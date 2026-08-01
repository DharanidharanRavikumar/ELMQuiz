import React from 'react';
import { useNavigate } from 'react-router-dom';
import PersonalDetails from '../pages/PersonalDetails';

const GenderSelectionPage = () => {
  const navigate = useNavigate();

  const handlePersonalDetailsSubmit = (details) => {
    localStorage.setItem('personalDetails', JSON.stringify(details));
    navigate('/quiz');
  };

  return (
    <div>
      <PersonalDetails onSubmit={handlePersonalDetailsSubmit} />
    </div>
  );
};

export default GenderSelectionPage;
