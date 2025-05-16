import React, { createContext, useContext, useState } from 'react';
import { getUserId, getLastKnownName, setLastKnownName, clearLastKnownName } from '@/utils/localStorage';

interface UserContextType {
  userId: string;
  name: string | null;
  setName: (name: string) => void;
  clearName: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId] = useState(getUserId());
  const [name, setNameState] = useState<string | null>(getLastKnownName());

  const setName = (newName: string) => {
    setNameState(newName);
    setLastKnownName(newName);
  };

  const clearName = () => {
    setNameState(null);
    clearLastKnownName();
  };

  const value = {
    userId,
    name,
    setName,
    clearName,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 