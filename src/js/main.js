// ============================================
// Main JavaScript - Carrière Bhalil Website
// ============================================

import { translations } from './translations.js';

// ============================================
// State
// ============================================
let currentLang = localStorage.getItem('carriere-lang') || 'fr';

// ============================================
// DOM Elements
// ============================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ============================================
// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initNavigation();
    initAccordion();
    initSmoothScroll();
    initScrollEffects();
    renderContent();
});

// ============================================
// Language Switching
// ============================================
function initLanguage() {
    const langBtn = $('#lang-switcher');

    if (langBtn) {
        langBtn.addEventListener('click', toggleLanguage);
    }

    // Set initial direction
    updateDirection();
}

function toggleLanguage() {
    currentLang = currentLang === 'fr' ? 'ar' : 'fr';
    localStorage.setItem('carriere-lang', currentLang);
    updateDirection();
    renderContent();
}

function updateDirection() {
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
}

function t(key) {
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

// ============================================
// Navigation
// ============================================
function initNavigation() {
    const toggle = $('#navbar-toggle');
    const menu = $('#navbar-menu');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            toggle.classList.toggle('active');
        });

        // Close menu when clicking on a link
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                toggle.classList.remove('active');
            });
        });
    }
}

// ============================================
// Accordion
// ============================================
function initAccordion() {
    document.addEventListener('click', (e) => {
        const header = e.target.closest('.accordion-header');
        if (!header) return;

        const item = header.closest('.accordion-item');
        if (!item) return;

        // Toggle current item
        item.classList.toggle('active');

        // Close other items (optional - remove for multi-open)
        const siblings = item.parentElement.querySelectorAll('.accordion-item');
        siblings.forEach(sibling => {
            if (sibling !== item) {
                sibling.classList.remove('active');
            }
        });
    });
}

// ============================================
// Smooth Scroll
// ============================================
function initSmoothScroll() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = target.offsetTop - navHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    });
}

// ============================================
// Scroll Effects
// ============================================
function initScrollEffects() {
    const navbar = $('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ============================================
// Render Content
// ============================================
function renderContent() {
    renderNavigation();
    renderHero();
    renderProducts();
    renderAdvantages();
    renderSOP();
    renderSectors();
    renderContact();
    renderFooter();
}

function renderNavigation() {
    // Update nav links
    const navLinks = {
        'nav-home': t('nav.home'),
        'nav-products': t('nav.products'),
        'nav-procedures': t('nav.procedures'),
        'nav-sectors': t('nav.sectors'),
        'nav-contact': t('nav.contact')
    };

    Object.entries(navLinks).forEach(([id, text]) => {
        const el = $(`#${id}`);
        if (el) el.textContent = text;
    });

    // Update language switcher
    const langSwitcher = $('#lang-text');
    if (langSwitcher) {
        langSwitcher.textContent = t('nav.langSwitch');
    }

    const langFlag = $('#lang-flag');
    if (langFlag) {
        langFlag.textContent = currentLang === 'fr' ? '🇸🇦' : '🇫🇷';
    }
}

function renderHero() {
    // Tags
    const tagsContainer = $('#hero-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = `
      <span class="tag">${t('hero.tag1')}</span>
      <span class="tag">${t('hero.tag2')}</span>
      <span class="tag">${t('hero.tag3')}</span>
    `;
    }

    // Title and subtitle
    const heroTitle = $('#hero-title');
    if (heroTitle) heroTitle.textContent = t('hero.title');

    const heroSubtitle = $('#hero-subtitle');
    if (heroSubtitle) heroSubtitle.textContent = t('hero.subtitle');

    // Buttons
    const ctaPrimary = $('#hero-cta-primary');
    if (ctaPrimary) ctaPrimary.textContent = t('hero.ctaPrimary');

    const ctaSecondary = $('#hero-cta-secondary');
    if (ctaSecondary) ctaSecondary.textContent = t('hero.ctaSecondary');

    // Info box
    const infoTitle = $('#hero-info-title');
    if (infoTitle) infoTitle.textContent = t('hero.infoTitle');

    const infoText = $('#hero-info-text');
    if (infoText) infoText.textContent = t('hero.infoText');
}

function renderProducts() {
    const title = $('#products-title');
    if (title) title.textContent = t('products.title');

    const subtitle = $('#products-subtitle');
    if (subtitle) subtitle.textContent = t('products.subtitle');

    const grid = $('#products-grid');
    if (grid) {
        const products = t('products.items');
        grid.innerHTML = products.map(product => `
      <article class="product-card">
        <div class="product-image">
          ${product.icon}
        </div>
        <div class="product-body">
          <h3 class="product-title">${product.name}</h3>
          <div class="product-sizes">
            ${product.sizes.map(size => `<span class="product-size">${size}</span>`).join('')}
          </div>
          <p class="product-uses">${product.uses}</p>
          <a href="#contact" class="btn btn-primary btn-sm">${t('products.inquiry')}</a>
        </div>
      </article>
    `).join('');
    }
}

function renderAdvantages() {
    const title = $('#advantages-title');
    if (title) title.textContent = t('advantages.title');

    const subtitle = $('#advantages-subtitle');
    if (subtitle) subtitle.textContent = t('advantages.subtitle');

    const grid = $('#advantages-grid');
    if (grid) {
        const advantages = t('advantages.items');
        grid.innerHTML = advantages.map(item => `
      <div class="advantage-card">
        <span class="advantage-icon">${item.icon}</span>
        <div class="advantage-content">
          <h4>${item.title}</h4>
          <p>${item.text}</p>
        </div>
      </div>
    `).join('');
    }
}

function renderSOP() {
    const title = $('#sop-title');
    if (title) title.textContent = t('sop.title');

    const subtitle = $('#sop-subtitle');
    if (subtitle) subtitle.textContent = t('sop.subtitle');

    const accordion = $('#sop-accordion');
    if (accordion) {
        const sections = t('sop.sections');
        accordion.innerHTML = sections.map((section, index) => `
      <div class="accordion-item${index === 0 ? ' active' : ''}">
        <button class="accordion-header">
          <span>${section.title}</span>
          <span class="accordion-icon">+</span>
        </button>
        <div class="accordion-content">
          <div class="accordion-body">
            <ul>
              ${section.content.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `).join('');
    }
}

function renderSectors() {
    const title = $('#sectors-title');
    if (title) title.textContent = t('sectors.title');

    const subtitle = $('#sectors-subtitle');
    if (subtitle) subtitle.textContent = t('sectors.subtitle');

    const grid = $('#sectors-grid');
    if (grid) {
        const sectors = t('sectors.items');
        const images = [
            // البناء والتشييد - Construction & Maçonnerie
            'https://images.unsplash.com/photo-1541976590-713941681591?w=600',
            // الطرق والبنية التحتية - Routes & Infrastructures  
            'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
            // الأشغال العمومية - Travaux Publics
            'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=600',
            // التهيئة - Aménagement
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'
        ];

        grid.innerHTML = sectors.map((sector, index) => `
      <div class="sector-card">
        <img src="${images[index]}" alt="${sector.name}" loading="lazy">
        <div class="sector-overlay">
          <h3 class="sector-title">${sector.icon} ${sector.name}</h3>
        </div>
      </div>
    `).join('');
    }
}

function renderContact() {
    const title = $('#contact-title');
    if (title) title.textContent = t('contact.title');

    const subtitle = $('#contact-subtitle');
    if (subtitle) subtitle.textContent = t('contact.subtitle');

    // Contact methods
    const phoneLabel = $('#contact-phone-label');
    if (phoneLabel) phoneLabel.textContent = t('contact.phone');

    const phoneNumber = $('#contact-phone-number');
    if (phoneNumber) phoneNumber.textContent = t('contact.phoneNumber');

    const emailLabel = $('#contact-email-label');
    if (emailLabel) emailLabel.textContent = t('contact.email');

    const emailAddress = $('#contact-email-address');
    if (emailAddress) emailAddress.textContent = t('contact.emailAddress');

    const locationLabel = $('#contact-location-label');
    if (locationLabel) locationLabel.textContent = t('contact.location');

    const locationAddress = $('#contact-location-address');
    if (locationAddress) locationAddress.textContent = t('contact.locationAddress');

    // Form
    const formTitle = $('#contact-form-title');
    if (formTitle) formTitle.textContent = t('contact.formTitle');

    const formNameLabel = $('#form-name-label');
    if (formNameLabel) formNameLabel.textContent = t('contact.formName');

    const formEmailLabel = $('#form-email-label');
    if (formEmailLabel) formEmailLabel.textContent = t('contact.formEmail');

    const formPhoneLabel = $('#form-phone-label');
    if (formPhoneLabel) formPhoneLabel.textContent = t('contact.formPhone');

    const formMessageLabel = $('#form-message-label');
    if (formMessageLabel) formMessageLabel.textContent = t('contact.formMessage');

    const formSubmit = $('#form-submit');
    if (formSubmit) formSubmit.textContent = t('contact.formSubmit');
}

function renderFooter() {
    const description = $('#footer-description');
    if (description) description.textContent = t('footer.description');

    const quickLinksTitle = $('#footer-quick-links-title');
    if (quickLinksTitle) quickLinksTitle.textContent = t('footer.quickLinks');

    const footerProducts = $('#footer-products');
    if (footerProducts) footerProducts.textContent = t('footer.products');

    const footerProcedures = $('#footer-procedures');
    if (footerProcedures) footerProcedures.textContent = t('footer.procedures');

    const footerContact = $('#footer-contact');
    if (footerContact) footerContact.textContent = t('footer.contact');

    const copyright = $('#footer-copyright');
    if (copyright) copyright.textContent = t('footer.copyright');

    const madeWith = $('#footer-made-with');
    if (madeWith) madeWith.textContent = t('footer.madeWith');
}

// ============================================
// WhatsApp Helper
// ============================================
window.openWhatsApp = function (message = '') {
    const phoneNumber = '212661350968'; // Carrière Bhalil WhatsApp
    const encodedMessage = encodeURIComponent(message || 'Bonjour, je souhaite obtenir un devis pour des granulats.');
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
};
