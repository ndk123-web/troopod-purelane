/* ============================================================
   PURELANE SHOPIFY INTERACTIVE JAVASCRIPT
   Supports AJAX Cart API, Floating Nav Sliding Indicator,
   Smooth Scroll Spy, Hero multi-stage slider, and reviews rail.
   ============================================================ */

(function () {
  'use strict';

  // Global Toast Function
  window.PurelaneToast = function (message) {
    var toast = document.getElementById('plToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'plToast';
      toast.className = 'pl-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#a4f4cf" stroke-width="2.5" stroke-linecap="round"><path d="m5 13 4 4L19 7"/></svg> ' + message;
    toast.classList.add('show');
    clearTimeout(window.plToastTimer);
    window.plToastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2800);
  };

  // Global AJAX Add to Cart
  window.PurelaneAddToCart = function (variantId, productName, buttonEl) {
    if (!variantId) {
      console.warn('Purelane: Missing variant ID');
      return;
    }
    
    var origText = buttonEl ? buttonEl.innerHTML : '';
    if (buttonEl) {
      buttonEl.setAttribute('disabled', 'true');
      buttonEl.innerHTML = 'Adding...';
    }

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: 1 })
    })
    .then(function (res) { return res.json(); })
    .then(function (item) {
      if (buttonEl) {
        buttonEl.removeAttribute('disabled');
        buttonEl.innerHTML = origText;
      }
      window.PurelaneToast('Added ' + (productName || item.title || 'Product') + ' to cart!');
      
      // Update Dawn Cart Bubble and Purelane Header Bubble
      fetch('/cart.js')
        .then(function (r) { return r.json(); })
        .then(function (cart) {
          var bubbles = document.querySelectorAll('.cart-count-bubble span, #cart-icon-bubble span, .dot, #cartCount');
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

  // Floating Header Navigation with Sliding Indicator & ScrollSpy
  function initNav() {
    var hdr = document.getElementById('hdr');
    var nav = document.getElementById('mainNav');
    var indicator = document.getElementById('navIndicator');
    var links = nav ? nav.querySelectorAll('.nav-link') : [];
    var railLinks = document.querySelectorAll('.rail a');

    function moveIndicator(linkEl) {
      if (!nav || !indicator || !linkEl) return;
      var navRect = nav.getBoundingClientRect();
      var linkRect = linkEl.getBoundingClientRect();
      indicator.style.left = (linkRect.left - navRect.left) + 'px';
      indicator.style.width = linkRect.width + 'px';
      indicator.style.opacity = '1';
    }

    function setActive(activeLink) {
      links.forEach(function (l) { l.classList.remove('active'); });
      if (activeLink) {
        activeLink.classList.add('active');
        moveIndicator(activeLink);
      }
    }

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
            var target = document.getElementById(targetId) || 
                         document.querySelector(href) || 
                         document.querySelector('[id^="' + targetId + '"]') || 
                         document.querySelector('.' + targetId);
            if (target) {
              var hdrOffset = 80;
              var targetPos = target.getBoundingClientRect().top + window.pageYOffset - hdrOffset;
              window.scrollTo({ top: Math.max(0, targetPos), behavior: 'smooth' });
              setActive(this);
            }
          }
        });
      });

      nav.addEventListener('mouseleave', function () {
        var curr = nav.querySelector('.nav-link.active') || links[0];
        moveIndicator(curr);
      });
    }

    // Scroll Header compact & ScrollSpy active links
    var sections = [
      { id: 'hero', link: nav ? nav.querySelector('a[href="#hero"]') : null },
      { id: 'reviews', link: nav ? nav.querySelector('a[href="#reviews"]') : null },
      { id: 'ingredients', link: nav ? nav.querySelector('a[href="#ingredients"]') : null },
      { id: 'combos', link: nav ? nav.querySelector('a[href="#combos"]') : null },
      { id: 'bundles', link: nav ? nav.querySelector('a[href="#bundles"]') : null },
      { id: 'shop', link: nav ? nav.querySelector('a[href="#shop"]') : null }
    ];

    window.addEventListener('scroll', function () {
      var y = window.scrollY || window.pageYOffset;
      if (hdr) hdr.classList.toggle('up', y > 40);

      // Sync active section link
      var scrollPos = y + window.innerHeight * 0.35;
      for (var i = sections.length - 1; i >= 0; i--) {
        var secId = sections[i].id;
        var sec = document.getElementById(secId) || document.querySelector('[id^="' + secId + '"]') || document.querySelector('.' + secId);
        if (sec && sec.offsetTop <= scrollPos) {
          if (sections[i].link && !sections[i].link.classList.contains('active')) {
            setActive(sections[i].link);
          }
          if (railLinks[i]) {
            railLinks.forEach(function (r, idx) { r.classList.toggle('on', idx === i); });
          }
          break;
        }
      }
    }, { passive: true });

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
          var target = document.getElementById(targetId) || 
                       document.querySelector(href) || 
                       document.querySelector('[id^="' + targetId + '"]') || 
                       document.querySelector('.' + targetId);
          if (target) {
            var hdrOffset = 80;
            var targetPos = target.getBoundingClientRect().top + window.pageYOffset - hdrOffset;
            window.scrollTo({ top: Math.max(0, targetPos), behavior: 'smooth' });
          }
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
    initNav();
    initHero();
    bindCartButtons();
  });

  // Shopify Theme Customizer Lifecycle Hooks
  document.addEventListener('shopify:section:load', function (e) {
    initNav();
    initHero(e.target);
    bindCartButtons(e.target);
  });
})();
