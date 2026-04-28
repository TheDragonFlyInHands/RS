import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.scss';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  // 🔹 Функция проверки авторизации
  const checkAuth = () => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setIsAuth(true);
        // Формируем имя из модели: first_name + last_name
        setUserName(`${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Пользователь');
      } catch {
        setIsAuth(false);
        setUserName('');
      }
    } else {
      setIsAuth(false);
      setUserName('');
    }
  };

  // 🔹 Проверяем при загрузке + слушаем изменения в localStorage
  useEffect(() => {
    checkAuth(); // Проверка при монтировании
    
    // Слушатель для изменений localStorage (работает при выходе из аккаунта)
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token' || e.key === 'user') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Дополнительно: проверяем при фокусе на окне (если вкладку переключили)
    const handleFocus = () => checkAuth();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogin = () => {
    navigate('/login');
    closeMenu();
  };

  const handleRegister = () => {
    navigate('/register');
    closeMenu();
  };

  return (
    <header className="header">
      <div className="header__container">
        
        {/* Левая часть: Меню + Логотип */}
        <div className="header__left">
          <div className="menu-wrapper">
            <button 
              className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
              onClick={toggleMenu}
              aria-label="Открыть меню"
            >
              <span className="menu-icon">
                <span></span>
                <span></span>
                <span></span>
              </span>
              <span className="menu-text">{isMenuOpen ? 'Закрыть' : 'Меню'}</span>
            </button>
            
            <nav className={`dropdown-nav ${isMenuOpen ? 'active' : ''}`}>
              <Link to="/" onClick={closeMenu}>Главная</Link>
              <Link to="/catalog" onClick={closeMenu}>Все предложения</Link>
              <Link to="/about" onClick={closeMenu}>О нас</Link>
              <Link to="/contacts" onClick={closeMenu}>Контакты</Link>
              
              {!isAuth && (
                <>
                  <button className="dropdown-btn" onClick={handleLogin}>Войти</button>
                  <button className="dropdown-btn" onClick={handleRegister}>Регистрация</button>
                </>
              )}
            </nav>
          </div>

          <Link to="/" className="logo">BankOffers</Link>
        </div>

        {/* Правая часть: Кнопки или Профиль */}
        <div className="header__right">
          {isAuth ? (
            <Link to="/profile" className="user-profile-link">
              <span className="user-name">{userName}</span>
              <div className="user-avatar">👤</div>
            </Link>
          ) : (
            <>
              <button className="btn btn--outline" onClick={handleLogin}>Войти</button>
              <button className="btn btn--primary" onClick={handleRegister}>Регистрация</button>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;