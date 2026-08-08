const API_BASE_URL = "http://127.0.0.1:8000";

export async function startInterview(sessionId, candidate) {
  const response = await fetch(`${API_BASE_URL}/api/interview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sessionId,
      candidate,
      message: null
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to start interview");
  }

  return response.json();
}

export async function sendAnswer(sessionId, message) {
  const response = await fetch(`${API_BASE_URL}/api/interview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sessionId,
      candidate: null,
      message
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to send answer");
  }

  return response.json();
}