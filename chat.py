
from groq_client import ask_groq


def generate_chat_response(data):

    if not data:

        return "No grocery data available."

    prompt = f"""
    Convert this grocery data into a clean user-friendly grocery report.

    Grocery Data:
    {data}

    Add:
    - emojis
    - readable formatting
    - price highlights
    - cheapest observations
    """

    try:

        response = ask_groq(prompt)

        return response

    except Exception as e:

        print("Chat Error:", e)

        return "Unable to generate grocery report."

