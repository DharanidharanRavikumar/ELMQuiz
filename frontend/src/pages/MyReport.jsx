import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/AdminDashboard.css";

const MyReport = () => {
  const [query, setQuery] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async () => {
    setError(""); setReport(null); setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/report/get-report?query=${query}`);
      if (!response.ok) throw new Error("No report found for that name or roll number.");
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!report) return;
    window.open(`${import.meta.env.VITE_API_URL}/api/report/download/${report._id}`, "_blank");
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-nav">
            <div className="admin-logo">ELM Quiz</div>
            <Link to="/" className="admin-exit-btn">← Home</Link>
          </div>
          <div className="admin-title-section">
            <div className="admin-badge">Self-Service Lookup</div>
            <h1 className="admin-title">Retrieve Your Report</h1>
            <p className="admin-subtitle">
              Enter the name or roll number you used when completing the assessment.
            </p>
          </div>
        </div>

        <div className="admin-search-card">
          <label className="admin-search-label">Search by Name or Roll Number</label>
          <div className="admin-search-row">
            <input
              className="admin-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Dharanidhar or 21CS045"
              onKeyDown={(e) => e.key === "Enter" && fetchReport()}
            />
            <button
              className={`admin-search-btn ${isLoading ? "loading" : ""}`}
              onClick={fetchReport}
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? "Searching..." : "Search →"}
            </button>
          </div>
          {error && (
            <div className="admin-error">
              <span>⚠</span> {error}
            </div>
          )}
        </div>

        {report && (
          <div className="admin-report-card">
            <div className="admin-report-header">
              <div className="admin-report-avatar">
                {report.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <h3 className="admin-report-name">{report.name}</h3>
                <p className="admin-report-roll">{report.rollNumber}</p>
              </div>
              <div className="admin-report-found-badge">Found</div>
            </div>

            <button className="admin-download-btn" onClick={downloadPDF}>
              Download PDF Report
            </button>
          </div>
        )}

        {!report && !error && (
          <div className="admin-empty-state">
            <p className="admin-empty-text">No report loaded yet — search above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReport;