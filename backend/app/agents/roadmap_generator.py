"""
Agent 4: Learning and Career Roadmap Agent
Combines personalized roadmap, learning resources, projects, and certifications based on skill gaps.
Organizes learning into logical milestones.
"""
import json
from ..services.llm_service import is_llm_available, generate_llm_response


class LearningAndCareerRoadmapAgent:

    def generate_roadmap(self, gap_report, profile_summary=None):
        target_role = gap_report.get("target_role", "Software Developer")
        priority_gaps = gap_report.get("priority_gaps", ["SQL", "Data Structures"])

        if is_llm_available():
            try:
                prompt = (
                    f"Target Role: {target_role}\n"
                    f"Gap Report: {json.dumps(gap_report)}\n"
                    "Generate structured roadmap JSON with:\n"
                    "- roadmap_title: string\n"
                    "- milestones: array of objects with keys:\n"
                    "    milestone_order (int), title (string), description (string), skills (array of strings), estimated_weeks (int),\n"
                    "    resources: array of objects { title: string, type: string, url: string },\n"
                    "    projects: array of objects { title: string, description: string }\n"
                    "- certifications: array of objects { title: string, provider: string }\n"
                    "- career_tips: array of strings"
                )
                sys_inst = "You are a Learning and Career Roadmap AI Agent. Return raw valid JSON."
                res = generate_llm_response(prompt, sys_inst)
                if res:
                    cleaned = res.strip().strip("```json").strip("```").strip()
                    parsed = json.loads(cleaned)
                    if isinstance(parsed, dict) and isinstance(parsed.get("milestones"), list) and len(parsed["milestones"]) > 0:
                        # Normalize milestones
                        for idx, m in enumerate(parsed["milestones"], 1):
                            if isinstance(m, dict):
                                if "resources" in m and isinstance(m["resources"], list):
                                    m["resources"] = [
                                        r if isinstance(r, dict) else {"title": str(r), "type": "Course", "url": "https://coursera.org"}
                                        for r in m["resources"]
                                    ]
                                if "projects" in m and isinstance(m["projects"], list):
                                    m["projects"] = [
                                        p if isinstance(p, dict) else {"title": str(p), "description": "Hands-on implementation project"}
                                        for p in m["projects"]
                                    ]
                        if "certifications" in parsed and isinstance(parsed["certifications"], list):
                            parsed["certifications"] = [
                                c if isinstance(c, dict) else {"title": str(c), "provider": "Coursera / Meta"}
                                for c in parsed["certifications"]
                            ]
                        return parsed
            except Exception as e:
                print(f"Roadmap LLM call error, using deterministic roadmap structure: {e}")

        # High-quality deterministic roadmap structure
        milestones = [
            {
                "milestone_order": 1,
                "title": "Foundation & Core Fundamentals",
                "description": f"Master essential core programming, syntax, and foundational tools required for {target_role}.",
                "skills": ["Data Structures", "Git & GitHub Basics", "Core Syntax"],
                "estimated_weeks": 3,
                "resources": [
                    {"title": "Interactive Python/JS Data Structures", "type": "Course", "url": "https://freecodecamp.org"},
                    {"title": "Git & GitHub Mastery Guide", "type": "Documentation", "url": "https://git-scm.com/doc"}
                ],
                "projects": [
                    {"title": "CLI Inventory & Task Manager", "description": "Build a command-line tool using core data structures and Git version control."}
                ]
            },
            {
                "milestone_order": 2,
                "title": "Intermediate Mastery & Priority Gaps",
                "description": f"Bridge key identified priority gaps: {', '.join(priority_gaps)}.",
                "skills": priority_gaps + ["REST APIs", "Relational Database Design"],
                "estimated_weeks": 4,
                "resources": [
                    {"title": f"Complete {priority_gaps[0] if priority_gaps else 'SQL'} Deep Dive", "type": "Course", "url": "https://coursera.org"},
                    {"title": "Database Schema Design & Indexing", "type": "Article", "url": "https://dev.to"}
                ],
                "projects": [
                    {"title": "Relational Data Analytics Dashboard", "description": f"Design a normalized database schema and connect to backend APIs using {priority_gaps[0] if priority_gaps else 'SQL'}."}
                ]
            },
            {
                "milestone_order": 3,
                "title": "Advanced Engineering & System Patterns",
                "description": "Implement modern application architecture, query optimization, security, and state management.",
                "skills": ["API Optimization", "Authentication & Security", "Unit Testing"],
                "estimated_weeks": 3,
                "resources": [
                    {"title": "Modern App Architecture & Security", "type": "Video Series", "url": "https://youtube.com"},
                    {"title": "Testing & Debugging Best Practices", "type": "Docs", "url": "https://pytest.org"}
                ],
                "projects": [
                    {"title": "Production-Ready Full Stack App with Auth", "description": "Build an end-to-end full stack web application with JWT authentication and test coverage."}
                ]
            },
            {
                "milestone_order": 4,
                "title": "Capstone Project & Portfolio Building",
                "description": "Demonstrate comprehensive end-to-end expertise with an industry-relevant capstone project.",
                "skills": ["System Integration", "Deployment & CI/CD", "Performance Monitoring"],
                "estimated_weeks": 4,
                "resources": [
                    {"title": "Free Tier Deployment Guide (Vercel & Render)", "type": "Article", "url": "https://render.com/docs"}
                ],
                "projects": [
                    {"title": f"AI-Enhanced {target_role} Industry Platform", "description": "Create a feature-rich, deployed web application featuring live APIs and responsive design."}
                ]
            },
            {
                "milestone_order": 5,
                "title": "Mock Interview & Career Readiness",
                "description": f"Prepare for technical interviews, practice live coding challenges, and polish resume for {target_role}.",
                "skills": ["Technical Interviewing", "Behavioral Answers", "Resume Polish"],
                "estimated_weeks": 2,
                "resources": [
                    {"title": "Top Tech Interview Problem Patterns", "type": "Interactive Practice", "url": "https://leetcode.com"},
                    {"title": "STAR Method Behavioral Interview Strategy", "type": "Guide", "url": "https://linkedin.com"}
                ],
                "projects": []
            }
        ]

        certifications = [
            {"title": f"Professional Certification in {target_role}", "provider": "Coursera / Meta"},
            {"title": "AWS Certified Cloud Practitioner (Optional)", "provider": "Amazon Web Services"}
        ]

        career_tips = [
            "Maintain an active GitHub green graph by committing project milestones daily.",
            "Write short technical breakdown posts on LinkedIn to highlight your capstone building process.",
            "Take mock interview sessions regularly to improve speaking pace and technical explanation structure."
        ]

        return {
            "roadmap_title": f"{target_role} Career Roadmap",
            "target_role": target_role,
            "milestones": milestones,
            "certifications": certifications,
            "career_tips": career_tips
        }
