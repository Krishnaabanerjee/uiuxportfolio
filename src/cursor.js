/* ----------------------------------------------------
 * INTERACTIVE CUSTOM CURSOR & MAGNETIC SNAPPING
 * ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('customCursor');
  const dot = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');
  const text = cursor.querySelector('.cursor-text');

  // Mouse Coordinates
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  // Smoothed Cursor Coordinates (Lerped)
  let dotX = mouseX;
  let dotY = mouseY;
  let ringX = mouseX;
  let ringY = mouseY;

  // Linear Interpolation (Lerp) factor
  const dotEase = 0.35;
  const ringEase = 0.12;

  // Keep track of active magnetic elements
  let activeMagnetic = null;

  // 1. Mouse movement tracking
  window.addEventListener('mousemove', (e) => {
    // If we're interacting with a magnetic element, the position can be influenced
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Hide cursor when leaving viewport, show when entering
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });

  // 2. Main Animation Loop (High Performance Raf)
  function updateCursor() {
    // Standard Lerp
    dotX += (mouseX - dotX) * dotEase;
    dotY += (mouseY - dotY) * dotEase;
    ringX += (mouseX - ringX) * ringEase;
    ringY += (mouseY - ringY) * ringEase;

    // Apply translations
    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    text.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${cursor.classList.contains('has-text') ? 1 : 0})`;

    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  // 3. Hover Interactions (Scale, Morph, Contrast Adjustments)
  const interactiveSelector = 'a, button, .social-btn, .quick-btn, .chat-close-btn, .floating-img-card, .highlight, .project-card, .stat-card, .skill-logo-wrap, .skill-stack-card, .process-card, .lab-card';
  
  document.body.addEventListener('mouseover', (e) => {
    const target = e.target.closest(interactiveSelector);
    
    // Detect if we are hovering over the purple projects section background (and not on a dark card)
    const inProjectsSection = e.target.closest('.projects-section');
    const inProjectCard = e.target.closest('.project-card');
    const inFooterSection = e.target.closest('.footer-section');
    const inFooterStar = e.target.closest('.footer-star-wrap') || e.target.closest('.footer-star-svg');
    
    // Detect if we are hovering over an element that has or will turn into the accent purple color
    const isPurpleTarget = target && (
                           target.classList.contains('highlight') || 
                           target.closest('.btn') || 
                           target.closest('.chatbot-toggle') || 
                           target.closest('.chat-send-btn') ||
                           target.closest('.quick-btn'));

    if (inFooterStar) {
      cursor.classList.remove('on-purple');
      cursor.classList.add('on-star');
    } else {
      cursor.classList.remove('on-star');
      if (isPurpleTarget || (inProjectsSection && !inProjectCard) || inFooterSection) {
        cursor.classList.add('on-purple');
      } else {
        cursor.classList.remove('on-purple');
      }
    }

    if (!target) return;

    // Determine hover layout changes
    if (target.classList.contains('floating-img-card')) {
      cursor.classList.add('hovering');
    } else if (target.classList.contains('card-locked')) {
      cursor.classList.add('hovering-locked');
    } else if ((target.classList.contains('project-card') && !target.classList.contains('behance-redirect-card')) || target.classList.contains('process-card') || target.classList.contains('lab-card')) {
      cursor.classList.add('hovering-card');
    } else if (target.classList.contains('stat-card')) {
      cursor.classList.add('hovering');
    } else if (target.classList.contains('skill-logo-wrap')) {
      cursor.classList.add('hovering-link');
    } else if (target.tagName === 'A' || target.classList.contains('social-btn') || target.classList.contains('nav-link')) {
      cursor.classList.add('hovering-link');
    } else {
      cursor.classList.add('hovering');
    }
  });

  document.body.addEventListener('mouseout', (e) => {
    const target = e.target.closest(interactiveSelector);
    
    // Maintain contrast class check on mouseout
    const inProjectsSection = e.target.closest('.projects-section');
    const inProjectCard = e.target.closest('.project-card');
    const inFooterSection = e.target.closest('.footer-section');
    const inFooterStar = e.target.closest('.footer-star-wrap') || e.target.closest('.footer-star-svg');
    
    if (inFooterStar) {
      cursor.classList.remove('on-purple');
      cursor.classList.add('on-star');
    } else {
      cursor.classList.remove('on-star');
      if ((inProjectsSection && !inProjectCard) || inFooterSection) {
        cursor.classList.add('on-purple');
      } else {
        cursor.classList.remove('on-purple');
      }
    }

    if (!target) return;
    
    cursor.classList.remove('hovering', 'hovering-link', 'hovering-card', 'hovering-locked', 'has-text');
    text.textContent = '';
  });

  // Click Animation
  window.addEventListener('mousedown', () => {
    ring.style.width = '30px';
    ring.style.height = '30px';
    ring.style.backgroundColor = 'var(--accent-purple-medium)';
  });

  window.addEventListener('mouseup', () => {
    if (cursor.classList.contains('hovering')) {
      ring.style.width = '64px';
      ring.style.height = '64px';
    } else if (cursor.classList.contains('hovering-card') || cursor.classList.contains('hovering-locked')) {
      ring.style.width = '72px';
      ring.style.height = '72px';
    } else if (cursor.classList.contains('hovering-link')) {
      ring.style.width = '50px';
      ring.style.height = '50px';
    } else {
      ring.style.width = '44px';
      ring.style.height = '44px';
    }
    ring.style.backgroundColor = '';
  });

  // 4. MAGNETIC ATTRACTOR LOGIC
  const magneticElements = document.querySelectorAll('.magnetic');

  magneticElements.forEach((el) => {
    el.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      
      // Calculate relative center of the element
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from mouse to center
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      // Magnetic Snapping Force (adjust strength here, e.g. 0.3)
      const pullForce = 0.35;

      // Translate the actual element to float toward cursor
      this.style.transform = `translate3d(${distanceX * pullForce}px, ${distanceY * pullForce}px, 0)`;
      this.style.transition = 'none'; // Disable transition during mousemove for real-time tracking

      // Attract cursor center slightly to the button center
      mouseX = centerX + distanceX * 0.45;
      mouseY = centerY + distanceY * 0.45;
    });

    el.addEventListener('mouseleave', function() {
      // Smoothly snap element back to rest position
      this.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      this.style.transform = 'translate3d(0px, 0px, 0)';
    });
  });

  // 5. NDA Locked Card Click Interaction
  const lockedCards = document.querySelectorAll('.card-locked');
  const ndaToast = document.getElementById('ndaToast');
  let toastTimeout = null;

  lockedCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Locate lock icon inside this card
      const lockIcon = card.querySelector('.lock-icon');
      if (lockIcon) {
        // Trigger high-end CSS shake animation
        lockIcon.classList.remove('shake');
        void lockIcon.offsetWidth; // force layout reflow
        lockIcon.classList.add('shake');
        
        setTimeout(() => {
          lockIcon.classList.remove('shake');
        }, 500);
      }

      // Display the non-intrusive NDA toast message
      if (ndaToast) {
        if (toastTimeout) {
          clearTimeout(toastTimeout);
          ndaToast.classList.remove('active');
          void ndaToast.offsetWidth; // force layout reflow
        }
        
        ndaToast.classList.add('active');
        
        toastTimeout = setTimeout(() => {
          ndaToast.classList.remove('active');
          toastTimeout = null;
        }, 3500);
      }
    });
  });
});
