// Theme System - Dark/Light Mode

(function initTheme() {

  const STORAGE_KEY = 'uu-theme';
  const html = document.documentElement;

  // Determing which theme to use on load
  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;

    // Check OS preference
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    return prefersLight ? 'light' : 'dark';
  }

  // Apply a theme to the document
  function applyTheme(theme){
    if (theme === 'light') {
      html.setAttribute('data-theme', 'light');
    } else {
      html.removeAttribute('data-theme');
    }
  }

  // Update the toggle button's accessible label
  function updateToggleLabel(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  // Wire up the toggle button click
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    // Set correct initial label
    updateToggleLabel(html.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

    btn.addEventListener('click', () => {
      // Read current them, flip it
      const current = html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'dark' ? 'light' : 'dark';

      // Apply the new theme visually
      applyTheme(next);

      // Save it so the choice persists on next visit
      localStorage.setItem(STORAGE_KEY, next);

      // Update the accessible label
      updateToggleLabel(next);

      // Re-run the particle canvas resize so it adapts to any background color change
      const canvas = document.getElementById('heroCanvas');
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    });

    // Listen for OS-level theme chnages while the page is open
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      const hasSavedPref = localStorage.getItem(STORAGE_KEY);
      if (!hasSavedPref) {
        // No saved preference - follow OS
        const newTheme = e.matches ? 'light' : 'dark';
        applyTheme(newTheme);
        updateToggleLabel(newTheme);
      }
    });
  });

  // Apply the theme immediately (before DOM is ready)
  applyTheme(getInitialTheme());
})();

// Page Load

document.documentElement.classList.add('js-loaded');

window.addEventListener('load', () => {
  // Short delay before the underline draws in - gives hero text time to appear first
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 600);

  // Set the footer copyright year dynamically
  const yearE1 = document.getElementById('year');
  if (yearE1) {
    yearE1.textContent = new Date().getFullYear();
  }
});


// Hero Particle Canvas

const canvas = document.getElementById('heroCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// Only run if canvas exists and user hasn't asked for reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && ctx && !prefersReducedMotion) {
  initParticles();
}

function initParticles() {

  // Resize the canvas to fill its parent (the hero section)
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resize();
  // Re-size on window resize (e.g. rotating phone from portrait to landscape)
  window.addEventListener('resize', resize);

  // Configuration
  const PARTICLE_COUNT = 55; // Number of dots
  const MAX_DIST = 130; // Max px distance to draw connecting lines
  const SPEED = 0.35; // How fast particles drift
  const DOT_RADIUS = 1.5; // Dot size in px
  const COLOR = '201, 80, 106'; // RGB of our rose-gold accent color

  // Create the particle array
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * canvas.width, // Random starting X
    y: Math.random() * canvas.height, // Random starting Y

    // Velocity: random direction, bounded by SPEED
    vx: (Math.random() - 0.5) * SPEED,
    vy: (Math.random() - 0.5) * SPEED,
  }));

  // The animation loop - called ~60 times per second
  function animate() {
    // Clear the canvas each frame so previous positions don't linger
    ctx.clearRect(0,0, canvas.width, canvas.height);

    // Update and draw each particle
    for (const p of particles) {

      // Move the particle
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges when a particle reaches the wall, flip its velocity to reverse direction
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
 
      // Draw the dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR}, 0.5)`;
      ctx.fill();
    }

    // Draw connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;  // Horizontal distance
        const dy = particles[i].y - particles[j].y;  // Vertical distance
        // Pythagoras: distance = √(dx² + dy²)
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
          // The closer the particles, the more opaque the line
          // When dist = 0, opacity = 0.15. When dist = MAX_DIST, opacity = 0.
          const opacity = (1 - dist / MAX_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${COLOR}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
 
    // Schedule the next frame
    requestAnimationFrame(animate);
  }
 
  // Kick off the loop
  animate();
}
 

// Sticky Nav - Scroll-Triggered Background

const navbar = document.getElementById('navbar');
const cvPill = document.getElementById('navCvPill');
// heroSection height tells us exactly when the user has left the hero
const heroSection = document.getElementById('home');
 
function handleNavScroll() {
  if (!navbar) return;

  // Frosted glass background
  navbar.classList.toggle('scrolled', window.scrollY > 80);

  // Download CV pill visibility
  if (cvPill && heroSection) {
    const heroBottom = heroSection.getBoundingClientRect().bottom;
    cvPill.classList.toggle('nav-cv-pill--visible', heroBottom < 72);
  }
}

// Listen for scroll events
window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();


// Active Nav Link - Highlights current section
const navLinks = document.querySelectorAll('.nav-link');

// The sections we want to track
const sections = document.querySelectorAll('section[id]');

// IntersectionObserver watches when elements enter/leave the viewport
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // This section is now visible — find and activate its nav link
        const id = entry.target.id;
        navLinks.forEach((link) => {
          // Check if this link's href ends with #sectionId
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  {
    // rootMargin: shrinks the "visible" area — we count a section as active 
    rootMargin: '-40% 0px -40% 0px',
  }
);
 
sections.forEach((section) => sectionObserver.observe(section));


// Mobile Menu - Hamburger Toggle

const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('nav-links');
 
function openMenu() {
  navLinksEl.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  // Prevent body from scrolling while menu is open
  document.body.style.overflow = 'hidden';
}
 
function closeMenu() {
  navLinksEl.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
 
if (hamburger && navLinksEl) {
  hamburger.addEventListener('click', () => {
    // Toggle: if open → close; if closed → open
    const isOpen = navLinksEl.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });
 
  // Close menu when any nav link is clicked
  navLinksEl.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}
 
// Close menu on Escape key — keyboard accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});


// Scroll Reveal Animations

const revealTargets = [
  '.section-header',
  '.service-card',
  '.tech-grid',
  '.project-card',
  '.about-container',
  '.contact-form',
  '.tech-pill',
];
 
revealTargets.forEach((selector) => {
  document.querySelectorAll(selector).forEach((el) => {
    el.classList.add('reveal');
  });
});

// Staggered children — grid containers whose children animate in sequence
document.querySelectorAll('.services-grid, .projects-grid').forEach((el) => {
  el.classList.add('reveal-children');
  // Remove individual reveal from direct children since the parent handles it
  el.querySelectorAll(':scope > .reveal').forEach((child) => {
    child.classList.remove('reveal');
  });
});
 
// The observer that triggers the animations
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once revealed, stop observing — no need to toggle it again
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,  // Trigger when 10% of the element is visible
    rootMargin: '0px 0px -50px 0px',  // Slightly before the element hits the viewport bottom
  }
);
 
// Observe everything marked with .reveal or .reveal-children
document.querySelectorAll('.reveal, .reveal-children').forEach((el) => {
  revealObserver.observe(el);
});


// Contact Form - Validation + Formspree Submit

const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formFeedback = document.getElementById('formFeedback');
 
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    // Prevent the default browser behaviour (page reload / form GET request)
    e.preventDefault();

    // Client-side validation
    let isValid = true;

    // Helper: show an error message below a field
    function showError(fieldId, message) {
      const field = document.getElementById(fieldId);
      const errorEl = field?.nextElementSibling;
      if (field) field.classList.add('error');
      if (errorEl) errorEl.textContent = message;
      isValid = false;
    }
 
    // Helper: clear error state
    function clearError(fieldId) {
      const field = document.getElementById(fieldId);
      const errorEl = field?.nextElementSibling;
      if (field) field.classList.remove('error');
      if (errorEl) errorEl.textContent = '';
    }
 
    // Clear previous errors first
    ['name', 'email', 'message'].forEach(clearError);
 
    // Validate name
    const name = document.getElementById('name')?.value.trim();
    if (!name) {
      showError('name', 'Please enter your name.');
    }

    // Validate email - uses a simple regex for basic format check
    const email = document.getElementById('email')?.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showError('email', 'Please enter your email address.');
    } else if (!emailRegex.test(email)) {
      showError('email', 'Please enter a valid email address.');
    }
 
    // Validate message
    const message = document.getElementById('message')?.value.trim();
    if (!message) {
      showError('message', 'Please write a message.');
    }
 
    // Stop here if any field is invalid
    if (!isValid) return;

    // Submit to Formspree
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const btnIcon = submitBtn.querySelector('.btn-icon');
 
    submitBtn.disabled = true;
    if (btnText) btnText.hidden = true;
    if (btnLoading) btnLoading.hidden = false;
    if (btnIcon) btnIcon.hidden = true;
 
    try {
      // FormData serializes all form fields into the right format for HTTP
      const data = new FormData(contactForm);
 
      // fetch() makes an HTTP request. We await the response.
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },

        // Accept: application/json tells Formspree to return JSON instead of redirecting. It is needed for AJAX submissions.
      });
 
      if (response.ok) {
        // Success! Clear the form and show success message
        contactForm.reset();
        showFeedback('success', '✓ Message sent! I\'ll get back to you soon.');
      } else {
        // Formspree returned an error (e.g. form not configured yet)
        const json = await response.json().catch(() => ({}));
        const msg = json.errors?.map(e => e.message).join(', ') || 'Something went wrong. Please try again.';
        showFeedback('error', msg);
      }
 
    } catch (err) {
      // Network error (no internet, etc.)
      showFeedback('error', 'Could not send message. Please check your connection.');
      console.error('Form submission error:', err);
 
    } finally {
      // Restore button state regardless of success/failure
      submitBtn.disabled = false;
      if (btnText) btnText.hidden = false;
      if (btnLoading) btnLoading.hidden = true;
      if (btnIcon) btnIcon.hidden = false;
    }
  });
 
  // Real-time validation: clear field error as user types a correction
  ['name', 'email', 'message'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        if (el.classList.contains('error')) {
          el.classList.remove('error');
          const errorEl = el.nextElementSibling;
          if (errorEl) errorEl.textContent = '';
        }
      });
    }
  });
}
 
function showFeedback(type, message) {
  if (!formFeedback) return;
  formFeedback.className = `form-feedback ${type}`;
  formFeedback.textContent = message;
  formFeedback.hidden = false;
  // Scroll the feedback into view smoothly
  formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  // Hide after 6 seconds
  setTimeout(() => {
    formFeedback.hidden = true;
  }, 6000);
}


// Smooth Scroll for Anchor Links

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
 
    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;
 
    e.preventDefault();
 
    const navbarHeight = navbar ? navbar.offsetHeight : 0;

    // getBoundClientRect gives position relative to viewport
    const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - navbarHeight;
 
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});


// Testimonials

(function initTestimonials() {
  const cfg = window.APP_CONFIG || {};
  const SUPABASE_URL = cfg.SUPABASE_URL || '';
  const SUPABASE_PUBLISHABLE_KEY = cfg.SUPABASE_PUBLISHABLE_KEY || '';

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || SUPABASE_URL.includes('ljawamabjuakbykldxid') || SUPABASE_PUBLISHABLE_KEY.includes('sb_publishable_dM0m1ehIvZ_2pwmhlyFxbg_SzF78eDN')) {
    console.warn(
      'Testimonials: Supabase credentials missing or using placeholders.\n' + 
      'Copy config.js → add your SUPABASE_URL\n' + 
      'and SUPABASE_PUBLISHABLE_KEY (the sb_publishable_... key).\n' + 
      'See SUPABASE_SETUP.md for instructions.'
    );
  }
  
  // Grab all the DOM elements we'll interact with
  const track = document.getElementById('testimonialsTrack');
  const nav = document.getElementById('testimonialsNav');
  const prevBtn = document.getElementById('testimonialPrev');
  const nextBtn = document.getElementById('testimonialNext');
  const dotsEl = document.getElementById('testimonialDots');
  const form = document.getElementById('testimonialForm');
  const submitBtn = document.getElementById('testimonialSubmitBtn');
  const feedbackEl = document.getElementById('testimonialFeedback');

  if (!track) return;

  const db = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
 
  if (!db) {
    console.warn('Supabase client not available. Check CDN script and credentials.');
    showEmptyState();
    return;
  }

  // Carousel state
  let currentPage = 0;
  let totalCards = 0;

  // Helper: cards per page based on viewport
  function cardsPerPage() {
    if (window.innerWidth > 900) return 3;
    if (window.innerWidth > 600) return 2;
    return 1;
  }
 
  function totalPages() {
    return Math.max(1, Math.ceil(totalCards / cardsPerPage()));
  }

  // Helper: build dots
  function buildDots() {
    dotsEl.innerHTML = '';
    for (let i = 0; i < totalPages(); i++) {
      const dot = document.createElement('button');
      dot.className = 'testimonial-dot' + (i === currentPage ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to testimonial page ${i + 1}`);
      dot.setAttribute('aria-selected', i === currentPage ? 'true' : 'false');
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    }
  }

  // Helper: slide to page
  function goTo(pageIndex) {
    if (totalCards === 0) return;
    const cpp = cardsPerPage();
    const pages = totalPages();
    currentPage = Math.max(0, Math.min(pageIndex, pages - 1));
 
    const shiftPercent = currentPage * cpp * (100 / totalCards);
    track.style.transform = `translateX(-${shiftPercent}%)`;
 
    const dots = dotsEl.querySelectorAll('.testimonial-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentPage);
      dot.setAttribute('aria-selected', i === currentPage ? 'true' : 'false');
    });
 
    if (prevBtn) prevBtn.disabled = currentPage === 0;
    if (nextBtn) nextBtn.disabled = currentPage === pages - 1;
  }

  // Helper: build one testimonial card element
  function buildCard(t) {
    const article = document.createElement('article');
    article.className = 'testimonial-card';
    article.setAttribute('role', 'listitem');
    article.setAttribute('aria-label', `Testimonial from ${t.name}`);
 
    const inner = document.createElement('div');
    inner.className = 'testimonial-card-inner';
 
    // Quote body
    const body = document.createElement('div');
    body.className = 'testimonial-body';
    const quote = document.createElement('p');
    quote.className = 'testimonial-text';
    quote.textContent = t.message; // textContent = safe — no HTML injection
    body.appendChild(quote);
 
    // Author row
    const author = document.createElement('div');
    author.className = 'testimonial-author';
 
    // Avatar: first letters of first and last name
    const initials = t.name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('');
 
    const avatar = document.createElement('div');
    avatar.className = 'testimonial-avatar';
    avatar.textContent = initials;
    avatar.setAttribute('aria-hidden', 'true');
 
    const meta = document.createElement('div');
    meta.className = 'testimonial-meta';
 
    const nameEl = document.createElement('span');
    nameEl.className = 'testimonial-name';
    nameEl.textContent = t.name;
 
    const roleEl = document.createElement('span');
    roleEl.className = 'testimonial-role';
    roleEl.textContent = t.role;
 
    meta.appendChild(nameEl);
    meta.appendChild(roleEl);
    author.appendChild(avatar);
    author.appendChild(meta);
 
    inner.appendChild(body);
    inner.appendChild(author);
    article.appendChild(inner);
 
    return article;
  }

  // Helper: empty state (no approved testimonials yet)
  function showEmptyState() {
    track.innerHTML = `
      <div class="testimonials-empty">
        <div class="testimonials-empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h3>No testimonials yet</h3>
        <p>Be the first to leave a kind word using the form below.</p>
      </div>`;
    if (nav) nav.hidden = true;
  }

  // Part 1: Fetch Approved Testimonials from Supabase
  async function loadTestimonials() {
    try {
      const { data, error } = await db
        .from('testimonials')
        .select('id, name, role, message, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
 
      if (error) throw error;
 
      // Remove skeleton cards
      track.innerHTML = '';
 
      if (!data || data.length === 0) {
        showEmptyState();
        return;
      }
 
      // Build and insert a card for each approved testimonial
      totalCards = data.length;
      data.forEach(row => track.appendChild(buildCard(row)));
 
      // Show carousel nav and initialise
      if (nav) nav.hidden = false;
      buildDots();
      goTo(0);
      startAuto();
 
    } catch (err) {
      console.warn('Could not load testimonials:', err.message);
      showEmptyState();
    }
  }

  // Auto-advance
  let autoTimer = null;
 
  function startAuto() {
    if (totalCards <= cardsPerPage()) return; // No point if all fit on one page
    autoTimer = setInterval(() => goTo((currentPage + 1) % totalPages()), 6000);
  }
 
  function stopAuto() { clearInterval(autoTimer); }
 
  const section = track.closest('.testimonials');
  if (section) {
    section.addEventListener('mouseenter', stopAuto);
    section.addEventListener('touchstart', stopAuto, { passive: true });
    section.addEventListener('mouseleave', () => { if (totalCards > 0) startAuto(); });
  }

  // Arrow + keyboard navigation
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentPage - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentPage + 1));
 
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(currentPage - 1);
    if (e.key === 'ArrowRight') goTo(currentPage + 1);
  });

  // Touch/swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? currentPage + 1 : currentPage - 1);
  }, { passive: true });

  // Rebuild on resize
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (totalCards === 0) return;
      buildDots();
      goTo(Math.min(currentPage, totalPages() - 1));
    }, 200);
  });

  // Part 2: Submit New Testimonial to Supabase
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      // Validation
      let valid = true;
 
      function fieldError(id, msg) {
        const el = document.getElementById(id);
        const errEl = el?.nextElementSibling;
        if (el) el.classList.add('error');
        if (errEl) errEl.textContent = msg;
        valid = false;
      }
 
      function clearFieldError(id) {
        const el = document.getElementById(id);
        const errEl = el?.nextElementSibling;
        if (el) el.classList.remove('error');
        if (errEl) errEl.textContent = '';
      }
 
      ['t-name', 't-role', 't-message'].forEach(clearFieldError);
 
      const name = document.getElementById('t-name')?.value.trim();
      const role = document.getElementById('t-role')?.value.trim();
      const message = document.getElementById('t-message')?.value.trim();
 
      if (!name) fieldError('t-name', 'Please enter your name.');
      if (!role) fieldError('t-role', 'Please enter your role or relationship.');
      if (!message) fieldError('t-message', 'Please write your testimonial.');
 
      if (!valid) return;

      // Show loading state on button
      const btnText = submitBtn?.querySelector('.btn-text');
      const btnLoading = submitBtn?.querySelector('.btn-loading');
      const btnIcon = submitBtn?.querySelector('.btn-icon');
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.hidden = true;
      if (btnLoading) btnLoading.hidden = false;
      if (btnIcon) btnIcon.hidden = true;

      try {
        const { error } = await db
          .from('testimonials')
          .insert({ name, role, message, status: 'pending' });
 
        if (error) throw error;
 
        // Success — clear form and show confirmation
        form.reset();
        showFormFeedback(
          'success',
          '✓ Thank you! Your testimonial has been received and will appear here after review.'
        );
 
      } catch (err) {
        console.error('Testimonial submission error:', err.message);
        showFormFeedback(
          'error',
          'Something went wrong. Please try again or contact me directly.'
        );
      } finally {
        // Restore button regardless of outcome
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.hidden = false;
        if (btnLoading) btnLoading.hidden = true;
        if (btnIcon) btnIcon.hidden = false;
      }
    });
 
    // Clear field errors as the user corrects them
    ['t-name', 't-role', 't-message'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          if (el.classList.contains('error')) {
            el.classList.remove('error');
            const errEl = el.nextElementSibling;
            if (errEl) errEl.textContent = '';
          }
        });
      }
    });
  }

  // Inline form feedback helper
  function showFormFeedback(type, message) {
    if (!feedbackEl) return;
    feedbackEl.className = `form-feedback ${type}`;
    feedbackEl.textContent = message;
    feedbackEl.hidden = false;
    feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => { feedbackEl.hidden = true; }, 8000);
  }

  loadTestimonials();
})();