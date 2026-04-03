// Basic interactive behaviors: typing animation, progress bars, scroll reveal, nav toggle
document.addEventListener('DOMContentLoaded', () => {
  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Typing animation
  const phrases = ['Full Stack Developer', 'Web Developer', 'Tech Enthusiast'];
  const typedEl = document.getElementById('typed');
  let pIndex = 0, charIndex = 0, deleting = false;

  function typeLoop() {
    const current = phrases[pIndex];
    if (!deleting) {
      typedEl.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(typeLoop, 1200);
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
    setTimeout(typeLoop, deleting ? 60 : 110);
  }
  typeLoop();

  // Progress bars animation
  const progressEls = document.querySelectorAll('.progress');
  function animateProgress() {
    progressEls.forEach(el => {
      const pct = el.dataset.percent || 0;
      const inner = el.querySelector('span');
      inner.style.width = pct + '%';
    });
  }

  // Intersection observer for reveal animations
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
      }
    });
  }, {threshold: 0.12});

  document.querySelectorAll('.glass, .project-card, .skill-card, .about-text, .hero-copy').forEach(el => {
    revealObserver.observe(el);
  });

  // Run progress when skills section visible
  const skillsSection = document.getElementById('skills');
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateProgress(); obs.disconnect(); }
    });
  }, {threshold: .2}).observe(skillsSection);

  // Smooth scroll for internal links (already via CSS but ensure offset for fixed nav)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (ev) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        ev.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({top, behavior:'smooth'});
      }
    });
  });

  // Back to top
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) backToTop.style.display = 'flex'; else backToTop.style.display = 'none';
    // navbar background change
    const navWrap = document.getElementById('header');
    if (window.scrollY > 40) navWrap.classList.add('scrolled'); else navWrap.classList.remove('scrolled');
    // progress top
    const progressTop = document.getElementById('progressTop');
    const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    progressTop.style.width = Math.min(100, scrolled * 100) + '%';
  });

  backToTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

  // Nav toggle for mobile
  const navToggle = document.getElementById('navToggle');
  navToggle.addEventListener('click', () => {
    const links = document.querySelector('.nav-links');
    links.style.display = links.style.display === 'flex' ? '' : 'flex';
  });

  // Contact form -> POST to backend /send-email (falls back to mailto if server unavailable)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const name = document.getElementById('cfName').value.trim();
      const email = document.getElementById('cfEmail').value.trim();
      const message = document.getElementById('cfMessage').value.trim();
      const btn = document.getElementById('sendBtn');

      // Basic validation
      if (!name || !email || !message) {
        alert('Please fill in name, email and message.');
        return;
      }

      // Show loading state
      const originalText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;

      // Try POST to backend
      try {
        const resp = await fetch('http://localhost:5000/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message })
        });

        if (resp.ok) {
          const data = await resp.json();
          alert(data.message || 'Message sent successfully!');
          contactForm.reset();
        } else {
          // If server returned error, show message and fallback to mailto option
          let err = 'Failed to send message via server.';
          try { const j = await resp.json(); if (j && j.error) err = j.error; } catch(e){}
          alert(err + ' Opening your mail client as fallback.');
          // fallback: open mail client so user can still send
          const subject = encodeURIComponent(`Portfolio message from ${name}`);
          const body = encodeURIComponent(`Reply-to: ${email}\n\n${message}`);
          window.location.href = `mailto:hirthickroshan2406@gmail.com?subject=${subject}&body=${body}`;
        }
      } catch (e) {
        // Network or CORS error -> fallback to mailto
        alert('Could not reach email server. Opening your mail client as fallback.');
        const subject = encodeURIComponent(`Portfolio message from ${name}`);
        const body = encodeURIComponent(`Reply-to: ${email}\n\n${message}`);
        window.location.href = `mailto:hirthickroshan2406@gmail.com?subject=${subject}&body=${body}`;
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  // initial call in case nearby elements visible
  animateProgress();
});
