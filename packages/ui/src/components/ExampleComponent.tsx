
import React from 'react';
import { useExample } from '../contexts/ExampleContext';

export const ExampleComponent: React.FC = () => {
  const { message, setMessage } = useExample();

  const handleButtonClick = () => {
    const newMessage = prompt('Enter a new message:');
    if (newMessage) {
      setMessage(newMessage);
    }
  };

  return (
    <div>
      <h2>{message}</h2>
      <button onClick={handleButtonClick}>
        Update Message
      </button>
    </div>
  );
};
