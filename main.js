/* =============================================================
   MAUÁ AUTOMÓVILES — main.js  (IIFE, sin módulos)
   ============================================================= */
(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduced   = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var escHTML = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  }); };

  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  /* ---- Formato de números para UI (es-UY) ---- */
  function fmtNum(n) { return Number(n || 0).toLocaleString("es-UY"); }
  function fmtPrecio(n) { return n > 0 ? ("US$ " + fmtNum(n)) : "Consultar"; }
  /* Precio que se muestra en el sitio: la cuota mensual en pesos que fija la
     automotora. Si no se cargó, se muestra "Consultar". */
  function cuotaWebHTML(v) {
    return (v.cuota && v.cuota > 0)
      ? '<span class="veh-price-lbl">Cuotas de</span> $ ' + fmtNum(v.cuota)
      : 'Consultar';
  }
  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
  function floorTo(n, step) { return Math.floor(n / step) * step; }
  function ceilTo(n, step) { return Math.ceil(n / step) * step; }
  function uniqueSorted(arr) {
    var seen = {}, out = [];
    arr.forEach(function (v) { if (!seen[v]) { seen[v] = true; out.push(v); } });
    out.sort(function (a, b) { return a.localeCompare(b, "es"); });
    return out;
  }

  /* ---- ¿Ingresó en los últimos 14 días? (badge "Reciente") ---- */
  function isReciente(fechaISO) {
    if (!fechaISO) return false;
    var d = new Date(fechaISO + "T00:00:00");
    var diffDays = (Date.now() - d.getTime()) / 86400000;
    return diffDays >= 0 && diffDays <= 14;
  }

  /* ---- Mapea el string de sucursal de un vehículo al waIntl del local
     correspondiente. La sucursal se guarda como "Calle N, Ciudad", así
     que buscamos por coincidencia parcial con locales[i].calle. Si no
     encaja ninguna, cae al número principal (Sánchez / central). ---- */
  function waIntlForSucursal(sucursal) {
    var locales = (data.locales || []);
    if (sucursal) {
      for (var i = 0; i < locales.length; i++) {
        var l = locales[i];
        if (l.calle && sucursal.indexOf(l.calle) !== -1 && l.waIntl) return l.waIntl;
      }
    }
    return "59891940049";
  }
  function waBaseFor(sucursal) {
    return "https://wa.me/" + waIntlForSucursal(sucursal) + "?text=";
  }

  /* ---- Genera el link de WhatsApp para un vehículo ---- */
  function vehWaHref(v) {
    var etiqueta = v.condicion === "usado" ? (v.anio + " (usado)") : "0 km";
    var msg = "Hola! Quiero informacion sobre " + v.marca + " " + v.modelo + " " + etiqueta;
    return waBaseFor(v.sucursal) + encodeURIComponent(msg);
  }

  /* ---- Etiqueta de estado (badge visible en la tarjeta) ----
     Las etiquetas (Igual a 0km / Buen estado / Usado) solo aplican a
     usados. Un 0 km se muestra siempre como "0 km". ---- */
  function etiquetaDe(v) {
    if (v.condicion !== "usado") return "0 km";
    return v.etiqueta || "Usado";
  }
  function etiquetaBadge(v) {
    var et = etiquetaDe(v);
    var cls = (et === "0 km" || et === "Igual a 0km") ? "veh-badge veh-badge-0km" : "veh-badge";
    return '<span class="' + cls + '">' + escHTML(et) + '</span>';
  }

  /* ---- Tarjeta de vehículo (compartida por carrusel y catálogo) ----
     El precio y el kilometraje no se muestran en el sitio público. ---- */
  function vehCardHTML(v) {
    var badgeReciente = isReciente(v.fechaIngreso) ? '<span class="veh-badge veh-badge-reciente">Reciente</span>' : "";
    return ""
      + '<article class="veh-card" data-carroceria="' + escHTML(v.carroceria) + '" data-etiqueta="' + escHTML(etiquetaDe(v)) + '">'
      +   '<a class="veh-card-link" href="vehiculo.html?id=' + encodeURIComponent(v.id) + '" aria-label="Ver ' + escHTML(v.marca) + ' ' + escHTML(v.modelo) + '"></a>'
      +   '<div class="veh-visual" data-model="' + escHTML(v.modelo) + '"' + (v.fotos && v.fotos[0] ? ' style="background:none"' : '') + '>'
      +     badgeReciente + etiquetaBadge(v)
      +     (v.fotos && v.fotos[0]
          ? '<img class="veh-foto" src="' + escHTML(v.fotos[0]) + '" alt="' + escHTML(v.marca + ' ' + v.modelo) + '" loading="lazy">'
          : '<span class="veh-ghost">' + escHTML((v.marca || "").toUpperCase()) + '</span>')
      +   '</div>'
      +   '<div class="veh-body">'
      +     '<p class="veh-tag">' + escHTML(v.carroceria) + ' · ' + v.anio + '</p>'
      +     '<h3 class="veh-name">' + escHTML(v.marca) + ' ' + escHTML(v.modelo) + '</h3>'
      +     '<ul class="veh-specs"><li>' + escHTML(v.transmision) + '</li><li>' + escHTML(v.tipoMotor) + '</li></ul>'
      +     '<div class="veh-foot">'
      +       '<span class="veh-price">' + cuotaWebHTML(v) + '</span>'
      +       '<a class="btn btn-small btn-wa" data-wa href="' + vehWaHref(v) + '" target="_blank" rel="noopener">WhatsApp</a>'
      +     '</div>'
      +   '</div>'
      + '</article>';
  }

  /* ---- Año en footer ---- */
  function initYear() {
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---- Splash (doble red de seguridad CSS + JS) ---- */
  function initSplash() {
    var splash = $("[data-splash]");
    if (!splash) return;
    var done = false;
    var hide = function () {
      if (done) return; done = true;
      splash.classList.add("is-out");
      /* Saca el splash del árbol tras la transición: si no, sus animaciones
         "infinite" (logo flotando, barra de carga) siguen corriendo en
         segundo plano para siempre aunque ya sea invisible. */
      setTimeout(function () { splash.style.display = "none"; }, 1100);
    };
    if (document.readyState === "complete") setTimeout(hide, 500);
    else window.addEventListener("load", function () { setTimeout(hide, 350); });
    setTimeout(hide, 3800);
  }

  /* ---- Nav: estado al hacer scroll ---- */
  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;
    /* Páginas sin hero (ej. catálogo) quieren el nav siempre sólido:
       no lo dejamos "transparente" al cargar. */
    if (nav.hasAttribute("data-nav-solid")) { nav.classList.add("is-scrolled"); return; }
    var on = function () { nav.classList.toggle("is-scrolled", window.scrollY > 60); };
    on();
    window.addEventListener("scroll", on, { passive: true });
  }

  /* ---- Menú móvil ---- */
  function initMobileMenu() {
    var burger = $("[data-burger]");
    var menu = $("[data-mobile-menu]");
    if (!burger || !menu) return;
    var setOpen = function (open) {
      burger.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", function () {
      setOpen(burger.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---- Anclas con scroll suave + offset de nav ---- */
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + window.scrollY - 74;
      window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---- Barra de progreso ---- */
  function initScrollProgress() {
    var bar = $("[data-scroll-progress]");
    if (!bar) return;
    var raf = null;
    var update = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
      raf = null;
    };
    window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  /* ---- Reveal on scroll (umbral muy bajo + red de seguridad 6s) ---- */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-revealed"); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -3% 0px" });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      $$("[data-reveal]:not(.is-revealed)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  /* ---- Count up ---- */
  function initCountUp() {
    $$("[data-count-to]").forEach(function (el) {
      var target = parseFloat(el.dataset.countTo);
      var decimals = (String(el.dataset.countTo).split(".")[1] || "").length;
      var done = false;
      var run = function () {
        if (done) return; done = true;
        if (window.gsap && !reduced) {
          var obj = { v: 0 };
          window.gsap.to(obj, { v: target, duration: 1.5, ease: "power2.out",
            onUpdate: function () { el.textContent = obj.v.toFixed(decimals); } });
        } else { el.textContent = target.toFixed(decimals); }
      };
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { run(); io.unobserve(e.target); } });
      }, { threshold: 0.5 });
      io.observe(el);
    });
  }


  /* ---- Tilt 3D + halo rojo en tarjetas (idempotente: se puede
     re-invocar tras render dinámico sin duplicar listeners).
     "container" debe ser el elemento [data-tilt-scope], no document,
     para no aplicar el efecto al carrusel de usados (lo excluye a propósito). ---- */
  function bindTilt(container) {
    if (!fineHover || !container) return;
    $$(".veh-card", container).forEach(function (card) {
      if (card.classList.contains("veh-card-cta") || card.dataset.tiltBound) return;
      card.dataset.tiltBound = "1";
      var MAX = 6, tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      card.classList.add("has-tilt");
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        tx = -py * MAX; ty = px * MAX;
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener("mouseleave", function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
      function loop() {
        cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
        card.style.setProperty("--rx", cx.toFixed(2) + "deg");
        card.style.setProperty("--ry", cy.toFixed(2) + "deg");
        raf = (Math.abs(tx - cx) > 0.04 || Math.abs(ty - cy) > 0.04) ? requestAnimationFrame(loop) : null;
      }
    });
  }
  function initTilt() {
    $$("[data-tilt-scope]").forEach(function (scope) { bindTilt(scope); });
  }

  /* ---- Vitrina Chery (home): categoría → modelo → foto, con flechas.
     "Ver modelo" no navega todavía (no hay ficha de modelo aún). ---- */
  function initCheryLineup() {
    var root = $(".cl");
    var catsEl = $("[data-cl-categories]");
    var tabsEl = $("[data-cl-tabs]");
    var photoEl = $("[data-cl-photo]");
    if (!root || !catsEl || !tabsEl || !photoEl || !data.cheryLineup || !data.cheryLineup.length) return;

    var prevBtn = $("[data-cl-prev]");
    var nextBtn = $("[data-cl-next]");
    var viewBtn = $("[data-cl-view]");
    var consultBtn = $("[data-cl-consult]");

    var catIndex = 0;
    var modelIndex = 0;

    function renderCategories() {
      catsEl.innerHTML = data.cheryLineup.map(function (cat, i) {
        var sep = i > 0 ? '<span class="cl-cat-sep" aria-hidden="true"></span>' : "";
        return sep + '<button class="cl-cat' + (i === catIndex ? " is-active" : "") + '" type="button" data-cat-i="' + i + '">' + escHTML(cat.nombre) + '</button>';
      }).join("");
    }
    function renderTabs() {
      var modelos = data.cheryLineup[catIndex].modelos;
      tabsEl.innerHTML = modelos.map(function (m, i) {
        return '<button class="cl-tab' + (i === modelIndex ? " is-active" : "") + '" type="button" data-model-i="' + i + '">' + escHTML(m.nombre) + '</button>';
      }).join("");
    }
    function renderModel() {
      var modelo = data.cheryLineup[catIndex].modelos[modelIndex];
      if (!modelo) return;
      var swap = function () {
        photoEl.src = modelo.foto;
        photoEl.alt = "Chery " + modelo.nombre;
        photoEl.classList.remove("is-swapping");
      };
      if (reduced || !photoEl.src) { swap(); }
      else { photoEl.classList.add("is-swapping"); setTimeout(swap, 180); }

      if (consultBtn) {
        var msg = "Hola! Quiero informacion sobre Chery " + modelo.nombre;
        consultBtn.setAttribute("href", (data.whatsapp || "https://wa.me/59891940049") + "?text=" + encodeURIComponent(msg));
      }
    }
    function goCategory(i) {
      var len = data.cheryLineup.length;
      catIndex = (i + len) % len;
      modelIndex = 0;
      renderCategories();
      renderTabs();
      renderModel();
    }
    function goModel(i) {
      var len = data.cheryLineup[catIndex].modelos.length;
      modelIndex = (i + len) % len;
      renderTabs();
      renderModel();
    }

    catsEl.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-cat-i]");
      if (!btn) return;
      goCategory(parseInt(btn.dataset.catI, 10));
    });
    tabsEl.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-model-i]");
      if (!btn) return;
      goModel(parseInt(btn.dataset.modelI, 10));
    });
    if (prevBtn) prevBtn.addEventListener("click", function () { goModel(modelIndex - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goModel(modelIndex + 1); });
    /* "Ver modelo" navega a la ficha modelo.html?id=<id-del-modelo>. */
    if (viewBtn) {
      var updateViewHref = function () {
        var modelo = data.cheryLineup[catIndex].modelos[modelIndex];
        if (modelo) viewBtn.setAttribute("href", "modelo.html?id=" + encodeURIComponent(modelo.id));
      };
      var origRender = renderModel;
      renderModel = function () { origRender(); updateViewHref(); };
    }

    renderCategories();
    renderTabs();
    renderModel();
  }

  /* ---- Ficha de modelo Chery (modelo.html?id=<id>) ---- */
  function initModeloDetail() {
    var root = $("[data-md]");
    if (!root) return;
    var modelos = data.cheryModelos || {};
    var params = new URLSearchParams(location.search);
    var id = params.get("id") || "";
    var m = modelos[id];
    var body = $("[data-md-body]");
    var notfound = $("[data-md-notfound]");

    if (!m) {
      if (notfound) notfound.hidden = false;
      if (body) body.hidden = true;
      return;
    }
    if (body) body.hidden = false;
    if (notfound) notfound.hidden = true;

    // Título de pestaña + meta description
    document.title = m.nombre + " · Mauá Automóviles";
    var meta = document.querySelector('meta[name="description"]');
    if (meta && m.tagline) meta.setAttribute("content", m.tagline + " Mauá Automóviles, representante oficial Chery en Cerro Largo.");

    // Textos
    $$("[data-md-nombre]").forEach(function (el) { el.textContent = m.nombre; });
    var sub = $("[data-md-sub]"); if (sub) sub.textContent = m.subtitulo || "";
    var cat = $("[data-md-cat]"); if (cat) cat.textContent = m.categoria || "Chery 0 km";
    var tag = $("[data-md-tagline]"); if (tag) tag.textContent = m.tagline || "";

    // Hero
    var hero = $("[data-md-hero]");
    if (hero) { hero.src = m.hero || ""; hero.alt = m.nombre; }

    // Estado del color activo — usado también por el CTA de WhatsApp
    var colorActivo = null;
    function waHrefFor(color) {
      var msg = "Hola! Quiero información sobre " + m.nombre;
      if (color && color.nombre) msg += " (color " + color.nombre + ")";
      msg += ".";
      return (data.whatsapp || "https://wa.me/59891940049") + "?text=" + encodeURIComponent(msg);
    }
    function updateWaCtas() {
      var href = waHrefFor(colorActivo);
      $$("[data-md-cta-wa], [data-md-cta-wa-b]").forEach(function (a) { a.setAttribute("href", href); });
    }
    updateWaCtas();

    // Selector de color inline (bajo la foto del hero).
    // Solo tiene sentido mostrarlo si podemos cambiar la foto: pide 2+ colores
    // con imagen propia. Si el modelo tiene una sola foto (M7, Himla), no hay
    // nada que seleccionar y el bloque queda oculto.
    var picker = $("[data-md-color-picker]");
    var swatchWrap = $("[data-md-color-swatches]");
    var colorLabel = $("[data-md-color-actual]");
    var coloresPicker = (m.colores || []).filter(function (c) { return !!c.imagen; });
    if (picker && swatchWrap && coloresPicker.length >= 2) {
      picker.hidden = false;
      swatchWrap.innerHTML = coloresPicker.map(function (c, i) {
        return '<button type="button" class="md-swatch' + (i === 0 ? ' is-active' : '') + '"'
          + ' data-color-i="' + i + '"'
          + ' style="--sw:' + escAttr(c.hex || '#333') + '"'
          + ' title="' + escAttr(c.nombre) + '"'
          + ' aria-label="' + escAttr(c.nombre) + '">'
          + '<span class="md-swatch-dot"></span>'
          + '</button>';
      }).join("");
      function selectColor(i) {
        var c = coloresPicker[i]; if (!c) return;
        colorActivo = c;
        if (colorLabel) colorLabel.textContent = c.nombre || "";
        if (hero) {
          hero.classList.add("is-swap");
          setTimeout(function () {
            hero.src = c.imagen;
            hero.classList.remove("is-swap");
          }, 160);
        }
        $$(".md-swatch", swatchWrap).forEach(function (b) { b.classList.toggle("is-active", parseInt(b.dataset.colorI, 10) === i); });
        updateWaCtas();
      }
      swatchWrap.addEventListener("click", function (e) {
        var b = e.target.closest("[data-color-i]"); if (!b) return;
        selectColor(parseInt(b.dataset.colorI, 10));
      });
      selectColor(0);
    } else if (picker) {
      picker.hidden = true;
    }

    // Highlights
    var hlWrap = $("[data-md-highlights]");
    if (hlWrap && Array.isArray(m.highlights)) {
      hlWrap.innerHTML = m.highlights.map(function (h) {
        return '<div class="md-hl"><span class="md-hl-k">' + escHTML(h.k) + '</span><span class="md-hl-v">' + escHTML(h.v) + '</span></div>';
      }).join("");
    }

    // Equipamiento / Seguridad (ocultamos el bloque si viene vacío)
    function fillList(sel, blockSel, arr) {
      var list = $(sel), block = $(blockSel);
      if (!list || !block) return;
      if (!arr || !arr.length) { block.hidden = true; return; }
      block.hidden = false;
      list.innerHTML = arr.map(function (t) { return "<li>" + escHTML(t) + "</li>"; }).join("");
    }
    fillList("[data-md-equipamiento]", "[data-md-block-equip]", m.equipamiento);
    fillList("[data-md-seguridad]", "[data-md-block-seg]", m.seguridad);

    // Versiones
    var verWrap = $("[data-md-versiones]");
    var verBlock = $("[data-md-block-versiones]");
    if (verWrap && verBlock) {
      if (m.versiones && m.versiones.length) {
        verBlock.hidden = false;
        verWrap.innerHTML = m.versiones.map(function (v) {
          return '<span class="md-version-chip">' + escHTML(v) + '</span>';
        }).join("");
      } else { verBlock.hidden = true; }
    }
  }
  function escAttr(s) { return String(s == null ? "" : s).replace(/"/g, "&quot;"); }

  /* ---- Carrusel de usados (home): chips de carrocería + flechas ---- */
  function initUsadosCarousel() {
    var track = $("[data-uc-track]");
    var filtros = $("[data-uc-filtros]");
    if (!track || !data.vehiculos) return;

    var usados = data.vehiculos
      .filter(function (v) { return v.condicion === "usado"; })
      .sort(function (a, b) { return new Date(a.fechaIngreso) - new Date(b.fechaIngreso); }); /* más nuevo al final */

    var activeFilter = null;

    function render() {
      var list = activeFilter ? usados.filter(function (v) { return v.carroceria === activeFilter; }) : usados;
      track.innerHTML = list.length
        ? list.map(vehCardHTML).join("")
        : '<p class="uc-noscript">No hay unidades de este tipo por ahora. <a href="usados.html">Ver catálogo completo →</a></p>';
      track.scrollLeft = 0;
      updateArrows();
    }

    if (filtros) {
      filtros.addEventListener("click", function (e) {
        var btn = e.target.closest(".chip");
        if (!btn) return;
        var val = btn.dataset.ucFilter;
        activeFilter = (activeFilter === val) ? null : val;
        $$(".chip", filtros).forEach(function (c) { c.classList.toggle("is-active", c.dataset.ucFilter === activeFilter); });
        render();
      });
    }

    var carousel = bindCardCarousel(track, $("[data-uc-prev]"), $("[data-uc-next]"));
    render();
    carousel.refit();
  }

  /* ---- Carrusel de tarjetas genérico: flechas + ancho ajustado a un
     múltiplo exacto de "ancho de tarjeta + gap" (nunca corta una tarjeta
     a la mitad en el borde). Compartido por el carrusel de usados de la
     home y el de "también te podría interesar" de la ficha. ---- */
  function bindCardCarousel(track, prevBtn, nextBtn) {
    function cardStep() {
      var card = track.querySelector(".veh-card");
      if (!card) return 300;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "18");
      return card.getBoundingClientRect().width + gap;
    }
    function fitTrackWidth() {
      var card = track.querySelector(".veh-card");
      if (!card) return;
      var wrap = track.closest(".uc-carousel");
      var arrowsWidth = (prevBtn ? prevBtn.offsetWidth : 0) + (nextBtn ? nextBtn.offsetWidth : 0);
      var wrapGap = wrap ? parseFloat(getComputedStyle(wrap).columnGap || getComputedStyle(wrap).gap || "0") * 2 : 0;
      var available = (wrap ? wrap.clientWidth : window.innerWidth) - arrowsWidth - wrapGap;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "18");
      var cardW = card.getBoundingClientRect().width;
      var perView = Math.max(1, Math.floor((available + gap) / (cardW + gap)));
      track.style.width = (perView * cardW + (perView - 1) * gap) + "px";
    }
    function updateArrows() {
      if (!prevBtn || !nextBtn) return;
      var max = track.scrollWidth - track.clientWidth - 4;
      prevBtn.classList.toggle("is-disabled", track.scrollLeft <= 4);
      nextBtn.classList.toggle("is-disabled", max <= 4 || track.scrollLeft >= max);
    }
    if (prevBtn) prevBtn.addEventListener("click", function () {
      track.scrollBy({ left: -cardStep(), behavior: reduced ? "auto" : "smooth" });
    });
    if (nextBtn) nextBtn.addEventListener("click", function () {
      track.scrollBy({ left: cardStep(), behavior: reduced ? "auto" : "smooth" });
    });
    var scrollRaf = null;
    track.addEventListener("scroll", function () {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(function () { updateArrows(); scrollRaf = null; });
    }, { passive: true });
    var resizeRaf = null;
    window.addEventListener("resize", function () {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(function () { fitTrackWidth(); updateArrows(); resizeRaf = null; });
    });
    return {
      refit: function () { fitTrackWidth(); track.scrollLeft = 0; updateArrows(); }
    };
  }

  /* ---- Catálogo completo (usados.html): filtros + resultados.
     No hace nada en index.html (no hay [data-cr-grid]). ---- */
  function initCatalog() {
    var grid = $("[data-cr-grid]");
    if (!grid || !data.vehiculos) return;

    var vehiculos = data.vehiculos.slice();

    var anios = vehiculos.map(function (v) { return v.anio; });
    var bounds = {
      anio: [Math.min.apply(null, anios), Math.max.apply(null, anios)]
    };

    var state = {
      ubicacion: [], marca: [], modelo: [], carroceria: [], etiqueta: [],
      tipoMotor: [], transmision: [], traccion: [],
      primerDueno: false,
      anio: bounds.anio.slice(),
      sort: "recientes"
    };

    /* ---- Marca: checkboxes derivados + buscador ---- */
    var marcaListEl = $("[data-cf-marca-list]");
    var marcas = uniqueSorted(vehiculos.map(function (v) { return v.marca; }));
    if (marcaListEl) {
      marcaListEl.innerHTML = marcas.map(function (m) {
        return '<label class="cf-check"><input type="checkbox" data-cf="marca" value="' + escHTML(m) + '"><span>' + escHTML(m) + '</span></label>';
      }).join("");
    }
    var marcaSearch = $("[data-cf-marca-search]");
    if (marcaSearch && marcaListEl) {
      marcaSearch.addEventListener("input", function () {
        var q = this.value.trim().toLowerCase();
        $$(".cf-check", marcaListEl).forEach(function (row) {
          row.style.display = row.textContent.toLowerCase().indexOf(q) === -1 ? "none" : "";
        });
      });
    }

    /* ---- Modelo: depende de las marcas elegidas ---- */
    var modeloListEl = $("[data-cf-modelo-list]");
    var modeloEmptyEl = $("[data-cf-modelo-empty]");
    function renderModelos() {
      if (!modeloListEl) return;
      if (!state.marca.length) {
        modeloListEl.innerHTML = "";
        if (modeloEmptyEl) modeloEmptyEl.hidden = false;
        return;
      }
      if (modeloEmptyEl) modeloEmptyEl.hidden = true;
      var pares = uniqueSorted(
        vehiculos.filter(function (v) { return state.marca.indexOf(v.marca) !== -1; })
          .map(function (v) { return v.marca + "|" + v.modelo; })
      );
      modeloListEl.innerHTML = pares.map(function (pair) {
        var partes = pair.split("|");
        var checked = state.modelo.indexOf(pair) !== -1 ? " checked" : "";
        return '<label class="cf-check"><input type="checkbox" data-cf="modelo" value="' + escHTML(pair) + '"' + checked + '><span>' + escHTML(partes[0]) + ' ' + escHTML(partes[1]) + '</span></label>';
      }).join("");
    }

    /* ---- Carrocería: chips multi-select ---- */
    $$("[data-cf-body]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var val = btn.dataset.cfBody;
        var idx = state.carroceria.indexOf(val);
        if (idx === -1) { state.carroceria.push(val); btn.classList.add("is-active"); }
        else { state.carroceria.splice(idx, 1); btn.classList.remove("is-active"); }
        applyAndRender();
      });
    });

    /* ---- Etiqueta (estado): chips multi-select ---- */
    $$("[data-cf-etiqueta]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var val = btn.dataset.cfEtiqueta;
        var idx = state.etiqueta.indexOf(val);
        if (idx === -1) { state.etiqueta.push(val); btn.classList.add("is-active"); }
        else { state.etiqueta.splice(idx, 1); btn.classList.remove("is-active"); }
        applyAndRender();
      });
    });

    /* ---- Checkboxes genéricos (ubicación, marca, modelo, motor, transmisión, tracción) ---- */
    document.addEventListener("change", function (e) {
      var cb = e.target.closest("[data-cf]");
      if (!cb || !grid.isConnected) return;
      var key = cb.dataset.cf;
      var arr = state[key];
      if (!arr) return;
      var idx = arr.indexOf(cb.value);
      if (cb.checked && idx === -1) arr.push(cb.value);
      if (!cb.checked && idx !== -1) arr.splice(idx, 1);
      if (key === "marca") {
        state.modelo = state.modelo.filter(function (pair) { return state.marca.indexOf(pair.split("|")[0]) !== -1; });
        renderModelos();
      }
      applyAndRender();
    });

    var pdInput = $("[data-cf-primer-dueno]");
    if (pdInput) pdInput.addEventListener("change", function () { state.primerDueno = this.checked; applyAndRender(); });

    /* ---- Sliders de rango doble ---- */
    function initRange(key, min, max, step) {
      var root = document.querySelector('[data-cf-range="' + key + '"]');
      if (!root) return null;
      var fill = root.querySelector("[data-cf-range-fill]");
      var inputMin = root.querySelector("[data-cf-range-min]");
      var inputMax = root.querySelector("[data-cf-range-max]");
      var numMin = root.querySelector("[data-cf-range-num-min]");
      var numMax = root.querySelector("[data-cf-range-num-max]");
      var applyBtn = root.querySelector("[data-cf-range-apply]");
      if (!inputMin || !inputMax || !numMin || !numMax) return null;

      [inputMin, inputMax, numMin, numMax].forEach(function (inp) { inp.min = min; inp.max = max; });
      inputMin.step = step; inputMax.step = step;
      inputMin.value = min; inputMax.value = max;
      numMin.value = min; numMax.value = max;

      function updateFill() {
        var lo = parseFloat(inputMin.value), hi = parseFloat(inputMax.value);
        var span = (max - min) || 1;
        if (fill) {
          fill.style.left = (((lo - min) / span) * 100) + "%";
          fill.style.right = (100 - ((hi - min) / span) * 100) + "%";
        }
      }
      function fromSliders() {
        var lo = parseFloat(inputMin.value), hi = parseFloat(inputMax.value);
        if (lo > hi) { var t = lo; lo = hi; hi = t; inputMin.value = lo; inputMax.value = hi; }
        numMin.value = lo; numMax.value = hi;
        updateFill();
        state[key] = [lo, hi];
        applyAndRender();
      }
      function fromNums() {
        var lo = clamp(parseFloat(numMin.value) || min, min, max);
        var hi = clamp(parseFloat(numMax.value) || max, min, max);
        if (lo > hi) { var t = lo; lo = hi; hi = t; }
        inputMin.value = lo; inputMax.value = hi; numMin.value = lo; numMax.value = hi;
        updateFill();
        state[key] = [lo, hi];
        applyAndRender();
      }
      inputMin.addEventListener("input", function () {
        if (parseFloat(inputMin.value) > parseFloat(inputMax.value)) inputMin.value = inputMax.value;
        updateFill();
      });
      inputMax.addEventListener("input", function () {
        if (parseFloat(inputMax.value) < parseFloat(inputMin.value)) inputMax.value = inputMin.value;
        updateFill();
      });
      inputMin.addEventListener("change", fromSliders);
      inputMax.addEventListener("change", fromSliders);
      if (applyBtn) applyBtn.addEventListener("click", fromNums);
      [numMin, numMax].forEach(function (inp) {
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); fromNums(); } });
      });

      updateFill();
      return {
        reset: function () {
          inputMin.value = min; inputMax.value = max; numMin.value = min; numMax.value = max; updateFill();
        }
      };
    }
    var rangeCtl = {
      anio: initRange("anio", bounds.anio[0], bounds.anio[1], 1)
    };

    /* ---- Acordeón de grupos de filtro ---- */
    $$("[data-cf-group]").forEach(function (group) {
      var toggle = group.querySelector("[data-cf-toggle]");
      if (toggle) toggle.addEventListener("click", function () { group.classList.toggle("is-open"); });
    });

    /* ---- Panel de filtros en mobile (off-canvas) ---- */
    var cfOpenBtn = $("[data-cf-open]");
    var cfPanel = $("[data-cf-panel]");
    var cfCloseBtn = $("[data-cf-close]");
    var cfClose2 = $("[data-cf-close-2]");
    var cfScrim = $("[data-cf-scrim]");
    function openPanel() {
      if (cfPanel) cfPanel.classList.add("is-open");
      if (cfScrim) cfScrim.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function closePanel() {
      if (cfPanel) cfPanel.classList.remove("is-open");
      if (cfScrim) cfScrim.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    if (cfOpenBtn) cfOpenBtn.addEventListener("click", openPanel);
    if (cfCloseBtn) cfCloseBtn.addEventListener("click", closePanel);
    if (cfClose2) cfClose2.addEventListener("click", function (e) { e.preventDefault(); closePanel(); });
    if (cfScrim) cfScrim.addEventListener("click", closePanel);

    /* ---- Chips de filtros activos ---- */
    function syncCheckboxUI(key, val, checked) {
      $$('[data-cf="' + key + '"]').forEach(function (cb) { if (cb.value === val) cb.checked = checked; });
    }
    function renderChips() {
      var chipsEl = $("[data-cf-chips]");
      if (!chipsEl) return;
      var chips = [];

      function pushArr(key, fmt, extraOnRemove) {
        state[key].forEach(function (v) {
          chips.push({
            text: fmt ? fmt(v) : v,
            onRemove: function () {
              var idx = state[key].indexOf(v);
              if (idx !== -1) state[key].splice(idx, 1);
              syncCheckboxUI(key, v, false);
              if (extraOnRemove) extraOnRemove(v);
              if (key === "marca") {
                state.modelo = state.modelo.filter(function (pair) { return state.marca.indexOf(pair.split("|")[0]) !== -1; });
                renderModelos();
              }
              applyAndRender();
            }
          });
        });
      }
      pushArr("ubicacion", function (v) { return v === "Rio Branco" ? "Río Branco" : v; });
      pushArr("marca");
      pushArr("modelo", function (v) { return v.split("|").join(" "); });
      pushArr("carroceria", null, function (v) {
        var b = document.querySelector('[data-cf-body="' + v + '"]');
        if (b) b.classList.remove("is-active");
      });
      pushArr("etiqueta", null, function (v) {
        var b = document.querySelector('[data-cf-etiqueta="' + v + '"]');
        if (b) b.classList.remove("is-active");
      });
      pushArr("tipoMotor");
      pushArr("transmision");
      pushArr("traccion");

      if (state.anio[0] !== bounds.anio[0] || state.anio[1] !== bounds.anio[1]) {
        chips.push({
          text: state.anio[0] + "–" + state.anio[1],
          onRemove: function () { state.anio = bounds.anio.slice(); if (rangeCtl.anio) rangeCtl.anio.reset(); applyAndRender(); }
        });
      }
      if (state.primerDueno) {
        chips.push({
          text: "Primer dueño",
          onRemove: function () { state.primerDueno = false; if (pdInput) pdInput.checked = false; applyAndRender(); }
        });
      }

      chipsEl.innerHTML = chips.map(function (c, i) {
        return '<span class="cf-chip-x" data-chip-i="' + i + '">' + escHTML(c.text) + ' <button type="button" aria-label="Quitar filtro">✕</button></span>';
      }).join("");
      $$(".cf-chip-x", chipsEl).forEach(function (el, i) {
        var btn = el.querySelector("button");
        if (btn) btn.addEventListener("click", function () { chips[i].onRemove(); });
      });
    }

    /* ---- Filtrado, orden y render de resultados ---- */
    function matches(v) {
      if (state.ubicacion.length && state.ubicacion.indexOf(v.ubicacion) === -1) return false;
      if (state.marca.length && state.marca.indexOf(v.marca) === -1) return false;
      if (state.modelo.length && state.modelo.indexOf(v.marca + "|" + v.modelo) === -1) return false;
      if (state.carroceria.length && state.carroceria.indexOf(v.carroceria) === -1) return false;
      if (state.etiqueta.length && state.etiqueta.indexOf(etiquetaDe(v)) === -1) return false;
      if (state.tipoMotor.length && state.tipoMotor.indexOf(v.tipoMotor) === -1) return false;
      if (state.transmision.length && state.transmision.indexOf(v.transmision) === -1) return false;
      if (state.traccion.length && state.traccion.indexOf(v.traccion) === -1) return false;
      if (state.primerDueno && v.primerDueno !== true) return false;
      if (v.anio < state.anio[0] || v.anio > state.anio[1]) return false;
      return true;
    }
    function sortList(list) {
      var copy = list.slice();
      if (state.sort === "anio-desc") copy.sort(function (a, b) { return b.anio - a.anio; });
      else copy.sort(function (a, b) { return new Date(b.fechaIngreso) - new Date(a.fechaIngreso); });
      return copy;
    }
    function renderResults() {
      var list = sortList(vehiculos.filter(matches));
      var countEl = $("[data-cr-count]");
      var emptyEl = $("[data-cr-empty]");
      var txt = list.length + (list.length === 1 ? " vehículo" : " vehículos");
      if (countEl) countEl.textContent = txt;

      if (!list.length) {
        grid.innerHTML = "";
        if (emptyEl) emptyEl.hidden = false;
      } else {
        if (emptyEl) emptyEl.hidden = true;
        grid.innerHTML = list.map(vehCardHTML).join("");
        safe(function () { bindTilt(grid); }, "catalogTilt");
      }

      var activeCount = state.ubicacion.length + state.marca.length + state.modelo.length + state.carroceria.length
        + state.etiqueta.length + state.tipoMotor.length + state.transmision.length + state.traccion.length + (state.primerDueno ? 1 : 0)
        + (state.anio[0] !== bounds.anio[0] || state.anio[1] !== bounds.anio[1] ? 1 : 0);
      var openCountEl = $("[data-cf-open-count]");
      if (openCountEl) { openCountEl.textContent = activeCount; openCountEl.hidden = activeCount === 0; }
    }
    function applyAndRender() { renderChips(); renderResults(); }

    var sortSel = $("[data-cr-sort]");
    if (sortSel) sortSel.addEventListener("change", function () { state.sort = this.value; renderResults(); });

    /* ---- Limpiar filtros ---- */
    function clearAll() {
      state.ubicacion = []; state.marca = []; state.modelo = []; state.carroceria = []; state.etiqueta = [];
      state.tipoMotor = []; state.transmision = []; state.traccion = []; state.primerDueno = false;
      state.anio = bounds.anio.slice();
      $$("[data-cf]").forEach(function (cb) { cb.checked = false; });
      $$("[data-cf-body]").forEach(function (b) { b.classList.remove("is-active"); });
      $$("[data-cf-etiqueta]").forEach(function (b) { b.classList.remove("is-active"); });
      if (pdInput) pdInput.checked = false;
      if (rangeCtl.anio) rangeCtl.anio.reset();
      renderModelos();
      applyAndRender();
    }
    var clearBtn = $("[data-cf-clear]");
    var clearBtn2 = $("[data-cf-clear-2]");
    if (clearBtn) clearBtn.addEventListener("click", clearAll);
    if (clearBtn2) clearBtn2.addEventListener("click", clearAll);

    renderModelos();
    applyAndRender();
  }

  /* ---- Íconos de la ficha de vehículo (trazo simple, heredan color) ---- */
  var PDP_ICONS = {
    motor: '<svg class="pdp-spec-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2S5 10.5 5 15a7 7 0 0 0 14 0c0-4.5-7-13-7-13z"/></svg>',
    carroceria: '<svg class="pdp-spec-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12l1.5-4.5A2 2 0 0 1 6.4 6h11.2a2 2 0 0 1 1.9 1.5L21 12M3 12v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-4M3 12h18M6.5 16.5h.01M17.5 16.5h.01"/></svg>',
    transmision: '<svg class="pdp-spec-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>',
    traccion: '<svg class="pdp-spec-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="12" r="3.2"/><circle cx="18" cy="12" r="3.2"/><path d="M9.2 12h5.6"/></svg>',
    anio: '<svg class="pdp-spec-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    km: '<svg class="pdp-spec-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 12l4-4M12 3v2M21 12h-2M12 21v-2M3 12h2M5.6 5.6l1.4 1.4M18.4 5.6l-1.4 1.4"/></svg>'
  };

  /* ---- Ficha de vehículo (vehiculo.html?id=...): galería, datos y
     relacionados. No hace nada si la página no tiene [data-pdp]. ---- */
  function initVehiculoDetail() {
    var root = $("[data-pdp]");
    if (!root || !data.vehiculos) return;

    var id = new URLSearchParams(location.search).get("id");
    var todos = data._allVehiculos || data.vehiculos;
    var v = null;
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].id === id) { v = todos[i]; break; }
    }

    var notFoundEl = $("[data-pdp-notfound]");
    var bodyEl = $("[data-pdp-body]");

    if (!v) {
      if (notFoundEl) notFoundEl.hidden = false;
      return;
    }
    if (bodyEl) bodyEl.hidden = false;

    document.title = v.marca + " " + v.modelo + " · Mauá Automóviles";

    var esUsado = v.condicion === "usado";
    var fotos = (v.fotos && v.fotos.length) ? v.fotos : [null]; /* null = placeholder de marca */

    /* ---- Galería ---- */
    var mainPhoto = $("[data-pdp-photo]");
    var thumbsEl = $("[data-pdp-thumbs]");
    function renderPhoto(idx) {
      var foto = fotos[idx];
      if (mainPhoto) {
        mainPhoto.src = foto || "assets/img/logo-mark.svg";
        mainPhoto.alt = v.marca + " " + v.modelo;
        mainPhoto.classList.toggle("is-placeholder", !foto);
      }
      if (thumbsEl) $$("button", thumbsEl).forEach(function (b, bi) { b.classList.toggle("is-active", bi === idx); });
    }
    var galleryIdx = 0;
    var btnPrev = $("[data-pdp-prev]");
    var btnNext = $("[data-pdp-next]");
    function updateArrows() {
      if (btnPrev) btnPrev.hidden = fotos.length <= 1;
      if (btnNext) btnNext.hidden = fotos.length <= 1;
    }
    function goTo(idx) {
      galleryIdx = (idx + fotos.length) % fotos.length;
      renderPhoto(galleryIdx);
    }
    if (btnPrev) btnPrev.addEventListener("click", function () { goTo(galleryIdx - 1); });
    if (btnNext) btnNext.addEventListener("click", function () { goTo(galleryIdx + 1); });

    if (fotos.length > 1 && thumbsEl) {
      thumbsEl.hidden = false;
      thumbsEl.innerHTML = fotos.map(function (f, i) {
        return '<button type="button" data-i="' + i + '"><img src="' + escHTML(f || "assets/img/logo-mark.svg") + '" alt="Foto ' + (i + 1) + '" loading="lazy" /></button>';
      }).join("");
      thumbsEl.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-i]");
        if (!btn) return;
        goTo(parseInt(btn.dataset.i, 10));
      });
    }
    updateArrows();
    renderPhoto(0);

    /* ---- Zoom con lupa ---- */
    var galleryMain = $("[data-pdp-gallery]");
    if (galleryMain && mainPhoto) {
      var lens = document.createElement("div");
      lens.className = "pdp-zoom-lens";
      galleryMain.appendChild(lens);
      var ZOOM = 2.4, LSIZE_W = 320, LSIZE_H = 260, LSIZE = Math.min(LSIZE_W, LSIZE_H);
      galleryMain.addEventListener("mousemove", function (e) {
        if (e.target.closest(".pdp-arrow")) { lens.style.display = "none"; return; }
        var cr = galleryMain.getBoundingClientRect();
        var cx = e.clientX - cr.left;
        var cy = e.clientY - cr.top;
        var nw = mainPhoto.naturalWidth || mainPhoto.width || 1;
        var nh = mainPhoto.naturalHeight || mainPhoto.height || 1;
        var cw = galleryMain.clientWidth, ch = galleryMain.clientHeight;
        var dispW, dispH, offX, offY;
        var scaleW = cw / nw, scaleH = ch / nh;
        var scale = Math.max(scaleW, scaleH);
        dispW = nw * scale; dispH = nh * scale;
        offX = (cw - dispW) / 2; offY = (ch - dispH) / 2;
        var imgX = cx - offX, imgY = cy - offY;
        if (imgX < 0 || imgY < 0 || imgX > dispW || imgY > dispH) {
          lens.style.display = "none"; return;
        }
        lens.style.display = "block";
        lens.style.left = cx + "px";
        lens.style.top = cy + "px";
        var bgW = Math.round(nw * scale * ZOOM);
        var bgH = Math.round(nh * scale * ZOOM);
        var bgX = Math.round(-(imgX * ZOOM - LSIZE_W / 2));
        var bgY = Math.round(-(imgY * ZOOM - LSIZE_H / 2));
        lens.style.backgroundImage = "url('" + mainPhoto.src + "')";
        lens.style.backgroundSize = bgW + "px " + bgH + "px";
        lens.style.backgroundPosition = bgX + "px " + bgY + "px";
      });
      galleryMain.addEventListener("mouseleave", function () { lens.style.display = "none"; });
    }

    /* ---- Badges ---- */
    var badgeCond = $("[data-pdp-badge-cond]");
    if (badgeCond) {
      var etDetalle = etiquetaDe(v);
      badgeCond.textContent = etDetalle;
      badgeCond.classList.toggle("veh-badge-0km", etDetalle === "0 km" || etDetalle === "Igual a 0km");
    }
    var badgeReciente = $("[data-pdp-badge-reciente]");
    if (badgeReciente) badgeReciente.hidden = !isReciente(v.fechaIngreso);

    /* ---- Sidebar ---- */
    var marcaEl = $("[data-pdp-marca]"); if (marcaEl) marcaEl.textContent = v.marca;
    var titleEl = $("[data-pdp-title]"); if (titleEl) titleEl.textContent = v.marca + " " + v.modelo;
    var versionEl = $("[data-pdp-version]"); if (versionEl) versionEl.textContent = v.version || "";
    var priceEl = $("[data-pdp-price]"); if (priceEl) priceEl.innerHTML = cuotaWebHTML(v);

    var quickEl = $("[data-pdp-quickspecs]");
    if (quickEl) {
      quickEl.innerHTML = ""
        + "<li><strong>" + v.anio + "</strong> · Año</li>"
        + "<li><strong>" + escHTML(etiquetaDe(v)) + "</strong> · Estado</li>"
        + "<li><strong>" + escHTML(v.tipoMotor) + "</strong> · Combustible</li>"
        + "<li><strong>" + escHTML(v.transmision) + "</strong> · Transmisión</li>";
    }

    var ubicEl = $("[data-pdp-ubicacion]");
    if (ubicEl) ubicEl.textContent = "Ubicación: " + (v.ubicacion === "Rio Branco" ? "Río Branco" : v.ubicacion);

    var tagsEl = $("[data-pdp-tags]");
    if (tagsEl) {
      var tags = [v.carroceria];
      if (esUsado && v.primerDueno) tags.push("Primer dueño");
      if (!esUsado) tags.push("Garantía oficial");
      tagsEl.innerHTML = tags.map(function (t) { return '<span class="pdp-tag">' + escHTML(t) + "</span>"; }).join("");
    }

    var etiqueta = esUsado ? (v.anio + " (usado)") : "0 km";
    // El CTA "Me interesa!" dirige al WhatsApp de la sucursal donde el
    // vehículo está publicado (waIntlForSucursal). El "share" comparte el
    // link de la ficha por WhatsApp — sale también por esa sucursal.
    var waBase = waBaseFor(v.sucursal);
    var ctaInteresa = $("[data-pdp-cta-interesa]");
    if (ctaInteresa) {
      var msgInteresa = "Hola! Me interesa el " + v.marca + " " + v.modelo + " " + etiqueta + ". ¿Sigue disponible?";
      ctaInteresa.setAttribute("href", waBase + encodeURIComponent(msgInteresa));
    }
    var shareWa = $("[data-pdp-share-wa]");
    if (shareWa) {
      var msgShare = "Mirá este " + v.marca + " " + v.modelo + ": " + location.href;
      shareWa.setAttribute("href", waBase + encodeURIComponent(msgShare));
    }

    /* ---- Características (íconos) ---- */
    var specsGrid = $("[data-pdp-specs-grid]");
    if (specsGrid) {
      var specs = [
        { ico: "motor", label: "Combustible", value: v.tipoMotor },
        { ico: "carroceria", label: "Carrocería", value: v.carroceria },
        { ico: "transmision", label: "Transmisión", value: v.transmision },
        { ico: "traccion", label: "Tracción", value: v.traccion },
        { ico: "anio", label: "Año", value: String(v.anio) },
        { ico: "km", label: "Estado", value: etiquetaDe(v) }
      ];
      specsGrid.innerHTML = specs.map(function (s) {
        return '<div class="pdp-spec">' + (PDP_ICONS[s.ico] || "") + "<strong>" + escHTML(s.value) + "</strong><span>" + escHTML(s.label) + "</span></div>";
      }).join("");
    }

    /* ---- Relacionados: misma carrocería primero, resto como relleno ---- */
    var relTrack = $("[data-pdp-related-track]");
    if (relTrack) {
      var sameBody = data.vehiculos.filter(function (x) { return x.id !== v.id && x.carroceria === v.carroceria; });
      var rest = data.vehiculos.filter(function (x) { return x.id !== v.id && x.carroceria !== v.carroceria; });
      var related = sameBody.concat(rest).slice(0, 10);
      relTrack.innerHTML = related.length
        ? related.map(vehCardHTML).join("")
        : '<p class="uc-noscript">No hay más vehículos para mostrar. <a href="usados.html">Ver catálogo completo →</a></p>';
      safe(function () { bindTilt(relTrack); }, "pdpRelatedTilt");
      var relCarousel = bindCardCarousel(relTrack, $("[data-pdp-related-prev]"), $("[data-pdp-related-next]"));
      relCarousel.refit();
    }
  }

  /* ---- WhatsApp: añade el modelo al mensaje ---- */
  function initWhatsApp() {
    var base = (data.whatsapp || "https://wa.me/59891940049") + "?text=";
    $$("[data-wa][data-model]").forEach(function (a) {
      var msg = "Hola! Quiero informacion sobre " + a.dataset.model;
      a.setAttribute("href", base + encodeURIComponent(msg));
    });
  }

  /* ---- Formulario de contacto → abre WhatsApp con la consulta ---- */
  function initContactForm() {
    var form = $("[data-contact-form]");
    var success = $("[data-contact-success]");
    if (!form || !success) return;
    var btn = form.querySelector("[type=submit]");
    var msgOut = $("[data-contact-success-msg]");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.classList.contains("is-sending")) return;
      if (!form.reportValidity()) return;

      var nombre  = (form.elements.nombre.value || "").trim();
      var tel     = (form.elements.telefono.value || "").trim();
      var interes = (form.elements.interes.value || "").trim();
      var mensaje = (form.elements.mensaje.value || "").trim();
      var first = nombre.split(/\s+/)[0] || "";

      var waText = "Hola! Soy " + nombre + ". Telefono: " + tel +
                   (interes ? ". Me interesa: " + interes : "") +
                   (mensaje ? ". " + mensaje : "");
      var waUrl = (data.whatsapp || "https://wa.me/59891940049") + "?text=" + encodeURIComponent(waText);

      /* Abrir WhatsApp de inmediato (dentro del gesto del usuario, evita bloqueo de pop-ups) */
      try { window.open(waUrl, "_blank", "noopener"); } catch (err) {}

      form.classList.add("is-sending");
      if (btn) btn.disabled = true;

      setTimeout(function () {
        form.classList.add("is-sent-check");
        if (msgOut) msgOut.textContent = first
          ? (first + ", abrimos WhatsApp con tu consulta. Si no se abrió, escribinos al 091 940 049.")
          : "Abrimos WhatsApp con tu consulta. Si no se abrió, escribinos al 091 940 049.";
        setTimeout(function () {
          form.classList.add("is-sent");
          success.setAttribute("aria-hidden", "false");
          success.classList.add("is-visible");
        }, 520);
      }, 650);
    });
  }

  /* ---- Mapas: se cargan solos (sin clic) cuando la sección de sucursales
     entra en pantalla. Se usa IntersectionObserver para no cargar los 3
     iframes de Google al abrir la página (arriba de todo), sino recién
     cuando el usuario baja hasta ellos. ---- */
  function initMapFacades() {
    var boxes = $$("[data-map-facade]");
    if (!boxes.length) return;
    function loadMap(box) {
      if (box.dataset.mapLoaded) return;
      box.dataset.mapLoaded = "1";
      var iframe = document.createElement("iframe");
      iframe.src = box.dataset.mapSrc;
      iframe.title = box.dataset.mapTitle || "Mapa";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      box.innerHTML = "";
      box.appendChild(iframe);
    }
    /* Fallback: si alguien igual toca el recuadro, lo carga al toque. */
    boxes.forEach(function (box) { box.addEventListener("click", function () { loadMap(box); }); });
    if (!("IntersectionObserver" in window)) { boxes.forEach(loadMap); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { loadMap(entry.target); obs.unobserve(entry.target); }
      });
    }, { rootMargin: "200px" });
    boxes.forEach(function (box) { obs.observe(box); });
  }

  /* ---- Pausar animaciones GSAP cuando la pestaña queda en segundo plano
     (evita que sigan consumiendo CPU sin que se las vea). ---- */
  function initVisibilityPause() {
    if (!window.gsap) return;
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) window.gsap.globalTimeline.pause();
      else window.gsap.globalTimeline.resume();
    });
  }

  function boot() {
    safe(initYear, "year");
    safe(initSplash, "splash");
    safe(initNav, "nav");
    safe(initMobileMenu, "mobileMenu");
    safe(initAnchors, "anchors");
    safe(initScrollProgress, "scrollProgress");
    safe(initReveals, "reveals");
    safe(initCountUp, "countUp");
    safe(initTilt, "tilt");
    safe(initCheryLineup, "cheryLineup");
    safe(initModeloDetail, "modeloDetail");
    safe(initWhatsApp, "whatsapp");
    safe(initContactForm, "contactForm");
    safe(initMapFacades, "mapFacades");
    safe(initVisibilityPause, "visibilityPause");

    /* Vehículos se cargan desde JSON (gestionado por el panel) */
    fetch("data/vehiculos.json").then(function (r) { return r.json(); }).then(function (vehiculos) {
      data._allVehiculos = vehiculos;
      data.vehiculos = vehiculos.filter(function (v) { return v.publicado !== false; });
      safe(initUsadosCarousel, "usadosCarousel");
      safe(initCatalog, "catalog");
      safe(initVehiculoDetail, "vehiculoDetail");
    }).catch(function () {
      safe(initUsadosCarousel, "usadosCarousel");
      safe(initCatalog, "catalog");
      safe(initVehiculoDetail, "vehiculoDetail");
    });

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
