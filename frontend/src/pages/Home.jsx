import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-bg-orb home-bg-orb-1" />
      <div className="home-bg-orb home-bg-orb-2" />

      <nav className="home-nav">
        <div className="home-nav-logo">🧠 ELM Quiz</div>
        <div className="home-nav-badge">Personal Insight Assessment</div>
      </nav>

      <main className="home-main">
        <div className="home-tag">Self-Reflection Tool</div>

        <h1 className="home-title">
          Understand Your <br />
          <span className="home-title-accent">Mental Landscape</span>
        </h1>

        <p className="home-desc">
          A structured self-assessment designed to reflect on your emotional patterns, learning style, and personal goals. Takes approximately 15–20 minutes to complete.
        </p>

        <div className="home-stats">
          <div className="home-stat">
            <span className="home-stat-num">6</span>
            <span className="home-stat-label">Assessment Parts</span>
          </div>
          <div className="home-stat-divider" />
          <div className="home-stat">
            <span className="home-stat-num">~20</span>
            <span className="home-stat-label">Minutes</span>
          </div>
          <div className="home-stat-divider" />
          <div className="home-stat">
            <span className="home-stat-num">PDF</span>
            <span className="home-stat-label">Report Included</span>
          </div>
        </div>

        <button className="home-cta" onClick={() => navigate("/gender-selection")}>
          Begin Assessment
          <span className="home-cta-arrow">→</span>
        </button>

        <p className="home-note">
          Your responses are confidential and used solely for assessment purposes.
        </p>
      </main>

      <div className="home-cards">
        {[
          { icon: "", title: "Comprehensive", desc: "Multi-dimensional evaluation across 6 psychological domains" },
          { icon: "", title: "Data-Driven", desc: "Scientifically validated scoring with detailed PDF report" },
          { icon: "", title: "Confidential", desc: "Your data is secure and handled with full privacy" },
        ].map((card, i) => (
          <div className="home-feature-card" key={i}>
            <div className="home-feature-icon">{card.icon}</div>
            <h3 className="home-feature-title">{card.title}</h3>
            <p className="home-feature-desc">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
