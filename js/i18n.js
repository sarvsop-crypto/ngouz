(function (global) {
  "use strict";

  var I18N_KEY = "ngo_public_lang_v1";
  var LANGS = ["uz", "ru", "en"];
  var LABELS = {
    uz: "Oʻzbekcha",
    ru: "Русский",
    en: "English"
  };
  var cache = {};
  var listeners = [];
  var current = null;
  var ready = false;
  var readyQueue = [];

  function pickInitialLang() {
    var path = (location.pathname || "").toLowerCase();
    if (path.indexOf("/ru/") !== -1) return "ru";
    if (path.indexOf("/en/") !== -1) return "en";
    try {
      var saved = localStorage.getItem(I18N_KEY);
      if (saved && LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    return "uz";
  }

  function resolveBaseUrl() {
    // The JSON files sit next to this script in /js/i18n/, but the page
    // can be served from /, /uz/, /en/, /ru/, /cabinet/ etc., so resolve
    // relative to the script's own src instead of relative to the page.
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
      var src = scripts[i].src || "";
      if (src.indexOf("i18n.js") !== -1 && src.indexOf("/i18n/") === -1) {
        return src.replace(/i18n\.js(?:\?.*)?$/, "i18n/");
      }
    }
    return "/js/i18n/";
  }
  var BASE = null;

  function lookup(dict, key) {
    if (!dict || !key) return undefined;
    var parts = key.split(".");
    var node = dict;
    for (var i = 0; i < parts.length; i++) {
      if (node == null) return undefined;
      node = node[parts[i]];
    }
    return node;
  }

  function load(lang) {
    if (cache[lang]) return Promise.resolve(cache[lang]);
    if (!BASE) BASE = resolveBaseUrl();
    // Default cache mode respects server Cache-Control headers — prod
    // /js/* sends max-age=300 must-revalidate so ETag round-trips keep
    // locale dicts cheap without trapping dev iteration on a stale copy.
    return fetch(BASE + lang + ".json", { cache: "default" })
      .then(function (r) {
        if (!r.ok) throw new Error("i18n " + lang + " HTTP " + r.status);
        return r.json();
      })
      .then(function (dict) { cache[lang] = dict; return dict; });
  }

  function applyText(scope, dict) {
    var nodes = scope.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute("data-i18n");
      var val = lookup(dict, key);
      if (typeof val === "string") {
        // data-i18n-html opts an element into innerHTML replacement;
        // default is textContent so authoring keys never injects markup.
        if (el.hasAttribute("data-i18n-html")) el.innerHTML = val;
        else el.textContent = val;
      }
    }
    // Value form: the key lives in data-i18n-html itself (no plain data-i18n),
    // e.g. <div data-i18n-html="pages.mission.body">. innerHTML replacement.
    // The empty flag form (data-i18n + bare data-i18n-html) is already handled
    // above, so skip empty values here to avoid clobbering it with undefined.
    var htmlNodes = scope.querySelectorAll("[data-i18n-html]");
    for (var h = 0; h < htmlNodes.length; h++) {
      var hel = htmlNodes[h];
      var hkey = hel.getAttribute("data-i18n-html");
      if (!hkey) continue; // flag form — key came from data-i18n
      var hval = lookup(dict, hkey);
      if (typeof hval === "string") hel.innerHTML = hval;
    }
  }

  var ATTRS = ["placeholder", "title", "alt", "aria-label", "aria-placeholder", "content"];

  function applyAttrs(scope, dict) {
    for (var a = 0; a < ATTRS.length; a++) {
      var attr = ATTRS[a];
      var selector = "[data-i18n-" + attr + "]";
      var els = scope.querySelectorAll(selector);
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        var key = el.getAttribute("data-i18n-" + attr);
        var val = lookup(dict, key);
        if (typeof val === "string") el.setAttribute(attr, val);
      }
    }
  }

  function apply(scope, dict) {
    scope = scope || document;
    if (!dict) dict = cache[current];
    if (!dict) return;
    applyText(scope, dict);
    applyAttrs(scope, dict);
    document.documentElement.lang = current;
  }

  function fireListeners() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](current, cache[current]); } catch (e) {}
    }
  }

  function set(lang, opts) {
    if (LANGS.indexOf(lang) === -1) lang = "uz";
    current = lang;
    try { localStorage.setItem(I18N_KEY, lang); } catch (e) {}
    return load(lang).then(function (dict) {
      apply(document, dict);
      fireListeners();
      if (!ready) {
        ready = true;
        var q = readyQueue; readyQueue = [];
        for (var i = 0; i < q.length; i++) { try { q[i](dict, current); } catch (e) {} }
      }
      return dict;
    }).catch(function (err) {
      // Fall back to uz if the requested locale fails to load, otherwise
      // the page is half-translated and the switcher silently does
      // nothing — much worse UX than reverting to source language.
      if (lang !== "uz") {
        console.warn("i18n: falling back to uz —", err);
        return set("uz", opts);
      }
      throw err;
    });
  }

  function onChange(fn) { if (typeof fn === "function") listeners.push(fn); }
  function onReady(fn) {
    if (typeof fn !== "function") return;
    if (ready) fn(cache[current], current);
    else readyQueue.push(fn);
  }

  function t(key, fallback) {
    var val = lookup(cache[current], key);
    return typeof val === "string" ? val : (fallback != null ? fallback : key);
  }

  current = pickInitialLang();
  global.ngoI18n = {
    LANGS: LANGS,
    LABELS: LABELS,
    get: function () { return current; },
    set: set,
    load: load,
    apply: apply,
    t: t,
    onChange: onChange,
    onReady: onReady
  };

  // Kick off the initial load immediately so the network round-trip
  // overlaps DOMContentLoaded — by the time main.js runs, the dict is
  // usually already in cache.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { set(current); });
  } else {
    set(current);
  }
})(typeof window !== "undefined" ? window : globalThis);
