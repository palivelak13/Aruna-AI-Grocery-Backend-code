from groq_client import ask_groq
import json


def evaluate(data):

    prompt = f"""
You are an AI grocery validator.

Analyze grocery pricing data.

Check:
- fake prices
- unrealistic prices
- missing fields
- duplicates
- quality

Return JSON only:

{{
  "score": 95,
  "status": "GOOD",
  "issues": []
}}

Data:
{json.dumps(data)}
"""

    try:

        result = ask_groq(prompt)

        parsed = json.loads(result)

        return parsed

    except Exception as e:

        return {

            "score": 50,

            "status": "UNKNOWN",

            "issues": [str(e)]

        }