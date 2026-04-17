import { useMemo, useState } from "react";

const DESTINATION_PRESETS = {
  pakistan: {
    label: "Pakistan",
    shipping: 1200,
    duty: 60,
    port: "Karachi",
    note: "Strong fit for compact hatchbacks and family sedans.",
  },
  ghana: {
    label: "Ghana",
    shipping: 1850,
    duty: 32,
    port: "Tema",
    note: "Great demand for Toyota, Honda, and clean low-mileage stock.",
  },
  uae: {
    label: "UAE",
    shipping: 1500,
    duty: 5,
    port: "Jebel Ali",
    note: "Low duty and strong demand for premium and hybrid units.",
  },
  uk: {
    label: "United Kingdom",
    shipping: 2100,
    duty: 20,
    port: "Southampton",
    note: "Useful for stock with clear condition and strong spec sheets.",
  },
  jamaica: {
    label: "Jamaica",
    shipping: 1800,
    duty: 45,
    port: "Kingston",
    note: "Popular market for compact and efficient right-hand-drive cars.",
  },
  custom: {
    label: "Custom destination",
    shipping: 1400,
    duty: 25,
    port: "Your port",
    note: "Adjust shipping and duty manually for your route.",
  },
};

const FEATURED_DEALS = [
  {
    title: "Toyota Vitz 2018",
    price: 4100,
    reference: "AT00068",
    tag: "Best for first-time buyers",
  },
  {
    title: "Honda Fit 2017",
    price: 3800,
    reference: "Sample stock",
    tag: "Low running cost option",
  },
  {
    title: "Nissan Note 2019",
    price: 4500,
    reference: "Sample stock",
    tag: "Hybrid-friendly city choice",
  },
];

const TRUST_POINTS = [
  "Company payments only to the official Japan company account.",
  "Full landed-cost planning before the buyer commits.",
  "Fast WhatsApp follow-up for stock suggestions and quotations.",
  "Global export support with destination-specific estimates.",
];

const WHATSAPP_NUMBER = "817044570584";
const LEAD_EMAIL = "sales@afriditrading.com";

function parseAmount(value) {
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function App() {
  const [destination, setDestination] = useState("ghana");
  const [price, setPrice] = useState("");
  const [shipping, setShipping] = useState(String(DESTINATION_PRESETS.ghana.shipping));
  const [duty, setDuty] = useState(String(DESTINATION_PRESETS.ghana.duty));

  const [lead, setLead] = useState({
    name: "",
    phone: "",
    budget: "",
    country: DESTINATION_PRESETS.ghana.label,
    interest: "Toyota / Honda / Nissan",
  });
  const [leadStatus, setLeadStatus] = useState("idle");

  const preset = DESTINATION_PRESETS[destination];

  const numbers = useMemo(() => {
    const vehiclePrice = parseAmount(price);
    const shippingCost = parseAmount(shipping);
    const dutyPercent = parseAmount(duty);
    const dutyAmount = (vehiclePrice * dutyPercent) / 100;
    const total = vehiclePrice + shippingCost + dutyAmount;

    return {
      vehiclePrice,
      shippingCost,
      dutyPercent,
      dutyAmount,
      total,
    };
  }, [price, shipping, duty]);

  const whatsappText = useMemo(() => {
    const lines = [
      "Hello Afridi Trading,",
      `My name is ${lead.name || "Customer"}.`,
      `Country: ${lead.country || preset.label}`,
      `WhatsApp: ${lead.phone || "Not provided"}`,
      `Budget: ${lead.budget ? `$${lead.budget}` : "Need guidance"}`,
      `Interested in: ${lead.interest || "Used car options from Japan"}`,
      numbers.total
        ? `Estimated landed cost discussed on page: ${formatMoney(numbers.total)}`
        : "Please share the best cars available for my budget.",
    ];

    return encodeURIComponent(lines.join("\n"));
  }, [lead, numbers.total, preset.label]);

  function applyPreset(key) {
    const nextPreset = DESTINATION_PRESETS[key];
    setDestination(key);
    setShipping(String(nextPreset.shipping));
    setDuty(String(nextPreset.duty));
    setLead((current) => ({
      ...current,
      country: nextPreset.label,
    }));
  }

  function handleLeadChange(event) {
    const { name, value } = event.target;
    setLead((current) => ({ ...current, [name]: value }));
  }

  async function submitLead(event) {
    event.preventDefault();
    setLeadStatus("loading");

    const payload = {
      name: lead.name,
      phone: lead.phone,
      budget: lead.budget,
      country: lead.country,
      interest: lead.interest,
      destination: preset.label,
      port: preset.port,
      estimate: numbers.total ? formatMoney(numbers.total) : "Not calculated",
      _subject: `New Afridi Trading lead from ${lead.name || "Website visitor"}`,
      _template: "table",
      _captcha: "false",
    };

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${LEAD_EMAIL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Lead request failed");
      }

      setLeadStatus("success");
    } catch {
      setLeadStatus("error");
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Afridi Trading Japan</p>
            <h1>Import quality Japanese cars with a clear landed cost.</h1>
            <p className="subtitle">
              This page is built to convert visitors into buyers fast: estimate the
              full cost, show trust clearly, and move serious leads into WhatsApp.
            </p>

            <div className="hero-stats">
              <article>
                <strong>50,000+</strong>
                <span>cars exported</span>
              </article>
              <article>
                <strong>4.9/5</strong>
                <span>customer rating</span>
              </article>
              <article>
                <strong>Japan account only</strong>
                <span>safe payment message</span>
              </article>
            </div>

            <div className="hero-actions">
              <a
                className="primary-link"
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`}
                target="_blank"
                rel="noreferrer"
              >
                Get Cars On WhatsApp
              </a>

              <a className="secondary-link" href="#calculator">
                Calculate Landed Cost
              </a>
            </div>
          </div>

          <form className="lead-card" onSubmit={submitLead}>
            <div className="panel-heading compact">
              <h2>Get the best cars for your budget</h2>
              <p>Collect the lead first, then follow up in WhatsApp within minutes.</p>
            </div>

            <label className="field">
              <span>Your name</span>
              <input
                type="text"
                name="name"
                placeholder="Raheel"
                value={lead.name}
                onChange={handleLeadChange}
                required
              />
            </label>

            <label className="field">
              <span>WhatsApp number</span>
              <input
                type="text"
                name="phone"
                placeholder="+92..."
                value={lead.phone}
                onChange={handleLeadChange}
                required
              />
            </label>

            <div className="field-grid">
              <label className="field">
                <span>Budget in USD</span>
                <input
                  type="number"
                  min="0"
                  name="budget"
                  placeholder="4500"
                  value={lead.budget}
                  onChange={handleLeadChange}
                />
              </label>

              <label className="field">
                <span>Country</span>
                <input
                  type="text"
                  name="country"
                  placeholder="Ghana"
                  value={lead.country}
                  onChange={handleLeadChange}
                />
              </label>
            </div>

            <label className="field">
              <span>Preferred car type</span>
              <input
                type="text"
                name="interest"
                placeholder="Vitz, Fit, Aqua, SUV, Hybrid..."
                value={lead.interest}
                onChange={handleLeadChange}
              />
            </label>

            <button type="submit" className="cta-button">
              {leadStatus === "loading" ? "Sending..." : "Send Lead"}
            </button>

            <a
              className="hero-contact wide"
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`}
              target="_blank"
              rel="noreferrer"
            >
              Open WhatsApp With Buyer Details
            </a>

            {leadStatus === "success" ? (
              <p className="success-text">
                Lead sent successfully. You can now continue the conversation on WhatsApp.
              </p>
            ) : null}

            {leadStatus === "error" ? (
              <p className="error-text">
                Lead form could not send right now. Use the WhatsApp button so the inquiry is not lost.
              </p>
            ) : null}
          </form>
        </div>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <p className="section-kicker">Why this converts</p>
          <h2>Visitors see value in the first few seconds.</h2>
          <p>
            The page explains the offer clearly: Japanese cars, destination-based
            costs, and fast support through WhatsApp.
          </p>
        </article>

        <article className="info-card notice-card">
          <p className="section-kicker">Trust first</p>
          <h2>Payments only to the official Japan company account.</h2>
          <p>
            Keep this message visible. It reduces fear, prevents fraud confusion,
            and helps the sales team close more carefully.
          </p>
        </article>
      </section>

      <section className="calculator-grid" id="calculator">
        <div className="panel input-panel">
          <div className="panel-heading">
            <h2>Landed Cost Calculator</h2>
            <p>Show buyers the total instead of only the FOB price.</p>
          </div>

          <div className="preset-row" role="tablist" aria-label="Destination presets">
            {Object.entries(DESTINATION_PRESETS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={key === destination ? "preset active" : "preset"}
                onClick={() => applyPreset(key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Destination</span>
              <select value={destination} onChange={(event) => applyPreset(event.target.value)}>
                {Object.entries(DESTINATION_PRESETS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Destination port</span>
              <input type="text" value={preset.port} readOnly />
            </label>
          </div>

          <label className="field">
            <span>Car price in USD</span>
            <input
              type="number"
              min="0"
              placeholder="4100"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Shipping in USD</span>
              <input
                type="number"
                min="0"
                value={shipping}
                onChange={(event) => setShipping(event.target.value)}
              />
            </label>

            <label className="field">
              <span>Duty %</span>
              <input
                type="number"
                min="0"
                value={duty}
                onChange={(event) => setDuty(event.target.value)}
              />
            </label>
          </div>

          <div className="market-note">
            <strong>{preset.label} note</strong>
            <p>{preset.note}</p>
          </div>
        </div>

        <div className="panel result-panel">
          <div className="panel-heading">
            <h2>Estimated Cost Snapshot</h2>
            <p>Simple enough for sales calls and fast quote follow-ups.</p>
          </div>

          <div className="summary-list">
            <article className="summary-item">
              <span>Vehicle price</span>
              <strong>{formatMoney(numbers.vehiclePrice)}</strong>
            </article>

            <article className="summary-item">
              <span>Shipping</span>
              <strong>{formatMoney(numbers.shippingCost)}</strong>
            </article>

            <article className="summary-item">
              <span>Duty amount</span>
              <strong>{formatMoney(numbers.dutyAmount)}</strong>
            </article>

            <article className="summary-item profit">
              <span>Total landed cost</span>
              <strong>{formatMoney(numbers.total)}</strong>
            </article>
          </div>

          <div className="breakdown">
            <div>
              <span>Duty rate</span>
              <strong>{numbers.dutyPercent}%</strong>
            </div>
            <div>
              <span>Lead inbox</span>
              <strong>{LEAD_EMAIL}</strong>
            </div>
          </div>

          <a
            className="hero-contact wide"
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`}
            target="_blank"
            rel="noreferrer"
          >
            Send This Estimate To WhatsApp
          </a>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel deals-panel">
          <div className="panel-heading">
            <h2>Today&apos;s deal ideas</h2>
            <p>Use these as quick hooks in ads, posts, and WhatsApp follow-ups.</p>
          </div>

          <div className="deal-list">
            {FEATURED_DEALS.map((deal) => (
              <article key={deal.title} className="deal-card">
                <p className="deal-tag">{deal.tag}</p>
                <h3>{deal.title}</h3>
                <p>Reference: {deal.reference}</p>
                <strong>{formatMoney(deal.price)} FOB</strong>
              </article>
            ))}
          </div>
        </div>

        <div className="panel trust-panel">
          <div className="panel-heading">
            <h2>Why buyers choose Afridi Trading</h2>
            <p>Keep the message short, strong, and confidence-building.</p>
          </div>

          <div className="trust-list">
            {TRUST_POINTS.map((point) => (
              <article key={point} className="trust-item">
                <span className="trust-dot" aria-hidden="true" />
                <p>{point}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
