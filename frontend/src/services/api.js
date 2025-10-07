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
