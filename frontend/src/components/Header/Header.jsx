import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.scss';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

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
          {/* Кнопка меню (гамбургер) */}
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
            
            {/* Выпадающее меню */}
            <nav className={`dropdown-nav ${isMenuOpen ? 'active' : ''}`}>
              <Link to="/" onClick={closeMenu}>Главная</Link>
              <Link to="/catalog" onClick={closeMenu}>Все предложения</Link>
              <Link to="/about" onClick={closeMenu}>О нас</Link>
              <Link to="/contacts" onClick={closeMenu}>Контакты</Link>
            </nav>
          </div>

          {/* Логотип */}
          <Link to="/" className="logo">
            BankOffers
          </Link>
        </div>

        {/* Правая часть: Кнопки входа и регистрации */}
        <div className="header__right">
          <button className="btn btn--outline" onClick={handleLogin}>
            Войти
          </button>
          <button className="btn btn--primary" onClick={handleRegister}>
            Регистрация
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;