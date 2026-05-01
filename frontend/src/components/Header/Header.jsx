import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.scss';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const navigate = useNavigate();

  // 🔹 Проверка авторизации + запрос статуса работника
  const checkAuth = () => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      setIsAuth(true);
      
      // 👇 Запрос на сервер для проверки is_employee
      fetch('http://localhost:8000/server_cm/auth/check-employee/', {
        headers: { 
          'Authorization': `Token ${token}` 
        }
      })
      .then(res => res.json())
      .then(data => {
        setIsEmployee(data.is_employee);
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserName(`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Пользователь');
        setUserAvatar(user.avatar_url || '');
      })
      .catch(() => {
        setIsEmployee(false);
        // При ошибке можно удалить токен
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setIsAuth(false);
      });
      
    } else {
      setIsAuth(false);
      setIsEmployee(false);
      setUserName('');
      setUserAvatar('');
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Слушатели для обновления при изменении localStorage
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__left">
          <div className="menu-wrapper">
            <button 
              className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
              onClick={toggleMenu}
            >
              <span className="menu-icon">
                <span></span><span></span><span></span>
              </span>
              <span className="menu-text">{isMenuOpen ? 'Закрыть' : 'Меню'}</span>
            </button>
            
            <nav className={`dropdown-nav ${isMenuOpen ? 'active' : ''}`}>
              <Link to="/" onClick={closeMenu}>Главная</Link>
              <Link to="/catalog" onClick={closeMenu}>Все предложения</Link>
              {isAuth && isEmployee && (
                <Link to="/products/new" onClick={closeMenu} >
                  Добавить продукт
                </Link>
              )&&(
                <Link to="/dashboard" onClick={closeMenu} >
                  Панель управления
                </Link>
              )}
              
              {isAuth && <Link to="/profile" onClick={closeMenu}>Личный кабинет</Link>}
              <Link to="/about" onClick={closeMenu}>О нас</Link>
              <Link to="/contacts" onClick={closeMenu}>Контакты</Link>
              
              {!isAuth && (
                <>
                  <button className="dropdown-btn" onClick={() => { navigate('/login'); closeMenu(); }}>Войти</button>
                  <button className="dropdown-btn" onClick={() => { navigate('/register'); closeMenu(); }}>Регистрация</button>
                </>
              )}
            </nav>
          </div>

          <Link to="/" className="logo">BankOffers</Link>
        </div>

        <div className="header__right">
          {isAuth ? (
            <Link to="/profile" className="user-profile-link">
              <span className="user-name">{userName}</span>
              <div className="user-avatar">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="user-avatar__image" />
                ) : '👤'}
              </div>
            </Link>
          ) : (
            <>
              <button className="btn btn--outline" onClick={() => navigate('/login')}>Войти</button>
              <button className="btn btn--primary" onClick={() => navigate('/register')}>Регистрация</button>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;