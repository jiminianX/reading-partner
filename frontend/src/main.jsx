import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ReadingProvider } from './contexts/ReadingContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <ReadingProvider>
                <App />
            </ReadingProvider>
        </AuthProvider>
    </React.StrictMode>
);
