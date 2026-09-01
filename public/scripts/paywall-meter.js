// paywall-meter.js — Flexible Sampling (Google recommended: 10 free articles/month)
// Behaviour: Googlebot sees full HTML + isAccessibleForFree schema. Humans see metering.
// Lead-in: first ~40% of article is always visible (CSS). After 10 views/month, .paywall blurs and CTA shows.
(function(){
  try {
    var KEY = "swal_paywall_v1";
    var LIMIT = 10;
    var now = new Date();
    var monthKey = now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0");
    var raw = localStorage.getItem(KEY);
    var data = raw ? JSON.parse(raw) : { month: monthKey, views: 0, history: [] };
    if (data.month !== monthKey) data = { month: monthKey, views: 0, history: [] };

    var isPaywalled = document.querySelector("[data-paywall-content]");
    if (!isPaywalled) return; // not a paywalled article

    var path = location.pathname;
    // don't double count same article in same session (history dedupe per day)
    var today = now.toISOString().slice(0,10);
    var already = (data.history||[]).some(function(h){ return h.path===path && h.day===today; });
    if (!already) {
      data.views = (data.views||0)+1;
      data.history = (data.history||[]).concat([{ path: path, day: today, ts: now.toISOString() }]);
      // keep last 50
      if (data.history.length>50) data.history = data.history.slice(-50);
      localStorage.setItem(KEY, JSON.stringify(data));
    }

    var over = data.views > LIMIT;
    var remaining = Math.max(0, LIMIT - data.views);

    // inject counter badge
    var badge = document.createElement("div");
    badge.className = "paywall-badge";
    badge.setAttribute("role","status");
    badge.setAttribute("aria-live","polite");
    badge.innerHTML = over
      ? '<span class="paywall-badge-dot paywall-badge-dot--over"></span> Has usado '+ data.views +' / '+ LIMIT +' lecturas este mes — <a href="/portfolio-iberi22/agenda/">suscríbete</a> para ilimitado'
      : '<span class="paywall-badge-dot"></span> '+ remaining +' lecturas gratis restantes este mes ('+ data.views +' / '+ LIMIT +') — <a href="/portfolio-iberi22/blog/">ver blog</a>';
    var article = isPaywalled.closest(".paywall-root") || isPaywalled.parentElement;
    if (article) article.insertBefore(badge, article.firstChild);

    if (over) {
      document.documentElement.classList.add("paywall-active");
      var cta = document.getElementById("paywall-cta");
      if (cta) cta.classList.remove("hidden");
      // allow "continue with lead-in" — scroll to top of paywall and blur
      var cont = document.getElementById("paywall-continue");
      if (cont) cont.addEventListener("click", function(){
        isPaywalled.classList.add("paywall--leadonly");
        cta.classList.add("hidden");
        window.scrollTo({ top: isPaywalled.offsetTop - 80, behavior: "smooth" });
      });
      var unlock = document.getElementById("paywall-unlock");
      if (unlock) unlock.addEventListener("click", function(){
        var code = prompt("Código de suscriptor (demo: SWAL2026):");
        if (code && code.trim().toUpperCase()==="SWAL2026") {
          localStorage.setItem(KEY, JSON.stringify({ month: monthKey, views: 0, history: [] }));
          location.reload();
        } else if (code) alert("Código no válido. Demo: SWAL2026 desbloquea el mes.");
      });
    }
    // expose for debugging
    window.__paywall = { views: data.views, limit: LIMIT, month: monthKey, over: over, remaining: remaining };
  } catch(e){ console.warn("paywall-meter error", e); }
})();
