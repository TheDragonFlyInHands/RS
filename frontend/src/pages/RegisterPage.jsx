import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.scss';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 - форма регистрации, 2 - подтверждение почты
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Маскировка email: test@gmail.com -> t***@gmail.com
  const maskEmail = (email) => {
    if (!email.includes('@')) return email;
    const [local, domain] = email.split('@');
    if (local.length <= 1) return email;
    const maskedLocal = local[0] + '*'.repeat(local.length - 1);
    return `${maskedLocal}@${domain}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        alert('Пароли не совпадают!');
        return;
      }
      setStep(2);
    } else {
      if (formData.verificationCode.length < 4) {
        alert('Введите корректный код подтверждения');
        return;
      }
      alert('Почта подтверждена! Регистрация завершена.');
      navigate('/profile');
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        
        {step === 1 && (
          <>
            <h2 className="register-title">Регистрация</h2>
            <form onSubmit={handleSubmit} className="register-form">
              <input
                type="text" name="firstName" placeholder="Имя"
                value={formData.firstName} onChange={handleChange} className="form-input" required
              />
              <input
                type="text" name="lastName" placeholder="Фамилия"
                value={formData.lastName} onChange={handleChange} className="form-input" required
              />
              <input
                type="tel" name="phone" placeholder="Номер телефона"
                value={formData.phone} onChange={handleChange} className="form-input" required
              />
              <input
                type="email" name="email" placeholder="Почта"
                value={formData.email} onChange={handleChange} className="form-input" required
              />
              <input
                type="password" name="password" placeholder="Пароль"
                value={formData.password} onChange={handleChange} className="form-input" required
              />
              <input
                type="password" name="confirmPassword" placeholder="Подтвердите пароль"
                value={formData.confirmPassword} onChange={handleChange} className="form-input" required
              />
              <button type="submit" className="btn-submit">Зарегистрироваться</button>
            </form>
            <div className="form-footer">
              <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="verification-step">
            <h2 className="register-title">Подтверждение почты</h2>
            <p className="verification-text">
              Мы отправили код подтверждения на <strong>{maskEmail(formData.email)}</strong>
            </p>

            <form onSubmit={handleSubmit} className="verification-form">
              <div className="code-input-wrapper">
                <input
                  type="text"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  placeholder="Введите код"
                  className="code-input"
                  maxLength={6}
                  autoComplete="off"
                  required
                />
              </div>
              <button type="submit" className="btn-submit">Подтвердить почту</button>
            </form>

            <div className="verification-footer">
              <button 
                type="button" 
                className="btn-resend"
                onClick={() => alert('Код отправлен повторно')}
              >
                Отправить код повторно
              </button>
              <button 
                type="button" 
                className="btn-back"
                onClick={() => setStep(1)}
              >
                Вернуться к регистрации
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RegisterPage;