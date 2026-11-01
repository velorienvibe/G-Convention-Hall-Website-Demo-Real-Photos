// G Convention Hall concept demo — navigation, real-photo loading, gallery and WhatsApp enquiry.

// Mobile navigation
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }));
}

// Copyright year
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Try multiple delivery routes for the same real venue photograph. No illustrated SVG placeholders are used.
function parseCandidates(value, fallback) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) && parsed.length ? parsed : [fallback].filter(Boolean);
  } catch {
    return [fallback].filter(Boolean);
  }
}

function loadImageWithCandidates(img) {
  const candidates = parseCandidates(img.dataset.imageCandidates, img.getAttribute('src'));
  // src already points to candidates[0], so the first retry must start at candidates[1].
  let index = 1;
  const tryNext = () => {
    if (index >= candidates.length) {
      img.classList.add('photo-load-failed');
      img.setAttribute('aria-label', 'Venue photograph temporarily unavailable');
      return;
    }
    img.src = candidates[index++];
  };
  img.addEventListener('error', tryNext);
  if (img.complete && img.naturalWidth === 0) tryNext();
}
document.querySelectorAll('img[data-image-candidates]').forEach(loadImageWithCandidates);

// Load hero/section backgrounds with the same multi-CDN approach.
function loadBackgroundWithCandidates(element) {
  const candidates = parseCandidates(element.dataset.bgCandidates, element.dataset.bgImage);
  const isOverlay = element.dataset.bgOverlay === 'true';
  let index = 0;
  const apply = url => {
    const photoLayer = `url("${url}")`;
    element.style.backgroundImage = isOverlay
      ? `linear-gradient(90deg, rgba(19,19,17,.88), rgba(19,19,17,.62)), ${photoLayer}`
      : photoLayer;
  };
  const tryNext = () => {
    if (index >= candidates.length) {
      element.classList.add('photo-background-failed');
      return;
    }
    const candidate = candidates[index++];
    const probe = new Image();
    probe.onload = () => apply(candidate);
    probe.onerror = tryNext;
    probe.src = candidate;
  };
  tryNext();
}
document.querySelectorAll('[data-bg-image]').forEach(loadBackgroundWithCandidates);

// Gallery lightbox — show the actual photo currently rendered in the card.
const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const lightboxImage = lightbox.querySelector('img');
  const closeButton = lightbox.querySelector('.lightbox-close');
  document.querySelectorAll('.gallery-item').forEach(item => item.addEventListener('click', () => {
    const visibleImage = item.querySelector('img');
    const image = visibleImage?.currentSrc || visibleImage?.src || item.dataset.full;
    if (!image || visibleImage?.classList.contains('photo-load-failed')) return;
    lightboxImage.src = image;
    lightboxImage.alt = visibleImage?.alt || 'G Convention Hall venue photograph';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }));
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.removeAttribute('src');
    document.body.style.overflow = '';
  };
  closeButton?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeLightbox(); });
}

// Contact form opens a pre-filled WhatsApp enquiry; it does not store submissions.
const enquiryForm = document.getElementById('enquiry-form');
if (enquiryForm) {
  enquiryForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!enquiryForm.reportValidity()) return;
    const formData = new FormData(enquiryForm);
    const value = key => String(formData.get(key) || '').trim();
    const message = [
      'Hello G Convention Hall, I would like to enquire about an event.',
      '',
      `Name: ${value('name')}`,
      `Phone: ${value('phone')}`,
      `Occasion: ${value('event')}`,
      `Preferred date: ${value('date') || 'Not decided'}`,
      `Approx. guests: ${value('guests') || 'Not decided'}`,
      `Additional details: ${value('message') || 'None'}`
    ].join('\n');
    const whatsappNumber = '919848302444';
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });
}
