import { getAuthToken } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiRequest = async (endpoint, options = {}) => {
    try {
        const token = await getAuthToken();
        
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const generateQuestions = async (text) => {
    return await apiRequest('/api/generate-questions', {
        method: 'POST',
        body: JSON.stringify({ text })
    });
};

export const saveNote = async (readingId, text, reference) => {
    return await apiRequest('/api/notes', {
        method: 'POST',
        body: JSON.stringify({ readingId, text, reference })
    });
};

export const getNotes = async (readingId) => {
    const query = readingId ? `?readingId=${readingId}` : '';
    return await apiRequest(`/api/notes${query}`);
};

export const deleteNote = async (noteId) => {
    return await apiRequest(`/api/notes/${noteId}`, {
        method: 'DELETE'
    });
};

export const saveResponse = async (readingId, questionIndex, response) => {
    return await apiRequest('/api/responses', {
        method: 'POST',
        body: JSON.stringify({ readingId, questionIndex, response })
    });
};

export const healthCheck = async () => {
    try {
        const response = await fetch(`${API_URL}/health`);
        return await response.json();
    } catch (error) {
        console.error('Health check failed:', error);
        return { status: 'error' };
    }
};

// Scaffolding API

export const savePreReading = async (readingId, priorKnowledge, learningGoals) => {
    return await apiRequest('/api/scaffolding/pre-reading', {
        method: 'POST',
        body: JSON.stringify({ readingId, priorKnowledge, learningGoals })
    });
};

export const getPreReading = async (readingId) => {
    return await apiRequest(`/api/scaffolding/pre-reading/${readingId}`);
};

export const generateCheckIn = async (text, priorKnowledge, learningGoals, pageNumber) => {
    return await apiRequest('/api/scaffolding/generate-check-in', {
        method: 'POST',
        body: JSON.stringify({ text, priorKnowledge, learningGoals, pageNumber })
    });
};

export const saveCheckIn = async (readingId, prompt, response, checkInType, pageNumber) => {
    return await apiRequest('/api/scaffolding/check-in', {
        method: 'POST',
        body: JSON.stringify({ readingId, prompt, response, checkInType, pageNumber })
    });
};

export const getCheckIns = async (readingId) => {
    return await apiRequest(`/api/scaffolding/check-ins/${readingId}`);
};

export const saveReflection = async (readingId, response) => {
    return await apiRequest('/api/scaffolding/reflection', {
        method: 'POST',
        body: JSON.stringify({ readingId, response })
    });
};

export const getReflection = async (readingId) => {
    return await apiRequest(`/api/scaffolding/reflection/${readingId}`);
};
