import { useMemo, useState } from "react";

const COUNTRY_PRESETS = {
  pakistan: {
    label: "Pakistan",
    flag: "PK",
    shipping: 1200,
    duty: 60,
    misc: 250,
  },
  jamaica: {
    label: "Jamaica",
    flag: "JM",
    shipping: 1800,
    duty: 45,
    misc: 300,
  },
  dominica: {
    label: "Dominica",
    flag: "DM",
    shipping: 2000,
    duty: 40,
    misc: 350,
  },
};

const DEFAULT_MARGIN = 20;

function parseAmount(value) {
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState("pakistan");
  const [price, setPrice] = useState("");
  const [shipping, setShipping] = useState("1200");
  const [duty, setDuty] = useState("60");
  const [other, setOther] = useState("250");
  const [margin, setMargin] = useState(String(DEFAULT_MARGIN));

  const numbers = useMemo(() => {
    const carPrice = parseAmount(price);
    const shippingCost = parseAmount(shipping);
    const dutyRate = parseAmount(duty);
    const miscCost = parseAmount(other);
    const profitMargin = parseAmount(margin);

    const dutyAmount = (carPrice * dutyRate) / 100;
    const landedCost = carPrice + shippingCost + dutyAmount + miscCost;
    const suggestedPrice = landedCost * (1 + profitMargin / 100);
    const estimatedProfit = suggestedPrice - landedCost;

    return {
      dutyAmount,
      landedCost,
      suggestedPrice,
      estimatedProfit,
    };
  }, [price, shipping, duty, other, margin]);

  function applyPreset(countryKey) {
    const preset = COUNTRY_PRESETS[countryKey];
    setSelectedCountry(countryKey);
    setShipping(String(preset.shipping));
    setDuty(String(preset.duty));
    setOther(String(preset.misc));
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Afridi Trading Tools</p>
          <h1>Car Import Profit Calculator</h1>
          <p className="subtitle">
            Check landed cost, selling price, and profit before you commit to an
            import deal.
          </p>
        </div>

        <div className="preset-row" role="tablist" aria-label="Country presets">
          {Object.entries(COUNTRY_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              className={key === selectedCountry ? "preset active" : "preset"}
              onClick={() => applyPreset(key)}
            >
              <span className="preset-flag">{preset.flag}</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="calculator-grid">
        <div className="panel input-panel">
          <div className="panel-heading">
            <h2>Deal Inputs</h2>
            <p>Enter the main costs and your target margin.</p>
          </div>

          <label className="field">
            <span>Car price</span>
            <input
              type="number"
              min="0"
              placeholder="10000"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>

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
            <span>Other costs</span>
            <input
              type="number"
              min="0"
              placeholder="250"
              value={other}
              onChange={(event) => setOther(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Target profit margin %</span>
            <input
              type="number"
              min="0"
              placeholder="20"
              value={margin}
              onChange={(event) => setMargin(event.target.value)}
            />
          </label>
        </div>

        <div className="panel result-panel">
          <div className="panel-heading">
            <h2>Profit Snapshot</h2>
            <p>Live estimate based on your current numbers.</p>
          </div>

          <div className="summary-list">
            <article className="summary-item">
              <span>Total landed cost</span>
              <strong>{formatMoney(numbers.landedCost)}</strong>
            </article>

            <article className="summary-item">
              <span>Suggested selling price</span>
              <strong>{formatMoney(numbers.suggestedPrice)}</strong>
            </article>

            <article className="summary-item profit">
              <span>Estimated profit</span>
              <strong>{formatMoney(numbers.estimatedProfit)}</strong>
            </article>
          </div>

          <div className="breakdown">
            <div>
              <span>Duty amount</span>
              <strong>{formatMoney(numbers.dutyAmount)}</strong>
            </div>
            <div>
              <span>Preset country</span>
              <strong>{COUNTRY_PRESETS[selectedCountry].label}</strong>
            </div>
          </div>

          <a
            className="cta-button"
            href="https://wa.me/923318484115"
            target="_blank"
            rel="noreferrer"
          >
            Import This Car With Us
          </a>
        </div>
      </section>
    </main>
  );
}
