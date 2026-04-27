import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  
  // Если токена нет — редирект на вход
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Если токен есть — показываем защищённый компонент
  return children;
};

export default PrivateRoute;