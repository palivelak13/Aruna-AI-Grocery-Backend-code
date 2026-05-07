from groq import Groq
from dotenv import load_dotenv
import os

# Load .env
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key or api_key == "YOUR_KEY":
    raise ValueError("❌ GROQ_API_KEY not set correctly. Check your .env file.")

print("DEBUG KEY:", api_key[:10], "...")

client = Groq(api_key=api_key)

def ask_groq(prompt):
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
        )

        return response.choices[0].message.content

    except Exception as e:
        print("Groq Error:", e)
        return ""