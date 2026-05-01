import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import './ProductPage.scss';

const ProductPage = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const referralId = searchParams.get('ref');
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`http://localhost:8000/server_cm/product/${productId}/`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Не удалось загрузить продукт');
        setProduct(data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Ошибка загрузки');
      })
      .finally(() => setLoading(false));
  }, [productId]);

  // Трекинг просмотра при загрузке страницы
  useEffect(() => {
    if (referralId && product) {
      fetch('http://localhost:8000/server_cm/dashboard/track/view/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referral_id: referralId })
      }).catch(err => console.error('Ошибка трекинга просмотра:', err));
    }
  }, [referralId, product]);

  // Обработчик клика на кнопку перехода
  const handleGoToBank = () => {
    if (referralId) {
      fetch('http://localhost:8000/server_cm/dashboard/track/click/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referral_id: referralId })
      }).catch(err => console.error('Ошибка трекинга клика:', err));
    }
    
    if (product.source_url) {
      window.open(product.source_url, '_blank');
    }
  };

  if (loading) {
    return <div className="product-page__loader">⏳ Загрузка продукта...</div>;
  }

  if (error || !product) {
    return (
      <div className="product-page__error">
        <h2>Упс!</h2>
        <p>{error || 'Продукт не найден.'}</p>
        <Link to="/catalog" className="btn btn--outline">← Вернуться в каталог</Link>
      </div>
    );
  }

  const cities = Array.isArray(product.cities) ? product.cities.filter(Boolean) : [];
  const formattedDate = product.date
    ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(product.date))
    : '';

  return (
    <div className="product-page">
      <Link to="/catalog" className="product-page__back">← Назад к предложениям</Link>
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
              <span key={i} className="badge badge--city">{city}</span>
            ))}
            {formattedDate && <span className="badge badge--date">Добавлено: {formattedDate}</span>}
          </div>

          <h1 className="product-page__title">{product.name}</h1>

          <div className="product-page__summary">
            {product.description ? (
              <div className="description-content" dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <p>Подробное описание для этого предложения пока не добавлено.</p>
            )}
          </div>

          <div className="product-page__actions">
            {product.source_url ? (
              <button 
                onClick={handleGoToBank}
                className="btn btn--primary btn--lg"
              >
                🚀 Оформить предложение
              </button>
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