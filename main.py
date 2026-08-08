"""
main.py

FastAPI backend for the AI Interview Agent.

Endpoints:
- GET  /health
- POST /api/interview

The interview session state is managed by interview_engine.SESSIONS.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from interview_engine import get_or_create_session
from llm_client import llm_available
from models import InterviewRequest, InterviewResponse


app = FastAPI(
    title="AI Interview Agent",
    version="1.0.0"
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Health Check
# ---------------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "llm_backend": (
            "anthropic"
            if llm_available()
            else "template-fallback"
        )
    }


# ---------------------------------------------------------
# Interview Endpoint
# ---------------------------------------------------------

@app.post(
    "/api/interview",
    response_model=InterviewResponse
)
def interview(req: InterviewRequest):

    # -----------------------------------------------------
    # Validate session ID
    # -----------------------------------------------------

    if not req.sessionId:
        raise HTTPException(
            status_code=400,
            detail="sessionId is required"
        )

    # -----------------------------------------------------
    # Get or create interview session
    # -----------------------------------------------------

    try:
        session = get_or_create_session(
            req.sessionId,
            req.candidate
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    # -----------------------------------------------------
    # Start a new interview
    # -----------------------------------------------------
    # A newly created session has index = -1.
    # We call session.start() to generate the welcome
    # message + first interview question.
    # -----------------------------------------------------

    if session.index == -1:

        reply = session.start()

        return {
            "reply": reply,
            "done": False,
            "feedback": None
        }

    # -----------------------------------------------------
    # Validate message for an existing session
    # -----------------------------------------------------

    if req.message is None or not req.message.strip():
        raise HTTPException(
            status_code=400,
            detail="message is required after the interview has started"
        )

    # -----------------------------------------------------
    # Continue the interview
    # -----------------------------------------------------

    response = None

    if hasattr(session, "handle_message"):

        response = session.handle_message(
            req.message
        )

    elif hasattr(session, "process_message"):

        response = session.process_message(
            req.message
        )

    elif hasattr(session, "respond"):

        response = session.respond(
            req.message
        )

    else:

        raise HTTPException(
            status_code=500,
            detail="Interview session does not support message handling"
        )

    # -----------------------------------------------------
    # If engine returns InterviewResponse
    # -----------------------------------------------------

    if isinstance(response, InterviewResponse):
        return response

    # -----------------------------------------------------
    # If engine returns a dictionary
    # -----------------------------------------------------

    if isinstance(response, dict):
        return response

    # -----------------------------------------------------
    # Unexpected response
    # -----------------------------------------------------

    raise HTTPException(
        status_code=500,
        detail="Interview engine returned an invalid response"
    )