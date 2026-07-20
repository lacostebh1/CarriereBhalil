// ============================================
// Main JavaScript — SOCIETE H.H ISTITMAR
// ============================================

import { translations } from './translations.js';

// ============================================
// State
// ============================================
let currentLang = localStorage.getItem('carriere-lang') || 'fr';

// ============================================
// DOM Helpers
// ============================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el && value !== undefined) el.textContent = value;
};

// ============================================
// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initNavigation();
    initAccordion();
    initSmoothScroll();
    initScrollEffects();
    initScrollSpy();
    initReveal();
    initLightbox();
    initContactForm();
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
            const isOpen = menu.classList.toggle('active');
            toggle.classList.toggle('active', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        // Close menu when clicking on a link
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
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

        item.classList.toggle('active');

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

        const navHeight = $('.navbar')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    });
}

// ============================================
// Scroll Effects (navbar)
// ============================================
function initScrollEffects() {
    const navbar = $('.navbar');
    if (!navbar) return;

    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

// ============================================
// Scroll Spy — active nav link
// ============================================
function initScrollSpy() {
    const sections = ['hero', 'products', 'procedures', 'sectors', 'contact']
        .map(id => document.getElementById(id))
        .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            $$('.navbar-link').forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
            });
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(section => observer.observe(section));
}

// ============================================
// Reveal on scroll
// ============================================
function initReveal() {
    const elements = $$('.reveal');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
        elements.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    elements.forEach(el => observer.observe(el));
}

// ============================================
// Gallery Lightbox
// ============================================
function initLightbox() {
    const lightbox = $('#lightbox');
    const lightboxImg = $('#lightbox-img');
    const closeBtn = $('#lightbox-close');
    if (!lightbox || !lightboxImg) return;

    const close = () => {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    };

    $$('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('.gallery-img');
            if (!img) return;
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    });

    closeBtn?.addEventListener('click', close);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });
}

// ============================================
// Contact form → WhatsApp
// ============================================
function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('#form-name')?.value || '';
        const email = $('#form-email')?.value || '';
        const phone = $('#form-phone')?.value || '';
        const message = $('#form-message')?.value || '';

        const lines = currentLang === 'ar'
            ? [`الاسم: ${name}`, `البريد: ${email}`, `الهاتف: ${phone}`, '', message]
            : [`Nom : ${name}`, `Email : ${email}`, `Téléphone : ${phone}`, '', message];

        window.openWhatsApp(lines.join('\n'));
    });
}

// ============================================
// Render Content
// ============================================
function renderContent() {
    renderNavigation();
    renderHero();
    renderStats();
    renderProducts();
    renderAdvantages();
    renderSOP();
    renderSectors();
    renderGallery();
    renderVideo();
    renderContact();
    renderFooter();
}

function renderNavigation() {
    setText('nav-home', t('nav.home'));
    setText('nav-products', t('nav.products'));
    setText('nav-procedures', t('nav.procedures'));
    setText('nav-sectors', t('nav.sectors'));
    setText('nav-contact', t('nav.contact'));
    setText('nav-client-btn', t('nav.clientButton'));
    setText('lang-text', t('nav.langSwitch'));

    const langFlag = $('#lang-flag');
    if (langFlag) {
        langFlag.textContent = currentLang === 'fr' ? '🇲🇦' : '🇫🇷';
    }
}

function renderHero() {
    const tagsContainer = $('#hero-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = `
      <span class="tag">${t('hero.tag1')}</span>
      <span class="tag">${t('hero.tag2')}</span>
      <span class="tag">${t('hero.tag3')}</span>
    `;
    }

    setText('hero-title', t('hero.title'));
    setText('hero-subtitle', t('hero.subtitle'));
    setText('hero-cta-primary', t('hero.ctaPrimary'));
    setText('hero-cta-secondary', t('hero.ctaSecondary'));
    setText('hero-info-title', t('hero.infoTitle'));
    setText('hero-info-text', t('hero.infoText'));
}

function renderStats() {
    const grid = $('#stats-grid');
    if (!grid) return;

    const items = t('stats.items');
    if (!Array.isArray(items)) return;

    grid.innerHTML = items.map(item => `
      <div class="stat-item">
        <div class="stat-number">${item.value}</div>
        <div class="stat-label">${item.label}</div>
      </div>
    `).join('');
}

function renderProducts() {
    setText('products-eyebrow', t('products.eyebrow'));
    setText('products-title', t('products.title'));
    setText('products-subtitle', t('products.subtitle'));

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
    setText('advantages-eyebrow', t('advantages.eyebrow'));
    setText('advantages-title', t('advantages.title'));
    setText('advantages-subtitle', t('advantages.subtitle'));

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
    setText('sop-eyebrow', t('sop.eyebrow'));
    setText('sop-title', t('sop.title'));
    setText('sop-subtitle', t('sop.subtitle'));

    const accordion = $('#sop-accordion');
    if (accordion) {
        const sections = t('sop.sections');
        accordion.innerHTML = sections.map((section, index) => `
      <div class="accordion-item${index === 0 ? ' active' : ''}">
        <button class="accordion-header" aria-expanded="${index === 0}">
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
    setText('sectors-eyebrow', t('sectors.eyebrow'));
    setText('sectors-title', t('sectors.title'));
    setText('sectors-subtitle', t('sectors.subtitle'));

    const grid = $('#sectors-grid');
    if (grid) {
        const sectors = t('sectors.items');
        const images = [
            new URL('../assets/images/gallery-4.jpg', import.meta.url).href,
            new URL('../assets/images/gallery-7.jpg', import.meta.url).href,
            new URL('../assets/images/gallery-3.jpg', import.meta.url).href,
            new URL('../assets/images/gallery-5.jpg', import.meta.url).href
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

function renderGallery() {
    setText('gallery-eyebrow', t('gallery.eyebrow'));
    setText('gallery-title', t('gallery.title'));
    setText('gallery-subtitle', t('gallery.subtitle'));

    ['1', '3', '4', '5', '6', '7'].forEach(n => {
        setText(`gallery-caption-${n}`, t(`gallery.caption${n}`));
    });
}

function renderVideo() {
    setText('video-eyebrow', t('video.eyebrow'));
    setText('video-title', t('video.title'));
    setText('video-subtitle', t('video.subtitle'));
}

function renderContact() {
    setText('contact-title', t('contact.title'));
    setText('contact-subtitle', t('contact.subtitle'));
    setText('contact-email-label', t('contact.email'));
    setText('contact-email-address', t('contact.emailAddress'));
    setText('contact-location-label', t('contact.location'));
    setText('contact-location-address', t('contact.locationAddress'));
    setText('contact-quarry-label', t('contact.quarryLocation'));
    setText('contact-quarry-address', t('contact.quarryAddress'));
    setText('contact-whatsapp-label', t('contact.whatsapp'));
    setText('contact-whatsapp-text', t('contact.whatsappText'));
    setText('contact-legal-label', t('contact.legalLabel'));

    // Form
    setText('contact-form-title', t('contact.formTitle'));
    setText('form-name-label', t('contact.formName'));
    setText('form-email-label', t('contact.formEmail'));
    setText('form-phone-label', t('contact.formPhone'));
    setText('form-message-label', t('contact.formMessage'));
    setText('form-submit', t('contact.formSubmit'));
}

function renderFooter() {
    setText('footer-description', t('footer.description'));
    setText('footer-quick-links-title', t('footer.quickLinks'));
    setText('footer-products', t('footer.products'));
    setText('footer-procedures', t('footer.procedures'));
    setText('footer-gallery', t('footer.gallery'));
    setText('footer-contact', t('footer.contact'));
    setText('footer-contact-title', t('footer.contactTitle'));
    setText('footer-legal-title', t('footer.legalTitle'));
    setText('footer-client-portal', t('footer.clientPortal'));
    setText('footer-admin-portal', t('footer.adminPortal'));
    setText('footer-copyright', t('footer.copyright'));
    setText('footer-made-with', t('footer.madeWith'));
}

// ============================================
// WhatsApp Helper
// ============================================
window.openWhatsApp = function (message = '') {
    const phoneNumber = '212661350968'; // WhatsApp SOCIETE H.H ISTITMAR
    const fallback = currentLang === 'ar'
        ? 'السلام عليكم، أود الحصول على عرض سعر للحصى.'
        : 'Bonjour, je souhaite obtenir un devis pour des granulats.';
    const encodedMessage = encodeURIComponent(message || fallback);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
};
