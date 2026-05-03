import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.scss';
import { apiGet, apiPost } from '../api/client';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    city: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await apiGet('/cities/', { cache: true });
        if (Array.isArray(data)) setCities(data);
      } catch (err) {
        console.error('Ошибка загрузки городов:', err);
      }
    };

    run();
  }, []);

  useEffect(() => {
    let interval;

    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError('');
  };

  const maskEmail = (email) => {
    if (!email.includes('@')) return email;
    const [local, domain] = email.split('@');
    if (local.length <= 1) return email;
    return `${local[0]}${'*'.repeat(local.length - 1)}@${domain}`;
  };

  const handleRegisterInit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setServerError('Пароли не совпадают!');
      return;
    }

    if (formData.password.length < 6) {
      setServerError('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const data = await apiPost('/auth/register-init/', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        password: formData.password,
      });

      if (data?.error) {
        setServerError(data.error);
        return;
      }

      setStep(2);
      setTimer(60);
    } catch (err) {
      setServerError('Не удалось подключиться к серверу');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterVerify = async (e) => {
    e.preventDefault();

    if (formData.verificationCode.length !== 6 || !/^\d+$/.test(formData.verificationCode)) {
      setServerError('Введите корректный 6-значный код');
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const data = await apiPost('/auth/register-verify/', {
        email: formData.email,
        code: formData.verificationCode,
      });

      if (data?.error) {
        setServerError(data.error);
        return;
      }

      alert('✅ Регистрация успешна! Теперь вы можете войти.');
      navigate('/login');
    } catch (err) {
      setServerError('Не удалось подключиться к серверу');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timer > 0) return;

    setLoading(true);
    setServerError('');

    try {
      const data = await apiPost('/auth/register-init/', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        password: formData.password,
      });

      if (data?.error) {
        setServerError(data.error);
        return;
      }

      setTimer(60);
      setServerError('Код отправлен повторно!');
    } catch (err) {
      setServerError('Ошибка соединения');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {step === 1 && (
          <>
            <h2 className="register-title">Регистрация</h2>
            <form onSubmit={handleRegisterInit} className="register-form">
              <div className="form-row">
                <input
                  type="text"
                  name="firstName"
                  placeholder="Имя"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Фамилия"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <input
                type="tel"
                name="phone"
                placeholder="Номер телефона"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Почта"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />

              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="form-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="">Город (необязательно)</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>

              <input
                type="password"
                name="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Подтвердите пароль"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                required
              />

              {serverError && <div className="server-error">{serverError}</div>}

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Отправка...' : 'Зарегистрироваться'}
              </button>
            </form>

            <div className="form-footer">
              <p>
                Уже есть аккаунт? <Link to="/login">Войти</Link>
              </p>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="verification-step">
            <h2 className="register-title">Подтверждение почты</h2>
            <p className="verification-text">
              Мы отправили код подтверждения на <strong>{maskEmail(formData.email)}</strong>
            </p>

            <form onSubmit={handleRegisterVerify} className="verification-form">
              <div className="code-input-wrapper">
                <input
                  type="text"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  placeholder="000000"
                  className="code-input"
                  maxLength={6}
                  autoComplete="off"
                  required
                />
              </div>

              {serverError && <div className="server-error">{serverError}</div>}

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Проверка...' : 'Подтвердить почту'}
              </button>
            </form>

            <div className="verification-footer">
              <button
                type="button"
                className="btn-resend"
                onClick={handleResendCode}
                disabled={timer > 0 || loading}
              >
                {timer > 0 ? `Отправить повторно через ${timer}с` : 'Отправить код повторно'}
              </button>

              <button type="button" className="btn-back" onClick={() => setStep(1)}>
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
