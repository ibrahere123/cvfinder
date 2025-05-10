import os
import re
import json
from collections import defaultdict
from datetime import datetime

import spacy
from spacy.matcher import PhraseMatcher
from dateparser import parse as parse_date
from pdfminer.high_level import extract_text as extract_pdf_text
from docx import Document

# -------------- CONFIGURATION --------------
RESUME_PATH = r"D:/OneDrive/Desktop/cvfinder2/resume-ranker/resumes/8.pdf"
SKILLS_JSON = None
OUTPUT_PATH = "parsed.json"

# ------------- SECTION KEYWORDS ------------
SECTION_KEYWORDS = {
    'contact': ['contact', 'personal information', 'contact information'],
    'summary': ['summary', 'objective', 'professional summary', 'profile'],
    'experience': ['experience', 'work experience', 'professional experience'],
    'education': ['education', 'academic credentials'],
    'skills': ['skills', 'technical skills', 'areas of expertise'],
    'certifications': ['certification', 'certifications', 'certified'],
    'projects': ['projects', 'major projects', 'academic projects', 'capstone'],
    'achievements': ['achievements', 'laurels', 'awards'],
}

# --------------- NLP SETUP ----------------
nlp = spacy.load("en_core_web_sm")

# Default skills list
DEFAULT_SKILLS = [
    "Python", "Java", "C++", "Machine Learning", "Deep Learning",
    "Data Analysis", "NLP", "Computer Vision", "SQL", "NoSQL",
    "Git", "Docker", "Kubernetes", "AWS", "Azure", "GCP"
]

# -------- TEXT EXTRACTION --------
def extract_text(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".pdf":
        return extract_pdf_text(filepath)
    elif ext in [".docx", ".doc"]:
        doc = Document(filepath)
        return "\n".join(p.text for p in doc.paragraphs)
    elif ext == ".txt":
        return open(filepath, 'r', encoding='utf-8', errors='ignore').read()
    else:
        raise ValueError(f"Unsupported file type: {ext}")

# --------- SECTION SPLITTING ---------
def split_sections(text):
    paragraphs = re.split(r"\n\s*\n", text)
    sections = defaultdict(list)
    current = 'header'
    for para in paragraphs:
        if not para.strip():
            continue
        first_line = para.strip().splitlines()[0].strip().lower()
        for sec, keys in SECTION_KEYWORDS.items():
            if any(first_line.startswith(k) for k in keys):
                current = sec
                content = '\n'.join(para.splitlines()[1:]).strip()
                if content:
                    sections[current].append(content)
                break
        else:
            sections[current].append(para.strip())
    return sections

# ----- CONTACT, NAME, DATES, SKILLS -----
def extract_contact_info(text):
    email = re.search(r"[\w\.-]+@[\w\.-]+", text)
    phone = re.search(r"(\+?\d[\d\-\s\(\)]{7,}\d)", text)
    linkedin = re.search(r"https?://[\w./]*linkedin\.com/[^\s]+", text)
    return {
        'email': email.group() if email else None,
        'phone': phone.group() if phone else None,
        'linkedin': linkedin.group() if linkedin else None
    }

def extract_name(text):
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == 'PERSON':
            return ent.text
    parts = text.split()
    return ' '.join(parts[:2]) if len(parts) >= 2 else None

def extract_dates(text):
    pattern = r"([A-Za-z]{3,9}\s+\d{4})\s*[-–—]\s*([A-Za-z]{3,9}\s+\d{4}|Present)"
    matches = re.findall(pattern, text)
    date_ranges = []
    for start, end in matches:
        s = parse_date(start)
        e = datetime.today() if end.lower() == 'present' else parse_date(end)
        if s and e:
            date_ranges.append({'start': s, 'end': e})
    return date_ranges

def extract_skills(text, skills_list=None):
    skills = skills_list or DEFAULT_SKILLS
    matcher = PhraseMatcher(nlp.vocab, attr='LOWER')
    matcher.add("SKILL", [nlp(skill) for skill in skills])
    doc = nlp(text)
    return sorted({doc[s:e].text for _, s, e in matcher(doc)})

# ----- EXPERIENCE DURATION CALCULATION -----
def calculate_total_years(date_ranges):
    total_days = sum((d['end'] - d['start']).days for d in date_ranges)
    years_float = total_days / 365.0
    return round(years_float, 2)

# --------- PARSING FUNCTION ---------
def parse_resume(path, skills_json=None):
    raw = extract_text(path)
    contact = extract_contact_info(raw)
    sections = split_sections(raw)

    all_dates = []
    data = {
        'name': extract_name(' '.join(sections.get('header', []))),
        'email': contact['email'],
        'phone': contact['phone'],
        'linkedin': contact['linkedin'],
        'summary': ' '.join(sections.get('summary', [])).strip(),
        'experience': [],
        'education': ' '.join(sections.get('education', [])).strip(),
        'skills': [],
        'certifications': sections.get('certifications', []),
        'projects': sections.get('projects', []),
        'achievements': sections.get('achievements', [])
    }

    for para in sections.get('experience', []):
        dates = extract_dates(para)
        all_dates.extend(dates)
        duration = calculate_total_years(dates) if dates else 0.0
        data['experience'].append({
            'entry': para,
            'dates': dates,
            'duration_years': duration
        })

    total_experience = calculate_total_years(all_dates)
    data['total_experience_years'] = total_experience

    # Skills extraction
    skills_list = None
    if skills_json and os.path.exists(skills_json):
        with open(skills_json) as f:
            skills_list = json.load(f)
    data['skills'] = extract_skills(' '.join(sections.get('skills', [])), skills_list)

    return data

# --------------- MAIN ----------------
if __name__ == '__main__':
    parsed = parse_resume(RESUME_PATH, SKILLS_JSON)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as out:
        json.dump(parsed, out, default=str, indent=2)
    print(f"Parsed resume written to {OUTPUT_PATH}")
