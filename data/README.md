# Datasets & Knowledge Base — AI Career Mentor Agent

## Academic Project Details
- **Course**: Bachelor of Computer Applications (BCA)
- **Institution**: Birla Institute of Technology, Mesra (BIT Mesra)
- **Team**: Riya Rani [BCA/40009/24], Shambhavi Shrivastava [BCA/40010/24], Divyanka Singh [BCA/40026/24], Puja Sharma [BCA/40031/24]

---

## Directory Overview

```
data/
├── raw/           # Raw inputs, reference resumes, and baseline job description benchmarks
├── processed/     # Extracted text corpora, processed skill keywords, and role mappings
└── sample/        # Reference sample student profiles and test resume documents
```

### 1. `data/raw/`
Contains baseline role definitions and required skill benchmarks used by the **Skill Gap Analysis Agent** and **Roadmap Agent** to assess candidate readiness against industry targets (e.g. Software Developer, Frontend Developer, Backend Engineer, Data Analyst, Cloud DevOps Engineer).

### 2. `data/processed/`
Stores temporary or cached structured resume JSON documents extracted by PyPDF and python-docx.

### 3. `data/sample/`
Provides standardized sample student profile data and test resume structures used during development, unit testing, and demonstration.
