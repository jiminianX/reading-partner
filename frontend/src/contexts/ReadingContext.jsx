import { createContext, useContext, useState } from 'react';

const ReadingContext = createContext();

export const useReading = () => {
    const context = useContext(ReadingContext);
    if (!context) {
        throw new Error('useReading must be used within ReadingProvider');
    }
    return context;
};

export const ReadingProvider = ({ children }) => {
    const [currentReading, setCurrentReading] = useState(null);
    const [notes, setNotes] = useState([]);

    const value = {
        currentReading,
        setCurrentReading,
        notes,
        setNotes
    };

    return (
        <ReadingContext.Provider value={value}>
            {children}
        </ReadingContext.Provider>
    );
};
