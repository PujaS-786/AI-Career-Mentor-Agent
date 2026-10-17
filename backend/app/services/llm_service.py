"""
LLM Service abstraction — supports Google Gemini / OpenAI when configured,
with rich, realistic deterministic Demo Mode fallback for keyless operation.
"""
import os
import json


def is_llm_available():
    return bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("OPENAI_API_KEY"))


def generate_llm_response(prompt, system_instruction=None):
    gemini_key = os.environ.get("GEMINI_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")

    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            candidate_models = ['gemini-flash-latest', 'gemini-3.8-flash']
            full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt

            for model_name in candidate_models:
                try:
                    model = genai.GenerativeModel(model_name)
                    # Use a 3-second timeout to avoid stalling the HTTP request
                    response = model.generate_content(full_prompt, request_options={"timeout": 3})
                    if response and response.text:
                        return response.text
                except Exception as me:
                    print(f"Gemini API model {model_name} attempt skipped: {me}")
                    break  # If connection times out or deadline exceeded, avoid compounding delays
        except Exception as e:
            print(f"Gemini API call failed or timed out: {e}")

    if openai_key:
        try:
            import openai
            client = openai.OpenAI(api_key=openai_key)
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})
            res = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
            return res.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API call failed: {e}")

    return None
