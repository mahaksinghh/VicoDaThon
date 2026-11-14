const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
export const DEMO_MODE = API_BASE_URL === "";

const demoSessions = new Map();
const demoQuestions = [
  "What is the difference between an array and a linked list, and when would you choose one over the other?",
  "How would you explain an API to a teammate, and what makes an endpoint reliable?",
  "If you were designing a small interview assistant, how would you keep its answers useful and handle a service outage?"
];

export async function startInterview(sessionId, candidate) {
  if (DEMO_MODE) {
    demoSessions.set(sessionId, { candidate, questionIndex: 0, answers: [] });
    return {
      reply: "Welcome, " + candidate.name + "! This is a browser-based demo interview for " +
        candidate.jobRole + ". Your answers stay in this browser.\\n\\n" + demoQuestions[0],
      done: false,
      feedback: null
    };
  }

  const response = await fetch(API_BASE_URL + "/api/interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, candidate, message: null })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to start interview");
  }

  return response.json();
}

export async function sendAnswer(sessionId, message) {
  if (DEMO_MODE) {
    const session = demoSessions.get(sessionId);
    if (!session) throw new Error("This demo interview session has expired.");

    session.answers.push(message);
    session.questionIndex += 1;

    if (session.questionIndex < demoQuestions.length) {
      return {
        reply: "Thanks for sharing your thinking.\\n\\n" + demoQuestions[session.questionIndex],
        done: false,
        feedback: null
      };
    }

    const detailedAnswers = session.answers.filter((answer) => answer.trim().split(/\\s+/).length >= 12).length;
    demoSessions.delete(sessionId);
    return {
      reply: "Interview demo complete. Your answers stayed in this browser; no AI service was called.",
      done: true,
      feedback: {
        summary: "You completed the three-question " + session.candidate.jobRole +
          " interview demo. This sample flow shows the interview and feedback screens; it does not score answers or provide a real AI assessment.",
        strengths: [
          "Completed all three interview prompts.",
          detailedAnswers + " answer(s) included 12 or more words."
        ],
        gaps: [
          "For a stronger interview response, explain your reasoning and give a concrete example.",
          "This demo does not evaluate technical correctness."
        ],
        next: [
          "Try the interview again with a different target role.",
          "Practice explaining trade-offs and edge cases."
        ]
      }
    };
  }

  const response = await fetch(API_BASE_URL + "/api/interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, candidate: null, message })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to send answer");
  }

  return response.json();
}