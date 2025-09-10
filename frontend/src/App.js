import React, { useState } from "react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    area: "",
    seats: "",
    usesGas: false,
    servesMeat: false,
  });

  const [requirements, setRequirements] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area: Number(form.area),
          seats: Number(form.seats),
          usesGas: form.usesGas,
          servesMeat: form.servesMeat,
        }),
      });

      const data = await res.json();
      setRequirements(data.matched);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="container">
      <h1>שאלון לעסק</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          גודל העסק (במ״ר):
          <input
            type="number"
            name="area"
            value={form.area}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          מספר מקומות ישיבה:
          <input
            type="number"
            name="seats"
            value={form.seats}
            onChange={handleChange}
            required
          />
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            name="usesGas"
            checked={form.usesGas}
            onChange={handleChange}
          />
          העסק משתמש בגז
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            name="servesMeat"
            checked={form.servesMeat}
            onChange={handleChange}
          />
          העסק מגיש בשר
        </label>

        <button type="submit">שלח</button>
      </form>

      {requirements && (
        <div className="results">
          <h2>דרישות לעסק שלך:</h2>
          <ul>
            {requirements.map((req, index) => (
              <li key={index}>
                <strong>{req.requirement}</strong>  
                <br />
                <small>{req.reference}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
