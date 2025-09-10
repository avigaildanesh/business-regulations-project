import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai"; 

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

function loadRequirements() {
  const filePath = path.join(__dirname, "data", "exampleRequirement.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateReport(requirements, businessData) {
  const prompt = `
אתה יועץ רישוי עסקים.
יש לי עסק עם המאפיינים:
- גודל: ${businessData.area} מ"ר
- מקומות ישיבה: ${businessData.seats}
- שימוש בגז: ${businessData.usesGas ? "כן" : "לא"}
- מגיש בשר: ${businessData.servesMeat ? "כן" : "לא"}

דרישות רגולטוריות שנמצאו:
${requirements.map((r) => `- ${r.requirement} (${r.reference})`).join("\n")}

אנא צור דוח מותאם אישית וברור לבעל העסק:
- חלק את המידע לקטגוריות: בטיחות אש, בטיחות גז, בריאות הציבור.
- פרט כל דרישה בשפה פשוטה (מה צריך לעשות בפועל).
- הוסף סדר עדיפויות: חובה מיד / חשוב / כדאי.
- הצג את התוצאה ברשימות נקודות, מסודר וקריא.
 אל תכלול שם עסק, תאריך .
 אם יש תקן מסויים, תכתוב מה הוא אומר, זה צריך להיות מובן למשתמש
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

app.post("/report", async (req, res) => {
  const { area, seats, usesGas, servesMeat } = req.body;
  const data = loadRequirements();

  let matched = [];

  for (const category in data.requirements) {
    for (const rule of data.requirements[category]) {
      const cond = rule.conditions;
      if (cond.always) matched.push(rule);
      else if (cond.areaMin && area >= cond.areaMin) matched.push(rule);
      else if (cond.seatsMin && seats >= cond.seatsMin) matched.push(rule);
      else if (cond.usesGas && usesGas) matched.push(rule);
      else if (cond.servesMeat && servesMeat) matched.push(rule);
    }
  }

  try {
    const report = await generateReport(matched, {
      area,
      seats,
      usesGas,
      servesMeat,
    });
    res.json({ report });
  } catch (error) {
    console.error("Error generating report:", error.message);
    res
      .status(500)
      .json({ error: `AI report generation failed: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
