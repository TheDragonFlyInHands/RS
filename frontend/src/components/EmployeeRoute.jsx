import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiGet } from '../api/client';

const EmployeeRoute = ({ children }) => {
  const [isEmployee, setIsEmployee] = useState(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const data = await apiGet('/auth/check-employee/', { cache: false });
        if (!mounted) return;
        setIsEmployee(Boolean(data?.is_employee));
      } catch {
        if (!mounted) return;
        setIsEmployee(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, []);

  if (isEmployee === null) return <div className="loading">Проверка прав доступа...</div>;
  if (!isEmployee) return <Navigate to="/" replace />;

  return children;
};

export default EmployeeRoute;
