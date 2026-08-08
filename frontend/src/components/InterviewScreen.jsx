import { useEffect, useRef, useState } from "react";
import { Send, Clock, Brain, LoaderCircle } from "lucide-react";

import ChatMessage from "./ChatMessage";
import ProgressBar from "./ProgressBar";

import { sendAnswer } from "../services/api";

function InterviewScreen({
  candidate,
  sessionId,
  firstResponse,
  onFinish,
}) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);

  const [messages, setMessages] = useState(() => {
    if (firstResponse?.reply) {
      return [
        {
          role: "ai",
          content: firstResponse.reply,
        },
      ];
    }

    return [];
  });

  const [questionNumber, setQuestionNumber] = useState(1);

  const bottomRef = useRef(null);

  /* ================================
     TIMER
  ================================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ================================
     AUTO SCROLL
  ================================= */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* ================================
     FORMAT TIMER
  ================================= */

  const formatTime = () => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");

    const secs = (seconds % 60)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${secs}`;
  };

  /* ================================
     SUBMIT ANSWER
  ================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!answer.trim() || loading) return;

    const userAnswer = answer.trim();

    setAnswer("");
    setError("");

    // Add user's answer
    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: userAnswer,
      },
    ]);

    setLoading(true);

    try {
      const data = await sendAnswer(
        sessionId,
        userAnswer
      );

      console.log("Interview response:", data);

      /* ================================
         INTERVIEW FINISHED
      ================================= */

      if (data?.done) {
        if (data.reply) {
          setMessages((previous) => [
            ...previous,
            {
              role: "ai",
              content: data.reply,
            },
          ]);
        }

        onFinish(data.feedback);
        return;
      }

      /* ================================
         NEXT QUESTION
      ================================= */

      if (data?.reply) {
        setMessages((previous) => [
          ...previous,
          {
            role: "ai",
            content: data.reply,
          },
        ]);

        setQuestionNumber(
          (value) => value + 1
        );
      } else {
        setError(
          "The interview server returned an empty response."
        );
      }
    } catch (err) {
      console.error("Interview error:", err);

      setError(
        "Unable to reach the interview server. Please check that FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     UI
  ================================= */

  return (
    <div className="interview-page">

      {/* TOP BAR */}

      <header className="topbar">

        <div className="brand">

          <div className="brand-icon">
            <Brain size={23} />
          </div>

          <span>AI Interview Agent</span>

        </div>

        <div className="timer">
          <Clock size={17} />
          {formatTime()}
        </div>

      </header>


      {/* MAIN */}

      <main className="interview-container">

        {/* HEADER */}

        <div className="candidate-header">

          <div>

            <p className="eyebrow">
              TECHNICAL INTERVIEW
            </p>

            <h2>
              {candidate?.jobRole || "Technical Role"}
            </h2>

            <p className="candidate-name">
              Candidate:{" "}
              {candidate?.name || "Candidate"}
            </p>

          </div>

          <ProgressBar
            current={questionNumber}
          />

        </div>


        {/* CHAT */}

        <section className="chat-container">

          {messages.length === 0 && (
            <div className="empty-chat">
              <div className="empty-icon">
                <Brain size={30} />
              </div>

              <h3>
                Your interview is starting...
              </h3>

              <p>
                The AI interviewer will ask you questions.
              </p>
            </div>
          )}


          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
            />
          ))}


          {loading && (
            <div className="chat-row ai">

              <div className="avatar">
                AI
              </div>

              <div className="chat-bubble ai typing">

                <LoaderCircle
                  className="spin"
                  size={18}
                />

                Thinking...

              </div>

            </div>
          )}

          <div ref={bottomRef} />

        </section>


        {/* ERROR */}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}


        {/* ANSWER */}

        <form
          className="answer-area"
          onSubmit={handleSubmit}
        >

          <textarea
            value={answer}
            disabled={loading}
            onChange={(e) =>
              setAnswer(e.target.value)
            }
            placeholder="Type your answer here..."
            rows={5}
          />

          <div className="answer-footer">

            <span>
              Be specific and explain your reasoning.
            </span>

            <button
              type="submit"
              className="primary-button send-button"
              disabled={
                loading || !answer.trim()
              }
            >

              {loading
                ? "Processing..."
                : "Submit Answer"}

              {!loading && (
                <Send size={17} />
              )}

            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default InterviewScreen;