import React, { createContext, useState, useContext } from 'react';

const ScannerContext = createContext();

export const ScannerProvider = ({ children }) => {
  const [scannerEnabled, setScannerEnabled] = useState(false);

  return (
    <ScannerContext.Provider value={{ scannerEnabled, setScannerEnabled }}>
      {children}
    </ScannerContext.Provider>
  );
};

export const useScanner = () => useContext(ScannerContext);
