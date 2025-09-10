const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

function loadRequirements() {
  const filePath = path.join(__dirname, "data", "requirements.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

app.post("/match", (req, res) => {
  const { area, seats, usesGas, servesMeat } = req.body;
  const requirements = loadRequirements();

  let matched = [];

  for (const category in requirements.requirements) {
    for (const rule of requirements.requirements[category]) {
      const cond = rule.conditions;

      if (cond.always) {
        matched.push(rule);
      } else if (cond.areaMin && area >= cond.areaMin) {
        matched.push(rule);
      } else if (cond.seatsMin && seats >= cond.seatsMin) {
        matched.push(rule);
      } else if (cond.usesGas && usesGas) {
        matched.push(rule);
      } else if (cond.servesMeat && servesMeat) {
        matched.push(rule);
      }
    }
  }

  res.json({ matched });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
