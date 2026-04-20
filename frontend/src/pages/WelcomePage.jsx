import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import { offersData } from '../data/offersData';
import './WelcomePage.scss';

const WelcomePage = () => {

  const popularOffers = offersData.slice(0, 3);

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
          {popularOffers.map(offer => (
            <ProductCard key={offer.id} offer={offer} />
          ))}
        </div>
      </section>

      <div className="welcome-page__catalog-link">
        <Link to="/catalog" className="catalog-btn">Смотреть весь каталог →</Link>
      </div>
    </div>
  );
};

export default WelcomePage;