import { useMemo, useState } from "react";

/* ================== CONFIG ================== */

const DESTINATION_PRESETS = {
  pakistan: { label: "Pakistan", shipping: 1200, duty: 60, port: "Karachi" },
  ghana: { label: "Ghana", shipping: 1850, duty: 32, port: "Tema" },
  uae: { label: "UAE", shipping: 1500, duty: 5, port: "Jebel Ali" },
  uk: { label: "United Kingdom", shipping: 2100, duty: 20, port: "Southampton" },
  jamaica: { label: "Jamaica", shipping: 1800, duty: 45, port: "Kingston" },
};

const WHATSAPP_NUMBER = "923000000000"; // 🔥 PUT YOUR NUMBER
const LEAD_EMAIL = "sales@afriditrading.com";

/* ================== HELPERS ================== */

const num = (v) => parseFloat(v) || 0;

const money = (v) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);

/* ================== APP ================== */

export default function App() {
  const [destination, setDestination] = useState("ghana");

  const [price, setPrice] = useState("");
  const [shipping, setShipping] = useState(
    DESTINATION_PRESETS.ghana.shipping
  );
  const [duty, setDuty] = useState(DESTINATION_PRESETS.ghana.duty);

  const [lead, setLead] = useState({
    name: "",
    phone: "",
    budget: "",
    country: "Ghana",
  });

  const preset = DESTINATION_PRESETS[destination];

  /* ================== CALC ================== */

  const calc = useMemo(() => {
    const p = num(price);
    const s = num(shipping);
    const d = num(duty);

    const dutyAmount = (p * d) / 100;
    const total = p + s + dutyAmount;

    return { p, s, d, dutyAmount, total };
  }, [price, shipping, duty]);

  /* ================== WHATSAPP ================== */

  const whatsappText = encodeURIComponent(`
Hello Afridi Trading,

My name: ${lead.name || "Customer"}
Country: ${lead.country}
Phone: ${lead.phone}
Budget: ${lead.budget || "Not specified"}

Estimated total: ${calc.total ? money(calc.total) : "Not calculated"}

Please send best cars in my budget.
`);

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`;

  /* ================== EVENTS ================== */

  const applyPreset = (key) => {
    const p = DESTINATION_PRESETS[key];
    setDestination(key);
    setShipping(p.shipping);
    setDuty(p.duty);
    setLead({ ...lead, country: p.label });
  };

  const handleLead = (e) => {
    setLead({ ...lead, [e.target.name]: e.target.value });
  };

  const submitLead = async (e) => {
    e.preventDefault();

    await fetch(`https://formsubmit.co/ajax/${LEAD_EMAIL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });

    alert("Lead sent! Now open WhatsApp.");
  };

  /* ================== UI ================== */

  return (
    <div style={styles.container}>
      <h1>🚗 Import Cars from Japan</h1>
      <p>Get full landed cost + best deals instantly</p>

      {/* LEAD FORM */}
      <form onSubmit={submitLead} style={styles.card}>
        <h3>Get Cars for Your Budget</h3>

        <input name="name" placeholder="Name" onChange={handleLead} required />
        <input
          name="phone"
          placeholder="WhatsApp"
          onChange={handleLead}
          required
        />
        <input name="budget" placeholder="Budget $" onChange={handleLead} />

        <button type="submit">Send Lead</button>

        <a href={whatsappLink} target="_blank">
          Open WhatsApp 🚀
        </a>
      </form>

      {/* CALCULATOR */}
      <div style={styles.card}>
        <h3>Calculate Import Cost</h3>

        <select onChange={(e) => applyPreset(e.target.value)}>
          {Object.entries(DESTINATION_PRESETS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>

        <input
          placeholder="Car Price"
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          placeholder="Shipping"
          value={shipping}
          onChange={(e) => setShipping(e.target.value)}
        />
        <input
          placeholder="Duty %"
          value={duty}
          onChange={(e) => setDuty(e.target.value)}
        />

        <h3>Total: {money(calc.total)}</h3>
      </div>

      {/* TRUST */}
      <div style={styles.card}>
        <h3>Why Afridi Trading?</h3>
        <p>✔ Japan company account only</p>
        <p>✔ Full price transparency</p>
        <p>✔ Fast WhatsApp support</p>
      </div>
    </div>
  );
}

/* ================== STYLES ================== */

const styles = {
  container: {
    maxWidth: "400px",
    margin: "auto",
    padding: "20px",
    fontFamily: "Arial",
    textAlign: "center",
  },
  card: {
    border: "1px solid #ddd",
    padding: "15px",
    marginTop: "20px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
};
