import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.scss';

const ProfilePage = () => {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  const [originalData, setOriginalData] = useState(userData);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleUserChange = (e) => {
    setUserData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Пароли не совпадают!');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const payload = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        address: userData.address,
      };

      if (passwordData.newPassword) {
        payload.newPassword = passwordData.newPassword;
        payload.confirmPassword = passwordData.confirmPassword;
      }

      const response = await fetch('http://localhost:8000/server_cm/auth/update-profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ Данные успешно сохранены!');
        // Обновляем localStorage и исходные данные для отмены
        localStorage.setItem('user', JSON.stringify(result.user));
        setOriginalData(result.user);
        setPasswordData({ newPassword: '', confirmPassword: '' });
        // Сообщаем Header, что данные обновились
        window.dispatchEvent(new Event('storage'));
      } else {
        alert(`❌ ${result.error || 'Ошибка сохранения'}`);
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      alert('Не удалось подключиться к серверу');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Отменить несохранённые изменения?')) {
      setUserData(originalData);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    }
  };

  const handleLogout = () => {
    if (window.confirm('Выйти из аккаунта?')) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('storage')); // Обновит Header
      navigate('/');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar-placeholder">👤</div>
          <h2 className="profile-title">Личный кабинет</h2>
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-section">
            <div className="form-group">
              <label>Имя</label>
              <input type="text" name="first_name" value={userData.first_name || ''} onChange={handleUserChange} />
            </div>
            <div className="form-group">
              <label>Фамилия</label>
              <input type="text" name="last_name" value={userData.last_name || ''} onChange={handleUserChange} />
            </div>
            <div className="form-group">
              <label>Номер телефона</label>
              <input type="tel" name="phone" value={userData.phone || ''} onChange={handleUserChange} />
            </div>
            <div className="form-group">
              <label>Почта</label>
              <input type="email" name="email" value={userData.email || ''} readOnly className="readonly-input" />
            </div>
            <div className="form-group">
              <label>Город / Адрес</label>
              <input type="text" name="address" value={userData.address || ''} onChange={handleUserChange} />
            </div>
          </div>

          <div className="form-section password-section">
            <h3>Смена пароля</h3>
            <div className="form-group">
              <label>Новый пароль</label>
              <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="Оставьте пустым, если не меняете" />
            </div>
            <div className="form-group">
              <label>Подтвердите новый пароль</label>
              <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="Повторите пароль" />
            </div>
          </div>

          <div className="profile-actions">
            <button type="button" className="btn-cancel" onClick={handleCancel} disabled={loading}>Отмена</button>
            <button type="submit" className="btn-save" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
            <button type="button" className="btn-logout" onClick={handleLogout} disabled={loading}>Выйти</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;