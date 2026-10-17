"""
AI Career Mentor Agent — Verification & Quality Assurance Script

Academic Project Details:
- Course: Bachelor of Computer Applications (BCA)
- Institution: Birla Institute of Technology, Mesra (BIT Mesra)
- Team Members:
  - Riya Rani [BCA/40009/24]
  - Shambhavi Shrivastava [BCA/40010/24]
  - Divyanka Singh [BCA/40026/24]
  - Puja Sharma [BCA/40031/24]

This script:
1. Runs the backend pytest automated test suite.
2. Checks frontend production compilation via Vite.
3. Reports comprehensive test and build status.
"""
import os
import sys
import subprocess

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

def run_step(step_name, command, cwd):
    print(f"\n=======================================================")
    print(f"[*] Running: {step_name}")
    print(f"[*] Working Directory: {cwd}")
    print(f"[*] Command: {' '.join(command) if isinstance(command, list) else command}")
    print(f"=======================================================")
    result = subprocess.run(command, cwd=cwd, shell=True)
    if result.returncode != 0:
        print(f"[!] FAILED: {step_name} exited with code {result.returncode}")
        return False
    print(f"[OK] PASSED: {step_name}")
    return True

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("\nAI Career Mentor Agent - Project Verification Suite")
    print("Birla Institute of Technology, Mesra - BCA 2024-2027\n")

    # Step 1: Run Backend Tests
    backend_ok = run_step(
        "Backend Pytest Automated Test Suite",
        f'"{sys.executable}" -m pytest',
        backend_dir
    )

    # Step 2: Test Frontend Build
    frontend_ok = run_step(
        "Frontend Vite Production Bundle Build",
        "npm run build",
        frontend_dir
    )

    print("\n=======================================================")
    print("VERIFICATION SUMMARY")
    print("=======================================================")
    print(f"Backend Tests : {'PASSED' if backend_ok else 'FAILED'}")
    print(f"Frontend Build: {'PASSED' if frontend_ok else 'FAILED'}")

    if backend_ok and frontend_ok:
        print("\n[OK] ALL CHECKS PASSED: The project is completely verified and production-ready!\n")
        sys.exit(0)
    else:
        print("\n[!] VERIFICATION FAILED: Please inspect errors above.\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
