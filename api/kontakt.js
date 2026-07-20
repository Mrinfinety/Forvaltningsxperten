// Kontaktmottak for forvaltningsxperten.no
// Tar imot kontaktskjemaet (POST, JSON) og sender henvendelsen som e-post
// via Resend til forvaltningsxperten@gmail.com. Ingen tredjeparts-branding,
// kun eier mottar. Krever miljøvariabelen RESEND_API_KEY i Vercel.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Bruk POST." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const navn = (body.navn || "").toString().trim();
  const epost = (body.email || "").toString().trim();
  const telefon = (body.telefon || "").toString().trim();
  const melding = (body.melding || "").toString().trim();
  const honey = (body._honey || "").toString().trim();

  // Honningfelle: fylt ut = robot. Later som alt gikk bra, men sender ingenting.
  if (honey) return res.status(200).json({ ok: true });

  if (!navn || !epost || !melding) {
    return res.status(400).json({ error: "Fyll ut navn, e-post og melding." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost)) {
    return res.status(400).json({ error: "Ugyldig e-postadresse." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Serveren er ikke ferdig konfigurert." });
  }

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#222;line-height:1.6">' +
    '<h2 style="margin:0 0 14px">Ny henvendelse fra forvaltningsxperten.no</h2>' +
    '<p style="margin:0 0 6px"><strong>Navn:</strong> ' + esc(navn) + "</p>" +
    '<p style="margin:0 0 6px"><strong>E-post:</strong> ' + esc(epost) + "</p>" +
    '<p style="margin:0 0 6px"><strong>Telefon:</strong> ' +
    (telefon ? esc(telefon) : "(ikke oppgitt)") + "</p>" +
    '<p style="margin:14px 0 6px"><strong>Melding:</strong></p>' +
    '<p style="margin:0;white-space:pre-wrap">' + esc(melding) + "</p>" +
    "</div>";

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Forvaltningsxperten <onboarding@resend.dev>",
        to: ["forvaltningsxperten@gmail.com"],
        reply_to: epost,
        subject: "Ny henvendelse fra forvaltningsxperten.no",
        html: html
      })
    });

    if (!r.ok) {
      const detalj = await r.text();
      console.error("Resend-feil:", r.status, detalj);
      return res.status(502).json({ error: "Kunne ikke sende meldingen akkurat nå." });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Uventet feil i /api/kontakt:", e);
    return res.status(500).json({ error: "Uventet feil." });
  }
}
