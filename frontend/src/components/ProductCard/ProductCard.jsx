import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.scss';
import { apiGet } from '../../api/client';

const ProductCard = ({ id }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загружаем продукт при изменении id.
  useEffect(() => {
    let mounted = true;

    // Асинхронная логика загрузки.
    const run = async () => {
      setLoading(true);
      try {
        const data = await apiGet(`/product/${id}/`, { cache: true });
        if (!mounted) return;
        setProduct(data);
      } catch (error) {
        console.error('Ошибка загрузки продукта:', error);
        if (!mounted) return;
        setProduct(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="card card--loading">Загрузка...</div>;
  }

  if (!product) {
    return <div className="card card--error">Ошибка загрузки</div>;
  }

  const productImage = product.image;

  return (
    <div className="product-card">
      <div className="product-card__image">
        {productImage ? <img src={productImage} alt={product.name} /> : <span>Нет фото</span>}
      </div>

      <div className="product-card__content">
        <h3 className="product-card__title">{product.name}</h3>
        <p className="product-card__description">{product.short_description}</p>
        <Link to={`/product/${id}`} className="product-card__button">
          К предложению
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
