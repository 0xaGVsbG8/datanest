import requests, pyperclip

def ask_ai_for_solution():
    url = "http://localhost:1234/v1/chat/completions"
    # url = "https://api.openai.com/v1/chat/completions"

    API_KEY = 'local'
    # API_KEY = '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'



    CONTENT = f"""
    nginx: [emerg] unexpected "server_name" in /etc/nginx/nginx.conf:3
    nginx: configuration file /etc/nginx/nginx.conf test failed
    give the minimal fix.
    """

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "google/gemma-3-4b",
        "model": "gpt-4o-mini",
        "messages": [
            # {"role": "user", "content": "Napisz hello world w Pythonie"}
            {"role": "user", "content":  CONTENT}
            
        ],
        "temperature": 0.2
    }

    response = requests.post(url,headers=headers, json=payload)
    content = response.json()["choices"][0]["message"]["content"]
    clean = content.replace("```python", "").replace("```", "").strip()

    print(clean)
    pyperclip.copy(clean)



ask_ai_for_solution()