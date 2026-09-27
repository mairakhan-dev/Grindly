(function() {
    'use strict';
    
    // Store original functions
    const originalToggleFocusMode = window.toggleFocusMode;
    
    // Enhanced toggle function
    window.toggleFocusMode = function() {
        const isEntering = !document.body.classList.contains('focus-mode');
        
        if (originalToggleFocusMode) {
            originalToggleFocusMode();
        } else {
            document.body.classList.toggle('focus-mode');
        }
        
        if (isEntering) {
            // Entering focus mode
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            
            // Scroll to top
            window.scrollTo(0, 0);
            document.querySelector('.main-content')?.scrollTo(0, 0);
            
            // Force hide all dashboard content
            setTimeout(() => {
                document.querySelectorAll('.dashboard-header, .dashboard-grid, .footer, .quick-stats, .content-card, .form-card, .streak-card, .motivation-card, .pro-tip, .controls-bar, .stats-overview-cards, .charts-container, .toast-container, .feedback-btn, .chatbot-fab, .student-view-bar, .mobile-nav-controls').forEach(el => {
                    if (el) el.style.setProperty('display', 'none', 'important');
                });
            }, 10);
        } else {
            // Exiting focus mode
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.body.style.position = '';
            document.body.style.width = '';
            
            // Restore dashboard content
            setTimeout(() => {
                document.querySelectorAll('.dashboard-header, .dashboard-grid, .footer, .quick-stats, .content-card, .form-card, .streak-card, .motivation-card, .pro-tip, .controls-bar, .stats-overview-cards, .charts-container, .toast-container, .feedback-btn, .chatbot-fab, .student-view-bar, .mobile-nav-controls').forEach(el => {
                    if (el) el.style.removeProperty('display');
                });
            }, 10);
        }
    };
    
    // Handle keyboard shortcut
    document.addEventListener('keydown', function(e) {
        if (e.shiftKey && e.key.toLowerCase() === 'f') {
            if (document.activeElement?.tagName.match(/^(INPUT|TEXTAREA|SELECT)$/i)) {
                return;
            }
            e.preventDefault();
            window.toggleFocusMode();
        }
    });
    
    // Handle resize events
    window.addEventListener('resize', function() {
        if (document.body.classList.contains('focus-mode')) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }
    });
    
    // Handle touch events to prevent pull-to-refresh
    document.addEventListener('touchmove', function(e) {
        if (document.body.classList.contains('focus-mode')) {
            const mainContent = document.querySelector('.main-content');
            const focusPanel = document.querySelector('.focus-mode-panel');
            
            if (mainContent && focusPanel) {
                const isScrollingDown = e.targetTouches[0].clientY > e.targetTouches[0].clientY;
                const atTop = mainContent.scrollTop <= 0;
                
                if (atTop && isScrollingDown) {
                    e.preventDefault();
                }
            }
        }
    }, { passive: false });
    
    // Ensure proper state on page load
    if (document.body.classList.contains('focus-mode')) {
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        
        document.querySelectorAll('.dashboard-header, .dashboard-grid, .footer, .quick-stats, .content-card, .form-card, .streak-card, .motivation-card, .pro-tip, .controls-bar, .stats-overview-cards, .charts-container, .toast-container, .feedback-btn, .chatbot-fab, .student-view-bar, .mobile-nav-controls').forEach(el => {
            if (el) el.style.setProperty('display', 'none', 'important');
        });
    }
})();

(function () {
  'use strict';

  // ---------- Inject the visual layers once ----------
  function injectPortalLayers() {
    if (document.getElementById('portalCanvas')) return;

    // Canvas
    var canvas = document.createElement('canvas');
    canvas.id = 'portalCanvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    // Aurora + rings + core wrappers
    var aurora = document.createElement('div');
    aurora.className = 'portal-aurora';

    var rings = document.createElement('div');
    rings.className = 'portal-rings';
    rings.innerHTML =
      '<div class="glow g3"></div>' +
      '<div class="glow g2"></div>' +
      '<div class="glow g1"></div>' +
      '<div class="ring r5"></div>' +
      '<div class="ring r4"></div>' +
      '<div class="ring r3"></div>' +
      '<div class="ring r2"></div>' +
      '<div class="ring r1"></div>';

    var core = document.createElement('div');
    core.className = 'portal-core';

    document.body.appendChild(aurora);
    document.body.appendChild(rings);
    document.body.appendChild(core);

    initCanvas(canvas);
  }

  // ---------- Warp tunnel renderer ----------
  function initCanvas(canvas) {
    var ctx = canvas.getContext('2d', { alpha: true });
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, cx = 0, cy = 0;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2;
      cy = H / 2;
    }
    resize();
    window.addEventListener('resize', resize);

    // ---- Particle field ----
    var PARTICLE_COUNT = Math.min(520, Math.floor((W * H) / 3500));
    var particles = [];
    var FAR = 1400;      // max depth
    var SPEED = 3.2;     // z units per frame

    function resetParticle(p, spawnFar) {
      // scatter in a disk around the axis
      var angle = Math.random() * Math.PI * 2;
      var radius = Math.random() * 1.2 + 0.05;
      p.x = Math.cos(angle) * radius;
      p.y = Math.sin(angle) * radius;
      p.z = spawnFar ? FAR * (0.6 + Math.random() * 0.4) : FAR;
      p.size = 0.4 + Math.random() * 1.6;
      p.hue = 18 + Math.random() * 40;   // amber → red
      p.trail = Math.random() < 0.15;    // 15% get streaks
    }
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var p = {};
      resetParticle(p, true);
      p.z = Math.random() * FAR; // spread initial z
      particles.push(p);
    }

    // ---- Ring ripples spawn periodically ----
    var ripples = [];
    var lastRipple = 0;
    var nextRippleEvery = 620; // ms

    // ---- Render loop ----
    var running = false;
    var rafId = null;
    var lastTime = 0;
    var tAccum = 0;

    function frame(now) {
      if (!running) return;
      if (!lastTime) lastTime = now;
      var dt = Math.min(48, now - lastTime);
      lastTime = now;
      tAccum += dt;

      // Fade previous frame slightly for trail effect
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(10, 8, 6, 0.22)';   // dark warm-black for trail
      ctx.fillRect(0, 0, W, H);

      // Additive blending for the particles / core
      ctx.globalCompositeOperation = 'lighter';

      // --- Center core (radial gradient bloom) ---
      var coreR = Math.min(W, H) * 0.14 * (1 + Math.sin(tAccum * 0.002) * 0.06);
      var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.6);
      grd.addColorStop(0.00, 'rgba(255, 240, 210, 0.85)');
      grd.addColorStop(0.18, 'rgba(255, 170, 60, 0.55)');
      grd.addColorStop(0.45, 'rgba(255, 71, 20, 0.28)');
      grd.addColorStop(0.75, 'rgba(214, 31, 0, 0.08)');
      grd.addColorStop(1.00, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 2.6, 0, Math.PI * 2);
      ctx.fill();

      // --- Spawn ripples ---
      if (tAccum - lastRipple > nextRippleEvery) {
        lastRipple = tAccum;
        nextRippleEvery = 500 + Math.random() * 400;
        ripples.push({ r: 4, life: 1 });
      }
      for (var r = ripples.length - 1; r >= 0; r--) {
        var rp = ripples[r];
        rp.r += 6.5;
        rp.life -= 0.008;
        if (rp.life <= 0 || rp.r > Math.max(W, H)) { ripples.splice(r, 1); continue; }
        ctx.strokeStyle = 'rgba(255, 170, 60, ' + (rp.life * 0.35).toFixed(3) + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // --- Update + draw particles ---
      for (var i = 0; i < particles.length; i++) {
        var pp = particles[i];
        pp.z -= SPEED * (dt / 16);

        if (pp.z <= 1) {
          resetParticle(pp, false);
          continue;
        }

        var k = 260 / pp.z;                 // perspective scale
        var sx = cx + pp.x * k * 300;
        var sy = cy + pp.y * k * 300;

        // cull offscreen
        if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;

        var depth = 1 - (pp.z / FAR);       // 0 = far, 1 = near
        var alpha = Math.max(0, Math.min(1, depth * depth));
        var size = Math.max(0.4, pp.size * k * 1.2);

        if (pp.trail) {
          // streak from previous projected point toward current
          var kPrev = 260 / (pp.z + SPEED * 6);
          var px = cx + pp.x * kPrev * 300;
          var py = cy + pp.y * kPrev * 300;
          var grad = ctx.createLinearGradient(px, py, sx, sy);
          grad.addColorStop(0, 'hsla(' + pp.hue + ', 100%, 65%, 0)');
          grad.addColorStop(1, 'hsla(' + pp.hue + ', 100%, 70%, ' + (alpha * 0.85).toFixed(3) + ')');
          ctx.strokeStyle = grad;
          ctx.lineWidth = size * 0.9;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        } else {
          ctx.fillStyle = 'hsla(' + pp.hue + ', 100%, 72%, ' + (alpha * 0.9).toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      lastTime = 0;
      rafId = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      // clear canvas so reopening starts clean
      ctx.clearRect(0, 0, W, H);
    }

    // Only run when focus-mode is active
    var bodyObserver = new MutationObserver(function () {
      if (document.body.classList.contains('focus-mode')) start();
      else stop();
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // If we load the page already in focus-mode, start right away
    if (document.body.classList.contains('focus-mode')) start();

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (document.body.classList.contains('focus-mode')) start();
    });
  }

  // Wait for DOM then inject
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectPortalLayers);
  } else {
    injectPortalLayers();
  }
})();