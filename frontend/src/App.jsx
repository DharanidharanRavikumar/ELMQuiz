import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import QuizPage from "./pages/QuizPage";
import GenderSelectionPage from "./pages/GenderSelectionPage";
import NotFound from "./pages/NotFound";
import PersonalDetails from "./pages/PersonalDetails";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import { QuizProvider } from "./contexts/QuizContext";
import AuthProvider from "./contexts/AuthContext"; // ✅ Correct import

const App = () => {
  return (
    <Router> {/* ✅ Wrap with Router */}
      <AuthProvider>
        <QuizProvider>
          <Routes>
            {/* ✅ Show login by default but allow access after login */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/home" element={<Home />} /> {/* ✅ Home accessible */}
            <Route path="/gender-selection" element={<GenderSelectionPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/personal-details" element={<PersonalDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QuizProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
