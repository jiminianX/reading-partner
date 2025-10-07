const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    return input.replace(/[<>]/g, '').trim().substring(0, 10000);
};

const validateText = (req, res, next) => {
    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }
    
    const sanitized = sanitizeInput(text);
    
    if (sanitized.length < 100) {
        return res.status(400).json({ 
            error: 'Text too short. Please provide at least 100 characters.' 
        });
    }
    
    req.sanitizedText = sanitized;
    next();
};

module.exports = { sanitizeInput, validateText };
