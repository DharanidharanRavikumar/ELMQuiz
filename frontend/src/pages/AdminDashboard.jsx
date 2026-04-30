import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const AdminDashboard = () => {
  const [query, setQuery] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook for navigation

  const fetchReport = async () => {
    setError("");
    setReport(null);

    try {
      const response = await fetch(`http://localhost:3000/api/report/get-report?query=${query}`);

      if (!response.ok) {
        throw new Error("Report not found");
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const downloadPDF = async () => {
    if (!report) return;

    const url = `http://localhost:3000/api/report/download/${report._id}`;
    window.open(url, "_blank"); // Opens the PDF download in a new tab
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter Name or Roll Number"
      />
      <button onClick={fetchReport}>Search</button>
      
      {error && <p style={{ color: "red" }}>{error}</p>}

      {report && (
        <div>
          <h3>Report Found:</h3>
          <button onClick={downloadPDF}>Download as PDF</button>
        </div>
      )}

      {/* Exit button to navigate back */}
      <button onClick={() => navigate("/")}>Exit</button> {/* Change "/" to your desired route */}
    </div>
  );
};

export default AdminDashboard;
