import os
import re
import json
import yaml
from collections import defaultdict
from datetime import datetime

import spacy
from spacy.matcher import PhraseMatcher
from dateparser import parse as parse_date
from pdfminer.high_level import extract_text as extract_pdf_text
from docx import Document

class ResumeParser:
    # -------------- CONFIGURATION --------------
    DEFAULT_SKILLS = [
        "Python", "Java", "C++", "Machine Learning", "Deep Learning",
        "Data Analysis", "NLP", "Computer Vision", "SQL", "NoSQL",
        "Git", "Docker", "Kubernetes", "AWS", "Azure", "GCP"
    ]

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

    def __init__(self, skills_yml_path=None):
        self.nlp = spacy.load("en_core_web_sm")
        self.skills_yml_path = skills_yml_path
        self.skill_list = self.load_skills()

    def load_skills(self):
        if self.skills_yml_path and os.path.exists(self.skills_yml_path):
            try:
                with open(self.skills_yml_path, 'r', encoding='utf-8') as f:
                    skills_data = yaml.safe_load(f)
                    if isinstance(skills_data, dict):
                        all_skills = []
                        for v in skills_data.values():
                            if isinstance(v, list):
                                all_skills.extend(v)
                        return list(set(all_skills))
                    elif isinstance(skills_data, list):
                        return skills_data
            except Exception as e:
                print(f"Error loading skills.yml: {e}")
        return self.DEFAULT_SKILLS

    def extract_text(self, filepath):
        ext = os.path.splitext(filepath)[1].lower()
        if ext == ".pdf":
            return extract_pdf_text(filepath)
        elif ext in [".docx", ".doc"]:
            doc = Document(filepath)
            return "\n".join(p.text for p in doc.paragraphs)
        elif ext == ".txt":
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        else:
            raise ValueError(f"Unsupported file type: {ext}")

    def split_sections(self, text):
        paragraphs = re.split(r"\n\s*\n", text)
        sections = defaultdict(list)
        current = 'header'
        for para in paragraphs:
            if not para.strip():
                continue
            first_line = para.strip().splitlines()[0].strip().lower()
            for sec, keys in self.SECTION_KEYWORDS.items():
                if any(first_line.startswith(k) for k in keys):
                    current = sec
                    content = '\n'.join(para.splitlines()[1:]).strip()
                    if content:
                        sections[current].append(content)
                    break
            else:
                sections[current].append(para.strip())
        return sections

    def extract_contact_info(self, text):
        email = re.search(r"[\w\.-]+@[\w\.-]+", text)
        phone = re.search(r"(\+?\d[\d\-\s\(\)]{7,}\d)", text)
        linkedin = re.search(r"https?://[\w./]*linkedin\.com/[^\s]+", text)
        return {
            'email': email.group() if email else None,
            'phone': phone.group() if phone else None,
            'linkedin': linkedin.group() if linkedin else None
        }

    def extract_name(self, text):
        doc = self.nlp(text)
        for ent in doc.ents:
            if ent.label_ == 'PERSON':
                return ent.text
        parts = text.split()
        return ' '.join(parts[:2]) if len(parts) >= 2 else None

    def extract_dates(self, text):
        pattern = r"([A-Za-z]{3,9}\s+\d{4})\s*[-–—]\s*([A-Za-z]{3,9}\s+\d{4}|Present)"
        matches = re.findall(pattern, text)
        date_ranges = []
        for start, end in matches:
            s = parse_date(start)
            e = datetime.today() if end.lower() == 'present' else parse_date(end)
            if s and e:
                date_ranges.append({'start': s, 'end': e})
        return date_ranges

    def extract_skills(self, text):
        matcher = PhraseMatcher(self.nlp.vocab, attr='LOWER')
        matcher.add("SKILL", [self.nlp(skill) for skill in self.skill_list])
        doc = self.nlp(text)
        return sorted({doc[s:e].text for _, s, e in matcher(doc)})

    def calculate_total_years(self, date_ranges):
        total_days = sum((d['end'] - d['start']).days for d in date_ranges)
        years_float = total_days / 365.0
        return round(years_float, 2)

    def parse(self, path):
        raw = self.extract_text(path)
        contact = self.extract_contact_info(raw)
        sections = self.split_sections(raw)

        all_dates = []
        data = {
            'raw_text': raw,
            'name': self.extract_name(' '.join(sections.get('header', []))),
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
            dates = self.extract_dates(para)
            all_dates.extend(dates)
            duration = self.calculate_total_years(dates) if dates else 0.0
            data['experience'].append({
                'entry': para,
                'dates': dates,
                'duration_years': duration
            })

        total_experience = self.calculate_total_years(all_dates)
        data['total_experience_years'] = total_experience

        data['skills'] = self.extract_skills(' '.join(sections.get('skills', [])))

        return data
