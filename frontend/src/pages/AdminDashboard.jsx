import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [query, setQuery] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchReport = async () => {
    setError(""); setReport(null); setIsLoading(true);
    try {
     const response = await fetch(`${import.meta.env.VITE_API_URL}/api/report/get-report?query=${query}`);
      if (!response.ok) throw new Error("Report not found");
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
      <div className="admin-bg-orb admin-bg-orb-1" />
      <div className="admin-bg-orb admin-bg-orb-2" />

      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-nav">
            <div className="admin-logo">ELM Quiz</div>
            <button className="admin-exit-btn" onClick={() => navigate("/")}>← Exit</button>
          </div>
          <div className="admin-title-section">
            <div className="admin-badge">Admin Panel</div>
            <h1 className="admin-title">Report Dashboard</h1>
            <p className="admin-subtitle">Search and download student assessment reports</p>
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
              <span></span> {error}
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
              <div className="admin-report-found-badge">Report Found</div>
            </div>

            <div className="admin-report-details">
              {[
                { label: "Gender", value: report.gender },
                { label: "12th Percentage", value: `${report.hsPercentage}%` },
                { label: "First Graduate", value: report.isFirstGraduate ? "Yes" : "No" },
                { label: "Ambition", value: report.futureIdea },
              ].map(({ label, value }) => (
                <div className="admin-report-detail" key={label}>
                  <span className="admin-detail-label">{label}</span>
                  <span className="admin-detail-value">{value || "—"}</span>
                </div>
              ))}
            </div>

            <button className="admin-download-btn" onClick={downloadPDF}>
              📄 Download PDF Report
            </button>
          </div>
        )}

        {!report && !error && (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">🔍</div>
            <p className="admin-empty-text">Enter a name or roll number to search for a report</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
