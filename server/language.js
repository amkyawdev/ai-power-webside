// Language Manager
class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.observers = [];
        
        // Load saved language
        const saved = localStorage.getItem('language');
        if (saved) {
            this.currentLanguage = saved;
        }
    }
    
    // Initialize language manager
    async init() {
        await this.loadLanguage(this.currentLanguage);
        this.applyTranslations();
    }
    
    // Load language file
    async loadLanguage(lang) {
        try {
            const response = await fetch(`../lug/${lang}.js`);
            const data = await response.text();
            
            // Execute the language file (it should define a translations object)
            eval(data);
            this.translations = window.translations || {};
            
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            this.notifyObservers();
            
        } catch (error) {
            console.error('Failed to load language:', error);
            // Fallback to English
            this.translations = this.getFallbackTranslations();
        }
    }
    
    // Get fallback translations
    getFallbackTranslations() {
        return {
            'common': {
                'welcome': 'Welcome',
                'login': 'Login',
                'logout': 'Logout',
                'register': 'Register',
                'dashboard': 'Dashboard',
                'settings': 'Settings',
                'save': 'Save',
                'cancel': 'Cancel',
                'delete': 'Delete',
                'edit': 'Edit',
                'search': 'Search'
            },
            'pages': {
                'dashboard': {
                    'title': 'Dashboard',
                    'welcome_back': 'Welcome back, {name}!',
                    'recent_projects': 'Recent Projects',
                    'ai_chat': 'AI Chat Assistant',
                    'documentation': 'Documentation'
                },
                'chat': {
                    'title': 'AI Chat',
                    'new_chat': 'New Chat',
                    'type_message': 'Type your message...',
                    'upload_file': 'Upload File'
                },
                'coder': {
                    'title': 'Code Editor',
                    'new_file': 'New File',
                    'save': 'Save',
                    'run': 'Run',
                    'preview': 'Preview'
                }
            }
        };
    }
    
    // Translate a key
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                return key; // Return the key if translation not found
            }
        }
        
        // Replace parameters
        if (typeof value === 'string') {
            Object.keys(params).forEach(param => {
                value = value.replace(`{${param}}`, params[param]);
            });
        }
        
        return value;
    }
    
    // Change language
    async setLanguage(lang) {
        await this.loadLanguage(lang);
        this.applyTranslations();
    }
    
    // Apply translations to DOM
    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            element.textContent = this.t(key);
        });
        
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.dataset.i18nPlaceholder;
            element.placeholder = this.t(key);
        });
        
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.dataset.i18nTitle;
            element.title = this.t(key);
        });
    }
    
    // Add observer for language changes
    addObserver(callback) {
        this.observers.push(callback);
    }
    
    // Notify observers of language change
    notifyObservers() {
        this.observers.forEach(callback => callback(this.currentLanguage, this.translations));
    }
    
    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    // Get available languages
    getAvailableLanguages() {
        return [
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'my', name: 'Myanmar', flag: '🇲🇲' },
            { code: 'th', name: 'Thai', flag: '🇹🇭' },
            { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
            { code: 'ru', name: 'Russian', flag: '🇷🇺' }
        ];
    }
}

// Create and export language manager instance
const languageManager = new LanguageManager();
window.languageManager = languageManager;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    languageManager.init();
});