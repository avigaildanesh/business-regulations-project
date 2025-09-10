import React, { useState } from "react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    area: "",
    seats: "",
    usesGas: false,
    servesMeat: false,
  });

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReport(null);

    try {
      const res = await fetch("http://localhost:4000/report", {
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
      setReport(data.report);
    } catch (error) {
      console.error("Error fetching report:", error);
      setReport("שגיאה ביצירת הדוח. נסי שוב מאוחר יותר.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>שאלון רישוי עסקים</h1>
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

        <button type="submit" disabled={loading}>
          {loading ? "מפיק דוח..." : "שלח"}
        </button>
      </form>

      {report && (
        <div className="report-box">
          <h2>📑 דוח חכם מותאם לעסק שלך:</h2>
          {report.split("\n").map((line, idx) => {
            if (!line.trim()) return null;
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <h3 key={idx} className="category-title">
                  {line.replace(/\*\*/g, "")}
                </h3>
              );
            }
            if (line.startsWith("*")) {
              return (
                <li key={idx} className="report-item">
                  {line.replace("*", "").trim()}
                </li>
              );
            }
            return (
              <p key={idx} className="report-text">
                {line}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;
