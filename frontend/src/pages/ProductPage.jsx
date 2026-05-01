import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import './ProductPage.scss';

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔹 Refs для предотвращения дублирования запросов при ре-рендере
  const hasTrackedView = useRef(false);
  const hasTrackedClick = useRef(false);

  // 🔹 Загрузка данных продукта
  useEffect(() => {
    setLoading(true);
    setError('');
    hasTrackedView.current = false;
    hasTrackedClick.current = false;

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

  // 🔹 Трекинг ПРОСМОТРА (срабатывает один раз при успешной загрузке)
  useEffect(() => {
    if (product && product.referral_id && !hasTrackedView.current) {
      hasTrackedView.current = true;
      fetch('http://localhost:8000/server_cm/dashboard/track/view/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referral_id: product.referral_id })
      })
      .then(() => console.log('✅ Просмотр зафиксирован'))
      .catch(err => console.error('❌ Ошибка трекинга просмотра:', err));
    }
  }, [product]);

  // 🔹 Трекинг КЛИКА (срабатывает при нажатии кнопки перехода)
  const handleGoToBank = (e) => {
    if (product && product.referral_id && !hasTrackedClick.current) {
      hasTrackedClick.current = true;
      fetch('http://localhost:8000/server_cm/dashboard/track/click/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true, // Гарантирует отправку даже при переходе по ссылке
        body: JSON.stringify({ referral_id: product.referral_id })
      })
      .then(() => console.log('✅ Клик зафиксирован'))
      .catch(err => console.error('❌ Ошибка трекинга клика:', err));
    }
  };

  // 🔹 Состояние загрузки
  if (loading) {
    return <div className="product-page__loader">⏳ Загрузка продукта...</div>;
  }

  // 🔹 Состояние ошибки или отсутствия продукта
  if (error || !product) {
    return (
      <div className="product-page__error">
        <h2>Упс!</h2>
        <p>{error || 'Продукт не найден.'}</p>
        <Link to="/catalog" className="btn btn--outline">← Вернуться в каталог</Link>
      </div>
    );
  }

  // 🔹 Подготовка данных для рендера
  const cities = Array.isArray(product.cities) ? product.cities.filter(Boolean) : [];
  const formattedDate = product.date
    ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(product.date))
    : '';

  // 🔹 Рендер (структура и классы сохранены точно как в вашем варианте)
  return (
    <div className="product-page">
      <Link to="/catalog" className="product-page__back">← Назад к предложениям</Link>
      
      <div className="product-page__container">
        {/* ️ Левая часть: Изображение */}
        <div className="product-page__gallery">
          {product.image ? (
            <img src={product.image} alt={product.name} className="product-page__image" />
          ) : (
            <div className="product-page__image-placeholder">Изображение отсутствует</div>
          )}
        </div>

        {/*  Правая часть: Информация */}
        <div className="product-page__details">
          <div className="product-page__badges">
            {product.category && <span className="badge badge--primary">{product.category}</span>}
            {cities.map((city, i) => (
              <span key={i} className="badge badge--city">{city}</span>
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
              <div className="description-content" dangerouslySetInnerHTML={{ __html: product.description }} />
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