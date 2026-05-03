import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.scss';
import { apiGet, apiPost } from '../api/client';
import { clearAuthToken, setAuthToken } from '../api/cookies';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    resetEmail: '',
  });

  // 🔹 Проверка токена при загрузке (если уже авторизован)
  useEffect(() => {
    const validateToken = async () => {
      try {
        const data = await apiGet('/auth/validate/');
        if (data?.valid) {
          localStorage.setItem('user', JSON.stringify(data.user));
          window.dispatchEvent(new Event('authchange'));
          navigate('/profile');
          return;
        }
        clearAuthToken();
        localStorage.removeItem('user');
      } catch {
        clearAuthToken();
        localStorage.removeItem('user');
      }
    };

    validateToken();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Функция входа
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      return alert('Заполните все поля');
    }

    setLoading(true);
    try {
      const data = await apiPost('/auth/login/', {
        identifier: formData.identifier,
        password: formData.password,
      });

      if (data?.token) {
        setAuthToken(data.token);
        localStorage.setItem('user', JSON.stringify(data));
        window.dispatchEvent(new Event('authchange'));
        navigate('/profile');
      } else {
        alert(data?.error || 'Неверный логин или пароль');
      }
    } catch (error) {
      alert(error?.response?.data?.error || 'Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.resetEmail.trim()) {
      return alert('Введите почту');
    }

    setLoading(true);
    try {
      const data = await apiPost('/auth/reset-password/', {
        email: formData.resetEmail.trim().toLowerCase(),
      });

      alert('✅ Новый пароль отправлен на вашу почту. Проверьте папку "Входящие" и "Спам".');
      setIsResetMode(false);
      setFormData({ identifier: '', password: '', resetEmail: '' });
    } catch (error) {
      const msg = error?.response?.data?.error || 'Ошибка при сбросе пароля';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Выход из аккаунта
  const handleLogout = () => {
    clearAuthToken();
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSubmit = (e) => {
    if (isResetMode) {
      handleResetPassword(e);
    } else {
      handleLogin(e);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {isResetMode ? (
          <div className="reset-step">
            <h2 className="login-title">Восстановление пароля</h2>
            <p className="reset-text">Введите вашу почту, мы сгенерируем новый пароль</p>
            <form onSubmit={handleSubmit} className="login-form">
              <input
                type="email"
                name="resetEmail"
                value={formData.resetEmail}
                onChange={handleChange}
                placeholder="Почта"
                className="form-input"
                required
                disabled={loading}
              />
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Загрузка...' : 'Сбросить пароль'}
              </button>
            </form>
            <div className="reset-footer">
              <button
                type="button"
                className="btn-back"
                onClick={() => setIsResetMode(false)}
                disabled={loading}
              >
                Вернуться к входу
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="login-title">Вход в аккаунт</h2>
            <form onSubmit={handleSubmit} className="login-form">
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Почта или телефон"
                className="form-input"
                required
                disabled={loading}
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Пароль"
                className="form-input"
                required
                disabled={loading}
              />
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
              </button>
            </form>

            <div className="login-actions">
              <Link to="/register" className="btn-link">
                Регистрация
              </Link>
              <span className="divider">|</span>
              <button
                type="button"
                className="btn-link"
                onClick={() => setIsResetMode(true)}
                disabled={loading}
              >
                Восстановить пароль
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
