import { createContext, useContext, useEffect, useState } from "react";

const TestContext = createContext<null>(null);

export const useTest = () => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error("useTest must be used within a TestProvider");
  }
  return context;
};

export const TestProvider = ({ children }: { children: React.ReactNode }) => {
  const [value, setValue] = useState<null>(null);

  useEffect(() => {
    setValue("test");
    return () => {
      // cleanup
    };
  }, []);

  if (!value) {
    return <div>Loading...</div>;
  }

  return (
    <TestContext.Provider value={value}>
      {children}
    </TestContext.Provider>
  );
};