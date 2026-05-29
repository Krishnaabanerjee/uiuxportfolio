/* ----------------------------------------------------
 * FLOATING IMAGES CURSOR-REACTIVE 3D PARALLAX & TILT
 * ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // Select all floating image cards
  const cards = [
    {
      el: document.querySelector('.card-scenic'),
      baseRot: -4,
      parallaxFactor: 0.04, // Intensity of X/Y drift
      tiltIntensity: 12,    // Degrees of rotational tilt
      currentX: 0,
      currentY: 0,
      currentRot: -4
    },
    {
      el: document.querySelector('.card-bicycle'),
      baseRot: 3,
      parallaxFactor: 0.025,
      tiltIntensity: -8,
      currentX: 0,
      currentY: 0,
      currentRot: 3
    },
    {
      el: document.querySelector('.card-laptop'),
      baseRot: -3,
      parallaxFactor: 0.03,
      tiltIntensity: 10,
      currentX: 0,
      currentY: 0,
      currentRot: -3
    },
    {
      el: document.querySelector('.card-portrait'),
      baseRot: 4,
      parallaxFactor: 0.045,
      tiltIntensity: -7,
      currentX: 0,
      currentY: 0,
      currentRot: 4
    }
  ];

  // Mouse Coordinates
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  // Track global mouse position
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Animation interpolation speed (Ease out factor)
  const easeFactor = 0.08;

  // 1. Core Parallax Loop
  let currentCardYOffset = 0;
  
  // Store smoothed image Y values for each project card
  const projectCardNodes = document.querySelectorAll('.project-card');
  const projectCardsData = Array.from(projectCardNodes).map(card => ({
    el: card,
    currentImgY: 0
  }));

  function animateParallax() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Normalize mouse position relative to center: range [-1, 1]
    const normX = (mouseX - centerX) / centerX;
    const normY = (mouseY - centerY) / centerY;

    // A. Hero Floating Images Mouse Parallax
    cards.forEach((card) => {
      if (!card.el) return;

      // Target offsets based on normalized cursor position and factor
      const targetX = normX * (window.innerWidth * card.parallaxFactor);
      const targetY = normY * (window.innerHeight * card.parallaxFactor);
      const targetRot = card.baseRot + (normX * card.tiltIntensity);

      // Lerp calculations for ultra-smooth fluid transitions
      card.currentX += (targetX - card.currentX) * easeFactor;
      card.currentY += (targetY - card.currentY) * easeFactor;
      card.currentRot += (targetRot - card.currentRot) * easeFactor;

      // Apply style transforms. Note calc(-50% + Y) keeps them aligned with their CSS centering
      card.el.style.transform = `translate3d(${card.currentX}px, calc(-50% + ${card.currentY}px), 0) rotate(${card.currentRot}deg)`;
    });

    // B. Projects Section Scroll Parallax (Dual-track column slide + inner image window drift)
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      const sectionRect = projectsSection.getBoundingClientRect();
      const inViewport = sectionRect.top < window.innerHeight && sectionRect.bottom > 0;

      if (inViewport) {
        // Compute column slide parallax (only in 2-column desktop mode)
        if (window.innerWidth > 992) {
          const progress = (window.innerHeight - sectionRect.top) / (sectionRect.height + window.innerHeight);
          // Right column cards Y offset (drift slowly)
          const targetCardYOffset = (progress - 0.5) * -80; // ranges from -40px to +40px
          currentCardYOffset += (targetCardYOffset - currentCardYOffset) * easeFactor;

          // In desktop, Cards 3, 5, 7 are odd-index nodes (nth-child(odd):not(.card-full))
          const rightCards = document.querySelectorAll('.projects-grid > :nth-child(odd):not(.card-full)');
          rightCards.forEach(card => {
            card.style.setProperty('--card-y-offset', `${currentCardYOffset}px`);
          });
          
          // Left column and full-width cards ensure Y offset is 0
          const leftCards = document.querySelectorAll('.projects-grid > :nth-child(even), .projects-grid > .card-full');
          leftCards.forEach(card => {
            card.style.setProperty('--card-y-offset', '0px');
          });
        } else {
          // Reset card y offset on smaller devices where cards are single column
          projectCardNodes.forEach(card => {
            card.style.setProperty('--card-y-offset', '0px');
          });
        }

        // Compute inner image scroll parallax for all project cards
        projectCardsData.forEach(cardData => {
          const cardRect = cardData.el.getBoundingClientRect();
          if (cardRect.top < window.innerHeight && cardRect.bottom > 0) {
            const cardCenter = cardRect.top + cardRect.height / 2;
            const viewportCenter = window.innerHeight / 2;
            const diff = cardCenter - viewportCenter;
            const ratio = diff / window.innerHeight; // range roughly -1 to 1

            // Translate range from -30px to +30px
            const targetImgY = ratio * 30;
            cardData.currentImgY += (targetImgY - cardData.currentImgY) * easeFactor;

            const img = cardData.el.querySelector('.project-visual img');
            if (img) {
              img.style.setProperty('--img-y-offset', `${cardData.currentImgY}px`);
            }
          }
        });
      }
    }

    // C. Skills Stack to Process Section Parallax curtain reveal (Desktop only)
    if (window.innerWidth > 992) {
      const processSection = document.getElementById('process');
      const skillsStackSection = document.getElementById('skills-stack');
      if (processSection && skillsStackSection) {
        const processRect = processSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        if (processRect.top < viewportHeight && processRect.bottom > 0) {
          const progress = viewportHeight - processRect.top;
          // Slowly move skills stack down as process section overlaps it
          const targetTranslateY = progress * 0.4;
          skillsStackSection.style.transform = `translate3d(0, ${targetTranslateY}px, 0)`;
        } else if (processRect.top >= viewportHeight) {
          skillsStackSection.style.transform = 'translate3d(0, 0, 0)';
        }
      }
    } else {
      const skillsStackSection = document.getElementById('skills-stack');
      if (skillsStackSection) {
        skillsStackSection.style.transform = 'none';
      }
    }

    requestAnimationFrame(animateParallax);
  }
  
  // Start parallax loop
  requestAnimationFrame(animateParallax);

  // 2. Individual 3D Perspective Card Tilt on Direct Hover
  cards.forEach((card) => {
    if (!card.el) return;
    
    const wrapper = card.el.querySelector('.img-wrapper');
    if (!wrapper) return;

    card.el.addEventListener('mousemove', (e) => {
      const rect = card.el.getBoundingClientRect();
      
      // Local coordinates inside card [0 to width], [0 to height]
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      
      // Normalize local coords to range [-0.5, 0.5]
      const normLocalX = (localX / rect.width) - 0.5;
      const normLocalY = (localY / rect.height) - 0.5;

      // Apply extreme 3D rotation matrix onto the image wrapper inside
      const tiltAngleX = -normLocalY * 20; // rotation around X axis (looks up/down)
      const tiltAngleY = normLocalX * 20;  // rotation around Y axis (looks left/right)

      // Transform inner wrapper
      wrapper.style.transform = `perspective(800px) rotateX(${tiltAngleX}deg) rotateY(${tiltAngleY}deg) scale(1.04)`;
      wrapper.style.transition = 'transform 0.1s ease';
    });

    card.el.addEventListener('mouseleave', () => {
      // Return smooth back to base orientation
      wrapper.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)`;
      wrapper.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    });
  });

  // 3. ABOUT ME: STATS COUNT-UP TICKER & ID CARD DROP TRIGGER
  const aboutSection = document.getElementById('about');
  const idCardAssembly = document.getElementById('idCardAssembly');
  const statValues = document.querySelectorAll('.stat-value');
  const statsGrid = document.querySelector('.stats-grid');
  
  let aboutAnimationTriggered = false;
  let statsAnimationTriggered = false;

  // A. Observer for ID Card drop trigger (triggers immediately as About section enters viewport)
  const aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !aboutAnimationTriggered) {
        aboutAnimationTriggered = true;
        
        if (idCardAssembly) {
          idCardAssembly.classList.add('animate-drop');
        }
        
        aboutObserver.unobserve(aboutSection);
      }
    });
  }, {
    threshold: 0.05
  });

  if (aboutSection) {
    aboutObserver.observe(aboutSection);
  }

  // B. Observer for Stats Grid (triggers only when stats cards are visible on screen)
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimationTriggered) {
        statsAnimationTriggered = true;
        
        statValues.forEach(stat => {
          const targetValue = parseFloat(stat.getAttribute('data-target'));
          const suffix = stat.getAttribute('data-suffix') || '';
          const decimals = parseInt(stat.getAttribute('data-decimals') || '0', 10);
          
          let startValue = 0;
          const duration = 1800; // 1.8 seconds count up
          const frameTime = 1000 / 60; // 60 FPS
          const totalFrames = duration / frameTime;
          const increment = targetValue / totalFrames;
          let currentFrame = 0;
          
          function updateTicker() {
            currentFrame++;
            startValue += increment;
            
            if (currentFrame >= totalFrames) {
              stat.textContent = targetValue.toFixed(decimals) + suffix;
            } else {
              stat.textContent = startValue.toFixed(decimals) + suffix;
              requestAnimationFrame(updateTicker);
            }
          }
          
          // Small staggered delay for a clean counting sequence
          setTimeout(() => {
            requestAnimationFrame(updateTicker);
          }, 200);
        });
        
        if (statsGrid) {
          statsObserver.unobserve(statsGrid);
        }
      }
    });
  }, {
    threshold: 0.15 // Trigger when 15% of the stats grid itself is visible
  });

  if (statsGrid) {
    statsObserver.observe(statsGrid);
  }

  // 4. ID BADGE 3D TILT ON HOVER (Once Settled)
  const idBadge = document.querySelector('.badge-system-wrapper');
  if (idBadge) {
    idBadge.addEventListener('mousemove', (e) => {
      const rect = idBadge.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      
      const normLocalX = (localX / rect.width) - 0.5;
      const normLocalY = (localY / rect.height) - 0.5;

      const tiltAngleX = -normLocalY * 18; // tilt up/down (X axis)
      const tiltAngleY = normLocalX * 18;  // tilt left/right (Y axis)

      // Add a subtle 3D translation as well for extra realism
      idBadge.style.transform = `perspective(1000px) rotateX(${tiltAngleX}deg) rotateY(${tiltAngleY}deg) translateY(-2px) scale(1.03)`;
      idBadge.style.transition = 'transform 0.1s ease';
    });

    idBadge.addEventListener('mouseleave', () => {
      idBadge.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
      idBadge.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    });
  }

  // 5. WHAT I BRING: STACKED CARDS SCROLL TRANSFORM ANIMATION (Webstack Style)
  function initCardStacking() {
    const cards = document.querySelectorAll('.skill-stack-card');
    const grid = document.querySelector('.skills-stack-grid');
    
    if (!cards.length || !grid) return;
    
    // We only apply scroll transforms on desktop/large screens (width > 992px)
    function handleScrollStacking() {
      if (window.innerWidth <= 992) {
        // Reset styles for mobile stack
        cards.forEach(card => {
          card.style.transform = 'none';
          card.style.opacity = '1';
        });
        return;
      }
      
      const gridRect = grid.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        // Sticky top positions defined in style.css
        const stickyTop = 120 + index * 25;
        
        // Calculate the distance of the card relative to its sticky activation point
        const distanceToSticky = cardRect.top - stickyTop;
        
        if (distanceToSticky <= 0) {
          // Card is stuck!
          // We look at the next card to see if it is scrolling over this one.
          const nextCard = cards[index + 1];
          if (nextCard) {
            const nextRect = nextCard.getBoundingClientRect();
            const nextStickyTop = 120 + (index + 1) * 25;
            
            // Calculate stacking progress: how close is the next card to sticking?
            const stackDistance = nextRect.top - nextStickyTop;
            const cardHeight = cardRect.height;
            
            // Calculate normalized progress (0 to 1) as the next card scrolls up
            let progress = 0;
            if (stackDistance > 0 && cardHeight > 0) {
              progress = 1 - Math.min(1, stackDistance / (cardHeight + 32)); // 32 is CSS gap
            } else if (stackDistance <= 0) {
              progress = 1;
            }
            
            // Webstack style: Scale down slightly (down to 0.94) and fade opacity (down to 0.55)
            const targetScale = 1 - (progress * 0.06);
            const targetOpacity = 1 - (progress * 0.45);
            
            card.style.transform = `scale(${targetScale})`;
            card.style.opacity = `${targetOpacity}`;
          } else {
            // Last card, keeps normal properties
            card.style.transform = 'scale(1)';
            card.style.opacity = '1';
          }
        } else {
          // Card is not stuck yet
          card.style.transform = 'scale(1)';
          card.style.opacity = '1';
        }
      });
    }
    
    // Listen to scroll and resize events
    window.addEventListener('scroll', handleScrollStacking);
    window.addEventListener('resize', handleScrollStacking);
    handleScrollStacking(); // run once on load
  }
  
  initCardStacking();

  // 6. HOW I WORK: PROCESS CARDS SCROLL REVEAL (Sequential Staggered Fade-up)
  function initProcessScrollReveal() {
    const processCards = document.querySelectorAll('.process-card');
    const processSection = document.getElementById('process');
    
    if (!processCards.length || !processSection) return;
    
    const processObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          processCards.forEach(card => {
            card.classList.add('visible');
          });
          processObserver.unobserve(processSection);
        }
      });
    }, {
      threshold: 0.15 // Trigger when 15% of the section is visible
    });
    
    processObserver.observe(processSection);
  }
  
  initProcessScrollReveal();

  // 7. CREATIVE LAB: BENTO GRID CARDS SCROLL REVEAL (Sequential Staggered Spring Reveal)
  function initLabScrollReveal() {
    const labCards = document.querySelectorAll('.lab-card');
    const labSection = document.getElementById('lab');
    
    if (!labCards.length || !labSection) return;
    
    const labObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          labCards.forEach(card => {
            card.classList.add('visible');
          });
          labObserver.unobserve(labSection);
        }
      });
    }, {
      threshold: 0.15 // Trigger when 15% of the section is visible
    });
    
    labObserver.observe(labSection);
  }
  
  initLabScrollReveal();
});
