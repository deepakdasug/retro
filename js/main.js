/**
 * RETROTECH - BUSINESS MADE EASY
 * Handles automatic background video playback, WhatsApp chat widget,
 * "Connect With Our Experts" modal, and responsive mobile navigation.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================================
     1. CONTINUOUS AUTOMATIC BACKGROUND VIDEO PLAYBACK
     The clip runs seamlessly in the background on load & loops continuously
     ========================================================================= */
  const heroVideo = document.getElementById('heroVideo');

  if (heroVideo) {
    // Explicitly set muted & loop properties for cross-browser autoplay compliance
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.loop = true;
    heroVideo.playsInline = true;
    heroVideo.setAttribute('muted', '');
    heroVideo.setAttribute('playsinline', '');
    heroVideo.setAttribute('autoplay', '');

    // Set slower playback speed (0.6 = 40% slower)
    heroVideo.playbackRate = 0.6;

    const startPlayback = () => {
      heroVideo.muted = true;
      const playPromise = heroVideo.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Background video playing successfully.');
            // Ensure playback rate is set after playback starts
            heroVideo.playbackRate = 0.6;
          })
          .catch((err) => {
            console.warn('Autoplay waiting for user gesture:', err);
          });
      }
    };

    // Attempt playback immediately
    startPlayback();

    // Also trigger as soon as data or metadata is loaded
    heroVideo.addEventListener('loadedmetadata', startPlayback);
    heroVideo.addEventListener('canplay', startPlayback);

    // Guaranteed fallback: trigger on first user interaction if browser policy blocked autoplay
    const triggerOnInteraction = () => {
      if (heroVideo.paused) {
        heroVideo.play().catch(() => {});
        heroVideo.playbackRate = 0.6;
      }
      window.removeEventListener('click', triggerOnInteraction);
      window.removeEventListener('touchstart', triggerOnInteraction);
      window.removeEventListener('scroll', triggerOnInteraction);
      window.removeEventListener('mousemove', triggerOnInteraction);
    };

    window.addEventListener('click', triggerOnInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', triggerOnInteraction, { once: true, passive: true });
    window.addEventListener('scroll', triggerOnInteraction, { once: true, passive: true });
    window.addEventListener('mousemove', triggerOnInteraction, { once: true, passive: true });

    // Loop failsafe
    heroVideo.addEventListener('ended', () => {
      heroVideo.currentTime = 0;
      heroVideo.play().catch(() => {});
    });
  }

  /* =========================================================================
     2. VIDEO SCROLL DOCKING ENGINE
     As user scrolls, video shrinks from full-screen and docks into "Modern [VIDEO] Workplace"
     ========================================================================= */
  const videoContainer = document.getElementById('videoContainer');
  const videoDockSlot = document.getElementById('videoDockSlot');
  const heroContent = document.querySelector('.hero-content');
  const siteHeader = document.getElementById('siteHeader');

  let ticking = false;

  const handleVideoScroll = () => {
    if (!videoDockSlot || !videoContainer) return;

    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;
    const slotRect = videoDockSlot.getBoundingClientRect();

    // Transition distance over which the full minimizing happens
    const transitionDistance = windowH * 0.85;
    const rawProgress = scrollY / transitionDistance;
    const p = Math.min(Math.max(rawProgress, 0), 1);

    // Target dimensions inside the heading
    const targetW = slotRect.width;
    const targetH = slotRect.height;
    const targetX = slotRect.left;
    const targetY = slotRect.top;

    // Mid-scroll transition (centered floating video card)
    const midW = Math.min(windowW * 0.54, 660);
    const midH = midW * (9 / 16);
    const midX = (windowW - midW) / 2;
    const midY = (windowH - midH) / 2 - 20;

    let curW, curH, curX, curY, curShadow;

    if (p <= 0.5) {
      // Phase 1: Full-screen -> Centered floating video card
      const subP = p / 0.5;
      const ease = subP * subP * (3 - 2 * subP);
      curW = windowW + (midW - windowW) * ease;
      curH = windowH + (midH - windowH) * ease;
      curX = 0 + (midX - 0) * ease;
      curY = 0 + (midY - 0) * ease;
      curShadow = ease * 25;
    } else if (p < 1.0) {
      // Phase 2: Centered card -> Inline heading dock slot
      const subP = (p - 0.5) / 0.5;
      const ease = subP * subP * (3 - 2 * subP);
      curW = midW + (targetW - midW) * ease;
      curH = midH + (targetH - midH) * ease;
      curX = midX + (targetX - midX) * ease;
      curY = midY + (targetY - midY) * ease;
      curShadow = 25 - ease * 15;
    } else {
      // Phase 3: Fully docked! Stays locked to the heading as user scrolls further
      curW = targetW;
      curH = targetH;
      curX = targetX;
      curY = targetY;
      curShadow = 10;
    }

    // Apply hardware-accelerated transform & dimensions
    videoContainer.style.width = `${curW}px`;
    videoContainer.style.height = `${curH}px`;
    videoContainer.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
    videoContainer.style.boxShadow = curShadow > 0 ? `0 10px ${curShadow}px rgba(0,0,0,0.22)` : 'none';

    // Fade out hero text
    if (heroContent) {
      const heroOpacity = Math.max(0, 1 - p * 2.2);
      heroContent.style.opacity = heroOpacity;
      heroContent.style.transform = `translateY(${-p * 60}px)`;
      heroContent.style.pointerEvents = heroOpacity < 0.2 ? 'none' : 'auto';
    }

    // Add scrolled class to header
    if (siteHeader) {
      if (scrollY > 40) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleVideoScroll();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  handleVideoScroll();

  /* =========================================================================
     3. "CONNECT WITH OUR EXPERTS" MODAL
     ========================================================================= */
  const expertModal = document.getElementById('expertModal');
  const openExpertModalBtn = document.getElementById('openExpertModalBtn');
  const navContactBtn = document.getElementById('navContactBtn');
  const footerContactBtn = document.getElementById('footerContactBtn');
  const mobileConnectBtn = document.getElementById('mobileConnectBtn');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  const openModal = (e) => {
    if (e) e.preventDefault();
    if (expertModal) expertModal.classList.add('active');
  };

  const closeModal = () => {
    if (expertModal) expertModal.classList.remove('active');
  };

  if (openExpertModalBtn) openExpertModalBtn.addEventListener('click', openModal);
  if (navContactBtn) navContactBtn.addEventListener('click', openModal);
  if (footerContactBtn) footerContactBtn.addEventListener('click', openModal);
  if (mobileConnectBtn) mobileConnectBtn.addEventListener('click', () => {
    closeMobileDrawer();
    openModal();
  });
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

  if (expertModal) {
    expertModal.addEventListener('click', (e) => {
      if (e.target === expertModal) closeModal();
    });
  }

  /* =========================================================================
     4. WHATSAPP FLOATING BUTTON & AUTO GREETING BUBBLE
     ========================================================================= */
  const whatsappBtn = document.getElementById('whatsappBtn');
  const waBubble = document.getElementById('waBubble');
  const waCloseBubble = document.getElementById('waCloseBubble');

  if (whatsappBtn && waBubble) {
    whatsappBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      waBubble.classList.toggle('active');
    });

    if (waCloseBubble) {
      waCloseBubble.addEventListener('click', (e) => {
        e.stopPropagation();
        waBubble.classList.remove('active');
      });
    }

    // Auto-display greeting bubble after 3.5 seconds
    setTimeout(() => {
      if (!waBubble.classList.contains('active')) {
        waBubble.classList.add('active');
      }
    }, 3500);

    document.addEventListener('click', (e) => {
      if (!waBubble.contains(e.target) && !whatsappBtn.contains(e.target)) {
        waBubble.classList.remove('active');
      }
    });
  }

  /* =========================================================================
     5. MOBILE NAVIGATION DRAWER
     ========================================================================= */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const drawerBackdrop = document.getElementById('drawerBackdrop');

  const openMobileDrawer = () => {
    if (mobileNavDrawer) mobileNavDrawer.classList.add('active');
    if (drawerBackdrop) drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileDrawer = () => {
    if (mobileNavDrawer) mobileNavDrawer.classList.remove('active');
    if (drawerBackdrop) drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeMobileDrawer);

  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileDrawer);
  });

  // ESC key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeMobileDrawer();
    }
  });

  /* =========================================================================
     6. SERVICES SECTION SCROLL ANIMATION
     IntersectionObserver with staggered delay for cascading card effect
     Cards disappear when scrolled away and reappear when scrolled back
     ========================================================================= */
  const serviceCards = document.querySelectorAll('[data-service-card]');

  if (serviceCards.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        const card = entry.target;
        const cardIndex = Array.from(serviceCards).indexOf(card);
        const delay = cardIndex * 100; // 100ms staggered delay per card

        if (entry.isIntersecting) {
          // Add visible class with staggered delay
          setTimeout(() => {
            card.classList.add('visible');
          }, delay);
        } else {
          // Remove visible class when scrolled away
          card.classList.remove('visible');
        }
      });
    }, observerOptions);

    serviceCards.forEach((card) => {
      observer.observe(card);
    });
  }

  /* =========================================================================
     7. PROCESS SECTION SCROLL ANIMATION
     IntersectionObserver with staggered delay for cascading step effect
     ========================================================================= */
  const processSteps = document.querySelectorAll('[data-process-step]');

  if (processSteps.length > 0) {
    const processObserverOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const processObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        const step = entry.target;
        const stepIndex = Array.from(processSteps).indexOf(step);
        const delay = stepIndex * 150; // 150ms staggered delay per step

        if (entry.isIntersecting) {
          setTimeout(() => {
            step.classList.add('visible');
          }, delay);
        } else {
          step.classList.remove('visible');
        }
      });
    }, processObserverOptions);

    processSteps.forEach((step) => {
      processObserver.observe(step);
    });
  }

  /* =========================================================================
     8. STATS COUNTERS
      Replay each metric count whenever it re-enters the viewport
     ========================================================================= */
  const statNumbers = document.querySelectorAll('.stats-section .stat-number[data-count]');
    const counterFrames = new WeakMap();
  const formatStatNumber = (number, decimals, suffix) => {
    const formattedNumber = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
    return `${formattedNumber}${suffix}`;
  };

  if ('IntersectionObserver' in window) {
    const statsCounterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const numberElement = entry.target;
        const activeFrame = counterFrames.get(numberElement);
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) {
          if (activeFrame) window.cancelAnimationFrame(activeFrame);
          counterFrames.delete(numberElement);
          return;
        }

        const target = Number(numberElement.dataset.count);
        const decimals = Number(numberElement.dataset.decimals || 0);
        const suffix = numberElement.dataset.suffix || '';
        if (activeFrame) window.cancelAnimationFrame(activeFrame);

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          numberElement.textContent = formatStatNumber(target, decimals, suffix);
          return;
        }

        const duration = 600;
        const startValue = target * 0.75;
        const startTime = performance.now();
        numberElement.textContent = formatStatNumber(startValue, decimals, suffix);

        const updateCounter = (currentTime) => {
          const progress = Math.min((currentTime - startTime) / duration, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 4);
          const currentValue = startValue + (target - startValue) * easedProgress;
          numberElement.textContent = formatStatNumber(currentValue, decimals, suffix);

          if (progress < 1) {
            counterFrames.set(numberElement, window.requestAnimationFrame(updateCounter));
          } else {
            numberElement.textContent = formatStatNumber(target, decimals, suffix);
            counterFrames.delete(numberElement);
          }
        };

        counterFrames.set(numberElement, window.requestAnimationFrame(updateCounter));
      });
    }, { threshold: 0.5 });

    statNumbers.forEach((numberElement) => statsCounterObserver.observe(numberElement));
  } else {
    statNumbers.forEach((numberElement) => {
      const target = Number(numberElement.dataset.count);
      const decimals = Number(numberElement.dataset.decimals || 0);
      const suffix = numberElement.dataset.suffix || '';
      numberElement.textContent = formatStatNumber(target, decimals, suffix);
    });
  }

});
