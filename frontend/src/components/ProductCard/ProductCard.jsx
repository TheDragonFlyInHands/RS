import React, { useState, useEffect } from 'react';
import './ProductCard.scss';

const ProductCard = ({ id }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Запрос данных при монтировании компонента
  useEffect(() => {
    fetch(`http://localhost:8000/server_cm/product/${id}/`)
      .then((response) => response.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка загрузки продукта:', error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="card card--loading">Загрузка...</div>;
  if (!product) return <div className="card card--error">Ошибка загрузки</div>;

  return (
    <div className="product-card">
      <div className="product-card__image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <span>Нет фото</span>
        )}
      </div>
      
      <div className="product-card__content">
        <h3 className="product-card__title">{product.name}</h3>
        <p className="product-card__description">
          {product.short_description}
        </p>
        <button className="product-card__button">К предложению</button>
      </div>
    </div>
  );
};

export default ProductCard;