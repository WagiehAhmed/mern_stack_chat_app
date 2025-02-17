import React, { createContext, useContext, useState } from "react";

const dataContext = createContext();

export const useDataContext = () => {
  return useContext(dataContext);
};

export default function DataContextProvider({ children }) {
  const [userDetails, setUserDetails] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Map());

  return (
    <dataContext.Provider
      value={{
        userDetails,
        setUserDetails,
        socket,
        setSocket,
        onlineUsers,
        setOnlineUsers,
      }}
    >
      {children}
    </dataContext.Provider>
  );
}
