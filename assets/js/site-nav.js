/* Navigation behaviour shared with squargraph.com (extracted from assets/js/core.js initNav):
   scroll-aware nav background, accessible mobile menu with focus trap and Escape to close. */
(function () {
  'use strict';
  var nav = document.getElementById('nav');
  var mobToggle = document.getElementById('mob-toggle');
  var mobMenu = document.getElementById('mob-menu');
  var menuOpen = false;
  var lastFocused = null;
  if (!nav || !mobToggle || !mobMenu) return;

  function focusableItems() {
    return Array.prototype.slice.call(mobMenu.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
  }

  function setMenu(open, restoreFocus) {
    menuOpen = open;
    nav.classList.toggle('menu-open', menuOpen);
    mobToggle.classList.toggle('open', menuOpen);
    mobToggle.setAttribute('aria-expanded', String(menuOpen));
    mobToggle.setAttribute('aria-label', menuOpen ? 'Close navigation menu' : 'Open navigation menu');
    mobMenu.classList.toggle('open', menuOpen);
    mobMenu.setAttribute('aria-hidden', String(!menuOpen));
    if (menuOpen) {
      lastFocused = document.activeElement;
      mobMenu.removeAttribute('inert');
      var first = focusableItems()[0];
      if (first) window.setTimeout(function () { first.focus(); }, 0);
    } else {
      mobMenu.classList.remove('pointer-open');
      mobMenu.setAttribute('inert', '');
      if (restoreFocus !== false && lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }

  function syncNavBackground() { nav.classList.toggle('scrolled', window.scrollY > 60); }
  syncNavBackground();
  window.addEventListener('scroll', syncNavBackground, { passive: true });
  window.addEventListener('pageshow', syncNavBackground);

  mobToggle.addEventListener('pointerdown', function () { mobMenu.classList.add('pointer-open'); });
  mobToggle.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') mobMenu.classList.remove('pointer-open'); });
  mobToggle.addEventListener('click', function () { setMenu(!menuOpen, true); });
  window.closeMob = function (restoreFocus) { setMenu(false, restoreFocus); };

  mobMenu.addEventListener('keydown', function (e) {
    if (!menuOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); window.closeMob(true); return; }
    if (e.key !== 'Tab') return;
    var items = focusableItems();
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  mobMenu.addEventListener('touchmove', function (e) {
    var touch = e.touches[0];
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    mobMenu.querySelectorAll('a').forEach(function (a) { a.classList.remove('finger-active'); });
    if (el && el.tagName === 'A' && mobMenu.contains(el)) el.classList.add('finger-active');
  }, { passive: true });
  mobMenu.addEventListener('touchend', function () {
    mobMenu.querySelectorAll('a').forEach(function (a) { a.classList.remove('finger-active'); });
  }, { passive: true });
  document.addEventListener('click', function (e) {
    if (menuOpen && !mobMenu.contains(e.target) && !mobToggle.contains(e.target)) window.closeMob();
  });
})();
