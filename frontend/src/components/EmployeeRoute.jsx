import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const EmployeeRoute = ({ children }) => {
  const [isEmployee, setIsEmployee] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsEmployee(false);
      return;
    }

    // Запрашиваем актуальный статус с сервера
    fetch('http://localhost:8000/server_cm/auth/check-employee/', {
      headers: { 'Authorization': `Token ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setIsEmployee(data.is_employee))
      .catch(() => setIsEmployee(false));
  }, []);

  if (isEmployee === null) return <div className="loading">Проверка прав доступа...</div>;
  if (!isEmployee) return <Navigate to="/" replace />;

  return children;
};

export default EmployeeRoute;