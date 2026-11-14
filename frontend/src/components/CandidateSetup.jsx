import { useState } from "react";
import { Brain, Sparkles, ArrowRight } from "lucide-react";
import { DEMO_MODE, startInterview } from "../services/api";

function CandidateSetup({ onStart }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("0");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !role.trim()) {
      setError("Please enter your name and target role.");
      return;
    }

    setLoading(true);
    setError("");

    const newSessionId =
      "session-" + Date.now() + "-" + Math.random().toString(36).slice(2);

    const candidate = {
      name: name.trim(),
      jobRole: role.trim(),
      yearsExperience: Number(experience) || 0
    };

    try {
      const data = await startInterview(newSessionId, candidate);

      onStart(candidate, newSessionId, data);

      window.dispatchEvent(
        new CustomEvent("interview-started", {
          detail: data
        })
      );
    } catch (err) {
      setError(
        "Could not connect to the interview server. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell setup-shell">
      <div className="setup-card">

        <div className="brand">
          <div className="brand-icon">
            <Brain size={28} />
          </div>

          <span>AI Interview Agent</span>
        </div>

        <div className="hero-icon">
          <Sparkles size={34} />
        </div>

        <p className="eyebrow">PERSONALIZED TECHNICAL INTERVIEW</p>

        <h1>
          Show what you
          <span> really know.</span>
        </h1>

        <p className="hero-description">
          {DEMO_MODE
            ? "Try a sample technical interview in your browser. The demo uses fixed prompts and does not send your answers to an AI service."
            : "An AI-powered technical interview that adapts to your coursework, strengths, gaps, and reasoning ability."}
        </p>

        <form onSubmit={handleSubmit}>

          <label>Candidate Name</label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Target Role</label>

          <input
            type="text"
            placeholder="e.g. AI Engineer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <label>Years of Experience</label>

          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          >
            <option value="0">Fresher / Student</option>
            <option value="1">1 year</option>
            <option value="2">2 years</option>
            <option value="3">3+ years</option>
          </select>

          {error && <div className="error-box">{error}</div>}

          <button className="primary-button" disabled={loading}>
            {loading ? "Starting Interview..." : "Start Interview"}
            {!loading && <ArrowRight size={19} />}
          </button>

        </form>

        <div className="setup-footer">
          <span>✓ Adaptive questions</span>
          <span>✓ {DEMO_MODE ? "Demo feedback" : "AI feedback"}</span>
          <span>✓ System design</span>
        </div>

      </div>
    </div>
  );
}

export default CandidateSetup;