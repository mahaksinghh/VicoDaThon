PROMPTS.md — AI Usage Log
This project (The Interview Agent — Problem Statement 2) was built in a single
conversational session with Claude (Anthropic), which wrote the full backend
end-to-end: architecture, code, and testing. This log documents the actual
prompts and decisions that shaped the build.
Tooling
Model: Claude (Anthropic), via claude.ai chat interface with code
execution enabled
Approach: Conversational / "vibe-coded" — I described the problem
statement and provided the source data files (curriculum.json,
candidates.json, technical-spec.md); Claude designed the architecture,
wrote all code, ran it in a sandboxed environment to verify it actually
works, and iterated based on results.
Build sequence
1. Initial brief
I uploaded curriculum.json, candidates.json, and technical-spec.md and
asked for the AI Interview Agent to be built per the spec: a POST /api/interview endpoint, session-based conversation state, and structured
feedback at the end.
2. Architecture decisions (made by Claude, reviewed by me)
Analyze the real curriculum/candidate data first to ground the interview in
actual performance rather than generic questions
Classify each candidate's mission history into strength / gap / unattempted
topics (curriculum_analysis.py)
Build an adaptive question plan: 3 strength-verification questions, 3
gap-probing questions, 1 open-ended system design question, then structured
feedback (interview_engine.py)
Isolate all LLM calls behind a single abstraction (llm_client.py) with a
deterministic template fallback, so the agent runs even without an API key
configured
Expose the flow via FastAPI (main.py) matching the exact request/response
contract in technical-spec.md
3. Verification
Claude installed dependencies, started the server, and ran a full simulated
interview end-to-end against a real candidate record (CAND-004, who had
skipped Docker/Kubernetes and needed multiple attempts on several topics),
confirming the generated questions correctly targeted those real gaps and
that the final feedback JSON matched the required schema.
4. C++ port
I asked whether the submission needed to be in Python or could be C++. Claude
explained the tradeoffs (no Pydantic/FastAPI equivalent, more boilerplate,
same functional outcome) and, on request, produced a full C++17 rewrite:
cpp-httplib for the HTTP server (single header)
nlohmann/json for JSON handling (single header)
libcurl for direct calls to the Anthropic Messages API
Same architecture 1:1: curriculum_analysis.hpp, interview_engine.hpp,
llm_client.hpp, main.cpp
Claude installed the required system libraries (libcurl4-openssl-dev,
libssl-dev, cmake), compiled the project with CMake, and re-ran the same
end-to-end simulated interview against the compiled binary to confirm
behavioral parity with the Python version, including error-path checks
(missing sessionId, missing candidate on new session, message sent to an
unknown session).
5. Deployment support
Claude explained deployment options (Render vs. Railway vs. Fly.io), the
build/start commands needed for Render specifically, and clarified that the
{"detail":"Not Found"} response at the bare root URL is FastAPI's expected
default 404 (no root route was defined), not a deployment failure — the real
endpoints are /health and /api/interview.
What was and wasn't AI-generated
AI-generated: All source code in both the Python and C++ versions
(main.py/main.cpp, interview_engine.*, curriculum_analysis.*,
llm_client.*, models.py), the CMake build config, and this log.
Human-directed: Problem selection, review/approval of architectural
choices at each step, decision to build a C++ port, deployment platform
choice, and final submission assembly (GitHub push, Render deploy).