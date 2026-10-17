"""
Agent 5: Mock Interview Agent
Acts as an AI interviewer. Generates questions dynamically based on target role,
evaluates student answers, creates adaptive follow-up questions, and generates comprehensive evaluation reports.
"""
import json
from ..services.llm_service import is_llm_available, generate_llm_response

QUESTION_BANKS = {
    "Software Developer": [
        "Tell me about yourself and your background in software development.",
        "Can you explain the difference between a Process and a Thread in operating systems?",
        "Describe a challenging project you built. What architecture choices did you make and how did your frontend communicate with the backend?",
        "How do SQL joins work, and what is the difference between an INNER JOIN and a LEFT JOIN?",
        "If your web app experiences slow page load times, how would you troubleshoot and optimize performance?"
    ],
    "Data Analyst": [
        "Tell me about your experience analyzing datasets and what tools you prefer using.",
        "How do you handle missing or corrupted data during data cleaning in Python or SQL?",
        "What is the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL?",
        "How would you present complex statistical insights to business stakeholders who do not have a technical background?",
        "Can you explain standard deviation and how you detect outliers in a dataset?"
    ],
    "AI/ML Engineer": [
        "Walk me through an ML model you trained. What algorithm did you choose and why?",
        "What is overfitting in Machine Learning, and what techniques do you use to prevent it?",
        "Explain the difference between supervised and unsupervised learning with real-world examples.",
        "How do precision, recall, and F1-score differ, and when would you optimize for recall over precision?",
        "What challenges exist when deploying machine learning models into production?"
    ],
    "General": [
        "Tell me about yourself and your primary technical skills.",
        "Describe a complex project you worked on recently and the technical challenges you resolved.",
        "How do you stay updated with new technologies and frameworks?",
        "Tell me about a time when you faced a bug that was difficult to reproduce. How did you resolve it?",
        "Where do you see your career in the next 2 to 3 years?"
    ]
}


class MockInterviewAgent:

    def generate_questions(self, target_role, mode="Technical", profile=None):
        bank = QUESTION_BANKS.get(target_role, QUESTION_BANKS.get("Software Developer", QUESTION_BANKS["General"]))
        if mode == "HR":
            return [
                "Tell me about yourself and why you are interested in this role.",
                "Describe a situation where you had to work with a difficult team member or under tight deadlines.",
                "What are your key strengths and what area are you currently working to improve?",
                "Where do you see yourself professionally in the next 3 years?",
                "Do you have any questions for us about the team or role?"
            ]
        return bank

    def evaluate_answer(self, question, answer, target_role):
        length = len(answer.strip()) if answer else 0

        if is_llm_available():
            try:
                prompt = f"Target Role: {target_role}\nQuestion: {question}\nStudent Answer: {answer}\nEvaluate answer. Return JSON with evaluation_score (0-100), evaluation_feedback, weak_points (list)."
                sys_inst = "You are a senior technical interviewer. Evaluate answer accuracy and depth. Return raw valid JSON."
                res = generate_llm_response(prompt, sys_inst)
                if res:
                    cleaned = res.strip().strip("```json").strip("```").strip()
                    return json.loads(cleaned)
            except Exception as e:
                print(f"Mock interview LLM call error, using deterministic evaluation: {e}")

        # Deterministic evaluation logic
        if length < 10:
            score = 45
            feedback = "Answer is very brief. Try elaborating with concrete technical examples and structured explanations."
            weak_points = ["Answer depth", "Lack of technical details"]
        elif length < 50:
            score = 72
            feedback = "Good start! Your core point is correct, but expanding on implementation steps or edge cases will strengthen your response."
            weak_points = ["Elaboration on edge cases"]
        else:
            score = 88
            feedback = "Excellent answer! You demonstrated solid technical understanding, clear communication, and structured thought process."
            weak_points = []

        return {
            "evaluation_score": score,
            "evaluation_feedback": feedback,
            "weak_points": weak_points
        }

    def generate_followup(self, question, answer):
        answer_lower = answer.lower()
        if "react" in answer_lower or "flask" in answer_lower or "api" in answer_lower:
            return "You mentioned APIs and frameworks. How did you handle error handling and state management across your frontend and backend?"
        elif "sql" in answer_lower or "database" in answer_lower:
            return "That's a good explanation of database tables. How do you approach indexing and query performance optimization when table sizes grow large?"
        elif "project" in answer_lower:
            return "What was the single biggest engineering tradeoff or bug you encountered during that project, and how did you resolve it?"
        else:
            return "Could you provide a specific code or scenario example to illustrate how you apply that concept?"

    def generate_final_report(self, target_role, mode, qa_pairs, presentation_cues=None):
        if not qa_pairs:
            qa_pairs = []

        scores = [item.get("score", 75) for item in qa_pairs]
        avg_score = int(sum(scores) / len(scores)) if scores else 80

        # Collect weak areas
        all_weak = []
        for item in qa_pairs:
            all_weak.extend(item.get("weak_points", []))

        weak_areas = list(set(all_weak))
        if not weak_areas:
            weak_areas = ["SQL Query Optimization", "Elaborating on edge cases during technical answers"]

        strong_areas = [
            f"Solid foundational knowledge in {target_role} concepts",
            "Clear explanation of project development experience",
            "Good engagement and communication structure"
        ]

        recommendations = [
            "Practice explaining database joins and query optimization with concrete examples",
            "Use the STAR (Situation, Task, Action, Result) method for behavioral questions",
            "Review core data structures and system design fundamentals"
        ]

        pres_score = 82
        if presentation_cues:
            # presentation cues assessment
            pres_score = 85 if presentation_cues.get("camera_engagement") == "Good" else 78

        return {
            "target_role": target_role,
            "overall_score": avg_score,
            "tech_score": min(100, avg_score + 2),
            "relevance_score": min(100, avg_score + 4),
            "comm_score": min(100, avg_score - 2),
            "pace_score": 78,
            "presentation_score": pres_score,
            "project_score": min(100, avg_score + 5),
            "feedback_summary": f"Overall solid interview session for {target_role}. You displayed good technical understanding and articulate answers.",
            "weak_areas": weak_areas,
            "strong_areas": strong_areas,
            "recommendations": recommendations
        }
