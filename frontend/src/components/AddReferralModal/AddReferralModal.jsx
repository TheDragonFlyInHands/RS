import React, { useState, useEffect } from 'react';
import './AddReferralModal.scss';

const AddReferralModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  const fetchProducts = async (pageNum, append = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      let url = `http://localhost:8000/server_cm/dashboard/search-products/?page=${pageNum}`;
      if (searchQuery.trim()) url += `&q=${encodeURIComponent(searchQuery.trim())}`;

      const res = await fetch(url, { headers: { 'Authorization': `Token ${token}` } });
      const data = await res.json();

      if (res.ok) {
        setProducts(prev => append ? [...prev, ...data.products] : data.products);
        // Собираем уникальные категории из загруженных продуктов
        const uniqueCats = [...new Set(data.products.map(p => p.category).filter(Boolean))];
        setCategories(prev => {
          const merged = [...new Set([...prev, ...uniqueCats])];
          return ['all', ...merged.filter(c => c !== 'all')];
        });
        setHasMore(data.has_more);
      }
    } catch (err) {
      console.error('Ошибка загрузки продуктов:', err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка при изменении поиска или монтировании
  useEffect(() => {
    setProducts([]);
    setPage(1);
    fetchProducts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Локальная фильтрация по категории
  useEffect(() => {
    const filtered = categoryFilter === 'all' 
      ? products 
      : products.filter(p => p.category === categoryFilter);
    setFilteredProducts(filtered);
  }, [categoryFilter, products]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!link.trim()) return alert('Введите ссылку');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8000/server_cm/dashboard/add-referral/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ 
          product_id: selectedProduct.id, 
          referral_link: link.trim() 
        })
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess();
      } else {
        alert(data.error || 'Ошибка при сохранении');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка сети');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>
          {step === 1 ? 'Выберите продукт для реферальной ссылки' : `Продукт: ${selectedProduct?.name}`}
        </h2>

        {step === 1 ? (
          <div className="product-selector">
            <div className="filters">
              <input 
                type="text" 
                placeholder="Поиск по названию..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <select 
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="category-select"
              >
                <option value="all">Все категории</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="products-grid">
              {filteredProducts.length === 0 && !loading ? (
                <p className="no-products">Продукты не найдены</p>
              ) : (
                filteredProducts.map(p => (
                  <div key={p.id} className="product-card" onClick={() => handleProductSelect(p)}>
                    <div className="product-card__image">
                      {p.image ? (
                        <img src={p.image} alt={p.name} />
                      ) : (
                        <div className="product-card__placeholder"></div>
                      )}
                    </div>
                    <div className="product-card__info">
                      <h3>{p.name}</h3>
                      {p.category && <span className="product-category">{p.category}</span>}
                      {p.short_description && <p className="product-desc">{p.short_description}</p>}
                    </div>
                    <button 
                      className="select-btn" 
                      onClick={(e) => { e.stopPropagation(); handleProductSelect(p); }}
                    >
                      Выбрать
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {hasMore && !loading && (
              <button className="load-more" onClick={handleLoadMore}>Загрузить ещё</button>
            )}
            {loading && <p className="loading">Загрузка...</p>}
          </div>
        ) : (
          <div className="link-form">
            <div className="selected-product-info">
              <strong>Выбранный продукт:</strong>
              <p>{selectedProduct.name}</p>
              {selectedProduct.category && <span>{selectedProduct.category}</span>}
            </div>
            
            <label>Ссылка на рефералку:</label>
            <input 
              type="url" 
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://bank.ru/product?ref=..."
            />
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>Назад</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Сохранение...' : 'Добавить ссылку'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddReferralModal;