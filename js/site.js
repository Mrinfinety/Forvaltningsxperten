/* Forvaltningsxperten – felles skript */
(function () {
  "use strict";

  /* Seksjonene glir rolig inn når de kommer til syne. Seksjoner som
     allerede er i synsfeltet vises umiddelbart; observeren håndterer
     resten. */
  var vis = function (el) { el.classList.add("vist"); };
  var under = [];
  document.querySelectorAll("main section").forEach(function (s) {
    if (s.getBoundingClientRect().top < window.innerHeight) {
      vis(s);
    } else {
      under.push(s);
    }
  });
  if ("IntersectionObserver" in window && under.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          vis(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    under.forEach(function (s) { io.observe(s); });
  } else {
    under.forEach(vis);
  }

  /* Kontaktskjema: sender via FormSubmit (AJAX) og viser kvittering
     uten å laste siden på nytt. Finnes bare på kontaktsiden. */
  var form = document.getElementById("kontaktskjema");
  if (!form) return;
  var status = document.getElementById("skjema-status");
  var btn = form.querySelector("button[type='submit']");

  function visStatus(ok, tekst) {
    status.textContent = tekst;
    status.classList.toggle("form-alert--ok", ok);
    status.hidden = false;
    status.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    var opprinnelig = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Sender …";

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });

    fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (r) {
        if (r.ok) {
          visStatus(true, "Takk! Meldingen er sendt – vi svarer så snart vi kan.");
          form.reset();
        } else {
          throw new Error("ikke ok");
        }
      })
      .catch(function () {
        visStatus(false, "Beklager, noe gikk galt. Send oss gjerne en e-post direkte til rolf.leo@forvaltningsxperten.no.");
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = opprinnelig;
      });
  });
})();
/* Gjennomgangen av bygget. Bildene loser seg opp i hverandre etter hvor langt
   du har scrollet, ikke i trinn - det skal kjennes som en film du ruller
   gjennom, ikke som et lysbildeskift.

   Naavaerende stopp er det siste som har passert midten av skjermen. Hvor
   langt vi er kommet videre fra det, styrer oppløsningen til neste. Kurven
   har platå i begge ender: bildet staar rent mesteparten av tiden og loser
   seg opp bare i midtpartiet. Uten platået ligger to bilder oppaa hverandre
   hele veien, og ingen av dem blir sett.

   Samme tall driver fremdriftsstreken oeverst.

   Egen IIFE fordi skriptet over avslutter tidlig paa sider uten
   kontaktskjema. */
(function () {
  "use strict";

  var stopp = Array.prototype.slice.call(document.querySelectorAll(".gj-stopp"));
  var bilder = Array.prototype.slice.call(document.querySelectorAll(".gj-bilde"));
  if (!stopp.length || stopp.length !== bilder.length) { return; }

  var tekst = document.querySelector(".gj-tekst");
  var strek = document.querySelector(".gj-fremdrift");
  var fyll = strek ? strek.querySelector("span") : null;
  var roligere = window.matchMedia("(prefers-reduced-motion: reduce)");
  var planlagt = false;

  function tegn() {
    planlagt = false;
    var h = window.innerHeight;
    var avstand = [];
    var i;

    for (i = 0; i < stopp.length; i++) {
      var r = stopp[i].getBoundingClientRect();
      /* avstand fra stoppets midte til skjermens midte, malt i skjermhoyder */
      var d = (r.top + r.height / 2 - h / 2) / h;
      if (d > 1.5) { d = 1.5; }
      if (d < -1.5) { d = -1.5; }
      avstand.push(d);
    }

    var n = 0;
    for (i = 0; i < avstand.length; i++) {
      if (avstand[i] <= 0) { n = i; }
    }

    var t = -avstand[n];
    if (t < 0) { t = 0; }
    if (t > 1) { t = 1; }

    var b = (t - 0.32) / 0.36;
    if (b < 0) { b = 0; }
    if (b > 1) { b = 1; }
    b = b * b * (3 - 2 * b);

    for (i = 0; i < bilder.length; i++) {
      var o = 0;
      if (i === n) { o = 1 - b; }
      else if (i === n + 1) { o = b; }
      bilder[i].style.opacity = o.toFixed(3);
      if (!roligere.matches) {
        /* sakte drift saa bildet aldri staar helt stille */
        bilder[i].style.transform = "scale(" + (1.06 - avstand[i] * 0.05).toFixed(4) + ")";
      }
    }

    if (fyll) {
      var del = stopp.length > 1 ? (n + t) / (stopp.length - 1) : 1;
      if (del < 0) { del = 0; }
      if (del > 1) { del = 1; }
      fyll.style.transform = "scaleX(" + del.toFixed(4) + ")";

      /* Streken vises forst naar gjennomgangen har tatt over skjermen. Med
         0.5 slo den inn allerede paa toppen, fordi gjennomgangen begynner
         omtrent midt i forste skjermbilde paa mobil. */
      var tr = tekst.getBoundingClientRect();
      var inne = tr.top < h * 0.15 && tr.bottom > h * 0.5;
      strek.classList.toggle("er-inne", inne);
    }
  }

  function planlegg() {
    if (planlagt) { return; }
    planlagt = true;
    window.requestAnimationFrame(tegn);
  }

  window.addEventListener("scroll", planlegg, { passive: true });
  window.addEventListener("resize", planlegg);
  tegn();
})();
