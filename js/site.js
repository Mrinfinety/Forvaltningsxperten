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
        visStatus(false, "Beklager, noe gikk galt. Send oss gjerne en e-post direkte til forvaltningsxperten@gmail.com.");
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = opprinnelig;
      });
  });
})();
