import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import './ProductPage.scss';
import { apiGet, apiPost } from '../api/client';

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasTrackedView = useRef(false);
  const hasTrackedClick = useRef(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    hasTrackedView.current = false;
    hasTrackedClick.current = false;

    const run = async () => {
      try {
        const data = await apiGet(`/product/${productId}/`, { cache: false, cacheTtlMs: 0 });
        setProduct(data);
      } catch (err) {
        const msg = err?.response?.data?.error || err?.message || 'Ошибка загрузки';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [productId]);

  useEffect(() => {
    if (!product?.referral_id || hasTrackedView.current) return;

    hasTrackedView.current = true;

    apiPost('/dashboard/track/view/', { referral_id: product.referral_id }).catch((err) => {
      console.error('❌ Ошибка трекинга просмотра:', err);
    });
  }, [product]);

  const handleGoToBank = () => {
    if (!product?.referral_id || hasTrackedClick.current) return;

    hasTrackedClick.current = true;

    apiPost('/dashboard/track/click/', { referral_id: product.referral_id }).catch((err) => {
      console.error('❌ Ошибка трекинга клика:', err);
    });
  };

  if (loading) {
    return <div className="product-page__loader">⏳ Загрузка продукта...</div>;
  }

  if (error || !product) {
    return (
      <div className="product-page__error">
        <h2>Упс!</h2>
        <p>{error || 'Продукт не найден.'}</p>
        <Link to="/catalog" className="btn btn--outline">
          ← Вернуться в каталог
        </Link>
      </div>
    );
  }

  const cities = Array.isArray(product.cities) ? product.cities.filter(Boolean) : [];
  const formattedDate = product.date
    ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(product.date))
    : '';

  return (
    <div className="product-page">
      <Link to="/catalog" className="product-page__back">
        ← Назад к предложениям
      </Link>

      <div className="product-page__container">
        <div className="product-page__gallery">
          {product.image ? (
            <img src={product.image} alt={product.name} className="product-page__image" />
          ) : (
            <div className="product-page__image-placeholder">Изображение отсутствует</div>
          )}
        </div>

        <div className="product-page__details">
          <div className="product-page__badges">
            {product.category && <span className="badge badge--primary">{product.category}</span>}
            {cities.map((city, i) => (
              <span key={i} className="badge badge--city">
                {city}
              </span>
            ))}
            {formattedDate && <span className="badge badge--date">Добавлено: {formattedDate}</span>}
          </div>

          <h1 className="product-page__title">{product.name}</h1>

          {product.short_description && (
            <div className="product-page__summary">
              <p>{product.short_description}</p>
            </div>
          )}

          <div className="product-page__full-description">
            {product.description ? (
              <div
                className="description-content"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p>Подробное описание для этого предложения пока не добавлено.</p>
            )}
          </div>

          <div className="product-page__actions">
            {product.source_url ? (
              <a
                href={product.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary btn--lg"
                onClick={handleGoToBank}
              >
                🚀 Оформить предложение
              </a>
            ) : (
              <button className="btn btn--disabled btn--lg" disabled>
                Ссылка на оформление появится позже
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
