import React from 'react';
import PersonalDetails from '../pages/PersonalDetails';

const GenderSelectionPage = () => {
  const handlePersonalDetailsSubmit = (details) => {
    localStorage.setItem('personalDetails', JSON.stringify(details));
    window.location.href = '/quiz';
  };

  return (
    <div>
      <PersonalDetails onSubmit={handlePersonalDetailsSubmit} />
    </div>
  );
};

export default GenderSelectionPage;
