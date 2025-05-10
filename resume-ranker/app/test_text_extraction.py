from app.parser import ResumeParser

def test_extract_text():
    parser = ResumeParser()
    sample_resume_path = "resume-ranker/resumes/ibrahimresume.pdf"
    text = parser.extract_text(sample_resume_path)
    print("Extracted text preview:")
    print(text[:1000])  # Print first 1000 characters

if __name__ == "__main__":
    test_extract_text()
