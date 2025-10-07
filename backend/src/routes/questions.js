const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateText } = require('../middleware/validation');
const { trackUsage } = require('../middleware/rateLimit');
const { callAnthropicAPI } = require('../services/anthropic');
const { admin } = require('../services/firebase');

const db = admin.firestore();

const QUESTIONS_PROMPT = `You are a reading comprehension tutor. Based on the following text, generate 5 diverse reading comprehension questions that help the reader engage deeply with the text WITHOUT summarizing it.

Include these types of questions:
1. A reflection question about the main idea
2. A prediction question (what might happen next or what the author might discuss)
3. A vocabulary/word exploration question
4. A question asking them to summarize a section in their own words
5. A critical thinking question about connections or analysis

Format each question as JSON with this structure:
{
  "type": "question type",
  "title": "brief title",
  "question": "the actual question"
}

Return ONLY a JSON array of 5 questions, no other text.

TEXT:
{TEXT}`;

const getDefaultQuestions = () => {
    return [
        {
            type: "Reflection",
            title: "Understanding the Main Idea",
            question: "What is the author's main point and what details support it?"
        },
        {
            type: "Prediction",
            title: "What Comes Next?",
            question: "What do you predict will be discussed next?"
        },
        {
            type: "Vocabulary",
            title: "Word Exploration",
            question: "Identify unfamiliar words and determine their meaning from context."
        },
        {
            type: "Summary",
            title: "In Your Own Words",
            question: "Summarize the key points in your own words."
        },
        {
            type: "Critical Thinking",
            title: "Making Connections",
            question: "How does this relate to something you already know?"
        }
    ];
};

router.post('/', authenticate, validateText, trackUsage, async (req, res) => {
    try {
        const data = await callAnthropicAPI(req.sanitizedText, QUESTIONS_PROMPT);
        const aiResponse = data.content[0].text;
        
        let questions;
        try {
            const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
            questions = JSON.parse(jsonMatch ? jsonMatch[0] : aiResponse);
        } catch (e) {
            console.error('Error parsing AI response:', e);
            questions = getDefaultQuestions();
        }
        
        // Log usage for analytics
        await db.collection('analytics').add({
            userId: req.user.uid,
            action: 'generate_questions',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            textLength: req.sanitizedText.length,
            tokensUsed: data.usage
        });
        
        res.json({ questions });
        
    } catch (error) {
        console.error('Error generating questions:', error);
        res.status(500).json({ 
            error: 'Failed to generate questions',
            message: error.message 
        });
    }
});

module.exports = router;