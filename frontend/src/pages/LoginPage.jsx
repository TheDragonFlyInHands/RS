import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.scss';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isResetMode, setIsResetMode] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '', // Почта или телефон
    password: '',
    resetEmail: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isResetMode) {
      if (!formData.resetEmail) return alert('Введите почту');
      alert(`Инструкция для сброса пароля отправлена на ${formData.resetEmail}`);
      setIsResetMode(false); // Возврат к форме входа
    } else {
      if (!formData.identifier || !formData.password) return alert('Заполните все поля');
      alert('Вход выполнен!');
      navigate('/'); // Переход на главную после входа
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {isResetMode ? (
          // 🔄 Режим восстановления пароля
          <div className="reset-step">
            <h2 className="login-title">Восстановление пароля</h2>
            <p className="reset-text">
              Введите вашу почту, мы отправим инструкцию для сброса пароля
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
              />
              <button type="submit" className="btn-submit">Сбросить пароль</button>
            </form>
            <div className="reset-footer">
              <button type="button" className="btn-back" onClick={() => setIsResetMode(false)}>
                Вернуться к входу
              </button>
            </div>
          </div>
        ) : (
          // 🔐 Режим входа
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
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Пароль"
                className="form-input"
                required
              />
              <button type="submit" className="btn-submit">Войти</button>
            </form>

            <div className="login-actions">
              <Link to="/register" className="btn-link">Регистрация</Link>
              <span className="divider">|</span>
              <button type="button" className="btn-link" onClick={() => setIsResetMode(true)}>
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