import os, sys, json, urllib.request, urllib.error

API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = os.environ.get("GLM_MODEL", "z-ai/glm-5.2")
KEY = os.environ.get("OPENROUTER_API_KEY", "")

def call(messages, max_tokens=6000):
    body = json.dumps({
        "model": MODEL, "messages": messages,
        "max_tokens": max_tokens, "temperature": 0.1,
    }).encode("utf-8")
    req = urllib.request.Request(API_URL, data=body, method="POST")
    req.add_header("Authorization", f"Bearer {KEY}")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read().decode("utf-8"))

def main():
    prompt_file, out_file = sys.argv[1], sys.argv[2]
    with open(prompt_file, "r", encoding="utf-8") as f:
        prompt = f.read()
    res = call([{"role": "user", "content": prompt}])
    msg = res["choices"][0]["message"]
    content = msg.get("content") or msg.get("reasoning") or "[empty]"
    u = res.get("usage", {})
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(content)
    print("finish:", res["choices"][0].get("finish_reason"),
          "| tokens p/c:", u.get("prompt_tokens"), u.get("completion_tokens"),
          "| wrote", out_file)

if __name__ == "__main__":
    main()
