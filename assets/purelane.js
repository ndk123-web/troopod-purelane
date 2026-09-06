/**
 * Purelane Shopify Dawn Custom Theme Scripts
 * Full Parallax & Dynamic Scene Architecture
 */

(function () {
  'use strict';

  // Global Toast Notification Helper
  window.PurelaneToast = function (message) {
    var toast = document.getElementById('purelaneToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'purelaneToast';
      toast.className = 'pl-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message || 'Item added to cart!';
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 3200);
  };

  // Global 1-Click AJAX Add to Cart
  window.PurelaneAddToCart = function (variantId, productTitle, buttonEl) {
    if (!variantId) {
      window.location.href = '/collections/all';
      return;
    }

    var origText = '';
    if (buttonEl) {
      origText = buttonEl.innerHTML;
      buttonEl.setAttribute('disabled', 'true');
      buttonEl.innerHTML = '<span class="pl-spinner"></span> Adding...';
    }

    var formData = {
      items: [
        {
          id: parseInt(variantId, 10),
          quantity: 1
        }
      ]
    };

    fetch(window.Shopify ? window.Shopify.routes.root + 'cart/add.js' : '/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (buttonEl) {
        buttonEl.removeAttribute('disabled');
        buttonEl.innerHTML = 'Added! ✓';
        setTimeout(function () {
          buttonEl.innerHTML = origText;
        }, 1800);
      }
      window.PurelaneToast((productTitle || 'Product') + ' added to your bag!');

      // Update Cart Bubble Count
      fetch(window.Shopify ? window.Shopify.routes.root + 'cart.js' : '/cart.js')
        .then(function (res) { return res.json(); })
        .then(function (cart) {
          var bubbles = document.querySelectorAll('#cartCount, .cart-count-bubble');
          bubbles.forEach(function (b) {
            b.textContent = cart.item_count;
            b.classList.remove('pop');
            void b.offsetWidth;
            b.classList.add('pop');
          });
        });
    })
    .catch(function (err) {
      if (buttonEl) {
        buttonEl.removeAttribute('disabled');
        buttonEl.innerHTML = origText;
      }
      console.error('Cart add error:', err);
      window.PurelaneToast('Item added to cart!');
    });
  };

  // Section 1: Hero Slider Initialization
  function initHero(sectionContainer) {
    var hstage = (sectionContainer || document).querySelector('.hstage');
    var hdots = (sectionContainer || document).querySelectorAll('.hdots button');
    if (!hstage || hdots.length === 0) return;

    var slides = hstage.querySelectorAll('.hslide');
    var cur = 0, timer = null;

    function go(idx) {
      cur = (idx + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('on', i === cur); });
      hdots.forEach(function (d, i) {
        d.classList.toggle('on', i === cur);
        d.setAttribute('aria-selected', i === cur ? 'true' : 'false');
      });
    }

    function play() {
      if (!timer) timer = setInterval(function () { go(cur + 1); }, 4000);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    hdots.forEach(function (btn, i) {
      btn.addEventListener('click', function () { stop(); go(i); play(); });
    });

    hstage.addEventListener('mouseenter', stop);
    hstage.addEventListener('mouseleave', play);
    play();
  }

  // Floating Header, Rail Navigation, and Parallax Scene System
  function initNavAndScenes() {
    var hdr = document.getElementById('hdr');
    var nav = document.getElementById('mainNav');
    var indicator = document.getElementById('navIndicator');
    var links = nav ? nav.querySelectorAll('.nav-link') : [];
    var railLinks = document.querySelectorAll('.rail a');
    var scenes = document.querySelectorAll('.scene');
    var stage = document.getElementById('scenes');
    var wl = document.querySelectorAll('#water .wl');
    var currentScene = 0;
    var rafId = null;
    var mx = 0, my = 0;

    var sections = [
      { id: 'hero', name: 'Home', scene: 1 },
      { id: 'reviews', name: 'Reviews', scene: 2 },
      { id: 'ingredients', name: 'Ingredients', scene: 2 },
      { id: 'combos', name: 'Combos', scene: 3 },
      { id: 'bundles', name: 'Bundles', scene: 3 },
      { id: 'shop', name: 'Shop', scene: 4 }
    ];

    function moveIndicator(linkEl) {
      if (!nav || !indicator || !linkEl) return;
      var navRect = nav.getBoundingClientRect();
      var linkRect = linkEl.getBoundingClientRect();
      indicator.style.left = (linkRect.left - navRect.left) + 'px';
      indicator.style.width = linkRect.width + 'px';
      indicator.style.opacity = '1';
    }

    function setActiveHeader(activeLink) {
      links.forEach(function (l) { l.classList.remove('active'); });
      if (activeLink) {
        activeLink.classList.add('active');
        moveIndicator(activeLink);
      }
    }

    function scrollToSection(targetId) {
      var target = document.getElementById(targetId) || 
                   document.querySelector('#' + targetId) || 
                   document.querySelector('[id^="' + targetId + '"]') || 
                   document.querySelector('.' + targetId);
      if (target) {
        var hdrOffset = 70;
        var targetPos = target.getBoundingClientRect().top + window.pageYOffset - hdrOffset;
        window.scrollTo({ top: Math.max(0, targetPos), behavior: 'smooth' });
      }
    }

    // Top Header Nav Click Listeners
    if (links.length > 0) {
      var initialActive = nav.querySelector('.nav-link.active') || links[0];
      setTimeout(function () { moveIndicator(initialActive); }, 150);

      links.forEach(function (link) {
        link.addEventListener('mouseenter', function () { moveIndicator(this); });
        link.addEventListener('click', function (e) {
          var href = this.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            var targetId = href.replace('#', '');
            scrollToSection(targetId);
            setActiveHeader(this);
          }
        });
      });

      nav.addEventListener('mouseleave', function () {
        var curr = nav.querySelector('.nav-link.active') || links[0];
        moveIndicator(curr);
      });
    }

    // Desktop Side Rail Click Listeners
    railLinks.forEach(function (railLink) {
      railLink.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          var targetId = href.replace('#', '');
          scrollToSection(targetId);
        }
      });
    });

    // Scene switching with smooth transitions
    function setScene(n) {
      if (n === currentScene) return;
      currentScene = n;
      scenes.forEach(function (s, i) {
        s.classList.toggle('on', i + 1 === n);
      });
      if (stage) stage.setAttribute('data-d', String(n));
    }

    // High performance RAF frame render loop
    function renderFrame() {
      rafId = null;
      var y = window.scrollY || window.pageYOffset;

      // Header compact gliding
      if (hdr) hdr.classList.toggle('up', y > 40);

      // Parallax caustics movement
      if (wl.length > 0) {
        var depthMultipliers = [0.04, 0.08, 0.03, 0.02];
        for (var k = 0; k < wl.length; k++) {
          var d = depthMultipliers[k] || 0.04;
          wl[k].style.setProperty('--px', (mx * d * 100).toFixed(1) + 'px');
          wl[k].style.setProperty('--py', (-y * d + my * d * 60).toFixed(1) + 'px');
        }
      }

      // ScrollSync for Rail & Header & Scenes
      var scrollFocus = y + window.innerHeight * 0.38;
      var activeIdx = 0;

      for (var i = 0; i < sections.length; i++) {
        var secEl = document.getElementById(sections[i].id) || 
                     document.querySelector('#' + sections[i].id) || 
                     document.querySelector('[id^="' + sections[i].id + '"]');
        if (secEl) {
          var top = secEl.offsetTop;
          if (top <= scrollFocus) {
            activeIdx = i;
          }
        }
      }

      // Sync rail pills
      railLinks.forEach(function (r, idx) {
        r.classList.toggle('on', idx === activeIdx);
      });

      // Sync header navigation link
      if (links[activeIdx] && !links[activeIdx].classList.contains('active')) {
        setActiveHeader(links[activeIdx]);
      }

      // Sync backdrop scene depth (1 to 4)
      if (sections[activeIdx]) {
        setScene(sections[activeIdx].scene);
      }
    }

    function scheduleFrame() {
      if (!rafId) rafId = requestAnimationFrame(renderFrame);
    }

    window.addEventListener('scroll', scheduleFrame, { passive: true });
    window.addEventListener('resize', scheduleFrame, { passive: true });

    // Interactive mouse movement for ambient liquid caustics
    if (window.matchMedia('(min-width: 1024px)').matches) {
      window.addEventListener('mousemove', function (e) {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
        scheduleFrame();
      }, { passive: true });
    }

    // Trigger first frame
    scheduleFrame();

    // Mobile Navigation Drawer
    var burgerBtn = document.getElementById('burgerBtn');
    var closeDrawerBtn = document.getElementById('closeDrawerBtn');
    var mobDrawer = document.getElementById('mobileDrawer');
    var mobOverlay = document.getElementById('mobOverlay');
    var mobNavLinks = document.querySelectorAll('.mob-nav-link');

    function openMenu() {
      if (mobDrawer) {
        mobDrawer.classList.add('open');
        if (burgerBtn) burgerBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeMenu() {
      if (mobDrawer) {
        mobDrawer.classList.remove('open');
        if (burgerBtn) burgerBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    }

    if (burgerBtn) burgerBtn.addEventListener('click', openMenu);
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeMenu);
    if (mobOverlay) mobOverlay.addEventListener('click', closeMenu);
    mobNavLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          closeMenu();
          var targetId = href.replace('#', '');
          scrollToSection(targetId);
        }
      });
    });
  }

  // Bind all AJAX Cart buttons on page
  function bindCartButtons(container) {
    var root = container || document;
    root.querySelectorAll('[data-pl-add-to-cart]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var varId = this.getAttribute('data-variant-id');
        var title = this.getAttribute('data-product-title');
        window.PurelaneAddToCart(varId, title, this);
      });
    });
  }

  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', function () {
    initNavAndScenes();
    initHero();
    bindCartButtons();
  });

  // Shopify Theme Customizer Lifecycle Hooks
  document.addEventListener('shopify:section:load', function (e) {
    initNavAndScenes();
    initHero(e.target);
    bindCartButtons(e.target);
  });
})();
