import { useState } from "react";
import CandidateSetup from "./components/CandidateSetup";
import InterviewScreen from "./components/InterviewScreen";
import FeedbackScreen from "./components/FeedbackScreen";

function App() {
  const [screen, setScreen] = useState("setup");
  const [candidate, setCandidate] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [firstResponse, setFirstResponse] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleStart = (candidateData, session, response) => {
    console.log("Starting interview:", {
      candidateData,
      session,
      response,
    });

    setCandidate(candidateData);
    setSessionId(session);
    setFirstResponse(response);
    setScreen("interview");
  };

  const handleFinish = (finalFeedback) => {
    console.log("Interview finished:", finalFeedback);

    setFeedback(finalFeedback);
    setScreen("feedback");
  };

  const handleRestart = () => {
    setCandidate(null);
    setSessionId(null);
    setFirstResponse(null);
    setFeedback(null);
    setScreen("setup");
  };

  return (
    <div className="app">
      {screen === "setup" && (
        <CandidateSetup onStart={handleStart} />
      )}

      {screen === "interview" && (
        <InterviewScreen
          candidate={candidate}
          sessionId={sessionId}
          firstResponse={firstResponse}
          onFinish={handleFinish}
        />
      )}

      {screen === "feedback" && (
        <FeedbackScreen
          candidate={candidate}
          feedback={feedback}
          onRestart={handleRestart}
        />
      )}

      {!["setup", "interview", "feedback"].includes(screen) && (
        <div className="error-screen">
          <h2>Something went wrong</h2>
          <button onClick={handleRestart}>
            Back to Setup
          </button>
        </div>
      )}
    </div>
  );
}

export default App;