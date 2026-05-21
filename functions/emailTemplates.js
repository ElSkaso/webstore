/**
 * Rene Puskas Jewelry — Transactional E-Mail Templates (CommonJS for Cloud Functions)
 */

const stageTitles = [
  "Verfügbarkeitsbestätigung",
  "Einkaufsbestätigung (Bali)",
  "Erhalt des Silbers & Produktionsstart",
  "Versandbestätigung"
];

const stageIntros = [
  `Vielen Dank für Dein Vertrauen in ehrliche Handwerkskunst. Wir haben Deine Pre-Order für das Beaded Bracelet erfolgreich gesichert. Die Materialanforderungen sind zusammengestellt und der Sourcing-Auftrag für die Rohmaterialien nach Bali ist initiiert.`,
  `Ein wichtiger Meilenstein ist erreicht: Unsere Partner in Bali haben die ethically-sourced 925 Sterling Silber Perlen und die vulkanischen Gesteine für Deine Bestellung ausgewählt und erworben. Die Komponenten machen sich nun auf den Weg in unser deutsches Atelier.`,
  `Die edlen Mineralkomponenten und handgebürsteten Silberperlen sind unversehrt im Atelier eingetroffen. Dein Armband wird nun in präziser Handarbeit auf den hochfesten 1.0mm Edelstahl-Kern aufgezogen und mit unserer doppelten Sicherungskette vollendet.`,
  `Nach strengster Qualitätskontrolle (Gewichtsprüfung und Magnet-Zugkraftmessung) ist Dein Beaded Bracelet fertiggestellt und in unserer obsidian-schwarzen Leinen-Verpackung sicher verstaut. Das Paket wurde soeben an DHL Express übergeben.`
];

/**
 * Generates the complete high-fidelity HSL dark HTML template for customer notification.
 */
const getEmailTemplateHtml = (order, stage, introText, trackingNumber = "") => {
  const metalName = order.configuration.metal;
  const stonesName = order.configuration.stones;
  const lengthVal = order.configuration.length;
  const totalPrice = order.configuration.totalPrice;
  const trackingLink = `https://www.dhl.com/de-de/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rene Puskas Jewelry Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d0f; font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e4e9; -webkit-font-smoothing: antialiased;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0c0d0f; min-height: 100%; padding: 40px 10px;">
    <tr>
      <td align="center" valign="top">
        <!-- Main Card Container -->
        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 580px; background-color: #15171c; border: 1px solid #242730; border-radius: 4px; overflow: hidden; border-spacing: 0;">
          <!-- Top Accenting Gold Line -->
          <tr>
            <td style="height: 3px; background-color: #d4af37;"></td>
          </tr>
          
          <!-- Editorial Typography Header -->
          <tr>
            <td align="center" style="padding: 45px 30px 20px 30px;">
              <div style="font-family: 'Cinzel', 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: normal; letter-spacing: 0.15em; color: #ffffff; text-transform: uppercase;">
                R E N E &nbsp; P U S K A S
              </div>
              <div style="font-family: -apple-system, system-ui, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 0.25em; color: #9196a6; text-transform: uppercase; margin-top: 8px;">
                HONEST RAW CRAFT
              </div>
            </td>
          </tr>

          <!-- Dynamic Timeline Stepper (4 Stages) -->
          <tr>
            <td align="center" style="padding: 10px 20px 25px 20px;">
              <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 440px;">
                <tr>
                  <!-- Stage 1 -->
                  <td align="center" style="width: 25%;">
                    <div style="width: 32px; height: 32px; line-height: 32px; border-radius: 50%; background-color: ${stage >= 1 ? '#d4af37' : '#242730'}; color: ${stage >= 1 ? '#0c0d0f' : '#9196a6'}; font-weight: bold; font-size: 13px; text-align: center; display: inline-block;">1</div>
                    <div style="font-size: 10px; margin-top: 8px; color: ${stage === 1 ? '#d4af37' : '#9196a6'}; font-weight: ${stage === 1 ? 'bold' : 'normal'};">Bestellt</div>
                  </td>
                  <!-- Connector 1 -->
                  <td valign="middle" style="width: 12.5%;">
                    <div style="height: 1px; background-color: ${stage >= 2 ? '#d4af37' : '#242730'}; margin-bottom: 22px;"></div>
                  </td>
                  <!-- Stage 2 -->
                  <td align="center" style="width: 25%;">
                    <div style="width: 32px; height: 32px; line-height: 32px; border-radius: 50%; background-color: ${stage >= 2 ? '#d4af37' : '#242730'}; color: ${stage >= 2 ? '#0c0d0f' : '#9196a6'}; font-weight: bold; font-size: 13px; text-align: center; display: inline-block;">2</div>
                    <div style="font-size: 10px; margin-top: 8px; color: ${stage === 2 ? '#d4af37' : '#9196a6'}; font-weight: ${stage === 2 ? 'bold' : 'normal'};">Sourcing</div>
                  </td>
                  <!-- Connector 2 -->
                  <td valign="middle" style="width: 12.5%;">
                    <div style="height: 1px; background-color: ${stage >= 3 ? '#d4af37' : '#242730'}; margin-bottom: 22px;"></div>
                  </td>
                  <!-- Stage 3 -->
                  <td align="center" style="width: 25%;">
                    <div style="width: 32px; height: 32px; line-height: 32px; border-radius: 50%; background-color: ${stage >= 3 ? '#d4af37' : '#242730'}; color: ${stage >= 3 ? '#0c0d0f' : '#9196a6'}; font-weight: bold; font-size: 13px; text-align: center; display: inline-block;">3</div>
                    <div style="font-size: 10px; margin-top: 8px; color: ${stage === 3 ? '#d4af37' : '#9196a6'}; font-weight: ${stage === 3 ? 'bold' : 'normal'};">Produktion</div>
                  </td>
                  <!-- Connector 3 -->
                  <td valign="middle" style="width: 12.5%;">
                    <div style="height: 1px; background-color: ${stage >= 4 ? '#d4af37' : '#242730'}; margin-bottom: 22px;"></div>
                  </td>
                  <!-- Stage 4 -->
                  <td align="center" style="width: 25%;">
                    <div style="width: 32px; height: 32px; line-height: 32px; border-radius: 50%; background-color: ${stage >= 4 ? '#d4af37' : '#242730'}; color: ${stage >= 4 ? '#0c0d0f' : '#9196a6'}; font-weight: bold; font-size: 13px; text-align: center; display: inline-block;">4</div>
                    <div style="font-size: 10px; margin-top: 8px; color: ${stage === 4 ? '#d4af37' : '#9196a6'}; font-weight: ${stage === 4 ? 'bold' : 'normal'};">Versand</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Editorial Horizontal Line -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #242730;"></div>
            </td>
          </tr>

          <!-- Personal Greeting & Sourcing Narrative -->
          <tr>
            <td style="padding: 30px 40px 10px 40px;">
              <p style="font-size: 16px; font-weight: bold; color: #ffffff; margin-top: 0;">
                Hallo ${order.customerName || "Kunde"},
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #9196a6; margin-bottom: 25px;">
                ${introText}
              </p>
            </td>
          </tr>

          <!-- Order Summary Card -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0c0d0f; border: 1px solid #242730; border-radius: 2px; padding: 20px;">
                <tr>
                  <td colspan="2" style="font-size: 11px; font-weight: bold; letter-spacing: 0.1em; color: #ffffff; text-transform: uppercase; padding-bottom: 12px; border-bottom: 1px solid #242730;">
                    Konfiguration & Details
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #9196a6; padding: 12px 0 6px 0;">Modell:</td>
                  <td align="right" style="font-size: 12px; font-weight: bold; color: #ffffff; padding: 12px 0 6px 0;">The Beaded Bracelet (Series 1)</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #9196a6; padding: 6px 0;">Edelmetall:</td>
                  <td align="right" style="font-size: 12px; font-weight: bold; color: #ffffff; padding: 6px 0;">${metalName}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #9196a6; padding: 6px 0;">Mineralkristalle:</td>
                  <td align="right" style="font-size: 12px; font-weight: bold; color: #ffffff; padding: 6px 0;">${stonesName}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #9196a6; padding: 6px 0; border-bottom: 1px solid #242730;">Umfang:</td>
                  <td align="right" style="font-size: 12px; font-weight: bold; color: #ffffff; padding: 6px 0; border-bottom: 1px solid #242730;">${lengthVal} cm</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; font-weight: bold; color: #ffffff; padding-top: 12px;">Pre-Order Betrag:</td>
                  <td align="right" style="font-size: 13px; font-weight: bold; color: #d4af37; padding-top: 12px;">EUR ${totalPrice},00</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Courier Call to Action (Only for Stage 4: Shipped) -->
          ${stage === 4 && trackingNumber ? `
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: rgba(212, 175, 55, 0.05); border: 1px dashed #d4af37; border-radius: 2px; padding: 20px; text-align: center;">
                <tr>
                  <td align="center">
                    <div style="font-size: 11px; font-weight: bold; letter-spacing: 0.1em; color: #d4af37; text-transform: uppercase; margin-bottom: 8px;">
                      Versandinformation
                    </div>
                    <div style="font-size: 14px; color: #ffffff; margin-bottom: 15px;">
                      DHL Express &mdash; Sendungsnummer: <code style="background-color: #242730; padding: 2px 6px; border-radius: 2px; font-family: monospace;">${trackingNumber}</code>
                    </div>
                    <a href="${trackingLink}" target="_blank" style="display: inline-block; background-color: #d4af37; color: #0c0d0f; font-size: 12px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; padding: 10px 20px; border-radius: 2px;">
                      Lieferung verfolgen
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Footer/Brand Philosophy -->
          <tr>
            <td align="center" style="background-color: #0c0d0f; padding: 40px 30px; border-top: 1px solid #242730;">
              <div style="font-size: 12px; color: #ffffff; margin-bottom: 6px; font-family: 'Cinzel', serif;">
                R E N E &nbsp; P U S K A S
              </div>
              <div style="font-size: 11px; color: #9196a6; max-width: 360px; line-height: 1.5; margin-bottom: 20px;">
                Wir glauben an die Ehrlichkeit von echtem Gewicht und roher Handwerkskunst. Keine Synthetik, kein künstlicher Schein.
              </div>
              <div style="font-size: 10px; color: #5a5f6e;">
                &copy; 2026 Rene Puskas. Alle Rechte vorbehalten.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = {
  stageTitles,
  stageIntros,
  getEmailTemplateHtml
};
