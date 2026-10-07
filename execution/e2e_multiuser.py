"""Multi-user end-to-end API test against a live CareerBridge backend.

Creates several users (directly in the DB, bypassing Google OAuth) with distinct
sessions, then exercises every authenticated endpoint with different data,
checks cross-user isolation, input validation and CSRF, and runs the users
concurrently.

Usage:
    set DATABASE_URL=sqlite:///.tmp/e2e.db   (a COPY of the real db)
    py -m uvicorn backend.main:app --port 8010
    py execution/e2e_multiuser.py http://localhost:8010 .tmp/e2e.db
"""
import hashlib
import secrets
import sqlite3
import sys
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta

import requests

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8010"
DB = sys.argv[2] if len(sys.argv) > 2 else ".tmp/e2e.db"
ORIGIN = {"Origin": "http://localhost:3000"}

FAILS: list[str] = []
PASSES = 0


def check(name: str, cond: bool, detail: str = "") -> bool:
    global PASSES
    if cond:
        PASSES += 1
    else:
        FAILS.append(f"{name} {detail}")
        print(f"  FAIL: {name} {detail}")
    return cond


class User:
    def __init__(self, label, skills, resume_text, remote_only, salary):
        self.label, self.skills, self.resume_text = label, skills, resume_text
        self.remote_only, self.salary = remote_only, salary
        self.email = f"e2e-{label}-{uuid.uuid4().hex[:6]}@example.test"
        self.id = str(uuid.uuid4())
        self.token = secrets.token_urlsafe(48)
        self.csrf = secrets.token_urlsafe(16)
        self.s = requests.Session()
        self.s.cookies.set("cb_session", self.token, domain="localhost.local")
        self.s.cookies.set("cb_csrf", self.csrf, domain="localhost.local")

    def create_in_db(self):
        con = sqlite3.connect(DB)
        now = datetime.utcnow()
        con.execute("INSERT INTO users (id,email,full_name,google_subject,created_at) VALUES (?,?,?,?,?)",
                    (self.id, self.email, f"E2E {self.label}", f"sub-{self.id}", now))
        con.execute("INSERT INTO profiles (id,user_id) VALUES (?,?)", (str(uuid.uuid4()), self.id))
        con.execute("INSERT INTO user_sessions (id,user_id,token_hash,expires_at,created_at) VALUES (?,?,?,?,?)",
                    (str(uuid.uuid4()), self.id, hashlib.sha256(self.token.encode()).hexdigest(),
                     now + timedelta(days=1), now))
        con.commit()
        con.close()

    def call(self, method, path, csrf=True, **kw):
        headers = dict(ORIGIN)
        headers.update(kw.pop("headers", {}))
        if csrf:
            headers["X-CSRF-Token"] = self.csrf
        # send cookies explicitly (host is localhost)
        cookies = {"cb_session": self.token, "cb_csrf": self.csrf}
        t0 = time.time()
        resp = requests.request(method, BASE + path, headers=headers, cookies=cookies, timeout=120, **kw)
        dt = time.time() - t0
        if dt > 5:
            print(f"  SLOW ({dt:.1f}s): {method} {path} [{self.label}]")
        return resp


def run_user(u: User, roles: list[dict]) -> dict:
    t = f"[{u.label}]"
    out = {}
    r = u.call("GET", "/api/auth/me")
    check(f"{t} me", r.status_code == 200 and r.json()["email"] == u.email, r.text[:120])

    # --- profile
    role = roles[hash(u.label) % len(roles)]
    out["role"] = role
    r = u.call("PUT", "/api/profile", json={"bio": f"bio of {u.label}", "current_title": f"{u.label} dev",
                                              "experience_level": "Junior", "education_level": "B.Tech",
                                              "target_role_id": role["id"]})
    check(f"{t} profile put", r.status_code == 200 and r.json().get("target_role_id") == role["id"], r.text[:200])
    r = u.call("GET", "/api/profile")
    check(f"{t} profile get persisted", r.status_code == 200 and r.json().get("bio") == f"bio of {u.label}", r.text[:200])
    r = u.call("PUT", "/api/profile", json={"target_role_id": "does-not-exist"})
    check(f"{t} profile bad role 404", r.status_code == 404, str(r.status_code))

    # --- skills
    ids = {}
    for name, prof in u.skills:
        r = u.call("POST", "/api/skills/user", json={"skill_name": name, "proficiency": prof})
        ok = check(f"{t} add skill {name}", r.status_code == 200 and r.json()["proficiency"] == prof, r.text[:200])
        if ok:
            ids[name] = r.json()["id"]
    if u.skills:
        r = u.call("POST", "/api/skills/user", json={"skill_name": u.skills[0][0], "proficiency": "Strong"})
        check(f"{t} re-add updates proficiency (no dup)", r.status_code == 200 and r.json()["proficiency"] == "Strong")
    r = u.call("GET", "/api/skills/user")
    names = [x["skill_name"].lower() for x in r.json()] if r.ok else []
    check(f"{t} user skills count", r.ok and len(r.json()) == len(u.skills), f"got {len(names)} expected {len(u.skills)}")
    r = u.call("POST", "/api/skills/user", json={"skill_name": "X", "proficiency": "Godlike"})
    check(f"{t} bad proficiency 422", r.status_code == 422, str(r.status_code))
    r = u.call("POST", "/api/skills/user", json={"skill_name": "", "proficiency": "Strong"})
    check(f"{t} empty skill 422", r.status_code == 422, str(r.status_code))
    out["skill_ids"] = list(r.json() and [x["id"] for x in u.call("GET", "/api/skills/user").json()])

    # --- recommendations
    r = u.call("POST", "/api/careers/recommend")
    ok = check(f"{t} recommend", r.status_code == 200 and r.json().get("recommendations"), r.text[:200])
    if ok:
        recs = r.json()["recommendations"]
        scores = [x["match_score"] for x in recs]
        check(f"{t} recommend sorted desc", scores == sorted(scores, reverse=True))
        check(f"{t} recommend scores in range", all(0 <= s <= 100 for s in scores))
        out["top_rec"] = recs[0]["title"]

    # --- skill gap
    r = u.call("POST", "/api/skill-gap/analyze", json={"role_id": role["id"]})
    ok = check(f"{t} gap analyze", r.status_code == 200, r.text[:200])
    if ok:
        g = r.json()
        check(f"{t} gap counts add up", g["matched_count"] + g["partial_count"] + g["missing_count"] == g["total_required"], str(g)[:200])
        check(f"{t} gap score range", 0 <= g["readiness_score"] <= 100)
        out["score"] = g["readiness_score"]
    r = u.call("GET", "/api/skill-gap/current")
    check(f"{t} gap current", r.status_code == 200 and r.json()["role_id"] == role["id"], r.text[:150])
    r = u.call("POST", "/api/skill-gap/analyze", json={"role_id": "nope"})
    check(f"{t} gap bad role 404", r.status_code == 404, str(r.status_code))

    # --- roadmap
    r = u.call("POST", "/api/roadmap/generate")
    ok = check(f"{t} roadmap generate", r.status_code == 200 and r.json().get("phases"), r.text[:200])
    if ok:
        rm = r.json()
        phases = rm["phases"]
        out["roadmap"] = rm
        ph = phases[0]
        goals = ph.get("learning_goals") or []
        if goals:
            r2 = u.call("PATCH", f"/api/roadmap/items/{ph['id']}", json={"completed_goals": goals[:1]})
            check(f"{t} roadmap tick goal", r2.status_code == 200, r2.text[:200])
            if r2.ok:
                check(f"{t} progress > 0", r2.json()["current_progress"] > 0, str(r2.json()["current_progress"]))
            r3 = u.call("PATCH", f"/api/roadmap/items/{ph['id']}", json={"completed_goals": ["bogus goal"]})
            check(f"{t} roadmap invalid goal 422", r3.status_code == 422, str(r3.status_code))
            r4 = u.call("PATCH", f"/api/roadmap/items/{ph['id']}", json={"completed_goals": goals})
            if r4.ok:
                st = [p for p in r4.json()["phases"] if p["id"] == ph["id"]][0]["status"]
                check(f"{t} phase completes when all goals done", st == "completed", st)
    r = u.call("GET", "/api/roadmap/current")
    check(f"{t} roadmap current", r.status_code == 200, r.text[:150])

    # --- preferences
    r = u.call("PUT", "/api/preferences", json={"salary_expectation": u.salary, "remote_only": u.remote_only})
    check(f"{t} prefs put", r.status_code == 200, r.text[:150])
    r = u.call("GET", "/api/preferences")
    check(f"{t} prefs persisted", r.ok and r.json()["remote_only"] == u.remote_only and r.json()["salary_expectation"] == u.salary, r.text[:150])

    # --- opportunities
    # 503 "not configured" is the intended behaviour when Adzuna keys are absent.
    for q in ({}, {"type_filter": "Internship"}, {"role_filter": "engineer"}, {"location": "Bangalore"}):
        r = u.call("GET", "/api/opportunities", params=q)
        unconfigured = r.status_code == 503 and "not configured" in r.text
        check(f"{t} opportunities {q}", (r.status_code == 200 and isinstance(r.json(), list)) or unconfigured, f"{r.status_code} {r.text[:150]}")
        out["jobs_configured"] = r.status_code == 200
    if r.ok:
        pass

    # --- resume
    files = {"file": (f"{u.label}.txt", u.resume_text.encode(), "text/plain")}
    r = u.call("POST", "/api/resume/upload", files=files)
    ok = check(f"{t} resume upload", r.status_code == 200, r.text[:250])
    if ok:
        check(f"{t} resume extracted skills", r.json()["extracted_skills_count"] > 0, str(r.json())[:200])
    r = u.call("GET", "/api/resume/latest")
    check(f"{t} resume latest is own", r.ok and r.json()["filename"] == f"{u.label}.txt", r.text[:150])
    r = u.call("POST", "/api/resume/upload", files={"file": ("x.exe", b"abc", "application/octet-stream")})
    check(f"{t} resume bad type 415", r.status_code == 415, str(r.status_code))
    r = u.call("POST", "/api/resume/upload", files={"file": ("empty.txt", b"   ", "text/plain")})
    check(f"{t} resume empty 422", r.status_code == 422, str(r.status_code))

    # --- dashboard
    r = u.call("GET", "/api/dashboard")
    ok = check(f"{t} dashboard", r.status_code == 200, r.text[:250])
    if ok:
        out["dashboard"] = r.json()

    # --- security
    r = u.call("POST", "/api/skills/user", csrf=False, json={"skill_name": "Python", "proficiency": "Strong"})
    check(f"{t} csrf missing 403", r.status_code == 403, str(r.status_code))
    r = u.call("POST", "/api/skills/user", headers={"Origin": "http://evil.example"}, json={"skill_name": "Python", "proficiency": "Strong"})
    check(f"{t} bad origin 403", r.status_code == 403, str(r.status_code))
    return out


def main():
    roles = requests.get(BASE + "/api/careers", timeout=30).json()
    check("careers seeded", len(roles) >= 3, str(len(roles)))
    for rr in roles:
        r = requests.get(f"{BASE}/api/careers/{rr['id']}")
        check(f"career detail {rr['title']}", r.status_code == 200 and r.json()["id"] == rr["id"])
    check("career 404", requests.get(BASE + "/api/careers/zzz").status_code == 404)
    check("skills list", len(requests.get(BASE + "/api/skills", timeout=30).json()) > 10)
    for p in ("/api/auth/me", "/api/profile", "/api/dashboard", "/api/roadmap/current", "/api/skill-gap/current",
              "/api/opportunities", "/api/skills/user", "/api/resume/latest", "/api/preferences"):
        check(f"unauth {p} 401", requests.get(BASE + p).status_code == 401)

    users = [
        User("alice", [("Python", "Strong"), ("SQL", "Moderate"), ("Machine Learning", "Familiar"), ("pandas", "Moderate")],
             "Alice Smith\nData scientist with Python, SQL, pandas, scikit-learn, TensorFlow and Machine Learning experience.\nB.Tech Computer Science 2022", True, "12 LPA"),
        User("bob", [("JavaScript", "Strong"), ("React", "Strong"), ("HTML", "Moderate"), ("CSS", "Moderate")],
             "Bob Jones\nFrontend developer: JavaScript, TypeScript, React, Next.js, HTML, CSS, Tailwind. 3 years experience.", False, "8 LPA"),
        User("carol", [("Docker", "Moderate"), ("AWS", "Familiar"), ("Linux", "Strong")],
             "Carol Lee\nDevOps engineer. Docker, Kubernetes, AWS, Linux, Terraform, CI/CD, Jenkins.", False, ""),
        User("dave", [("Java", "Familiar")],
             "Dave Roy\nFresher. Java, Spring Boot, MySQL.", True, "5 LPA"),
        User("erin", [],
             "Erin Park\nBackend developer with Node.js, Express, MongoDB, PostgreSQL and REST APIs.", False, "15 LPA"),
    ]
    for u in users:
        u.create_in_db()

    with ThreadPoolExecutor(max_workers=len(users)) as pool:
        results = list(pool.map(lambda u: run_user(u, roles), users))
    res = dict(zip([u.label for u in users], results))

    # --- cross-user isolation & data differentiation
    print("Isolation checks...")
    a, b = users[0], users[1]
    a_skill_ids = res["alice"].get("skill_ids", [])
    for sid in a_skill_ids[:1]:
        r = b.call("DELETE", f"/api/skills/user/{sid}")
        check("bob cannot delete alice's skill", r.status_code == 404, str(r.status_code))
    a_items = [p["id"] for p in res["alice"].get("roadmap", {}).get("phases", [])]
    if a_items:
        r = b.call("PATCH", f"/api/roadmap/items/{a_items[0]}", json={"status": "completed"})
        check("bob cannot patch alice's roadmap", r.status_code == 404, str(r.status_code))
    ra = a.call("GET", "/api/resume/latest").json()["filename"]
    rb = b.call("GET", "/api/resume/latest").json()["filename"]
    check("resumes isolated", ra == "alice.txt" and rb == "bob.txt", f"{ra} {rb}")
    ska = {x["skill_name"] for x in a.call("GET", "/api/skills/user").json()}
    skb = {x["skill_name"] for x in b.call("GET", "/api/skills/user").json()}
    check("skills isolated", "React" not in ska and "Python" not in skb, f"{ska} | {skb}")
    pa, pb = a.call("GET", "/api/preferences").json(), b.call("GET", "/api/preferences").json()
    check("prefs isolated", pa["remote_only"] is True and pb["remote_only"] is False)
    scores = {k: v.get("score") for k, v in res.items()}
    check("readiness scores vary between users", len({s for s in scores.values() if s is not None}) > 1, str(scores))

    # delete skill works for owner
    sid = a_skill_ids[0]
    r = a.call("DELETE", f"/api/skills/user/{sid}")
    check("owner deletes skill", r.status_code == 200, r.text)
    check("deleted skill gone", sid not in [x["id"] for x in a.call("GET", "/api/skills/user").json()])
    check("second delete 404", a.call("DELETE", f"/api/skills/user/{sid}").status_code == 404)

    # logout/revocation for last user
    z = users[-1]
    r = z.call("POST", "/api/auth/logout")
    check("logout 200", r.status_code == 200)
    check("revoked session 401", z.call("GET", "/api/auth/me").status_code == 401)

    print("\nPer-user summary:")
    for k, v in res.items():
        d = v.get("dashboard", {})
        print(f"  {k}: role={v['role']['title']!r} top_rec={v.get('top_rec')!r} readiness={v.get('score')} dashboard_keys={sorted(d)[:6]}")
    print(f"\nPASSED: {PASSES}   FAILED: {len(FAILS)}")
    for f in FAILS:
        print("  -", f)
    sys.exit(1 if FAILS else 0)


if __name__ == "__main__":
    main()
