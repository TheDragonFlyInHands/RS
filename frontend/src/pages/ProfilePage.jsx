import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.scss';

const ProfilePage = () => {
  const navigate = useNavigate();
  
  // Загружаем данные, если они есть (или ставим заглушки)
  const [userData, setUserData] = useState({
    firstName: localStorage.getItem('userName') || 'Иван',
    lastName: localStorage.getItem('userSurname') || 'Иванов',
    phone: localStorage.getItem('userPhone') || '+7 (999) 123-45-67',
    email: localStorage.getItem('userEmail') || 'example@mail.ru',
    city: 'Москва'
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Пароли не совпадают!');
      return;
    }
    // Здесь будет логика отправки на сервер
    alert('Данные успешно сохранены!');
    localStorage.setItem('userName', userData.firstName); // Обновляем кэш
  };

  const handleCancel = () => {
    if (window.confirm('Вы уверены? Несохраненные изменения будут потеряны.')) {
      window.location.reload(); // Просто перезагружаем для отката
    }
  };

  const handleLogout = () => {
    if (window.confirm('Вы хотите выйти из аккаунта?')) {
      navigate('/');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar-placeholder">
            {/* Имитация фото профиля */}
            👤
          </div>
          <h2 className="profile-title">Личный кабинет</h2>
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-section">
            <div className="form-group">
              <label>Имя</label>
              <input 
                type="text" 
                name="firstName" 
                value={userData.firstName} 
                onChange={handleUserChange} 
              />
            </div>

            <div className="form-group">
              <label>Фамилия</label>
              <input 
                type="text" 
                name="lastName" 
                value={userData.lastName} 
                onChange={handleUserChange} 
              />
            </div>

            <div className="form-group">
              <label>Номер телефона</label>
              <input 
                type="tel" 
                name="phone" 
                value={userData.phone} 
                onChange={handleUserChange} 
              />
            </div>

            <div className="form-group">
              <label>Почта</label>
              <input 
                type="email" 
                name="email" 
                value={userData.email} 
                onChange={handleUserChange} 
              />
            </div>

            <div className="form-group">
              <label>Город</label>
              <input 
                type="text" 
                name="city" 
                value={userData.city} 
                onChange={handleUserChange} 
              />
            </div>
          </div>

          <div className="form-section password-section">
            <h3>Смена пароля</h3>
            <div className="form-group">
              <label>Новый пароль</label>
              <input 
                type="password" 
                name="newPassword" 
                value={passwordData.newPassword} 
                onChange={handlePasswordChange} 
                placeholder="Минимум 6 символов"
              />
            </div>
            <div className="form-group">
              <label>Подтвердите новый пароль</label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={passwordData.confirmPassword} 
                onChange={handlePasswordChange} 
                placeholder="Повторите пароль"
              />
            </div>
          </div>

          <div className="profile-actions">
            <button type="button" className="btn-cancel" onClick={handleCancel}>Отмена</button>
            <button type="submit" className="btn-save">Сохранить</button>
            <button type="button" className="btn-logout" onClick={handleLogout}>Выйти</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;