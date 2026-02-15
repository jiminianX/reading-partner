import { createContext, useContext, useState, useCallback } from 'react';
import { getAllReadings } from '../services/storage';

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
    const [allReadings, setAllReadings] = useState([]);

    const loadAllReadings = useCallback(async () => {
        try {
            const readings = await getAllReadings();
            setAllReadings(readings);
            return readings;
        } catch (error) {
            console.error('Error loading all readings:', error);
            return [];
        }
    }, []);

    const value = {
        currentReading,
        setCurrentReading,
        notes,
        setNotes,
        allReadings,
        setAllReadings,
        loadAllReadings
    };

    return (
        <ReadingContext.Provider value={value}>
            {children}
        </ReadingContext.Provider>
    );
};
