import React from 'react';

const Question = ({ question, onAnswer }) => {
  const handleSkip = () => {
    onAnswer(0, question.category); // Apply negative mark for skipping
  };

  return (
    <div>
      <h2>{question.question}</h2>
      <ul>
        {question.options.map((option, index) => (
          <li key={index}>
            <button onClick={() => onAnswer(option.score, question.category)}>
              {option.text}
            </button>
          </li>
        ))}
      </ul>
      <button onClick={handleSkip} style={{ marginTop: '10px' }}>
        Skip Question
      </button>
    </div>
  );
};

export default Question;
