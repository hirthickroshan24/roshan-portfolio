// ================================================================
// HIRTHICK ROSHAN A — PORTFOLIO SCRIPTS
// Typing animation, particle canvas, scroll animations, counters
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
  // ── API Base ──
  // Auto-detect environment: local dev vs production
  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://roshan-portfolio-backend.onrender.com';

  // ── Year ──
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ================================================================
  // ANIMATED BACKGROUND CANVAS — Floating particles with connections
  // ================================================================
  const canvas = document.getElementById('bgCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h;
    const particles = [];
    const maxParticles = 60;
    const connectDist = 140;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.r = Math.random() * 2 + 0.5;
        this.alpha = Math.random() * 0.4 + 0.1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108, 99, 255, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(108, 99, 255, ${0.06 * (1 - dist / connectDist)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ================================================================
  // TYPING ANIMATION
  // ================================================================
  const phrases = [
    'Full Stack Developer',
    'App Developer',
    'Python Enthusiast',
    'React Developer',
    'Tech Enthusiast'
  ];
  const typedEl = document.getElementById('typed');
  let pIndex = 0, charIndex = 0, deleting = false;

  function typeLoop() {
    const current = phrases[pIndex];
    if (!deleting) {
      typedEl.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(typeLoop, 1800);
        return;
      }
    } else {
      typedEl.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        pIndex = (pIndex + 1) % phrases.length;
      }
    }
    setTimeout(typeLoop, deleting ? 45 : 95);
  }
  if (typedEl) typeLoop();

  // ================================================================
  // SCROLL ANIMATIONS — IntersectionObserver
  // ================================================================
  const animEls = document.querySelectorAll('[data-anim]');
  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, parseInt(delay));
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  animEls.forEach(el => animObserver.observe(el));

  // ================================================================
  // COUNTER ANIMATION (Hero Stats)
  // ================================================================
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        let current = 0;
        const duration = 1500;
        const step = Math.ceil(target / (duration / 30));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = current;
        }, 30);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  // ================================================================
  // NAVIGATION — Active state + scroll behavior
  // ================================================================
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 150;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) {
        if (scrollPos >= top && scrollPos < top + height) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
        // Close mobile nav
        const navLinksEl = document.getElementById('navLinks');
        if (navLinksEl && navLinksEl.classList.contains('show')) {
          navLinksEl.classList.remove('show');
          document.getElementById('navToggle').classList.remove('open');
        }
      }
    });
  });

  // ================================================================
  // NAVBAR — Scroll background + progress bar
  // ================================================================
  const header = document.getElementById('header');
  const progressTop = document.getElementById('progressTop');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    // Navbar background
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Progress bar
    const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    progressTop.style.width = Math.min(100, scrolled * 100) + '%';

    // Back to top button
    if (window.scrollY > 500) {
      backToTop.style.display = 'flex';
      backToTop.style.opacity = '1';
    } else {
      backToTop.style.opacity = '0';
      setTimeout(() => {
        if (window.scrollY <= 500) backToTop.style.display = 'none';
      }, 300);
    }

    updateActiveNav();
  });

  // Back to top click
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ================================================================
  // MOBILE NAV TOGGLE
  // ================================================================
  const navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const links = document.getElementById('navLinks');
      if (!links) return;
      links.classList.toggle('show');
      navToggle.classList.toggle('open');
    });
  }

  // ================================================================
  // CONTACT FORM
  // ================================================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const name = document.getElementById('cfName').value.trim();
      const email = document.getElementById('cfEmail').value.trim();
      const message = document.getElementById('cfMessage').value.trim();
      const btn = document.getElementById('sendBtn');

      if (!name || !email || !message) {
        showNotification('Please fill in all fields.', 'error');
        return;
      }

      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
      btn.disabled = true;

      try {
        const resp = await fetch(`${API_BASE}/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message })
        });

        if (resp.ok) {
          const data = await resp.json();
          showNotification(data.message || 'Message sent successfully! ✨', 'success');
          contactForm.reset();
        } else {
          let err = 'Failed to send message via server.';
          try { const j = await resp.json(); if (j && j.error) err = j.error; } catch(e){}
          showNotification(err + ' Opening mail client...', 'error');
          openMailto(name, email, message);
        }
      } catch (e) {
        showNotification('Could not reach server. Opening mail client...', 'error');
        openMailto(name, email, message);
      } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
      }
    });
  }

  function openMailto(name, email, message) {
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`Reply-to: ${email}\n\n${message}`);
    window.location.href = `mailto:hirthickroshan2406@gmail.com?subject=${subject}&body=${body}`;
  }

  // ================================================================
  // NOTIFICATION TOAST
  // ================================================================
  function showNotification(msg, type = 'success') {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `notification-toast notification-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : '!'}</span>
      <p>${msg}</p>
    `;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      padding: 0.85rem 1.5rem;
      border-radius: 12px;
      background: ${type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
      border: 1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
      color: ${type === 'success' ? '#4ade80' : '#f87171'};
      backdrop-filter: blur(20px);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.92rem;
      font-weight: 500;
      box-shadow: 0 8px 30px rgba(0,0,0,0.3);
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(100px)';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  // ================================================================
  // TILT EFFECT on glass cards (subtle)
  // ================================================================
  document.querySelectorAll('.glass').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -2;
      const rotateY = (x - centerX) / centerX * 2;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(5px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });

  // Initial active nav check
  updateActiveNav();
});
