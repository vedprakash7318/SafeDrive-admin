import React, { createContext, useState, useContext } from 'react';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [qrs, setQrs] = useState([]);
  
  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AdminContext.Provider value={{ user, qrs, setQrs, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => useContext(AdminContext);
