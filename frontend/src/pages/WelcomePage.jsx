import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import './WelcomePage.scss';

const WelcomePage = () => {
  const [popularOffers, setPopularOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Запрос к Django серверу
    fetch('http://localhost:8000/server_cm/products/popular/')
      .then((response) => response.json())
      .then((data) => {
        setPopularOffers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка загрузки популярных предложений:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="welcome-page__loading">Загрузка предложений...</div>;
  }

  return (
    <div className="welcome-page">
      <section className="welcome-banner" id="about">
        <h1>BankOffers</h1>
        <p>
          Добро пожаловать! Мы собрали лучшие предложения от банков и финансовых организаций. 
          Найдите выгодный кредит, вклад, карту или страховку в вашем городе.
        </p>
      </section>

      <section className="popular-preview" id="popular">
        <h2>Популярные предложения</h2>
        
        <div className="preview-grid">
          {popularOffers.length > 0 ? (
            popularOffers.map((id) => (
              <ProductCard key={id} id={id} />
            ))
          ) : (
            <p className="no-offers">Пока нет доступных предложений</p>
          )}
        </div>
      </section>

      <div className="welcome-page__catalog-link">
        <Link to="/catalog" className="catalog-btn">Смотреть весь каталог →</Link>
      </div>
    </div>
  );
};

export default WelcomePage;