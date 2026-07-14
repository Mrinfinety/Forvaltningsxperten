/* Forvaltningsxperten – felles skript: rolige innlastingseffekter
   på alle sider, og skjemavakt på kontaktsiden. */
(function () {
  "use strict";

  /* Seksjonene glir rolig inn når de kommer til syne. CSS-en gjemmer
     dem bare når <html> har klassen "js" (settes i <head>), så
     innholdet aldri er skjult om JavaScript ikke kjører. Seksjoner
     som allerede er i synsfeltet vises umiddelbart – observeren
     håndterer bare det som ligger lenger ned. */
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

  /* Kontaktskjema: stopper innsending til et mottak (endepunkt) er
     satt i data-endpoint / action i kontakt.html. Se kommentar der. */
  var form = document.querySelector("form[data-endpoint]");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    if (!form.getAttribute("data-endpoint")) {
      e.preventDefault();
      var msg = document.getElementById("skjema-melding");
      if (msg) {
        msg.hidden = false;
        msg.focus();
      }
      return;
    }

    /* Nettleserens validering når skjemaet er koblet opp
       (novalidate er satt i HTML-en). */
    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
    }
  });
})();
