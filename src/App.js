// src/App.js
import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import ElectionPage from './components/ElectionPage'; 
import Confirm from './components/confirm'; // Ensure correct casing
import VoteDisplay from './components/VoteDisplay'; // Import your VoteDisplay component if needed

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null); // Simplified logic to set user
    });

    return () => unsubscribe();
  }, []);

  return (
    <Routes>
      <Route
        path="/home"
        element={user ? <Home /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/home" />}
      />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/home" />}
      />
      <Route
        path="/confirm"
        element={<Confirm />} // Corrected component name to match casing
      />
      <Route
        path="/election/:uniqueId" 
        element={<ElectionPage />} // Ensure this page handles undefined uniqueId
      />
      <Route
        path="/vote/:uniqueId" // Add route for VoteDisplay if applicable
        element={<VoteDisplay />}
      />
      <Route
        path="/"
        element={<Navigate to={user ? "/home" : "/login"} />}
      />
    </Routes>
  );
}

export default App;
