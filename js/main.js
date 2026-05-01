(function () {
  /* ── Load Phosphor Icons 2.1 (SRI-pinned) ─────────────────── */
  var _ph = document.createElement('script');
  _ph.src = 'https://unpkg.com/@phosphor-icons/web@2.1.1/src/index.js';
  _ph.integrity = 'sha384-cPFV+/abYd3INVFHPmSKpBmcnH+Q+bTZW7dv/EiuShUNPkHyFmRF8PsL7Ibfvunk';
  _ph.crossOrigin = 'anonymous';
  document.head.appendChild(_ph);

  var i18nKey = "ngo_lang_v1";
  var i18nDict = {
    uz: {
      nav: {
        "about.html": "Biz haqimizda",
        "news.html": "Yangiliklar",
        "events.html": "Tadbirlar",
        "contact.html": "Xizmatlar",
        "awards.html": "Hamkorlar"
      },
      contactBtn: "A'zo bo'lish",
      a11y: "Ko'z ojizlar uchun",
      ctaBtn: "Bog'lanish",
      footerQuick: "Tezkor havolalar",
      footerContact: "Bog'lanish",
      footerServices: "Xizmatlar",
      footerSocial: "Ijtimoiy tarmoqlar"
    },
    ru: {
      nav: {
        "about.html": "О нас",
        "news.html": "Новости",
        "events.html": "Мероприятия",
        "contact.html": "Услуги",
        "awards.html": "Партнеры"
      },
      contactBtn: "Членство",
      a11y: "Для слабовидящих",
      ctaBtn: "Связаться",
      footerQuick: "Быстрые ссылки",
      footerContact: "Контакты",
      footerServices: "Услуги",
      footerSocial: "Соцсети"
    },
    en: {
      nav: {
        "about.html": "About Us",
        "news.html": "News",
        "events.html": "Events",
        "contact.html": "Services",
        "awards.html": "Partners"
      },
      contactBtn: "Membership",
      a11y: "Accessibility",
      ctaBtn: "Contact",
      footerQuick: "Quick links",
      footerContact: "Contact",
      footerServices: "Services",
      footerSocial: "Social media"
    }
  };

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


  var applyLang = function (langCode) {
    var lang = i18nDict[langCode] ? langCode : "uz";
    var t = i18nDict[lang];
    document.documentElement.lang = lang;

    var menuLinks = document.querySelectorAll(".menu a[data-page]");
    menuLinks.forEach(function (a) {
      var key = a.getAttribute("data-page");
      if (t.nav[key]) a.textContent = t.nav[key];
    });

    var contactBtn = document.querySelector(".contact-btn");
    if (contactBtn) contactBtn.textContent = t.contactBtn;

    var a11yBtn = document.querySelector(".vis-btn");
    if (a11yBtn) a11yBtn.setAttribute("aria-label", t.a11y);

    var ctaBtn = document.querySelector(".dark-cta .btn");
    if (ctaBtn) ctaBtn.textContent = t.ctaBtn;

    var footerTitles = document.querySelectorAll(".footer-top h4");
    if (footerTitles[0]) footerTitles[0].textContent = t.footerQuick;
    if (footerTitles[1]) footerTitles[1].textContent = t.footerContact;
    if (footerTitles[2]) footerTitles[2].textContent = t.footerSocial;
    if (footerTitles[3]) footerTitles[3].textContent = t.footerServices;

    var langLinks = document.querySelectorAll(".topbar-lang[data-lang]");
    var _langShort = { uz: "O\u02BBzbekcha", ru: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439", en: "English" };
    langLinks.forEach(function (a) {
      var code = a.getAttribute("data-lang");
      a.classList.toggle("active-lang", code === lang);
    });
    var labelEl = document.getElementById("topbarLangLabel");
    if (labelEl) labelEl.textContent = _langShort[lang] || lang.toUpperCase();

    try { localStorage.setItem(i18nKey, lang); } catch (e) {}
    return lang;
  };

  var initialLang = "uz";
  var pathLower = (location.pathname || "").toLowerCase();
  if (pathLower.indexOf("/ru/") !== -1) initialLang = "ru";
  if (pathLower.indexOf("/en/") !== -1) initialLang = "en";
  try {
    var savedLang = localStorage.getItem(i18nKey);
    if (savedLang && pathLower.indexOf("/ru/") === -1 && pathLower.indexOf("/en/") === -1) initialLang = savedLang;
  } catch (e) {}
  applyLang(initialLang);

  var languageLinks = Array.prototype.slice.call(document.querySelectorAll(".topbar-lang"));
  languageLinks.forEach(function (a, idx) {
    var code = idx === 0 ? "uz" : idx === 1 ? "ru" : "en";
    a.setAttribute("data-lang", code);
  });
  languageLinks = document.querySelectorAll(".topbar-lang[data-lang]");
  // CF Pages serves clean URLs (no .html). The .html stubs in /uz/,
  // /ru/, /en/ are also accessible without the suffix, so build the
  // switcher href the same way: /<code>/<slug>.
  var currentSlug = (location.pathname.split("/").pop() || "index").toLowerCase();
  if (currentSlug.endsWith(".html")) currentSlug = currentSlug.slice(0, -5);
  if (!currentSlug) currentSlug = "index";
  languageLinks.forEach(function (a) {
    var code = a.getAttribute("data-lang");
    a.setAttribute("href", "/" + code + "/" + currentSlug);
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

  applyLang(initialLang);

  // CF Pages serves clean URLs (iter 67); normalize back to .html form
  // so the parentMap entries below still match.
  var path = (location.pathname.split("/").pop() || "index").toLowerCase();
  if (!path.endsWith(".html")) path += ".html";
  var parentMap = {
    "who-we-are.html": "about.html",
    "mission.html": "about.html",
    "board-of-experts.html": "about.html",
    "leadership.html": "about.html",
    "our-team.html": "about.html",
    "nnt-school.html": "about.html",
    "online-library.html": "about.html",
    "multimedia-room.html": "about.html",
    "official-docs.html": "contact.html",
    "reporting-forms.html": "contact.html",
    "faq.html": "contact.html",
    "membership-guide.html": "contact.html",
    "service-request.html": "contact.html",
    "service-request-status.html": "contact.html",
    "report-status.html": "contact.html",
    "publications.html": "news.html",
    "publication-detail.html": "news.html",
    "news-detail.html": "news.html",
    "videos.html": "events.html",
    "video-detail.html": "events.html",
    "event-detail.html": "events.html",
    "membership-status.html": "membership.html",
    "membership-certificate.html": "membership.html",
    "research-areas.html": "contact.html",
    "search-results.html": "news.html",
    "projects.html": "contact.html"
  };
  var activePath = parentMap[path] || path;
  var links = document.querySelectorAll(".menu a[data-page]");
  links.forEach(function (a) {
    if (a.getAttribute("data-page") === activePath) {
      a.classList.add("active");
    }
  });

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
    faqItems.forEach(function (item) {
      item.classList.add("is-collapsed");
      var toggle = item.querySelector(".faq-toggle");
      if (toggle) {
        toggle.addEventListener("click", function () {
          item.classList.toggle("is-collapsed");
        });
      }
    });
  }
  if (faqSearch && faqItems.length) {
    faqSearch.addEventListener("input", function () {
      var query = faqSearch.value.toLowerCase().trim();
      faqItems.forEach(function (item) {
        var text = item.textContent.toLowerCase();
        item.style.display = !query || text.indexOf(query) !== -1 ? "" : "none";
      });
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
          resultsNode.innerHTML = heading + results.map(function (item) {
            // siteIndex urls were authored with .html (legacy); strip
            // the suffix so clicks hit the canonical clean URL directly
            // instead of taking a 308 round-trip.
            var href = String(item.url).replace(/\.html$/, "");
            return "<a class=\"search-item\" href=\"" + href + "\"><h3>" + item.title + "</h3><p>" + item.summary + "</p></a>";
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
      if (val) location.href = 'search-results?q=' + encodeURIComponent(val);
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
    panel.setAttribute("aria-label", "Ko'rish imkoniyati");
    panel.innerHTML =
      "<h4>Ko'rish rejimi</h4>" +
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
      if (!panel.contains(e.target) && e.target !== a11yBtn) {
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
    // Mirror desktop nav (kept as the single source of truth).
    mobileNav.innerHTML =
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

    // a11y wiring: button announces collapsed/expanded; mobileNav is a
    // dialog so AT users get the standard "menu opened" cue.
    hamburgerBtn.setAttribute('aria-controls', 'mobileNav');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('role', 'dialog');
    mobileNav.setAttribute('aria-modal', 'true');
    mobileNav.setAttribute('aria-label', 'Asosiy menyu');

    var toggleMobileNav = function (open) {
      var isOpen = typeof open === 'boolean' ? open : !mobileNav.classList.contains('is-open');
      mobileNav.classList.toggle('is-open', isOpen);
      hamburgerBtn.classList.toggle('is-open', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
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
      if (e.key === 'Escape') toggleMobileNav(false);
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

  var homeVideoFrame = document.getElementById("home-video-frame");
  if (homeVideoFrame) {
    var videoTitle = document.getElementById("home-video-title");
    var videoDesc = document.getElementById("home-video-desc");
    var videoMeta = document.getElementById("home-video-meta");
    var videoItems = Array.prototype.slice.call(document.querySelectorAll(".video-hub-item"));

    var setVideo = function (btn) {
      if (!btn) return;
      var embed = btn.getAttribute("data-embed");
      if (embed) {
        var withAutoplay = embed.indexOf("autoplay=1") === -1
          ? embed + (embed.indexOf("?") === -1 ? "?autoplay=1" : "&autoplay=1")
          : embed;
        homeVideoFrame.src = withAutoplay;
      }
      if (videoTitle) videoTitle.textContent = btn.getAttribute("data-title") || "";
      if (videoDesc) videoDesc.textContent = btn.getAttribute("data-desc") || "";
      if (videoMeta) videoMeta.textContent = btn.getAttribute("data-meta") || "";
      videoItems.forEach(function (x) { x.classList.toggle("is-active", x === btn); });
    };

    videoItems.forEach(function (btn) {
      btn.addEventListener("click", function () { setVideo(btn); });
    });
  }

})();
