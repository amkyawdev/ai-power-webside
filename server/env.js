// Environment Variables Manager
class EnvManager {
    constructor() {
        this.variables = {};
        this.loadFromLocalStorage();
    }
    
    // Load from localStorage
    loadFromLocalStorage() {
        const saved = localStorage.getItem('env_variables');
        if (saved) {
            try {
                this.variables = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load env variables:', e);
                this.variables = {};
            }
        }
    }
    
    // Save to localStorage
    saveToLocalStorage() {
        localStorage.setItem('env_variables', JSON.stringify(this.variables));
    }
    
    // Get environment variable
    get(key, defaultValue = null) {
        return this.variables[key] || defaultValue;
    }
    
    // Set environment variable
    set(key, value) {
        this.variables[key] = value;
        this.saveToLocalStorage();
    }
    
    // Delete environment variable
    delete(key) {
        delete this.variables[key];
        this.saveToLocalStorage();
    }
    
    // Get all variables
    getAll() {
        return { ...this.variables };
    }
    
    // Clear all variables
    clear() {
        this.variables = {};
        this.saveToLocalStorage();
    }
    
    // Import from JSON
    importFromJSON(json) {
        try {
            const parsed = typeof json === 'string' ? JSON.parse(json) : json;
            this.variables = { ...this.variables, ...parsed };
            this.saveToLocalStorage();
            return true;
        } catch (e) {
            console.error('Failed to import env variables:', e);
            return false;
        }
    }
    
    // Export to JSON
    exportToJSON() {
        return JSON.stringify(this.variables, null, 2);
    }
    
    // Get required variables for different services
    getServiceVariables(service) {
        const services = {
            'firebase': ['apiKey', 'authDomain', 'projectId', 'storageBucket'],
            'gemini': ['apiKey'],
            'googleDrive': ['clientId', 'apiKey'],
            'github': ['token'],
            'openai': ['apiKey']
        };
        
        const required = services[service] || [];
        const result = {};
        
        required.forEach(key => {
            result[key] = this.variables[key];
        });
        
        return result;
    }
    
    // Check if all required variables for a service are set
    checkService(service) {
        const required = this.getServiceVariables(service);
        return Object.values(required).every(value => value && value !== '');
    }
}

// Create and export env manager instance
const envManager = new EnvManager();
window.envManager = envManager;

// Demo mode counter
class DemoModeManager {
    constructor() {
        this.maxAttempts = 3;
        this.attempts = this.getAttempts();
    }
    
    getAttempts() {
        const attempts = localStorage.getItem('demo_attempts');
        return attempts ? parseInt(attempts) : 0;
    }
    
    incrementAttempts() {
        this.attempts++;
        localStorage.setItem('demo_attempts', this.attempts.toString());
    }
    
    canUseDemo() {
        return this.attempts < this.maxAttempts;
    }
    
    getRemainingAttempts() {
        return Math.max(0, this.maxAttempts - this.attempts);
    }
    
    resetAttempts() {
        this.attempts = 0;
        localStorage.removeItem('demo_attempts');
    }
}

// Create demo mode manager
const demoMode = new DemoModeManager();
window.demoMode = demoMode;