import os, sys, json, urllib.request, urllib.error

API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = os.environ.get("GLM_MODEL", "z-ai/glm-5.2")
KEY = os.environ.get("OPENROUTER_API_KEY", "")

def extract(res):
    msg = res["choices"][0]["message"]
    content = msg.get("content")
    if content:
        return content.strip()
    # reasoning models may put text under reasoning when truncated
    r = msg.get("reasoning")
    if r:
        return "[no final answer — model still reasoning; partial thoughts below]\n" + r.strip()
    return "[empty response]"

def call(messages, max_tokens=4000):
    body = json.dumps({
        "model": MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.3,
    }).encode("utf-8")
    req = urllib.request.Request(API_URL, data=body, method="POST")
    req.add_header("Authorization", f"Bearer {KEY}")
    req.add_header("Content-Type", "application/json")
    req.add_header("HTTP-Referer", "http://localhost/excellent-driving")
    req.add_header("X-Title", "Excellent Driving Maquette Review")
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            data = json.loads(r.read().decode("utf-8"))
        return True, data
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')}"
    except Exception as e:
        return False, f"ERR: {e}"

def main():
    if not KEY:
        print("NO KEY in OPENROUTER_API_KEY"); sys.exit(1)

    if sys.argv[1:] and sys.argv[1] == "--test":
        ok, res = call([{"role": "user", "content": "Reply with exactly: PONG"}], max_tokens=20)
        if ok:
            try:
                msg = res["choices"][0]["message"]["content"]
                print("OK model:", res.get("model"), "| reply:", msg.strip())
            except Exception:
                print("OK but unexpected shape:", json.dumps(res)[:600])
        else:
            print("FAIL:", res[:800])
        return

    # Review mode: each remaining arg is a file to review
    files = sys.argv[1:]
    out_md = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_review_output.md")
    chunks = ["# GLM-5.2 Review of Excellent Driving Maquettes\n",
              f"_Model: {MODEL} · provider via OpenRouter_\n"]
    for f in files:
        name = os.path.basename(f)
        with open(f, "r", encoding="utf-8") as fh:
            html = fh.read()
        # trim only pathologically large files; spec maquettes fit whole
        if len(html) > 60000:
            html = html[:60000] + "\n<!-- [truncated for review] -->"
        prompt = (
            "You are a senior UI/UX and front-end reviewer. Review this standalone HTML maquette "
            "for a driving-school website (brand: navy #0F1F3D + amber #F5A623, fonts Sora + Inter, "
            "must be mobile-responsive and fully interactive with vanilla JS, no external libraries).\n\n"
            f"File: {name}\n\n"
            "Give concise, actionable feedback in these sections:\n"
            "1. Design & visual polish (max 3 points)\n"
            "2. Interactivity / UX issues (max 3 points)\n"
            "3. Accessibility (max 2 points)\n"
            "4. Responsiveness risks (max 2 points)\n"
            "5. One top priority fix.\n"
            "Be specific and brief. Here is the file:\n\n```html\n" + html + "\n```"
        )
        print("Reviewing:", name, "...")
        ok, res = call([{"role": "user", "content": prompt}], max_tokens=4500)
        chunks.append(f"\n\n---\n\n## {name}\n")
        if ok:
            try:
                chunks.append(extract(res))
                u = res.get("usage", {})
                chunks.append(f"\n\n_[tokens: prompt={u.get('prompt_tokens')} completion={u.get('completion_tokens')}]_")
                print("   ok")
            except Exception as ex:
                chunks.append(f"_Unexpected response shape: {ex}_")
                print("   shape error")
        else:
            chunks.append(f"_API FAIL: {res[:400]}_")
            print("   FAIL:", res[:200])
    with open(out_md, "w", encoding="utf-8") as fh:
        fh.write("\n".join(chunks))
    print("\nWrote", out_md)

if __name__ == "__main__":
    main()
