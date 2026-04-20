// Theme System - Dark/Light Mode

(function initTheme() {

  const STORAGE_KEY = 'uu-theme';
  const html = document.documentElement;

  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;

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

    updateToggleLabel(html.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

    btn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'dark' ? 'light' : 'dark';

      applyTheme(next);

      localStorage.setItem(STORAGE_KEY, next);

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
        const newTheme = e.matches ? 'light' : 'dark';
        applyTheme(newTheme);
        updateToggleLabel(newTheme);
      }
    });
  });

  applyTheme(getInitialTheme());
})();


// Page Load

document.documentElement.classList.add('js-loaded');

window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 600);

  const yearE1 = document.getElementById('year');
  if (yearE1) {
    yearE1.textContent = new Date().getFullYear();
  }
});

(function initTypewriter() {

  const el = document.getElementById('typewriterText');
  const cursor = document.getElementById('typewriterCursor');
  if (!el) return;

  let words = [];
  try {
    words = JSON.parse(el.dataset.words || '[]');
  } catch (e) {
    words = ['I build things for the web.'];
  }

  if (words.length === 0) return;

  function playTick() {
    // silent - no sound
  }

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let firstComplete = false;

  // Timing config (milliseconds)
  const TYPE_SPEED = 65;
  const DELETE_SPEED = 35;
  const PAUSE_AFTER = 1800;
  const PAUSE_BEFORE = 400;

  function tick() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      if (charIndex > 0) {
        charIndex--;
        el.textContent = currentWord.slice(0, charIndex);
        setTimeout(tick, DELETE_SPEED);
      } else {
        // finished deleting, move to next word
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(tick, PAUSE_BEFORE);
      }
      return;
    }

    // Typing
    if (charIndex < currentWord.length) {
      charIndex++;
      el.textContent = currentWord.slice(0, charIndex);
      playTick();

      if (charIndex === currentWord.length) {
        setTimeout(() => {
          if (cursor) {
            cursor.style.transition = 'opacity 0.5s ease';
            cursor.style.opacity = '0';
            setTimeout(() => {
              cursor.style.display = 'none'
            }, 500);
          }
        }, 900);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
    } else {
      setTimeout(tick, TYPE_SPEED);
    }
  }

  setTimeout(tick, 1000);
})();


// Service Card Read-More Toggle
document.querySelectorAll('.read-more-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const textE1 = btn.previousElementSibling;
    if (!textE1) return;

    const isExpanded = btn.getAttribute('aria-expanded') === 'true';

    if (isExpanded) {
      textE1.classList.remove('expanded');
      btn.textContent = 'Read more';
      btn.setAttribute('aria-expanded', 'false');
    } else {
      textE1.classList.add('expanded');
      btn.textContent = 'Read less';
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});


// Hero Particle Canvas

const canvas = document.getElementById('heroCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && ctx && !prefersReducedMotion) {
  initParticles();
}

function initParticles() {

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  const PARTICLE_COUNT = 55; // Number of dots
  const MAX_DIST = 130; // Max px distance to draw connecting lines
  const SPEED = 0.35; // How fast particles drift
  const DOT_RADIUS = 1.5; // Dot size in px
  const COLOR = '201, 80, 106'; // RGB of our rose-gold accent color

  // Create the particle array
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,

    // Velocity: random direction, bounded by SPEED
    vx: (Math.random() - 0.5) * SPEED,
    vy: (Math.random() - 0.5) * SPEED,
  }));

  function animate() {
    ctx.clearRect(0,0, canvas.width, canvas.height);

    for (const p of particles) {

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
 
      ctx.beginPath();
      ctx.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR}, 0.5)`;
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;  // Horizontal distance
        const dy = particles[i].y - particles[j].y;  // Vertical distance
        // Pythagoras: distance = √(dx² + dy²)
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
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
 
    requestAnimationFrame(animate);
  } 
  animate();
}
 

// Sticky Nav - Scroll-Triggered Background

const navbar = document.getElementById('navbar');
const heroSection = document.getElementById('home');
 
function handleNavScroll() {
  if (!navbar) return;

  navbar.classList.toggle('scrolled', window.scrollY > 80);
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();


// Active Nav Link - Highlights current section

const navLinks = document.querySelectorAll('.nav-link');

const sections = document.querySelectorAll('section[id]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {

        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  {
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
  document.body.style.overflow = 'hidden';
}
 
function closeMenu() {
  navLinksEl.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
 
if (hamburger && navLinksEl) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinksEl.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });
 
  navLinksEl.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}
 
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

document.querySelectorAll('.services-grid, .projects-grid').forEach((el) => {
  el.classList.add('reveal-children');
  el.querySelectorAll(':scope > .reveal').forEach((child) => {
    child.classList.remove('reveal');
  });
});
 
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  }
);
 
document.querySelectorAll('.reveal, .reveal-children').forEach((el) => {
  revealObserver.observe(el);
});


// Contact Form - Validation + Formspree Submit

const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formFeedback = document.getElementById('formFeedback');
 
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;

    function showError(fieldId, message) {
      const field = document.getElementById(fieldId);
      const errorEl = field?.nextElementSibling;
      if (field) field.classList.add('error');
      if (errorEl) errorEl.textContent = message;
      isValid = false;
    }
 
    function clearError(fieldId) {
      const field = document.getElementById(fieldId);
      const errorEl = field?.nextElementSibling;
      if (field) field.classList.remove('error');
      if (errorEl) errorEl.textContent = '';
    }
 
    ['name', 'email', 'message'].forEach(clearError);
 
    const name = document.getElementById('name')?.value.trim();
    if (!name) {
      showError('name', 'Please enter your name.');
    }

    const email = document.getElementById('email')?.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showError('email', 'Please enter your email address.');
    } else if (!emailRegex.test(email)) {
      showError('email', 'Please enter a valid email address.');
    }
 
    const message = document.getElementById('message')?.value.trim();
    if (!message) {
      showError('message', 'Please write a message.');
    }
 
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
      const data = new FormData(contactForm);
 
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },

      });
 
      if (response.ok) {
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

  let currentPage = 0;
  let totalCards = 0;

  function cardsPerPage() {
    if (window.innerWidth > 900) return 3;
    if (window.innerWidth > 600) return 2;
    return 1;
  }
 
  function totalPages() {
    return Math.max(1, Math.ceil(totalCards / cardsPerPage()));
  }

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

  // Fetch Approved Testimonials from Supabase
  async function loadTestimonials() {
    try {
      const { data, error } = await db
        .from('testimonials')
        .select('id, name, role, message, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
 
      if (error) throw error;
 
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


  // Submit New Testimonial to Supabase

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();

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


// Writing Section - Hashnode API Fetch

(async function initWritingSection() {
  const HASHNODE_USERNAME = 'analystyuchels';
 
  const POSTS_TO_SHOW = 3;
 
  const grid = document.getElementById('writingGrid');
  const ctaWrap = document.getElementById('writingCta');
  const ctaLink = document.getElementById('writingCtaLink');
 
  if (!grid) return;
 
  const blogUrl = `https://${HASHNODE_USERNAME}.hashnode.dev`;
  if (ctaLink) ctaLink.href = blogUrl;
 
  const QUERY = `
    query GetRecentPosts($host: String!, $first: Int!) {
      publication(host: $host) {
        posts(first: $first) {
          edges {
            node {
              title
              brief
              publishedAt
              url
              coverImage { url }
            }
          }
        }
      }
    }
  `;
 
  // Format ISO date string → "17 April 2026"
  function formatDate(isoString) {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date(isoString));
  }
 
  function buildPostCard(post) {
    const card = document.createElement('a');
    card.href = post.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.className = 'post-card reveal';
    card.setAttribute('aria-label', `Read: ${post.title} (opens in new tab)`);
 
    // Cover image — only if the post has one
    if (post.coverImage?.url) {
      const wrap = document.createElement('div');
      wrap.className = 'post-card-cover-wrap';
      const img = document.createElement('img');
      img.src = post.coverImage.url;
      img.alt = '';
      img.className = 'post-card-cover';
      img.loading = 'lazy';
      wrap.appendChild(img);
      card.appendChild(wrap);
    }
 
    // Card body
    const body = document.createElement('div');
    body.className = 'post-card-body';
 
    const date = document.createElement('p');
    date.className = 'post-card-date';
    date.textContent = formatDate(post.publishedAt);
 
    const title = document.createElement('h3');
    title.className = 'post-card-title';
    title.textContent = post.title;
 
    const excerpt = document.createElement('p');
    excerpt.className = 'post-card-excerpt';
    excerpt.textContent = post.brief || '';
 
    const readMore = document.createElement('span');
    readMore.className = 'post-card-read';
    readMore.innerHTML = `Read article
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <line x1="7" y1="17" x2="17" y2="7"/>
        <polyline points="7 7 17 7 17 17"/>
      </svg>`;
 
    body.appendChild(date);
    body.appendChild(title);
    body.appendChild(excerpt);
    body.appendChild(readMore);
    card.appendChild(body);
 
    return card;
  }
 
  // Fallback shown when fetch fails or username not set
  function showFallback() {
    grid.innerHTML = `
      <div class="writing-fallback">
        <div class="writing-fallback-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <h3>Writing on Hashnode</h3>
        <p>I write about web development, technical documentation, and lessons from building real projects.</p>
        <a href="${blogUrl}" class="btn btn-primary" target="_blank" rel="noopener noreferrer" style="margin-top:0.5rem;">
          Visit my Blog
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>`;
  }
 
  if (HASHNODE_USERNAME === 'your-hashnode-username') {
    console.warn(
      'Writing section: Hashnode username not set.\n' +
      "Open script.js, find HASHNODE_USERNAME, and replace 'your-hashnode-username'\n" +
      'with your real Hashnode username (the part after hashnode.com/@).'
    );
    showFallback();
    return;
  }
 
  // Fetch posts from Hashnode's GraphQL API
  try {
    const response = await fetch('https://gql.hashnode.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: QUERY,
        variables: {
          host:  `${HASHNODE_USERNAME}.hashnode.dev`,
          first: POSTS_TO_SHOW,
        },
      }),
    });
 
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
 
    const json  = await response.json();
    const edges = json?.data?.publication?.posts?.edges;
 
    if (!edges || edges.length === 0) {
      showFallback();
      return;
    }
 
    grid.innerHTML = '';
    edges.forEach(({ node: post }) => {
      const card = buildPostCard(post);
      card.classList.remove('reveal');
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      card.style.transitionDelay = `${index * 0.1}s`;
      grid.appendChild(card);

      // Trigger animation on next frame so transition fires
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      });
    });
 
    // Show the "Read All Articles" CTA button
    if (ctaWrap) ctaWrap.hidden = false;
  } catch (err) {
    console.warn('Writing section: could not fetch posts.', err.message);
    showFallback();
  }
})();

document.querySelectorAll('.read-more-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const wrap = btn.closest('.service-text-wrap');
    const text = wrap?.querySelector('.service-text');
    const expanded = btn.getAttribute('aria-expanded') ==='true';

    if (!text) return;

    if (expanded) {
      text.classList.remove('expanded');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = 'Read more';
    } else {
      text.classList.add('expanded');
      btn.setAttribute('aria-expanded', 'true');
      btn.textContent = 'Show less';
    }
  });
});