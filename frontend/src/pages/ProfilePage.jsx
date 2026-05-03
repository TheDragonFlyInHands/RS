import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.scss';

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [originalData, setOriginalData] = useState(userData);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(userData.avatar_url || '');
  const [avatarLabel, setAvatarLabel] = useState('');

  // 🔹 Состояние для списка городов
  const [cities, setCities] = useState([]);

  // 🔹 Загрузка городов при монтировании компонента
  useEffect(() => {
    fetch('http://localhost:8000/server_cm/cities/')
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(err => console.error('Ошибка загрузки городов:', err));
  }, []);

  const resetAvatarPreview = () => {
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
  };

  const handleUserChange = (event) => {
    setUserData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handlePasswordChange = (event) => {
    setPasswordData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleChooseAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой. Выберите изображение до 5 МБ.');
      event.target.value = '';
      return;
    }
    resetAvatarPreview();
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarLabel(file.name);
    event.target.value = '';
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Пароли не совпадают!');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const payload = new FormData();

      payload.append('first_name', userData.first_name || '');
      payload.append('last_name', userData.last_name || '');
      payload.append('phone', userData.phone || '');
      payload.append('city', userData.city || ''); // Отправляем выбранное название города

      if (passwordData.newPassword) {
        payload.append('newPassword', passwordData.newPassword);
        payload.append('confirmPassword', passwordData.confirmPassword);
      }
      if (avatarFile) {
        payload.append('avatar', avatarFile);
      }

      const response = await fetch('http://localhost:8000/server_cm/auth/update-profile/', {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` },
        body: payload,
      });

      const result = await response.json();
      if (response.ok) {
        alert('✅ Данные успешно сохранены!');
        localStorage.setItem('user', JSON.stringify(result.user));
        setUserData(result.user);
        setOriginalData(result.user);
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setAvatarFile(null);
        resetAvatarPreview();
        setAvatarPreview(result.user.avatar_url || '');
        setAvatarLabel('');
        window.dispatchEvent(new Event('authchange'));
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
      setAvatarFile(null);
      resetAvatarPreview();
      setAvatarPreview(originalData.avatar_url || '');
      setAvatarLabel('');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Выйти из аккаунта?')) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('authchange'));
      navigate('/');
    }
  };

  const renderedAvatar = avatarPreview || userData.avatar_url || '';

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {renderedAvatar ? (
              <img src={renderedAvatar} alt="Фото профиля" className="profile-avatar__image" />
            ) : (
              <span className="profile-avatar__placeholder">👤</span>
            )}
          </div>
          <div className="profile-header__content">
            <h2 className="profile-title">Личный кабинет</h2>
            <div className="profile-avatar__controls">
              <button type="button" className="profile-avatar__button" onClick={handleChooseAvatar} disabled={loading}>
                Прикрепить фотографию
              </button>
              {avatarLabel && <span className="profile-avatar__filename">{avatarLabel}</span>}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="profile-avatar__input" onChange={handleAvatarChange} />
          </div>
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
              <input type="tel" name="phone" value={userData.phone || ''} readOnly className="readonly-input" />
            </div>
            <div className="form-group">
              <label>Почта</label>
              <input type="email" name="email" value={userData.email || ''} readOnly className="readonly-input" />
            </div>
            
            {/* 🔹 Выпадающий список городов вместо текстового поля */}
            <div className="form-group">
              <label>Город</label>
              <select name="city" value={userData.city || ''} onChange={handleUserChange}>
                <option value="">Выберите город</option>
                {cities.map(city => (
                  <option key={city.id} value={city.name}>{city.name}</option>
                ))}
              </select>
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