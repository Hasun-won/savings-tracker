import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Account, Transaction } from '../types';
import * as utils from '../utils';

interface AppContextType {
  accounts: Account[];
  transactions: Transaction[];
  currentMonthIndex: number;
  setCurrentMonthIndex: (index: number) => void;
  updateAccounts: (accounts: Account[]) => void;
  updateTransactions: (transactions: Transaction[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  useEffect(() => {
    setAccounts(utils.loadAccounts());
    setTransactions(utils.loadTransactions());
  }, []);

  const updateAccounts = (newAccounts: Account[]) => {
    setAccounts(newAccounts);
    utils.saveAccounts(newAccounts);
  };

  const updateTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    utils.saveTransactions(newTransactions);
  };

  return (
    <AppContext.Provider value={{
      accounts,
      transactions,
      currentMonthIndex,
      setCurrentMonthIndex,
      updateAccounts,
      updateTransactions
    }}>
      {children}
    </AppContext.Provider>
  );
};