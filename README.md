# Forvaltningsxperten – forvaltningsexperten.no

> **Merk navnet:** Logoen staver navnet «Forvaltningsxperten» (uten «e» før X),
> og det er den skrivemåten som brukes på hele nettsiden. Domenet
> forvaltningsexperten.no har derimot «e». Sjekk at dette stemmer med
> foretaksregistreringen før publisering.

Statisk nettside (ren HTML/CSS – ingen byggverktøy, ingen eksterne avhengigheter).
Kan publiseres direkte på et vanlig webhotell, Netlify, Vercel, Cloudflare Pages
e.l. ved å laste opp innholdet i denne mappen.

## Struktur

```
index.html        Forside
tjenester.html    Tjenester (eiendomsforvaltning + regnskap)
om-oss.html       Om oss
kontakt.html      Kontakt med skjema
css/style.css     Felles stilark
js/site.js        Skjemahåndtering (brukes kun på kontaktsiden)
```

## Må fylles inn før publisering

Alle plassholdere er markert som `[SETT INN: ...]` (søk etter `SETT INN` i filene):

| Hva | Hvor |
|---|---|
| E-postadresse | Bunntekst på alle sider + kontakt.html |
| Telefonnummer | Bunntekst på alle sider + kontakt.html |
| Organisasjonsnummer | Bunntekst på alle sider |
| Skjema-endepunkt | kontakt.html (se under) |

## Koble opp kontaktskjemaet

Skjemaet i `kontakt.html` er ikke koblet til noe mottak ennå. Så lenge det er
frakoblet, stopper `js/site.js` innsending og viser en forklarende melding.

Slik kobler du det opp (eksempel med Formspree, fungerer også med tilsvarende
tjenester eller eget backend-endepunkt):

1. Opprett et skjema hos f.eks. [Formspree](https://formspree.io) og kopier URL-en
   (ser ut som `https://formspree.io/f/abcdwxyz`).
2. I `kontakt.html`: lim inn URL-en i både `action=""` og `data-endpoint=""`
   på `<form>`-elementet.
3. Fjern gjerne plassholder-avsnittet `#skjema-melding` når mottaket er testet.

## Bevisste valg

- **Minimalt, i logoens toner:** mørk brun (#443831), krem og varm grå på varm
  off-white – hentet fra logoen. Én smal tekstkolonne, hårfine skillelinjer,
  ingen dekor. Systemfont – ingen eksterne fontkall.
- **Logoen** er gjenskapt som inline SVG i toppen av hver side (og som favicon),
  så den skalerer skarpt uten bildefiler. Har dere logoen som fil (SVG/PNG),
  kan `<svg class="logo-mark">…</svg>` byttes ut med en `<img>`.
- **Ingen JavaScript** utenom skjemavakten på kontaktsiden. Menyen bryter
  naturlig om på mobil, uten hamburgerknapp.
- **Ingen oppdiktet innhold:** ingen kundeuttalelser, tall, ansatte, adresse
  eller historikk. «Om oss» sier ærlig at selskapet er nyetablert.
