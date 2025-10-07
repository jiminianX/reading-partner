const log = {
    info: (message, ...args) => {
        if (process.env.LOG_LEVEL === 'info' || process.env.LOG_LEVEL === 'debug') {
            console.log(`[INFO] ${new Date().toISOString()}:`, message, ...args);
        }
    },
    
    error: (message, ...args) => {
        console.error(`[ERROR] ${new Date().toISOString()}:`, message, ...args);
    },
    
    debug: (message, ...args) => {
        if (process.env.LOG_LEVEL === 'debug') {
            console.log(`[DEBUG] ${new Date().toISOString()}:`, message, ...args);
        }
    },
    
    warn: (message, ...args) => {
        console.warn(`[WARN] ${new Date().toISOString()}:`, message, ...args);
    }
};

module.exports = log;