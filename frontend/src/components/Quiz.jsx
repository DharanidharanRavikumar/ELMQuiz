import React from 'react';

const Quiz = ({ questions, currentQuestionIndex, onAnswer }) => (
  <div>
    <h2>{questions[currentQuestionIndex].question}</h2>
    <ul>
      {questions[currentQuestionIndex].options.map((option, index) => (
        <li key={index}>
          <button onClick={() => onAnswer(option.score)}>
            {option.text}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default Quiz;
