/*
  GSAP-driven animations:
   - on-scroll reveals (IntersectionObserver)
   - hover micro-interactions (desktop + touch fallback)
   - carousel caption + indicators animation on slide
   Respects prefers-reduced-motion.
*/
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsapAvailable = typeof window.gsap !== 'undefined';
  if (!gsapAvailable || reduced) {
    // no-op: ensure elements visible if reduced or GSAP missing
  }

  const qs = (s, ctx = document) => Array.from((ctx || document).querySelectorAll(s));

  // helper: exclude elements marked with .gsap-exclude or data-gsap="exclude"
  const isExcluded = (el) => !!el.closest('[data-gsap="exclude"], .gsap-exclude');

  // On-scroll reveal using IntersectionObserver + GSAP
  const revealTargets = qs('.animate-on-scroll, .animate-scale, .animate-pop, .card, .info, .page-header')
    .filter(el => !isExcluded(el));

  revealTargets.forEach(el => gsap.set(el, { opacity: 0, y: 18 }));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseFloat(el.dataset.delay || 0);
      gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay });
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealTargets.forEach(el => io.observe(el));

  // Hover micro-interactions
  const hoverElems = qs('.animate-pop, .animate-scale, .btn, .info, .carousel-caption')
    .filter(el => !isExcluded(el));

  hoverElems.forEach(el => {
    let hoverTween;
    el.addEventListener('mouseenter', () => {
      hoverTween && hoverTween.kill();
      hoverTween = gsap.to(el, { scale: 1.04, y: -6, duration: 0.22, ease: 'power1.out' });
    });
    el.addEventListener('mouseleave', () => {
      hoverTween && hoverTween.reverse();
    });
    // touch: quick feedback
    el.addEventListener('touchstart', () => {
      gsap.fromTo(el, { scale: 1 }, { scale: 1.03, y: -4, duration: 0.12, ease: 'power1.out' });
      setTimeout(() => gsap.to(el, { scale: 1, y: 0, duration: 0.24, ease: 'power1.out' }), 380);
    }, { passive: true });
  });

  // Carousel caption + indicators animation
  const carousel = document.querySelector('#carouselExampleCaptions');
  // if the carousel itself or its parent is excluded, skip GSAP controls for it
  if (carousel && !isExcluded(carousel)) {
    const captionIn = (caption) => {
      if (!caption) return;
      gsap.killTweensOf(caption);
      gsap.set(caption, { y: 22, opacity: 0 });
      gsap.to(caption, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
    };
    const captionOut = (caption) => {
      if (!caption) return;
      gsap.killTweensOf(caption);
      gsap.to(caption, { y: -12, opacity: 0, duration: 0.34, ease: 'power2.in' });
    };
    const animateIndicators = (activeIndex = 0) => {
      const inds = qs('.carousel-indicators button', carousel);
      gsap.set(inds, { scale: 0.9, opacity: 0.7 });
      gsap.to(inds, {
        scale: 1,
        opacity: 1,
        duration: 0.36,
        ease: 'back.out(1.1)',
        stagger: { each: 0.06, from: activeIndex }
      });
      if (inds[activeIndex]) {
        gsap.fromTo(inds[activeIndex], { scale: 0.9 }, { scale: 1.35, duration: 0.28, ease: 'power3.out', yoyo: true, repeat: 1 });
      }
    };

    carousel.addEventListener('slide.bs.carousel', () => {
      const outgoingCap = carousel.querySelector('.carousel-item.active .carousel-caption');
      captionOut(outgoingCap);
      gsap.to(qs('.carousel-indicators button', carousel), { opacity: 0.6, scale: 0.9, duration: 0.15, ease: 'power1.in' });
    });

    carousel.addEventListener('slid.bs.carousel', (e) => {
      const incomingCap = carousel.querySelector('.carousel-item.active .carousel-caption');
      // Bootstrap provides `to` index on event object in many builds; fallback to find active
      const activeIndex = (typeof e.to === 'number') ? e.to : qs('.carousel-item', carousel).findIndex(i => i.classList.contains('active'));
      captionIn(incomingCap);
      animateIndicators(activeIndex >= 0 ? activeIndex : 0);
    });

    // initial run
    const initCap = carousel.querySelector('.carousel-item.active .carousel-caption');
    captionIn(initCap);
    const initIndex = qs('.carousel-item', carousel).findIndex(i => i.classList.contains('active'));
    animateIndicators(initIndex >= 0 ? initIndex : 0);
  }

  // Animate a specific div (id="promoCard" or class=".promo-card")
  const promo = document.querySelector('#promoCard') || document.querySelector('.promo-card');
  if (promo && !isExcluded(promo) && gsapAvailable && !reduced) {
    // entrance reveal (uses optional data-delay attribute)
    gsap.fromTo(
      promo,
      { y: 22, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', delay: parseFloat(promo.dataset.delay || 0) }
    );

    // subtle hover/touch micro-interaction
    let promoHover;
    promo.addEventListener('mouseenter', () => {
      promoHover && promoHover.kill();
      promoHover = gsap.to(promo, { scale: 1.035, y: -6, duration: 0.18, ease: 'power1.out' });
    });
    promo.addEventListener('mouseleave', () => {
      promoHover && promoHover.reverse();
    });
    promo.addEventListener('touchstart', () => {
      gsap.fromTo(promo, { scale: 1 }, { scale: 1.02, y: -4, duration: 0.12, ease: 'power1.out' });
      setTimeout(() => gsap.to(promo, { scale: 1, y: 0, duration: 0.24, ease: 'power1.out' }), 360);
    }, { passive: true });
  }

})();