/**
 * language.js - Advanced Language Manager
 * Handles multi-language support with dynamic loading and translations
 */

class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.fallbackLanguage = 'en';
        this.observers = [];
        this.supportedLanguages = {
            'en': { name: 'English', native: 'English', flag: '🇺🇸', dir: 'ltr' },
            'my': { name: 'Myanmar', native: 'မြန်မာ', flag: '🇲🇲', dir: 'ltr' },
            'th': { name: 'Thai', native: 'ไทย', flag: '🇹🇭', dir: 'ltr' },
            'zh': { name: 'Chinese', native: '中文', flag: '🇨🇳', dir: 'ltr' },
            'ru': { name: 'Russian', native: 'Русский', flag: '🇷🇺', dir: 'ltr' }
        };
        
        this.init();
    }

    /**
     * Initialize the language manager
     */
    async init() {
        await this.loadSavedLanguage();
        await this.loadLanguage(this.currentLanguage);
        this.setupEventListeners();
        this.applyDirection();
    }

    /**
     * Load saved language from localStorage
     */
    async loadSavedLanguage() {
        try {
            const saved = localStorage.getItem('preferred_language');
            if (saved && this.supportedLanguages[saved]) {
                this.currentLanguage = saved;
            } else {
                // Try to detect browser language
                const browserLang = this.detectBrowserLanguage();
                if (browserLang && this.supportedLanguages[browserLang]) {
                    this.currentLanguage = browserLang;
                }
            }
        } catch (error) {
            console.warn('Failed to load saved language:', error);
        }
    }

    /**
     * Detect browser language
     */
    detectBrowserLanguage() {
        try {
            const browserLang = navigator.language || navigator.userLanguage;
            if (browserLang) {
                const shortLang = browserLang.split('-')[0].toLowerCase();
                if (this.supportedLanguages[shortLang]) {
                    return shortLang;
                }
            }
        } catch (error) {
            console.warn('Failed to detect browser language:', error);
        }
        return null;
    }

    /**
     * Load language file
     */
    async loadLanguage(langCode) {
        if (!this.supportedLanguages[langCode]) {
            console.warn(`Language ${langCode} not supported, falling back to ${this.fallbackLanguage}`);
            langCode = this.fallbackLanguage;
        }

        try {
            // Dynamic import of language file
            const module = await import(`../lug/${this.capitalize(langCode)}.js`);
            this.translations = module.translations || {};
            this.currentLanguage = langCode;
            
            // Save preference
            localStorage.setItem('preferred_language', langCode);
            
            // Notify observers
            this.notifyObservers();
            
            // Apply translations to DOM
            this.applyTranslations();
            
            // Update HTML lang attribute
            document.documentElement.lang = langCode;
            
            console.log(`Language loaded: ${langCode}`);
            
        } catch (error) {
            console.error(`Failed to load language ${langCode}:`, error);
            
            // Fallback to English
            if (langCode !== this.fallbackLanguage) {
                console.log(`Falling back to ${this.fallbackLanguage}`);
                await this.loadLanguage(this.fallbackLanguage);
            }
        }
    }

    /**
     * Capitalize first letter
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Get translation for a key
     */
    t(key, params = {}) {
        if (!key) return '';
        
        const keys = key.split('.');
        let value = this.translations;
        
        // Navigate through nested keys
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                // Key not found, return the key itself
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }
        
        // If value is not a string, return as is
        if (typeof value !== 'string') {
            return value || key;
        }
        
        // Replace parameters
        return this.replaceParams(value, params);
    }

    /**
     * Replace parameters in string
     */
    replaceParams(text, params) {
        if (!params || Object.keys(params).length === 0) return text;
        
        let result = text;
        for (const [key, value] of Object.entries(params)) {
            const placeholder = new RegExp(`{${key}}`, 'g');
            result = result.replace(placeholder, value);
        }
        return result;
    }

    /**
     * Check if a key exists
     */
    has(key) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                return false;
            }
        }
        return true;
    }

    /**
     * Apply translations to DOM elements
     */
    applyTranslations() {
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            const translation = this.t(key);
            if (translation) {
                element.textContent = translation;
            }
        });

        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.dataset.i18nPlaceholder;
            const translation = this.t(key);
            if (translation) {
                element.placeholder = translation;
            }
        });

        // Translate titles
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.dataset.i18nTitle;
            const translation = this.t(key);
            if (translation) {
                element.title = translation;
            }
        });

        // Translate alt attributes
        document.querySelectorAll('[data-i18n-alt]').forEach(element => {
            const key = element.dataset.i18nAlt;
            const translation = this.t(key);
            if (translation) {
                element.alt = translation;
            }
        });

        // Translate aria labels
        document.querySelectorAll('[data-i18n-aria]').forEach(element => {
            const key = element.dataset.i18nAria;
            const translation = this.t(key);
            if (translation) {
                element.setAttribute('aria-label', translation);
            }
        });

        // Translate value attributes
        document.querySelectorAll('[data-i18n-value]').forEach(element => {
            const key = element.dataset.i18nValue;
            const translation = this.t(key);
            if (translation) {
                element.value = translation;
            }
        });
    }

    /**
     * Apply text direction based on language
     */
    applyDirection() {
        const langInfo = this.supportedLanguages[this.currentLanguage];
        if (langInfo && langInfo.dir) {
            document.documentElement.dir = langInfo.dir;
            document.documentElement.style.direction = langInfo.dir;
        } else {
            document.documentElement.dir = 'ltr';
            document.documentElement.style.direction = 'ltr';
        }
    }

    /**
     * Set current language
     */
    async setLanguage(langCode) {
        if (!this.supportedLanguages[langCode]) {
            console.error(`Unsupported language: ${langCode}`);
            return false;
        }

        if (langCode === this.currentLanguage) {
            return true;
        }

        await this.loadLanguage(langCode);
        this.applyDirection();
        
        // Dispatch custom event
        this.dispatchEvent('languageChanged', {
            language: langCode,
            languageInfo: this.supportedLanguages[langCode]
        });
        
        return true;
    }

    /**
     * Get current language info
     */
    getCurrentLanguage() {
        return {
            code: this.currentLanguage,
            ...this.supportedLanguages[this.currentLanguage]
        };
    }

    /**
     * Get all supported languages
     */
    getSupportedLanguages() {
        return Object.entries(this.supportedLanguages).map(([code, info]) => ({
            code,
            ...info
        }));
    }

    /**
     * Add observer for language changes
     */
    addObserver(callback) {
        if (typeof callback === 'function') {
            this.observers.push(callback);
        }
    }

    /**
     * Remove observer
     */
    removeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    /**
     * Notify all observers
     */
    notifyObservers() {
        const languageInfo = this.getCurrentLanguage();
        this.observers.forEach(callback => {
            try {
                callback(languageInfo, this.translations);
            } catch (error) {
                console.error('Observer callback failed:', error);
            }
        });
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`language-${eventName}`, {
            detail: {
                language: this.currentLanguage,
                ...detail
            },
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for language change events from components
        document.addEventListener('language-change-request', async (e) => {
            const { language } = e.detail;
            await this.setLanguage(language);
        });

        // Auto-translate new content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            this.translateNode(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Translate a specific node
     */
    translateNode(node) {
        if (!node || node.nodeType !== 1) return;

        // Check if node has data-i18n
        if (node.hasAttribute && node.hasAttribute('data-i18n')) {
            const key = node.getAttribute('data-i18n');
            node.textContent = this.t(key);
        }

        // Check for data-i18n-placeholder
        if (node.hasAttribute && node.hasAttribute('data-i18n-placeholder')) {
            const key = node.getAttribute('data-i18n-placeholder');
            node.placeholder = this.t(key);
        }

        // Check for data-i18n-title
        if (node.hasAttribute && node.hasAttribute('data-i18n-title')) {
            const key = node.getAttribute('data-i18n-title');
            node.title = this.t(key);
        }

        // Recursively translate children
        node.childNodes.forEach(child => this.translateNode(child));
    }

    /**
     * Create a language switcher dropdown
     */
    createLanguageSwitcher(options = {}) {
        const {
            container = document.body,
            className = 'language-switcher',
            showNames = true,
            showFlags = true,
            onChange = null
        } = options;

        const switcher = document.createElement('div');
        switcher.className = className;

        const select = document.createElement('select');
        select.className = 'language-select';

        this.getSupportedLanguages().forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.selected = lang.code === this.currentLanguage;
            
            let text = '';
            if (showFlags) text += lang.flag + ' ';
            if (showNames) text += lang.name;
            
            option.textContent = text;
            select.appendChild(option);
        });

        select.addEventListener('change', async (e) => {
            const langCode = e.target.value;
            await this.setLanguage(langCode);
            if (onChange) onChange(langCode);
        });

        switcher.appendChild(select);
        container.appendChild(switcher);

        return switcher;
    }

    /**
     * Get translation with count (pluralization)
     */
    tn(key, count, params = {}) {
        const pluralKey = `${key}.${this.getPluralForm(count)}`;
        if (this.has(pluralKey)) {
            return this.t(pluralKey, { count, ...params });
        }
        return this.t(key, { count, ...params });
    }

    /**
     * Get plural form for current language
     */
    getPluralForm(count) {
        // Basic pluralization rules (can be extended per language)
        if (count === 0) return 'zero';
        if (count === 1) return 'one';
        return 'other';
    }

    /**
     * Format number according to current locale
     */
    formatNumber(number, options = {}) {
        try {
            return new Intl.NumberFormat(this.currentLanguage, options).format(number);
        } catch (error) {
            return number.toString();
        }
    }

    /**
     * Format date according to current locale
     */
    formatDate(date, options = {}) {
        try {
            return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
        } catch (error) {
            return date.toString();
        }
    }

    /**
     * Format currency according to current locale
     */
    formatCurrency(amount, currency = 'USD', options = {}) {
        try {
            return new Intl.NumberFormat(this.currentLanguage, {
                style: 'currency',
                currency,
                ...options
            }).format(amount);
        } catch (error) {
            return `${amount} ${currency}`;
        }
    }

    /**
     * Get direction for current language
     */
    getDirection() {
        return this.supportedLanguages[this.currentLanguage]?.dir || 'ltr';
    }

    /**
     * Check if current language is RTL
     */
    isRTL() {
        return this.getDirection() === 'rtl';
    }

    /**
     * Export translations as JSON
     */
    exportTranslations(langCode = this.currentLanguage) {
        return JSON.stringify(this.translations, null, 2);
    }

    /**
     * Import translations from JSON
     */
    importTranslations(json, langCode) {
        try {
            const translations = JSON.parse(json);
            if (langCode && this.supportedLanguages[langCode]) {
                // In production, this would save to server
                console.log(`Imported translations for ${langCode}`);
                return true;
            }
        } catch (error) {
            console.error('Failed to import translations:', error);
        }
        return false;
    }
}

// Create and export language manager instance
const languageManager = new LanguageManager();
window.languageManager = languageManager;

// Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    languageManager.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageManager;
}