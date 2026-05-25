(function () {
  /* ── Load Phosphor Icons 2.1 (SRI-pinned) ─────────────────── */
  var _ph = document.createElement('script');
  _ph.src = 'https://unpkg.com/@phosphor-icons/web@2.1.1/src/index.js';
  _ph.integrity = 'sha384-cPFV+/abYd3INVFHPmSKpBmcnH+Q+bTZW7dv/EiuShUNPkHyFmRF8PsL7Ibfvunk';
  _ph.crossOrigin = 'anonymous';
  document.head.appendChild(_ph);

  // i18n state + text replacement live in js/i18n.js (window.ngoI18n).
  // main.js only owns the topbar lang switcher chrome — wiring clicks
  // to ngoI18n.set(code) and reflecting the active language in the
  // dropdown's label and selected option. This keeps page-string
  // translations out of every per-page bundle.
  var i18nKey = "ngo_lang_v1";

  var siteIndex = [
    { title: "Bosh sahifa", url: "index.html", summary: "O'zbekiston nodavlat notijorat tashkilotlari milliy assotsiatsiyasi rasmiy sayti.", keywords: "nntma uznntma ngo.uz bosh sahifa" },
    { title: "Biz haqimizda", url: "about.html", summary: "O'zNNTMA 2005 yilda 150 ta fuqarolik institutlari tashabbusi bilan tashkil topgan.", keywords: "about biz haqimizda tarixi 2005 150" },
    { title: "Rahbariyat", url: "leadership.html", summary: "Ishanxodjayev Kamoliddin — Kengash raisi. Jo'raboyev Ibroximjon — birinchi o'rinbosar. Ismoilov Samandar — o'rinbosar.", keywords: "rahbariyat kengash raisi ishanxodjayev joraboyev ismoilov" },
    { title: "Bizning jamoa", url: "our-team.html", summary: "O'zNNTMA ijro etuvchi devoni va hududiy bo'linmalar xodimlari ro'yxati.", keywords: "bizning jamoa our team xodimlar staff hududiy bolinma" },
    { title: "NNTlar maktabi", url: "nnt-school.html", summary: "NNT rahbarlari va xodimlari uchun o'quv kurslari va treninglar.", keywords: "nntlar maktabi school kurslar trening" },
    { title: "Yangiliklar", url: "news.html", summary: "O'zNNTMA va NNT sektori bo'yicha so'nggi yangiliklar va tahliliy maqolalar.", keywords: "yangiliklar news xabar tahlil" },
    { title: "Tadbirlarimiz", url: "events.html", summary: "Seminarlar, treninglar, malaka oshirish kurslari va anjumanlar.", keywords: "tadbirlar events seminar trening kurs anjuman" },
    { title: "Xalqaro faoliyat", url: "services.html", summary: "TIKA, Germaniya va Yevropa komissiyasi bilan hamkorlikdagi dasturlar.", keywords: "xalqaro hamkorlik tika germaniya yevropa berlin" },
    { title: "Hamkorlar", url: "awards.html", summary: "Ekologik partiya, Liberal-demokratik partiya, Statistika qo'mitasi va boshqa hamkorlar.", keywords: "hamkorlar partners ekologik liberal statistika" },
    { title: "Interaktiv xizmatlar", url: "contact.html", summary: "NNT hujjatlari, hisobot shakllari, huquqiy konsultatsiyalar va murojaatlar.", keywords: "interaktiv xizmatlar hujjatlar hisobot konsultatsiya" },
    { title: "A'zo bo'lish", url: "membership.html", summary: "O'zNNTMAga a'zolik jarayoni va zarur hujjatlar ro'yxati.", keywords: "azo bolish membership qanday" },
    { title: "Rasmiy hujjatlar", url: "official-docs.html", summary: "Davlat dasturlari, qonunlar, qarorlar va NNT faoliyatiga oid normativ hujjatlar.", keywords: "hujjatlar qonun qaror davlat dasturi" },
    { title: "Hisobot shakllari", url: "reporting-forms.html", summary: "NNT yillik hisobot shakllari va taqdim etish muddatlari.", keywords: "hisobot shakl taqdim etish muddat" },
    { title: "Savol-javob", url: "faq.html", summary: "NNT faoliyatiga oid ko'p beriladigan savollarga javoblar.", keywords: "savol javob faq nnt" },
    { title: "Grant va tanlovlar", url: "projects.html", summary: "Faol grant tanlovlari va moliyaviy qo'llab-quvvatlash dasturlari.", keywords: "grant tanlov loyiha moliya" },
    { title: "Publikatsiyalar", url: "publications.html", summary: "Tahliliy maqolalar, seminar materiallari va metodik qo'llanmalar.", keywords: "publikatsiya nashr maqola material" },
    { title: "A'zolik yo'riqnomasi", url: "membership-guide", summary: "O'zNNTMAga a'zo bo'lish bo'yicha bosqichma-bosqich yo'riqnoma.", keywords: "azoliq yuriqnoma bosqich hujjat" },
    // iter 150: round out the index from 17 → ~46 entries so site
    // search reaches every public page after the iter-67 URL cleanup.
    // strip() in main.js handles the trailing .html for legacy entries.
    { title: "Maqsad va vazifalar", url: "mission", summary: "O'zNNTMA strategik maqsadlari va NNT sektori uchun ustuvor vazifalari.", keywords: "maqsad vazifa missiya strategiya" },
    { title: "Kengash a'zolari", url: "board-of-experts", summary: "O'zNNTMA Boshqaruv kengashi a'zolari, ekspertlar va qo'mita raislari.", keywords: "kengash ekspertlar board" },
    { title: "Hududiy bo'linmalar", url: "hududiy-bolinmalar", summary: "O'zNNTMA viloyat va Toshkent shahar hududiy bo'linmalari.", keywords: "hududiy bolinma viloyat toshkent regional" },
    { title: "Assotsiatsiya tuzilmasi", url: "structure", summary: "O'zNNTMA tashkiliy tuzilmasi, qo'mitalar va ishchi guruhlar.", keywords: "tuzilma struktura qomita ishchi guruh" },
    { title: "NNTlar reyestri", url: "nntlar", summary: "Assotsiatsiyaga a'zo NNTlar — to'liq ro'yxat, qidiruv va hududlar bo'yicha filtr.", keywords: "nnt reyestr royxat azolar a'zo organization tashkilot" },
    { title: "Barqarorlik indeksi", url: "sustainability-index", summary: "NNTlar barqarorlik indeksi va tashkilot bal taqsimoti.", keywords: "barqarorlik indeks reyting sustainability" },
    { title: "Barqaror NNT sertifikati", url: "sustainability-cert", summary: "Barqaror NNT sertifikatiga ega tashkilotlar ro'yxati.", keywords: "barqaror sertifikat sustainability cert" },
    { title: "Mahalliy hamkorlar", url: "mahalliy-hamkorlar", summary: "O'zNNTMA mahalliy davlat va xususiy hamkorlari.", keywords: "mahalliy hamkor partner uzbekistan" },
    { title: "Jamoatchilik kengashi", url: "jamoatchilik-kengashi", summary: "Jamoatchilik kengashi a'zolari va ularning faoliyat sohalari.", keywords: "jamoatchilik kengash a'zo public council" },
    { title: "Loyihalar", url: "projects", summary: "Faol loyihalar, grant tanlovlari va NNTlar uchun moliyaviy yordam.", keywords: "loyiha proyekt grant project" },
    { title: "Grant tanlovlari (AI)", url: "grant-tanlovlari", summary: "AI yordamida grant tanlovlarini topish — sun'iy intellektga savol bering.", keywords: "grant ai sunatik intellekt search ai chat" },
    { title: "Grantlar", url: "grants", summary: "Faol grant tanlovlari ro'yxati — donor, summa, ariza muddati va tafsilotlar.", keywords: "grant donor summa ariza muddat funding tanlov" },
    { title: "Bog'lanish", url: "contact", summary: "Manzil, telefon, email va ijtimoiy tarmoqlar.", keywords: "kontakt bog'lanish manzil aloqa" },
    { title: "Qayta aloqa", url: "qayta-aloqa", summary: "Savol, taklif yoki murojaat yuborish uchun forma.", keywords: "qayta aloqa feedback murojaat savol" },
    { title: "Korrupsiya murojaati", url: "korrupsiya-murojaat", summary: "Korrupsiyani oldini olish — anonim murojaat shakli.", keywords: "korrupsiya anti-corruption murojaat anonim" },
    { title: "Multimedia", url: "multimedia-room", summary: "Foto, video va audio materiallar.", keywords: "multimedia foto video audio media" },
    { title: "Videolar", url: "videos", summary: "O'zNNTMA video roliklari va treninglar.", keywords: "video rolik trening multimedia" },
    { title: "Infografika", url: "infographics", summary: "NNT sektori statistikasi va vizualizatsiyalar.", keywords: "infografika statistika diagramma chart" },
    { title: "Dayjestlar", url: "dayjestlar", summary: "Haftalik va oylik NNT yangiliklari dayjesti.", keywords: "dayjest digest haftalik oy review" },
    { title: "Bo'sh ish o'rinlari", url: "vacancies", summary: "NNT sektoridagi bo'sh ish o'rinlari va ish e'lonlari.", keywords: "vakansiya ish vacancy job o'rin" },
    { title: "Stajirovka va volontyorlik", url: "stajirovka-volontyorlik", summary: "Stajirovka va volontyorlik dasturlari, NNTlar bilan amaliyot.", keywords: "stajirovka volontyor internship volunteer amaliyot" },
    { title: "Virtual akademiya", url: "talim-rivojlanish", summary: "Onlayn ta'lim — NNT rahbarlari va xodimlari uchun kurslar.", keywords: "akademiya talim ta'lim kurs online education" },
    { title: "Onlayn kutubxona", url: "online-library", summary: "NNT sektori bo'yicha kitoblar, qo'llanmalar va metodik materiallar.", keywords: "kutubxona library kitob qollanma material" },
    { title: "Tadqiqot yo'nalishlari", url: "research-areas", summary: "O'zNNTMA tadqiqot yo'nalishlari va ilmiy ishlanmalar.", keywords: "tadqiqot research yo'nalish ilm science" },
    { title: "Davlat ijtimoiy buyurtmalari", url: "social-orders", summary: "Davlat ijtimoiy buyurtmalari va NNT sektori ishtiroki.", keywords: "ijtimoiy buyurtma davlat social order tender" },
    { title: "Ijtimoiy afzalliklar", url: "afzalliklar", summary: "A'zolik afzalliklari, imtiyozlar va bonuslar.", keywords: "afzallik benefit imtiyoz bonus a'zolik" },
    { title: "Rasmiy murojaat", url: "service-request", summary: "Interaktiv xizmatlar bo'yicha rasmiy murojaat yuborish formasi.", keywords: "service request rasmiy murojaat formal" },
    { title: "A'zolik guvohnomasi", url: "membership-certificate", summary: "Tashkilot a'zolik guvohnomasini olish tartibi.", keywords: "guvohnoma certificate a'zolik membership" },
    { title: "Kim biz", url: "who-we-are", summary: "O'zNNTMA tashkiloti haqida — vazifa, missiya va qadriyatlar.", keywords: "kim biz who we are about haqida" },
    { title: "Maxfiylik siyosati", url: "maxfiylik-siyosati", summary: "Shaxsiy ma'lumotlarni qayta ishlash siyosati va saytdan foydalanish.", keywords: "maxfiylik privacy siyosat policy" },
    { title: "Foydalanish shartlari", url: "foydalanish-shartlari", summary: "Sayt va xizmatlardan foydalanish shartlari.", keywords: "shartlar foydalanish terms conditions" }
  ];


  var _langShort = { uz: "O\u02BBzbekcha", ru: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439", en: "English" };

  // Chrome-only update for the topbar switcher: active class, listbox
  // aria-selected, and the trigger label. Text translation is handled
  // by js/i18n.js \u2014 this only paints the switcher's own state so the
  // UI reflects whichever language ngoI18n is now using.
  var updateLangChrome = function (lang) {
    var langLinks = document.querySelectorAll(".topbar-lang[data-lang]");
    langLinks.forEach(function (a) {
      var code = a.getAttribute("data-lang");
      var isActive = code === lang;
      a.classList.toggle("active-lang", isActive);
      if (a.getAttribute("role") === "option") {
        a.setAttribute("aria-selected", isActive ? "true" : "false");
      }
    });
    var labelEl = document.getElementById("topbarLangLabel");
    if (labelEl) labelEl.textContent = _langShort[lang] || lang.toUpperCase();
  };

  // Legacy alias \u2014 a few inline handlers in older HTML still call
  // applyLang(). Route them through ngoI18n so existing pages keep
  // working without per-page edits.
  var applyLang = function (langCode) {
    var lang = (langCode === "ru" || langCode === "en" || langCode === "uz") ? langCode : "uz";
    if (window.ngoI18n) window.ngoI18n.set(lang);
    else updateLangChrome(lang);
    return lang;
  };

  // ngoI18n loads its dict async; this fires once the locale JSON
  // applies, plus on every later switcher click.
  if (window.ngoI18n) window.ngoI18n.onChange(function (lang) { updateLangChrome(lang); });

  var initialLang = window.ngoI18n ? window.ngoI18n.get() : "uz";
  updateLangChrome(initialLang);

  var languageLinks = Array.prototype.slice.call(document.querySelectorAll(".topbar-lang"));
  languageLinks.forEach(function (a, idx) {
    var code = idx === 0 ? "uz" : idx === 1 ? "ru" : "en";
    a.setAttribute("data-lang", code);
  });
  languageLinks = document.querySelectorAll(".topbar-lang[data-lang]");
  // CF Pages serves clean URLs (no .html). The .html stubs in /uz/,
  // /ru/, /en/ are also accessible without the suffix, so build the
  // switcher href the same way: /<code>/<slug>. Preserve the query
  // string so /news-detail?id=123 → /ru/news-detail?id=123 keeps the
  // article reference; without this, the language-switched detail
  // page lost the id and rendered the empty/first article instead.
  var currentSlug = (location.pathname.split("/").pop() || "").toLowerCase();
  if (currentSlug.endsWith(".html")) currentSlug = currentSlug.slice(0, -5);
  // Empty slug (root path '/' or '/uz/') → omit so href becomes '/ru/'
  // not '/ru/index'. The /index URL also works on CF Pages but is
  // ugly in the address bar after clicking the language switcher.
  var currentQuery = location.search || "";
  languageLinks.forEach(function (a) {
    var code = a.getAttribute("data-lang");
    a.setAttribute("href", "/" + code + "/" + currentSlug + currentQuery);
    a.addEventListener("click", function (e) {
      e.preventDefault();
      applyLang(code);
      langDrop.classList.remove("open");
      // Trigger may not be in scope at this point (it is built below)
      // — so look it up by id; this also covers any rebuild of the
      // wrapper in dynamic flows.
      var t = document.getElementById("topbarLangTrigger");
      if (t) t.setAttribute("aria-expanded", "false");
    });
  });

  // Build language dropdown wrapper
  var langDrop = document.createElement("div");
  langDrop.className = "topbar-lang-drop";
  var langShort = { uz: "O\u02BBzbekcha", ru: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439", en: "English" };
  var langTrigger = document.createElement("button");
  langTrigger.type = "button";
  langTrigger.className = "topbar-lang-trigger";
  langTrigger.id = "topbarLangTrigger";
  langTrigger.setAttribute("aria-haspopup", "listbox");
  langTrigger.setAttribute("aria-expanded", "false");
  langTrigger.setAttribute("aria-label", "Tilni tanlash");
  langTrigger.innerHTML = '<span id="topbarLangLabel">' + (langShort[initialLang] || "O\u02BBzbekcha") + '</span>' +
    '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="2,3 5,7 8,3"/></svg>';
  var langMenu = document.createElement("div");
  langMenu.className = "topbar-lang-menu";
  langMenu.setAttribute("role", "listbox");
  Array.prototype.forEach.call(document.querySelectorAll(".topbar-lang[data-lang]"), function(a) {
    a.setAttribute("role", "option");
    // Initial aria-selected mirrors the .active-lang class set by
    // applyLang() above. applyLang() will keep this in sync on every
    // language change. Without this initial pass, options had no
    // selected state until the user clicked one.
    a.setAttribute("aria-selected", a.classList.contains("active-lang") ? "true" : "false");
    langMenu.appendChild(a);
  });
  langDrop.appendChild(langTrigger);
  langDrop.appendChild(langMenu);
  var topbarControls = document.querySelector(".topbar-controls");
  var visBtn2 = topbarControls && topbarControls.querySelector(".vis-btn");
  if (visBtn2) topbarControls.insertBefore(langDrop, visBtn2);
  else if (topbarControls) topbarControls.appendChild(langDrop);

  langTrigger.addEventListener("click", function(e) {
    e.stopPropagation();
    var nowOpen = langDrop.classList.toggle("open");
    langTrigger.setAttribute("aria-expanded", nowOpen ? "true" : "false");
  });
  document.addEventListener("click", function(e) {
    if (!langDrop.contains(e.target) && langDrop.classList.contains("open")) {
      langDrop.classList.remove("open");
      langTrigger.setAttribute("aria-expanded", "false");
    }
  });
  // Esc closes \u2014 same pattern as the visibility panel and modal stack.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && langDrop.classList.contains("open")) {
      langDrop.classList.remove("open");
      langTrigger.setAttribute("aria-expanded", "false");
      langTrigger.focus();
    }
  });

  // updateLangChrome(initialLang) already ran above before the
  // switcher DOM existed — re-run now so the listbox options that
  // were just inserted pick up the active-lang/aria-selected state.
  updateLangChrome(initialLang);

  // (Removed: parentMap + .menu a[data-page] section-active loop.
  // No element in any HTML has a data-page attribute, so the loop
  // matched zero links and the parentMap was unused. dropdown.js
  // now handles section-active highlighting via the
  // .nav-item.is-section-active class set when a child link's
  // slug matches the current page (iter 211).)

  // Nav dropdown click/keyboard handling lives in dropdown.js. It
  // attaches before main.js (loaded earlier in the document) so don't
  // double-up here — duplicate handlers race-toggle is-open and the
  // menu opens-then-closes on the same click.

  var reg = document.getElementById("reg-ok");
  var submit = document.getElementById("submit-membership");
  if (reg && submit) {
    var sync = function () {
      submit.disabled = !reg.checked;
    };
    reg.addEventListener("change", sync);
    sync();
  }

  var reportConfirm = document.getElementById("report-confirm");
  var reportSubmit = document.getElementById("report-submit");
  if (reportConfirm && reportSubmit) {
    var syncReport = function () {
      reportSubmit.disabled = !reportConfirm.checked;
    };
    reportConfirm.addEventListener("change", syncReport);
    syncReport();
  }

  var faqSearch = document.getElementById("faq-search");
  var faqItems = Array.prototype.slice.call(document.querySelectorAll("[data-faq-item]"));
  if (faqItems.length) {
    faqItems.forEach(function (item, idx) {
      item.classList.add("is-collapsed");
      var toggle = item.querySelector(".faq-toggle");
      var answer = item.querySelector("p");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        if (answer) {
          if (!answer.id) answer.id = "faq-answer-" + idx;
          toggle.setAttribute("aria-controls", answer.id);
        }
        toggle.addEventListener("click", function () {
          var collapsed = item.classList.toggle("is-collapsed");
          toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
        });
      }
    });
  }
  if (faqSearch && faqItems.length) {
    var faqEmpty = null;
    // Visually-hidden live region so SR users hear the count change
    // ("3 ta savol topildi") without sighted users seeing a redundant
    // counter on screen — the visible result is the filtered list.
    var faqCount = document.createElement("p");
    faqCount.id = "faqSearchCount";
    faqCount.className = "visually-hidden";
    faqCount.setAttribute("role", "status");
    faqCount.setAttribute("aria-live", "polite");
    var faqListEl = document.getElementById("faqList") || document.querySelector(".faq.faq-list-spaced");
    if (faqListEl && faqListEl.parentNode) faqListEl.parentNode.insertBefore(faqCount, faqListEl);
    var faqAnnounceTimer = null;
    faqSearch.addEventListener("input", function () {
      var query = faqSearch.value.toLowerCase().trim();
      var visibleCount = 0;
      faqItems.forEach(function (item) {
        var text = item.textContent.toLowerCase();
        var match = !query || text.indexOf(query) !== -1;
        item.style.display = match ? "" : "none";
        if (match) visibleCount += 1;
      });
      if (visibleCount === 0 && query) {
        if (!faqEmpty) {
          faqEmpty = document.createElement("p");
          faqEmpty.setAttribute("role", "status");
          faqEmpty.style.padding = "12px";
          faqEmpty.style.color = "#6b7280";
          faqEmpty.textContent = "Hech narsa topilmadi";
          var faqList = document.getElementById("faqList") || document.querySelector(".faq.faq-list-spaced");
          if (faqList) faqList.appendChild(faqEmpty);
        }
        if (faqEmpty) faqEmpty.style.display = "";
      } else if (faqEmpty) {
        faqEmpty.style.display = "none";
      }
      // Debounce SR announcement so each keystroke doesn't queue a
      // separate utterance — SR queues are FIFO and a fast typer
      // would hear stale counts for several seconds after stopping.
      if (faqAnnounceTimer) clearTimeout(faqAnnounceTimer);
      faqAnnounceTimer = setTimeout(function () {
        faqCount.textContent = query
          ? (visibleCount + " ta savol topildi")
          : "";
      }, 350);
    });
  }

  var searchPath = (location.pathname.split("/").pop() || "").toLowerCase();
  if (searchPath === "search-results" || searchPath === "search-results.html") {
    var params = new URLSearchParams(location.search);
    var q = (params.get("q") || "").trim().toLowerCase();
    var queryNode = document.getElementById("search-query");
    // Prefer #search-static-results (renders alongside the dynamic
    // news-search results that content.js fills #dynamic-search-results
    // with). Fall back to the legacy single-bucket id when this page
    // hasn't been updated to the two-section markup yet.
    var staticNode = document.getElementById("search-static-results");
    var resultsNode = staticNode
      || document.getElementById("dynamic-search-results")
      || document.getElementById("search-results-list");
    if (queryNode) queryNode.textContent = q ? ("\"" + params.get("q").trim() + "\"") : "so'rov kiritilmagan";
    // Reflect the search query in <title> so browser tabs / history /
    // bookmarks disambiguate searches instead of all reading
    // "Qidiruv natijalari - ngo.uz".
    if (q) {
      try {
        var qDisp = params.get("q").trim().slice(0, 80);
        document.title = qDisp + " — Qidiruv natijalari · ngo.uz";
      } catch (e) {}
    }
    if (resultsNode) {
      if (!q) {
        resultsNode.innerHTML = "<div class=\"search-item\"><h3>Qidiruv so'rovi bo'sh</h3><p>Iltimos, yuqoridagi qidiruv maydoniga kalit so'z kiriting.</p></div>";
      } else {
        var results = siteIndex.filter(function (item) {
          var haystack = (item.title + " " + item.summary + " " + item.keywords).toLowerCase();
          return haystack.indexOf(q) !== -1;
        });
        if (!results.length) {
          // When the dedicated static-results node exists, leave it
          // empty rather than printing "no matches" — the dynamic
          // results below may still surface news/event hits, and a
          // doubled empty-state is confusing.
          if (!staticNode) {
            resultsNode.innerHTML = "<div class=\"search-item\"><h3>Natija topilmadi</h3><p>Boshqa kalit so'z bilan qayta qidirib ko'ring.</p></div>";
          }
        } else {
          var heading = staticNode
            ? "<h2 class=\"search-section-title\">Sahifalar (" + results.length + ")</h2>"
            : "";
          var escSearch = function (s) {
            return String(s == null ? "" : s)
              .replace(/&/g, "&amp;").replace(/</g, "&lt;")
              .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
              .replace(/'/g, "&#39;");
          };
          resultsNode.innerHTML = heading + results.map(function (item) {
            // siteIndex urls were authored with .html (legacy); strip
            // the suffix so clicks hit the canonical clean URL directly
            // instead of taking a 308 round-trip.
            var href = String(item.url).replace(/\.html$/, "");
            // siteIndex is a static array, but defense-in-depth: a copy-
            // paste typo or future i18n source could land special chars
            // in title/summary; esc keeps innerHTML safe.
            return "<a class=\"search-item\" href=\"" + escSearch(href) + "\"><h3>" + escSearch(item.title) + "</h3><p>" + escSearch(item.summary) + "</p></a>";
          }).join("");
        }
      }
    }
  }

  // Wire search overlay form to redirect to search-results.html
  var searchOverlayForm = document.querySelector('#searchOverlay form');
  if (searchOverlayForm) {
    searchOverlayForm.onsubmit = function () {
      var inp = document.getElementById('searchInput');
      var val = inp ? inp.value.trim() : '';
      if (val) {
        location.href = 'search-results?q=' + encodeURIComponent(val);
      } else if (inp) {
        // Empty submit gave no feedback — refocus the input so the
        // user knows where to type. Native required+browser validation
        // doesn't fire because the page-level onsubmit returns false
        // synchronously.
        try { inp.focus(); } catch (e) {}
      }
      return false;
    };
  }

  var a11yBtn = document.querySelector(".vis-btn");
  if (a11yBtn) {
    var key = "ngo_a11y_v1";
    var root = document.documentElement;
    var body = document.body;
    var state = { fontScale: 1, contrast: false, grayscale: false };

    try {
      var raw = localStorage.getItem(key);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (typeof parsed.fontScale === "number") state.fontScale = parsed.fontScale;
        if (typeof parsed.contrast === "boolean") state.contrast = parsed.contrast;
        if (typeof parsed.grayscale === "boolean") state.grayscale = parsed.grayscale;
      }
    } catch (e) {}

    var panel = document.createElement("div");
    panel.className = "a11y-panel";
    panel.id = "a11yPanel";
    panel.setAttribute("role", "dialog");
    // aria-labelledby points at the visible h4 so SR users hear exactly
    // the heading text rather than a parallel aria-label that drifted
    // ("Ko'rish imkoniyati" vs "Ko'rish rejimi"). Matches the iter 927
    // pattern in cabinet-organization editOrgModal.
    panel.setAttribute("aria-labelledby", "a11yPanelTitle");
    panel.innerHTML =
      "<h4 id=\"a11yPanelTitle\">Ko'rish rejimi</h4>" +
      "<div class=\"a11y-row\"><label>Matn o'lchami</label><div><button type=\"button\" class=\"btn-mini\" data-a11y=\"dec\">A-</button> <button type=\"button\" class=\"btn-mini\" data-a11y=\"inc\">A+</button></div></div>" +
      "<div class=\"a11y-row\"><label>Yuqori kontrast</label><button type=\"button\" class=\"btn-mini\" data-a11y=\"contrast\">Yoqish</button></div>" +
      "<div class=\"a11y-row\"><label>Qora-oq rejim</label><button type=\"button\" class=\"btn-mini\" data-a11y=\"gray\">Yoqish</button></div>" +
      "<div class=\"a11y-row\"><button type=\"button\" class=\"btn-mini\" data-a11y=\"reset\">Standart holat</button></div>";
    body.appendChild(panel);
    a11yBtn.setAttribute("aria-haspopup", "dialog");
    a11yBtn.setAttribute("aria-controls", "a11yPanel");
    a11yBtn.setAttribute("aria-expanded", "false");

    var contrastBtn = panel.querySelector("[data-a11y=\"contrast\"]");
    var grayBtn = panel.querySelector("[data-a11y=\"gray\"]");

    var save = function () {
      try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
    };

    var applyState = function () {
      state.fontScale = Math.min(1.5, Math.max(0.7, state.fontScale));
      root.style.zoom = state.fontScale;
      var filters = [];
      if (state.contrast) filters.push("contrast(2)");
      if (state.grayscale) filters.push("grayscale(1)");
      body.style.filter = filters.join(" ");
      if (contrastBtn) {
        contrastBtn.classList.toggle("active", !!state.contrast);
        contrastBtn.textContent = state.contrast ? "O'chirish" : "Yoqish";
      }
      if (grayBtn) {
        grayBtn.classList.toggle("active", !!state.grayscale);
        grayBtn.textContent = state.grayscale ? "O'chirish" : "Yoqish";
      }
      save();
    };

    panel.addEventListener("click", function (e) {
      var action = e.target && e.target.getAttribute("data-a11y");
      if (!action) return;
      if (action === "inc") state.fontScale += 0.15;
      if (action === "dec") state.fontScale -= 0.15;
      if (action === "contrast") state.contrast = !state.contrast;
      if (action === "gray") state.grayscale = !state.grayscale;
      if (action === "reset") {
        state.fontScale = 1;
        state.contrast = false;
        state.grayscale = false;
      }
      applyState();
    });

    a11yBtn.addEventListener("click", function () {
      var nowOpen = panel.classList.toggle("open");
      a11yBtn.setAttribute("aria-expanded", nowOpen ? "true" : "false");
    });

    document.addEventListener("click", function (e) {
      // a11yBtn contains an SVG icon; e.target is the SVG, not the
      // button. The previous `e.target !== a11yBtn` check missed this
      // and the document handler closed the panel right after the
      // button handler opened it — clicking the icon appeared to do
      // nothing. Use .contains() so any descendant of the button
      // (svg/path/etc) counts as the toggle source.
      if (!panel.contains(e.target) && !a11yBtn.contains(e.target)) {
        if (panel.classList.contains("open")) {
          panel.classList.remove("open");
          a11yBtn.setAttribute("aria-expanded", "false");
        }
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("open")) {
        panel.classList.remove("open");
        a11yBtn.setAttribute("aria-expanded", "false");
        a11yBtn.focus();
      }
    });

    applyState();
  }

  // Hamburger + mobile nav
  var hamburgerBtn = document.getElementById('hamburgerBtn');
  if (hamburgerBtn) {
    var mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    mobileNav.id = 'mobileNav';
    // Mirror desktop nav (kept as the single source of truth). Controls row
    // (UZ/RU/EN + search + a11y) sits at the TOP so users land on them
    // immediately when the drawer opens — these are the highest-value
    // utilities. Nav links follow below.
    mobileNav.innerHTML =
      '<div class="mobile-nav-controls">' +
        '<div class="lang-group" role="group" aria-label="Til">' +
          '<button type="button" class="lang-pill" data-mobile-lang="uz">UZ</button>' +
          '<button type="button" class="lang-pill" data-mobile-lang="ru">RU</button>' +
          '<button type="button" class="lang-pill" data-mobile-lang="en">EN</button>' +
        '</div>' +
        '<button type="button" class="icon-btn" data-mobile-search aria-label="Qidirish">' +
          '<svg aria-hidden="true" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="16.5" x2="22" y1="16.5" y2="22"></line></svg>' +
        '</button>' +
        '<button type="button" class="icon-btn" data-mobile-a11y aria-label="Ko\'rish rejimi">' +
          '<svg aria-hidden="true" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>' +
        '</button>' +
      '</div>' +
      '<span class="mobile-nav-label">Assotsiatsiya haqida</span>' +
      '<a href="about">Assotsiatsiya haqida</a>' +
      '<div class="mobile-nav-sub">' +
        '<a href="mission">Maqsad va vazifalar</a>' +
        '<a href="board-of-experts">Kengash a\'zolari</a>' +
        '<a href="leadership">Rahbariyat</a>' +
        '<a href="our-team">Bizning jamoa</a>' +
        '<a href="hududiy-bolinmalar">Hududiy bo\'linmalar</a>' +
        '<a href="structure">Assotsiatsiya tuzilmasi</a>' +
      '</div>' +
      '<span class="mobile-nav-label">NNTlar reyestri</span>' +
      '<a href="nntlar">Assotsiatsiyaga a\'zo NNTlar</a>' +
      '<div class="mobile-nav-sub">' +
        '<a href="sustainability-index">NNTlar barqarorlik indeksi</a>' +
        '<a href="sustainability-cert">"Barqaror NNT" sertifikatiga ega NNTlar</a>' +
      '</div>' +
      '<a href="projects">Loyihalar</a>' +
      '<span class="mobile-nav-label">Hamkorlar</span>' +
      '<a href="awards">Xorijiy hamkorlar</a>' +
      '<div class="mobile-nav-sub">' +
        '<a href="mahalliy-hamkorlar">Mahalliy hamkorlar</a>' +
        '<a href="jamoatchilik-kengashi">Jamoatchilik kengashi a\'zolari</a>' +
      '</div>' +
      '<span class="mobile-nav-label">Ochiq ma\'lumotlar</span>' +
      '<a href="contact">Bog\'lanish</a>' +
      '<div class="mobile-nav-sub">' +
        '<a href="grant-tanlovlari">Grant tanlovlari - AI qidiruv</a>' +
        '<a href="official-docs">Normativ-huquqiy hujjatlar</a>' +
        '<a href="multimedia-room">Media</a>' +
        '<a href="events">Tadbirlar</a>' +
        '<a href="reporting-forms">Hisobotlar</a>' +
        '<a href="dayjestlar">Dayjestlar</a>' +
        '<a href="vacancies">Bo\'sh ish o\'rinlari</a>' +
        '<a href="talim-rivojlanish">Virtual akademiya</a>' +
        '<a href="stajirovka-volontyorlik">Stajirovka va volontyorlik</a>' +
      '</div>' +
      '<a href="membership" class="mobile-nav-cta">A\'zo bo\'lish</a>';
    document.body.appendChild(mobileNav);

    // Mobile drawer controls: delegate to the existing topbar widgets so
    // we don't fork the lang / search / a11y state machines.
    var paintMobileLang = function () {
      var current = (window.ngoI18n && window.ngoI18n.get && window.ngoI18n.get()) ||
        (function () { try { return localStorage.getItem('ngo_lang_v1') || 'uz'; } catch (e) { return 'uz'; } })();
      mobileNav.querySelectorAll('[data-mobile-lang]').forEach(function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-mobile-lang') === current);
      });
    };
    paintMobileLang();
    if (window.ngoI18n && typeof window.ngoI18n.onChange === 'function') {
      window.ngoI18n.onChange(paintMobileLang);
    }
    mobileNav.addEventListener('click', function (e) {
      var langBtn = e.target.closest && e.target.closest('[data-mobile-lang]');
      if (langBtn && window.ngoI18n) {
        e.stopPropagation();
        window.ngoI18n.set(langBtn.getAttribute('data-mobile-lang'));
        return;
      }
      var searchBtn = e.target.closest && e.target.closest('[data-mobile-search]');
      if (searchBtn) {
        e.stopPropagation();
        toggleMobileNav(false);
        var trigger = document.getElementById('searchToggle');
        if (trigger) setTimeout(function () { trigger.click(); }, 80);
        return;
      }
      var a11yBtn2 = e.target.closest && e.target.closest('[data-mobile-a11y]');
      if (a11yBtn2) {
        e.stopPropagation();
        toggleMobileNav(false);
        var trigger2 = document.querySelector('.vis-btn');
        if (trigger2) setTimeout(function () { trigger2.click(); }, 80);
        return;
      }
    });

    // a11y wiring: button announces collapsed/expanded; mobileNav is a
    // dialog so AT users get the standard "menu opened" cue.
    hamburgerBtn.setAttribute('aria-controls', 'mobileNav');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-haspopup', 'dialog');
    mobileNav.setAttribute('role', 'dialog');
    mobileNav.setAttribute('aria-modal', 'true');
    mobileNav.setAttribute('aria-label', 'Asosiy menyu');
    // Initial state — display:none alone hides from AT today, but
    // aria-hidden="true" makes intent explicit and survives any future
    // CSS override that switches to visibility/opacity instead.
    mobileNav.setAttribute('aria-hidden', 'true');

    var toggleMobileNav = function (open) {
      var isOpen = typeof open === 'boolean' ? open : !mobileNav.classList.contains('is-open');
      mobileNav.classList.toggle('is-open', isOpen);
      hamburgerBtn.classList.toggle('is-open', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileNav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      // body-only overflow:hidden left iOS Safari scrollable behind
      // the open mobile nav. .is-modal-open on <html> covers both
      // elements via the foundation CSS rule (iter 687).
      document.documentElement.classList.toggle('is-modal-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen) {
        var firstLink = mobileNav.querySelector('a');
        if (firstLink) firstLink.focus();
      } else {
        // Return focus to the trigger when closing so keyboard users
        // don't get stranded at the body's tabindex root.
        try { hamburgerBtn.focus(); } catch (e) {}
      }
    };

    hamburgerBtn.addEventListener('click', function () { toggleMobileNav(); });

    mobileNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { toggleMobileNav(false); }
    });

    // Focus trap: when nav is open, Tab/Shift+Tab cycle within it.
    mobileNav.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !mobileNav.classList.contains('is-open')) return;
      var focusables = Array.prototype.slice.call(
        mobileNav.querySelectorAll('a[href],button:not([disabled])')
      ).filter(function (el) { return el.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    document.addEventListener('keydown', function (e) {
      // Guard against stealing focus when the user presses Escape with
      // the nav already closed — toggleMobileNav(false) unconditionally
      // calls hamburgerBtn.focus() in its else branch, which would yank
      // focus away from whatever element the user was on.
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        toggleMobileNav(false);
      }
    });
  }

  // Cinematic header: become solid after scrolling past hero
  var siteHeader = document.querySelector(".site-header");
  if (siteHeader && document.body.classList.contains("home-page")) {
    var onHeaderScroll = function () {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 80);
    };
    window.addEventListener("scroll", onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  // Phosphor icons are decorative font glyphs — without aria-hidden,
  // some screen readers announce them as "graphic" or read the empty
  // <i> tag, cluttering surrounding link/button labels. Mirrors the
  // sweep in pacta-foundation.js (admin/cabinet) for public pages.
  document.querySelectorAll('i[class*="ph-"]').forEach(function (icon) {
    if (!icon.hasAttribute('aria-hidden')) icon.setAttribute('aria-hidden', 'true');
  });

})();
