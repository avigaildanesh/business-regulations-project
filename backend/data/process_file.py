import sys
import os
import json
import re
from docx import Document
from PyPDF2 import PdfReader

def extract_text_from_pdf(file_path):
    reader = PdfReader(file_path)
    text = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text.append(page_text)
    return "\n".join(text)

def extract_text_from_docx(file_path):
    doc = Document(file_path)
    text = []
    for para in doc.paragraphs:
        if para.text.strip():
            text.append(para.text.strip())
    return "\n".join(text)

def detect_conditions(text):
    """מזהה תנאים מתוך הטקסט"""
    conditions = {}

    # זיהוי שטח (לדוגמה: "301 מ"ר")
    match_area = re.search(r"(\d+)\s*מ\"?ר", text)
    if match_area:
        conditions["areaMin"] = int(match_area.group(1))

    match_seats = re.search(r"(\d+)\s*מקומות\s*ישיבה", text)
    if match_seats:
        conditions["seatsMin"] = int(match_seats.group(1))

    if "גז" in text or "גפ\"מ" in text:
        conditions["usesGas"] = True

    if "בשר" in text or "עופות" in text or "דגים" in text:
        conditions["servesMeat"] = True

    if not conditions:
        conditions["always"] = True

    return conditions

def detect_reference(text):
    """מנסה לתפוס מספר סעיף/פרק מתוך השורה"""
    match = re.search(r"(סעיף\s*\d+(\.\d+)*|פרק\s*\d+)", text)
    if match:
        return match.group(0)
    return "N/A"

def categorize_requirement(text):
    """מקטלג את הדרישה לפי תוכן"""
    if "אש" in text or "כיבוי" in text or "ספרינקלר" in text:
        return "fire_safety"
    elif "גז" in text or "גפ\"מ" in text:
        return "gas_safety"
    elif "בשר" in text or "עופות" in text or "דגים" in text or "מזון" in text or "בריאות" in text:
        return "public_health"
    else:
        return "public_health"

def process_text_to_requirements(text):
    requirements = {
        "fire_safety": [],
        "gas_safety": [],
        "public_health": []
    }

    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue

        category = categorize_requirement(line)
        requirement_obj = {
            "requirement": line,
            "reference": detect_reference(line),
            "conditions": detect_conditions(line)
        }
        requirements[category].append(requirement_obj)

    return {"requirements": requirements}

def process_file(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        text = extract_text_from_pdf(file_path)
    elif ext == ".docx":
        text = extract_text_from_docx(file_path)
    else:
        raise ValueError("Unsupported file format. Use PDF or DOCX.")

    structured_data = process_text_to_requirements(text)

    out_file = os.path.join(os.path.dirname(__file__), "requirements.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(structured_data, f, ensure_ascii=False, indent=2)

    print(f"Processed requirements saved to {out_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python process_file.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    process_file(file_path)
