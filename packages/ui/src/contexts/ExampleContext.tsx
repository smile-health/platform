
import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Define the shape of the context data
interface ExampleContextType {
  message: string;
  setMessage: (message: string) => void;
}

// 2. Create the context with a default value
const ExampleContext = createContext<ExampleContextType | undefined>(undefined);

// 3. Create a provider component
interface ExampleProviderProps {
  children: ReactNode;
}

export const ExampleProvider: React.FC<ExampleProviderProps> = ({ children }) => {
  const [message, setMessage] = useState('Hello from Context!');

  const value = { message, setMessage };

  return (
    <ExampleContext.Provider value={value}>
      {children}
    </ExampleContext.Provider>
  );
};

// 4. Create a custom hook for easy consumption
export const useExample = (): ExampleContextType => {
  const context = useContext(ExampleContext);
  if (context === undefined) {
    throw new Error('useExample must be used within an ExampleProvider');
  }
  return context;
};
