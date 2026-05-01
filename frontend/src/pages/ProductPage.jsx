import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './ProductPage.scss';

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    fetch(`http://localhost:8000/server_cm/product/${productId}/`)
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Не удалось загрузить продукт');
        }

        setProduct(data);
      })
      .catch((fetchError) => {
        console.error('Ошибка загрузки страницы продукта:', fetchError);
        setError(fetchError.message || 'Не удалось загрузить продукт');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return <div className="product-page__status">Загрузка продукта...</div>;
  }

  if (error || !product) {
    return (
      <div className="product-page__status product-page__status--error">
        <p>{error || 'Продукт не найден.'}</p>
        <Link to="/catalog" className="product-page__status-link">
          Вернуться к каталогу
        </Link>
      </div>
    );
  }

  const productImage = product.image;
  const cities = Array.isArray(product.cities) ? product.cities.filter(Boolean) : [];
  const formattedDate = product.date
    ? new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(product.date))
    : '';

  return (
    <div className="product-page">
      <section className="product-page__hero">
        <Link to="/catalog" className="product-page__back">
          Вернуться к продуктам
        </Link>

        <div className="product-page__visual">
          {productImage ? (
            <img src={productImage} alt={product.name} />
          ) : (
            <div className="product-page__visual-placeholder">
              <strong>{product.name}</strong>
              <span>Изображение пока не добавлено</span>
            </div>
          )}
        </div>
      </section>

      <section className="product-page__content">
        <div className="product-page__meta">
          {product.category && <span className="product-page__badge">{product.category}</span>}
          {cities.map((city) => (
            <span key={city} className="product-page__badge product-page__badge--light">
              {city}
            </span>
          ))}
          {formattedDate && (
            <span className="product-page__badge product-page__badge--date">
              Добавлено {formattedDate}
            </span>
          )}
        </div>

        <h1 className="product-page__title">{product.name}</h1>

        <div className="product-page__description">
          {product.description ? (
            <p>{product.description}</p>
          ) : (
            <p>Подробное описание для этого предложения пока не добавлено.</p>
          )}
        </div>

        {product.short_description && (
          <div className="product-page__summary">
            <span>Кратко</span>
            <p>{product.short_description}</p>
          </div>
        )}

        {product.source_url ? (
          <a
            className="product-page__action"
            href={product.source_url}
            target="_blank"
            rel="noreferrer"
          >
            Оформить продукт
          </a>
        ) : (
          <button className="product-page__action product-page__action--disabled" type="button" disabled>
            Ссылка на оформление появится позже
          </button>
        )}
      </section>
    </div>
  );
};

export default ProductPage;
