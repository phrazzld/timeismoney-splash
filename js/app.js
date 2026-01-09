/**
 * Time is Money - Static Landing Page
 * Three interactive components: DemoCard, TimeThieves, ChromeButton
 */
(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // CONSTANTS & DATA
  // ═══════════════════════════════════════════════════════════════
  const CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/time-is-money/ooppbnomdcjmoepangldchpmjhkeendl?hl=en';

  const DRAMATIC_EXAMPLES = [
    { price: "$299", time: "18 hours", item: "AirPods Pro" },
    { price: "$899", time: "54 hours", item: "iPhone" },
    { price: "$1,299", time: "79 hours", item: "MacBook" },
    { price: "$45", time: "3 hours", item: "dinner out" },
    { price: "$159", time: "10 hours", item: "designer shoes" },
    { price: "$2,500", time: "152 hours", item: "vacation" }
  ];

  const TIME_THIEVES = [
    { name: "Streaming services", desc: "Netflix, Spotify, Disney+, etc.", monthly: 50, hours: 2, yearly: 24, icon: "📺" },
    { name: "Daily coffee", desc: "That $5 morning ritual", monthly: 150, hours: 6, yearly: 72, icon: "☕" },
    { name: "Food delivery fees", desc: "Convenience charges add up", monthly: 80, hours: 3.2, yearly: 38.4, icon: "🚗" },
    { name: "Unused gym membership", desc: "Haven't gone in months", monthly: 40, hours: 1.6, yearly: 19.2, icon: "💪" },
    { name: "Impulse shopping", desc: "Those \"small\" purchases", monthly: 200, hours: 8, yearly: 96, icon: "🛍️" },
    { name: "Subscription boxes", desc: "Monthly surprises you forget about", monthly: 35, hours: 1.4, yearly: 16.8, icon: "📦" }
  ];

  // ═══════════════════════════════════════════════════════════════
  // DEMO CARD CAROUSEL
  // ═══════════════════════════════════════════════════════════════
  function initDemoCard() {
    const card = document.getElementById('demo-card');
    if (!card) return;

    let currentIndex = 0;
    let isPaused = false;
    let intervalId;

    const itemEl = card.querySelector('[data-item]');
    const priceEl = card.querySelector('[data-price]');
    const timeEl = card.querySelector('[data-time]');
    const dotsContainer = card.querySelector('[data-dots]');

    function render() {
      const current = DRAMATIC_EXAMPLES[currentIndex];
      if (itemEl) itemEl.textContent = current.item;
      if (priceEl) priceEl.textContent = current.price;
      if (timeEl) timeEl.textContent = current.time;
      updateDots();
    }

    function updateDots() {
      if (!dotsContainer) return;
      dotsContainer.querySelectorAll('.demo-dot').forEach(function(dot, i) {
        if (i === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    function next() {
      currentIndex = (currentIndex + 1) % DRAMATIC_EXAMPLES.length;
      render();
    }

    function prev() {
      currentIndex = (currentIndex - 1 + DRAMATIC_EXAMPLES.length) % DRAMATIC_EXAMPLES.length;
      render();
    }

    function startAutoRotate() {
      intervalId = setInterval(function() {
        if (!isPaused) next();
      }, 3500);
    }

    // Create dots
    if (dotsContainer) {
      DRAMATIC_EXAMPLES.forEach(function(_, i) {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', 'View example ' + (i + 1));
        dot.className = 'demo-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', function() {
          currentIndex = i;
          render();
        });
        dotsContainer.appendChild(dot);
      });
    }

    // Event listeners
    card.addEventListener('mouseenter', function() { isPaused = true; });
    card.addEventListener('mouseleave', function() { isPaused = false; });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });

    render();
    startAutoRotate();
  }

  // ═══════════════════════════════════════════════════════════════
  // TIME THIEVES TOGGLE & COUNTER
  // ═══════════════════════════════════════════════════════════════
  function initTimeThieves() {
    const section = document.getElementById('time-thieves');
    if (!section) return;

    let showYearly = false;
    let currentTotal = 0;
    let animationFrame;

    const monthlyBtn = section.querySelector('[data-period="monthly"]');
    const yearlyBtn = section.querySelector('[data-period="yearly"]');
    const cards = section.querySelectorAll('[data-thief]');
    const totalEl = section.querySelector('[data-total]');
    const subtitleEl = section.querySelector('[data-subtitle]');

    function getTotal() {
      return TIME_THIEVES.reduce(function(sum, t) {
        return sum + (showYearly ? t.yearly : t.hours);
      }, 0);
    }

    function animateCounter(target) {
      const start = currentTotal;
      const diff = target - start;
      const duration = 1000;
      const startTime = performance.now();

      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        currentTotal = start + diff * eased;
        if (totalEl) totalEl.textContent = Math.round(currentTotal);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(tick);
        }
      }

      cancelAnimationFrame(animationFrame);
      requestAnimationFrame(tick);
    }

    function update() {
      // Update toggle buttons
      if (monthlyBtn) {
        if (!showYearly) {
          monthlyBtn.classList.add('active');
        } else {
          monthlyBtn.classList.remove('active');
        }
      }
      if (yearlyBtn) {
        if (showYearly) {
          yearlyBtn.classList.add('active');
        } else {
          yearlyBtn.classList.remove('active');
        }
      }

      // Update cards
      cards.forEach(function(card, i) {
        var t = TIME_THIEVES[i];
        if (!t) return;
        var hoursEl = card.querySelector('[data-hours]');
        var costEl = card.querySelector('[data-cost]');
        if (hoursEl) hoursEl.textContent = (showYearly ? t.yearly : t.hours) + ' hours';
        if (costEl) costEl.textContent = '$' + t.monthly + (showYearly ? '/mo' : ' per month');
      });

      // Update total with animation
      animateCounter(getTotal());

      // Update subtitle
      if (subtitleEl) {
        if (showYearly) {
          subtitleEl.textContent = "That's " + Math.round(getTotal() / 40) + ' full work weeks per year';
        } else {
          subtitleEl.textContent = 'Every single month';
        }
      }
    }

    if (monthlyBtn) {
      monthlyBtn.addEventListener('click', function() {
        showYearly = false;
        update();
      });
    }

    if (yearlyBtn) {
      yearlyBtn.addEventListener('click', function() {
        showYearly = true;
        update();
      });
    }

    update();
  }

  // ═══════════════════════════════════════════════════════════════
  // CHROME INSTALL BUTTON
  // ═══════════════════════════════════════════════════════════════
  function initChromeButtons() {
    document.querySelectorAll('[data-chrome-btn]').forEach(function(btn) {
      var textEl = btn.querySelector('[data-text]');
      var arrowEl = btn.querySelector('[data-arrow]');
      var spinnerEl = btn.querySelector('[data-spinner]');
      var originalText = textEl ? textEl.textContent : '';

      btn.addEventListener('click', function() {
        // Show loading state
        if (textEl) textEl.textContent = 'Opening...';
        if (arrowEl) arrowEl.style.display = 'none';
        if (spinnerEl) spinnerEl.style.display = 'inline-block';
        btn.disabled = true;

        // Open store after brief delay for feedback
        setTimeout(function() {
          window.open(CHROME_STORE_URL, '_blank', 'noopener,noreferrer');

          // Reset after opening
          setTimeout(function() {
            if (textEl) textEl.textContent = originalText;
            if (arrowEl) arrowEl.style.display = '';
            if (spinnerEl) spinnerEl.style.display = 'none';
            btn.disabled = false;
          }, 500);
        }, 150);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', function() {
    initDemoCard();
    initTimeThieves();
    initChromeButtons();
  });
})();
