import { DEMO_MODE } from "../services/api";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Trophy
} from "lucide-react";

function FeedbackScreen({
  candidate,
  feedback,
  onRestart
}) {
  if (!feedback) {
    return (
      <div className="app-shell">
        <div className="empty-feedback">
          No feedback available.
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell feedback-shell">

      <header className="topbar">

        <div className="brand">
          <div className="brand-icon">
            <Trophy size={23} />
          </div>

          <span>AI Interview Agent</span>
        </div>

      </header>

      <main className="feedback-container">

        <div className="feedback-heading">

          <div className="success-icon">
            <CheckCircle2 size={34} />
          </div>

          <p className="eyebrow">
            INTERVIEW COMPLETE
          </p>

          <h1>
            Great work, {candidate?.name}.
          </h1>

          <p>
            {DEMO_MODE ? 'This is sample feedback from the browser-only demo.' : 'Here\'s your AI-generated interview feedback.'}
          </p>

        </div>

        <section className="summary-card">

          <h3>Overall Assessment</h3>

          <p>
            {feedback.summary}
          </p>

        </section>

        <div className="feedback-grid">

          <section className="feedback-card">

            <div className="feedback-card-title">
              <CheckCircle2 size={21} />
              <h3>Strengths</h3>
            </div>

            <ul>
              {(feedback.strengths || []).map(
                (item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                )
              )}
            </ul>

          </section>

          <section className="feedback-card">

            <div className="feedback-card-title">
              <AlertTriangle size={21} />
              <h3>Areas to Improve</h3>
            </div>

            <ul>
              {(feedback.gaps || []).map(
                (item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                )
              )}
            </ul>

          </section>

        </div>

        <section className="next-card">

          <div>
            <p className="eyebrow">
              RECOMMENDED NEXT STEPS
            </p>

            <h3>
              Keep building from here.
            </h3>
          </div>

          <div className="next-list">

            {(feedback.next || []).map(
              (item, index) => (
                <div
                  className="next-item"
                  key={index}
                >
                  <span>{index + 1}</span>

                  <p>{item}</p>

                  <ArrowRight size={18} />
                </div>
              )
            )}

          </div>

        </section>

        <button
          className="secondary-button"
          onClick={onRestart}
        >
          <RotateCcw size={17} />
          Start New Interview
        </button>

      </main>

    </div>
  );
}

export default FeedbackScreen;