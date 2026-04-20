import React from 'react';
import { cityNames } from '../../data/offersData';
import './ProductCard.scss';

const ProductCard = ({ offer }) => {
  const formattedDate = offer.date.split('-').reverse().join('.');
  
  return (
    <div className="product-card">
      <div className="product-card__image">Лого Банка</div>
      <div className="product-card__body">
        <div className="product-card__meta">
          <span>{formattedDate}</span>
          <span>{cityNames[offer.city]}</span>
        </div>
        <h3 className="product-card__title">{offer.title}</h3>
        <p className="product-card__description">{offer.desc}</p>
        <button className="product-card__button">К предложению</button>
      </div>
    </div>
  );
};

export default ProductCard;