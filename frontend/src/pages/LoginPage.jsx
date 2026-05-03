import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.scss';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '', 
    password: '',
    resetEmail: ''
  });

  // 🔹 Проверка токена при загрузке (если уже авторизован)
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Можно отправить запрос на сервер для валидации токена
      fetch('http://localhost:8000/server_cm/auth/validate/', {
        headers: { 'Authorization': `Token ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          localStorage.setItem('user', JSON.stringify(data.user));
          window.dispatchEvent(new Event('authchange'));
          navigate('/profile'); // Если токен валиден — сразу в кабинет
        }
        else{
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
      })
      .catch(() => {localStorage.removeItem('auth_token');localStorage.removeItem('user');});
    }
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
      const response = await fetch('http://localhost:8000/server_cm/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        window.dispatchEvent(new Event('authchange'));
        navigate('/profile');
      } else {
        alert(data.error || 'Неверный логин или пароль');
      }
    } catch (error) {
      alert('Ошибка подключения к серверу');
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
    const response = await fetch('http://localhost:8000/server_cm/auth/reset-password/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.resetEmail.trim().toLowerCase() })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('✅ Новый пароль отправлен на вашу почту. Проверьте папку "Входящие" и "Спам".');
      setIsResetMode(false);
      setFormData({ identifier: '', password: '', resetEmail: '' });
    } else {
      alert(data.error || 'Ошибка при сбросе пароля');
    }
  } catch (error) {
    console.error(error);
    alert('Не удалось подключиться к серверу');
  } finally {
    setLoading(false);
  }
};

  // 🔹 Выход из аккаунта
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
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
            <p className="reset-text">
              Введите вашу почту, мы сгенерируем новый пароль
            </p>
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
              <Link to="/register" className="btn-link">Регистрация</Link>
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