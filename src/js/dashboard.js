// ============================================
// Shared Dashboard Logic
// ============================================
import { translations } from './translations.js';

// State
let currentLang = localStorage.getItem('carriere-lang') || 'fr';

// DOM Elements
const body = document.body;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    updateDirection();
});

// Language Utils
function initLanguage() {
    const langBtn = document.getElementById('lang-switcher');
    if (langBtn) {
        langBtn.addEventListener('click', toggleLanguage);
        updateLangButtonText();
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'fr' ? 'ar' : 'fr';
    localStorage.setItem('carriere-lang', currentLang);
    updateDirection();
    updateLangButtonText();
    location.reload(); // Simple reload to re-render in new lang
}

function updateDirection() {
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
}

function updateLangButtonText() {
    const btnText = document.getElementById('lang-text');
    if (btnText) {
        btnText.textContent = currentLang === 'fr' ? 'العربية' : 'Français';
    }
}

// Translation Helper
export function t(key) {
    const keys = key.split('.');
    let value = translations[currentLang];

    for (const k of keys) {
        if (value && value[k] !== undefined) {
            value = value[k];
        } else {
            return key;
        }
    }
    return value;
}
