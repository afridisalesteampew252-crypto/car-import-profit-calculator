import { useMemo, useState } from "react";

const DESTINATION_PRESETS = {
  pakistan: {
    label: "Pakistan",
    duty: 60,
    shipping: 1200,
    misc: 250,
  },
  jamaica: {
    label: "Jamaica",
    duty: 45,
    shipping: 1800,
    misc: 300,
  },
  dominica: {
    label: "Dominica",
    duty: 40,
    shipping: 2000,
    misc: 350,
  },
  uae: {
    label: "UAE",
    duty: 5,
    shipping: 1500,
    misc: 280,
  },
  kenya: {
    label: "Kenya",
    duty: 35,
    shipping: 1700,
    misc: 320,
  },
  custom: {
    label: "Custom",
    duty: 25,
    shipping: 1000,
    misc: 200,
  },
};

const CURRENCIES = {
  USD: { label: "USD", rateToUsd: 1 },
  JPY: { label: "JPY", rateToUsd: 0.0067 },
  PKR: { label: "PKR", rateToUsd: 0.0036 },
};

const DEFAULT_MARGIN = 20;
const WHATSAPP_NUMBER = "923318484115";
const LEAD_EMAIL = "raheelhayat038@gmail.com";

function parseAmount(value) {
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function convertToUsd(amount, currency, rates) {
  return amount * (rates[currency] || 1);
}

function convertFromUsd(amount, currency, rates) {
  const rate = rates[currency] || 1;
  return rate === 0 ? 0 : amount / rate;
}

function formatMoney(value, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(value);
}

export default function App() {
  const [destination, setDestination] = useState("pakistan");
  const [carPrice, setCarPrice] = useState("");
  const [shipping, setShipping] = useState("1200");
  const [duty, setDuty] = useState("60");
  const [other, setOther] = useState("250");
  const [margin, setMargin] = useState(String(DEFAULT_MARGIN));

  const [carCurrency, setCarCurrency] = useState("USD");
  const [shippingCurrency, setShippingCurrency] = useState("USD");
  const [otherCurrency, setOtherCurrency] = useState("USD");
  const [displayCurrency, setDisplayCurrency] = useState("USD");

  const [usdRate, setUsdRate] = useState("1");
  const [jpyRate, setJpyRate] = useState("0.0067");
  const [pkrRate, setPkrRate] = useState("0.0036");

  const [lead, setLead] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    notes: "",
  });
  const [leadStatus, setLeadStatus] = useState("idle");

  const rates = useMemo(
    () => ({
      USD: parseAmount(usdRate) || 1,
      JPY: parseAmount(jpyRate) || 0.0067,
      PKR: parseAmount(pkrRate) || 0.0036,
    }),
    [usdRate, jpyRate, pkrRate],
  );

  const numbers = useMemo(() => {
    const priceRaw = parseAmount(carPrice);
    const shippingRaw = parseAmount(shipping);
    const otherRaw = parseAmount(other);
    const dutyRate = parseAmount(duty);
    const profitMargin = parseAmount(margin);

    const priceUsd = convertToUsd(priceRaw, carCurrency, rates);
    const shippingUsd = convertToUsd(shippingRaw, shippingCurrency, rates);
    const otherUsd = convertToUsd(otherRaw, otherCurrency, rates);

    const dutyAmountUsd = (priceUsd * dutyRate) / 100;
    const landedCostUsd = priceUsd + shippingUsd + dutyAmountUsd + otherUsd;
    const suggestedPriceUsd = landedCostUsd * (1 + profitMargin / 100);
    const estimatedProfitUsd = suggestedPriceUsd - landedCostUsd;

    return {
      priceUsd,
      shippingUsd,
      otherUsd,
      dutyAmountUsd,
      landedCostUsd,
      suggestedPriceUsd,
      estimatedProfitUsd,
      landedCostDisplay: convertFromUsd(landedCostUsd, displayCurrency, rates),
      suggestedPriceDisplay: convertFromUsd(
        suggestedPriceUsd,
        displayCurrency,
        rates,
      ),
      estimatedProfitDisplay: convertFromUsd(
        estimatedProfitUsd,
        displayCurrency,
        rates,
      ),
      dutyAmountDisplay: convertFromUsd(dutyAmountUsd, displayCurrency, rates),
    };
  }, [
    carPrice,
    shipping,
    other,
    duty,
    margin,
    carCurrency,
    shippingCurrency,
    otherCurrency,
    displayCurrency,
    rates,
  ]);

  function applyPreset(key) {
    const preset = DESTINATION_PRESETS[key];
    setDestination(key);
    setShipping(String(preset.shipping));
    setDuty(String(preset.duty));
    setOther(String(preset.misc));
  }

  function resetCalculator() {
    applyPreset(destination);
    setCarPrice("");
    setMargin(String(DEFAULT_MARGIN));
    setCarCurrency("USD");
    setShippingCurrency("USD");
    setOtherCurrency("USD");
    setDisplayCurrency("USD");
  }

  async function copyEstimate() {
    const lines = [
      "Afridi Trading Universal Import Estimate",
      `Destination: ${DESTINATION_PRESETS[destination].label}`,
      `Car price: ${formatMoney(parseAmount(carPrice), carCurrency)}`,
      `Shipping: ${formatMoney(parseAmount(shipping), shippingCurrency)}`,
      `Duty: ${duty}%`,
      `Other costs: ${formatMoney(parseAmount(other), otherCurrency)}`,
      `Landed cost: ${formatMoney(numbers.landedCostDisplay, displayCurrency)}`,
      `Suggested selling price: ${formatMoney(numbers.suggestedPriceDisplay, displayCurrency)}`,
      `Estimated profit: ${formatMoney(numbers.estimatedProfitDisplay, displayCurrency)}`,
    ];

    await navigator.clipboard.writeText(lines.join("\n"));
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
      email: lead.email,
      phone: lead.phone,
      country: lead.country,
      notes: lead.notes,
      destination: DESTINATION_PRESETS[destination].label,
      landed_cost: formatMoney(numbers.landedCostDisplay, displayCurrency),
      suggested_price: formatMoney(numbers.suggestedPriceDisplay, displayCurrency),
      estimated_profit: formatMoney(numbers.estimatedProfitDisplay, displayCurrency),
      _subject: `New import lead from ${lead.name || "Website visitor"}`,
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
      setLead({
        name: "",
        email: "",
        phone: "",
        country: "",
        notes: "",
      });
    } catch {
      setLeadStatus("error");
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-topline">
          <div className="hero-copy">
            <p className="eyebrow">Afridi Trading Tools</p>
            <h1>Universal Car Import Calculator</h1>
            <p className="subtitle">
              Estimate landed cost, selling price, and profit for imports across
              different destinations and currencies.
            </p>
          </div>

          <a
            className="hero-contact"
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Us
          </a>
        </div>

        <div className="preset-row" role="tablist" aria-label="Destination presets">
          {Object.entries(DESTINATION_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              className={key === destination ? "preset active" : "preset"}
              onClick={() => applyPreset(key)}
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="calculator-grid">
        <div className="panel input-panel">
          <div className="panel-heading">
            <h2>Import Inputs</h2>
            <p>Mix currencies, tune the exchange rates, and compare margins.</p>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Destination market</span>
              <select value={destination} onChange={(event) => applyPreset(event.target.value)}>
                {Object.entries(DESTINATION_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Display currency</span>
              <select
                value={displayCurrency}
                onChange={(event) => setDisplayCurrency(event.target.value)}
              >
                {Object.keys(CURRENCIES).map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-combo">
            <label className="field">
              <span>Car price</span>
              <input
                type="number"
                min="0"
                placeholder="10000"
                value={carPrice}
                onChange={(event) => setCarPrice(event.target.value)}
              />
            </label>
            <label className="field currency-field">
              <span>Currency</span>
              <select
                value={carCurrency}
                onChange={(event) => setCarCurrency(event.target.value)}
              >
                {Object.keys(CURRENCIES).map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-combo">
            <label className="field">
              <span>Shipping</span>
              <input
                type="number"
                min="0"
                placeholder="1200"
                value={shipping}
                onChange={(event) => setShipping(event.target.value)}
              />
            </label>
            <label className="field currency-field">
              <span>Currency</span>
              <select
                value={shippingCurrency}
                onChange={(event) => setShippingCurrency(event.target.value)}
              >
                {Object.keys(CURRENCIES).map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-combo">
            <label className="field">
              <span>Other costs</span>
              <input
                type="number"
                min="0"
                placeholder="250"
                value={other}
                onChange={(event) => setOther(event.target.value)}
              />
            </label>
            <label className="field currency-field">
              <span>Currency</span>
              <select
                value={otherCurrency}
                onChange={(event) => setOtherCurrency(event.target.value)}
              >
                {Object.keys(CURRENCIES).map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Duty %</span>
              <input
                type="number"
                min="0"
                placeholder="60"
                value={duty}
                onChange={(event) => setDuty(event.target.value)}
              />
            </label>

            <label className="field">
              <span>Target margin %</span>
              <input
                type="number"
                min="0"
                placeholder="20"
                value={margin}
                onChange={(event) => setMargin(event.target.value)}
              />
            </label>
          </div>

          <div className="rate-box">
            <div className="panel-heading compact">
              <h2>Exchange Rates To USD</h2>
              <p>Adjust these anytime to match today&apos;s market.</p>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>USD</span>
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={usdRate}
                  onChange={(event) => setUsdRate(event.target.value)}
                />
              </label>

              <label className="field">
                <span>JPY</span>
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={jpyRate}
                  onChange={(event) => setJpyRate(event.target.value)}
                />
              </label>

              <label className="field">
                <span>PKR</span>
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={pkrRate}
                  onChange={(event) => setPkrRate(event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="action-row">
            <button type="button" className="secondary-button" onClick={resetCalculator}>
              Reset
            </button>
            <button type="button" className="primary-button" onClick={copyEstimate}>
              Copy estimate
            </button>
          </div>
        </div>

        <div className="panel result-panel">
          <div className="panel-heading">
            <h2>Profit Snapshot</h2>
            <p>Showing all results in {displayCurrency}.</p>
          </div>

          <div className="summary-list">
            <article className="summary-item">
              <span>Total landed cost</span>
              <strong>{formatMoney(numbers.landedCostDisplay, displayCurrency)}</strong>
            </article>

            <article className="summary-item">
              <span>Suggested selling price</span>
              <strong>{formatMoney(numbers.suggestedPriceDisplay, displayCurrency)}</strong>
            </article>

            <article className="summary-item profit">
              <span>Estimated profit</span>
              <strong>{formatMoney(numbers.estimatedProfitDisplay, displayCurrency)}</strong>
            </article>
          </div>

          <div className="breakdown">
            <div>
              <span>Duty amount</span>
              <strong>{formatMoney(numbers.dutyAmountDisplay, displayCurrency)}</strong>
            </div>
            <div>
              <span>Destination</span>
              <strong>{DESTINATION_PRESETS[destination].label}</strong>
            </div>
            <div>
              <span>Base total in USD</span>
              <strong>{formatMoney(numbers.landedCostUsd, "USD")}</strong>
            </div>
            <div>
              <span>Lead email</span>
              <strong>{LEAD_EMAIL}</strong>
            </div>
          </div>

          <form className="lead-form" onSubmit={submitLead}>
            <div className="panel-heading compact">
              <h2>Import This Car With Us</h2>
              <p>Send the estimate and your contact details straight to Afridi Trading.</p>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  required
                  value={lead.name}
                  onChange={handleLeadChange}
                />
              </label>

              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  value={lead.email}
                  onChange={handleLeadChange}
                />
              </label>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>Phone / WhatsApp</span>
                <input
                  type="text"
                  name="phone"
                  required
                  value={lead.phone}
                  onChange={handleLeadChange}
                />
              </label>

              <label className="field">
                <span>Country</span>
                <input
                  type="text"
                  name="country"
                  value={lead.country}
                  onChange={handleLeadChange}
                />
              </label>
            </div>

            <label className="field">
              <span>Vehicle details or notes</span>
              <textarea
                name="notes"
                rows="4"
                placeholder="Model, year, auction details, questions, or destination notes"
                value={lead.notes}
                onChange={handleLeadChange}
              />
            </label>

            <button type="submit" className="cta-button">
              {leadStatus === "loading" ? "Sending..." : "Send Inquiry"}
            </button>

            {leadStatus === "success" ? (
              <p className="success-text">
                Inquiry sent. Check {LEAD_EMAIL} and confirm FormSubmit once if this is the first lead.
              </p>
            ) : null}

            {leadStatus === "error" ? (
              <p className="error-text">
                Could not send right now. Please try again or message us on WhatsApp.
              </p>
            ) : null}
          </form>

          <a
            className="hero-contact wide"
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
          >
            Chat On WhatsApp
          </a>

          <p className="disclaimer">
            Estimates are for planning only. Final costs can change based on exchange
            rates, inspection fees, port charges, destination taxes, and local compliance.
          </p>
        </div>
      </section>
    </main>
  );
}
