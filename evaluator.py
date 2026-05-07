from groq_client import ask_groq

def evaluate(data):
    prompt = f"""
    Evaluate grocery price data quality.

    Score from 0 to 100 based on:
    - completeness
    - correctness
    - realistic prices

    Return only number.

    Data:
    {data}
    """

    result = ask_groq(prompt)

    try:
        return float(result)
    except:
        return 50.0