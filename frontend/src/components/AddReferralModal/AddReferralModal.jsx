import React, { useState, useEffect } from 'react';
//import './AddReferralModal.scss';

const AddReferralModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1 - выбор продукта, 2 - ввод ссылки
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Загрузка продуктов
  const loadProducts = async (query = '', pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(
        `http://localhost:8000/server_cm/dashboard/search-products/?q=${query}&page=${pageNum}`,
        { headers: { 'Authorization': `Token ${token}` } }
      );
      const data = await res.json();
      
      if (res.ok) {
        setProducts(prev => append ? [...prev, ...data.products] : data.products);
        setHasMore(data.has_more);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(searchQuery, page, page > 1);
  }, [searchQuery, page]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!link) return alert('Введите ссылку');
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
          referral_link: link
        })
      });

      if (res.ok) {
        onSuccess();
      } else {
        alert('Ошибка при сохранении');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h2>{step === 1 ? 'Выберите продукт' : `Продукт: ${selectedProduct?.name}`}</h2>

        {step === 1 ? (
          <div className="product-selector">
            <input 
              type="text" 
              placeholder="Поиск продукта..." 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              className="search-input"
            />
            <div className="products-list">
              {products.map(p => (
                <div key={p.id} className="product-item" onClick={() => handleProductSelect(p)}>
                  <strong>{p.name}</strong>
                  <span>{p.category}</span>
                </div>
              ))}
              {hasMore && !loading && (
                <button className="load-more" onClick={() => setPage(p => p + 1)}>Загрузить ещё</button>
              )}
              {loading && <p>Загрузка...</p>}
            </div>
          </div>
        ) : (
          <div className="link-form">
            <label>Ссылка на рефералку:</label>
            <input 
              type="url" 
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://..."
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>Назад</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Сохранение...' : 'Добавить'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddReferralModal;