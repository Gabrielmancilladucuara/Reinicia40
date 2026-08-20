/* =========================================================
   Reinicia despues de los 40 - interacciones
   JavaScript vanilla, sin dependencias, funciona offline.
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- 1. Contador de la oferta: 15 minutos, persiste en la sesion --- */
  function initClock() {
    var clock = document.getElementById('clock');
    if (!clock) return;

    var MINUTES = 15;
    var KEY = 'reinicia:deadline';
    var deadline = 0;

    try { deadline = parseInt(sessionStorage.getItem(KEY), 10) || 0; } catch (e) { deadline = 0; }

    if (!deadline || deadline < Date.now()) {
      deadline = Date.now() + MINUTES * 60 * 1000;
      try { sessionStorage.setItem(KEY, String(deadline)); } catch (e) {}
    }

    var cells = clock.getElementsByTagName('span');
    var tick;

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function paint() {
      var left = Math.max(0, deadline - Date.now());
      var total = Math.floor(left / 1000);

      cells[0].textContent = pad(Math.floor(total / 3600));
      cells[1].textContent = pad(Math.floor((total % 3600) / 60));
      cells[2].textContent = pad(total % 60);

      if (left <= 0) {
        clock.classList.add('is-done');
        clearInterval(tick);
      }
    }

    paint();
    tick = setInterval(paint, 1000);
  }

  /* --- 2. Diagnostico: las 7 senales --- */
  function initSigns() {
    var list = document.getElementById('signs');
    var tally = document.getElementById('tally');
    var verdict = document.getElementById('verdict');
    if (!list || !tally) return;

    var boxes = list.querySelectorAll('input[type="checkbox"]');

    function update() {
      var n = 0;
      for (var i = 0; i < boxes.length; i++) { if (boxes[i].checked) n++; }

      tally.textContent = n === 1
        ? '1 de 7 se\u00f1ales marcada'
        : n + ' de 7 se\u00f1ales marcadas';

      if (verdict) verdict.classList.toggle('is-on', n >= 2);
    }

    list.addEventListener('change', function (ev) {
      if (ev.target && ev.target.type === 'checkbox') update();
    });

    update();
  }

  /* --- 3. Acordeones (bloques y FAQ): uno abierto por grupo --- */
  function initAccordions() {
    var groups = document.querySelectorAll('[data-acc]');

    Array.prototype.forEach.call(groups, function (group) {
      var items = group.querySelectorAll('.acc-item');

      Array.prototype.forEach.call(items, function (item) {
        var trigger = item.querySelector('.acc-t');
        if (!trigger) return;

        trigger.addEventListener('click', function () {
          var wasOpen = item.classList.contains('is-open');

          Array.prototype.forEach.call(items, function (other) {
            other.classList.remove('is-open');
            var t = other.querySelector('.acc-t');
            if (t) t.setAttribute('aria-expanded', 'false');
          });

          if (!wasOpen) {
            item.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
          }
        });
      });
    });
  }

  /* --- 4. Aparicion progresiva al hacer scroll --- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');

    if (reduced || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* --- 5. Barra de compra fija en movil --- */
  function initDock() {
    var dock = document.getElementById('dock');
    var hero = document.getElementById('hero');
    var price = document.getElementById('precio');
    if (!dock || !hero) return;

    var raf = 0;

    function evaluate() {
      raf = 0;
      var passedHero = window.pageYOffset > hero.offsetHeight * 0.7;
      var onPrice = false;

      if (price) {
        var box = price.getBoundingClientRect();
        onPrice = box.top < window.innerHeight * 0.9 && box.bottom > 0;
      }

      dock.classList.toggle('is-on', passedHero && !onPrice);
    }

    window.addEventListener('scroll', function () {
      if (!raf) raf = window.requestAnimationFrame(evaluate);
    }, { passive: true });

    window.addEventListener('resize', evaluate);
    evaluate();
  }

  /* --- 6. Botones de compra sin pasarela conectada.
         Cambia href="#" por tu enlace de pago real. --- */
  function initBuy() {
    var buttons = document.querySelectorAll('a.btn[href="#"]');

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();

        var host = btn.parentNode;
        var hint = host.parentNode.querySelector('.pay-hint');

        if (!hint) {
          hint = document.createElement('p');
          hint.className = 'fine pay-hint';
          hint.setAttribute('role', 'status');
          host.parentNode.insertBefore(hint, host.nextSibling);
        }

        hint.textContent = 'Conecta aqu\u00ed tu enlace de pago (atributo href del bot\u00f3n).';
      });
    });
  }

  function boot() {
    initClock();
    initSigns();
    initAccordions();
    initReveal();
    initDock();
    initBuy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
