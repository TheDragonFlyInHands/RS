import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthToken } from '../api/cookies';

const PrivateRoute = ({ children }) => {
  const token = getAuthToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
