"""
Agent 1: Career Mentor Orchestrator Agent
Central coordinator of the multi-agent system.
Directs tasks to specialized agents, maintains context, chains workflows, and notifies ProgressTrackingService.
"""
from .resume_analyzer import ResumeAndProfileAnalysisAgent
from .skill_gap_analyzer import SkillGapAnalysisAgent
from .roadmap_generator import LearningAndCareerRoadmapAgent
from .mock_interviewer import MockInterviewAgent
from ..services.progress_service import update_progress_on_event


class CareerMentorOrchestratorAgent:

    def __init__(self):
        self.resume_agent = ResumeAndProfileAnalysisAgent()
        self.skill_gap_agent = SkillGapAnalysisAgent()
        self.roadmap_agent = LearningAndCareerRoadmapAgent()
        self.mock_interview_agent = MockInterviewAgent()

    def process_resume_and_assessment(self, user_id, resume_text, assessment_data=None):
        """
        Workflow: Resume + Assessment -> Resume Analysis Agent -> Progress Tracking
        """
        profile = self.resume_agent.analyze(resume_text, assessment_data)

        # Notify Progress Tracking Service
        update_progress_on_event(user_id, "RESUME_ANALYZED", {"score": profile.get("resume_score", 80)})
        return profile

    def process_role_matching(self, profile, preferred_roles=None):
        """
        Workflow for Path 2 & Path 3: Profile + Assessment -> Career Role Matching
        """
        matches = self.skill_gap_agent.match_roles(profile, preferred_roles)
        return matches

    def process_skill_gap_and_roadmap(self, user_id, profile, target_role, target_company=None):
        """
        Workflow: Target Role -> Skill Gap Agent -> Roadmap Agent -> Progress Tracking
        """
        # Step 1: Skill Gap Analysis
        gap_report = self.skill_gap_agent.analyze_gaps(profile, target_role, target_company)

        # Step 2: Roadmap Generation
        roadmap_data = self.roadmap_agent.generate_roadmap(gap_report, profile.get("profile_summary"))

        # Step 3: Progress Events
        update_progress_on_event(user_id, "SKILL_GAP_ANALYZED", {"target_role": target_role})
        update_progress_on_event(user_id, "ROADMAP_GENERATED", {"target_role": target_role})

        return {
            "skill_gap": gap_report,
            "roadmap": roadmap_data
        }

    def process_interview_feedback_loop(self, user_id, weak_areas, profile, target_role):
        """
        Feedback Loop: Weak areas from Mock Interview -> Orchestrator -> Skill Gap -> Roadmap -> Progress
        """
        if not weak_areas:
            return

        # Add weak areas to profile skills context as missing/weak
        updated_profile = dict(profile) if profile else {}
        existing_skills = list(updated_profile.get("skills", []))
        # Ensure weak areas are passed to gap analyzer
        gap_report = self.skill_gap_agent.analyze_gaps(updated_profile, target_role)
        gap_report["priority_gaps"] = list(set(gap_report.get("priority_gaps", []) + weak_areas))

        roadmap_data = self.roadmap_agent.generate_roadmap(gap_report)
        update_progress_on_event(user_id, "MOCK_INTERVIEW_COMPLETED", {"weak_areas": weak_areas})

        return {
            "updated_gap": gap_report,
            "updated_roadmap": roadmap_data
        }
