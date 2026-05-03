import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../data/offersData';
import './AddProductPage.scss';
import { apiGet, apiPost } from '../api/client';
import { getAuthToken } from '../api/cookies';

const availableCategories = categories.filter(({ value }) => value !== 'all');

const initialFormState = {
  name: '',
  category: '',
  short_description: '',
  description: '',
  source_url: '',
  primary_city: '',
  cities: [],
};

const AddProductPage = () => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(initialFormState);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageLabel, setImageLabel] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cities, setCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [citiesError, setCitiesError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const data = await apiGet('/cities/', { cache: true, cacheTtlMs: 60 * 60 * 1000 });
        if (!Array.isArray(data)) throw new Error('Некорректный ответ сервера');

        const formattedCities = data.map((city) => ({
          value: city.id,
          label: city.name,
        }));

        setCities(formattedCities);
      } catch (err) {
        setCitiesError('Ошибка загрузки списка городов. Попробуйте обновить страницу.');
        console.error(err);
      } finally {
        setIsLoadingCities(false);
      }
    };

    run();
  }, []);

  const resetPreview = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCityToggle = (cityValue) => {
    setFormData((prev) => {
      const isSelected = prev.cities.includes(cityValue);
      const nextCities = isSelected
        ? prev.cities.filter((item) => item !== cityValue)
        : [...prev.cities, cityValue];

      let nextPrimaryCity = prev.primary_city;
      if (!nextCities.length) {
        nextPrimaryCity = '';
      } else if (!nextPrimaryCity || !nextCities.includes(nextPrimaryCity)) {
        nextPrimaryCity = nextCities[0];
      }

      return { ...prev, cities: nextCities, primary_city: nextPrimaryCity };
    });
  };

  const handleChooseFile = () => fileInputRef.current?.click();

  const handleImageUpload = (event) => {
    const [file] = event.target.files || [];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Файл слишком большой. Выберите изображение до 5 МБ.');
      event.target.value = '';
      return;
    }

    resetPreview();
    setSelectedImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setImageLabel(file.name);
    setError('');
    event.target.value = '';
  };

  const resetForm = () => {
    resetPreview();
    setFormData(initialFormState);
    setSelectedImageFile(null);
    setPreviewUrl('');
    setImageLabel('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Заполните название продукта.');
      return;
    }
    if (!formData.category) {
      setError('Выберите категорию.');
      return;
    }
    if (!formData.short_description.trim()) {
      setError('Добавьте короткое описание для карточки.');
      return;
    }
    if (!formData.cities.length) {
      setError('Выберите хотя бы один город получения.');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError('Нужна авторизация для добавления продукта.');
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('category', formData.category);
    payload.append('short_description', formData.short_description);
    payload.append('description', formData.description);
    payload.append('source_url', formData.source_url);

    formData.cities.forEach((cityId) => payload.append('cities', cityId));
    if (selectedImageFile) payload.append('image', selectedImageFile);

    setIsSubmitting(true);
    try {
      const result = await apiPost('/products/new/', payload);

      if (result?.error) {
        setError(result.error || 'Не удалось добавить продукт.');
        return;
      }

      setSuccess(`✅ Продукт #${result?.product_id} успешно добавлен в каталог.`);
      resetForm();
    } catch (submitError) {
      const msg = submitError?.response?.data?.error || 'Не удалось подключиться к серверу.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product-page">
      <section className="add-product-intro">
        <div>
          <h1>Добавление продукта</h1>
          <p>
            Соберите карточку предложения с фото, кратким описанием и городами выдачи. После сохранения
            продукт сразу попадёт в каталог.
          </p>
        </div>
      </section>

      <section className="add-product-shell">
        <form className="add-product-form" onSubmit={handleSubmit}>
          <div className="add-product-form__grid">
            <div className="photo-upload">
              <div
                className={`photo-upload__preview ${previewUrl ? 'has-image' : ''}`}
                onClick={handleChooseFile}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Предпросмотр продукта" />
                ) : (
                  <div className="photo-upload__placeholder">
                    <strong>Фото продукта</strong>
                    <span>Загрузите изображение, оно будет сохранено как отдельный файл.</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden-input"
                onChange={handleImageUpload}
              />
            </div>

            <label className="form-field">
              <span>Название</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFieldChange}
                placeholder="Например, Кредит наличными"
              />
            </label>

            <label className="form-field">
              <span>Категория</span>
              <select name="category" value={formData.category} onChange={handleFieldChange}>
                <option value="">Выберите категорию</option>
                {availableCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="cities-section">
              <div className="section-heading">
                <span>Города получения</span>
                <p>Можно отметить несколько городов и выбрать основной.</p>
              </div>

              {isLoadingCities ? (
                <p className="cities-loading">🔄 Загрузка городов...</p>
              ) : citiesError ? (
                <p className="cities-error">❌ {citiesError}</p>
              ) : (
                <div className="cities-grid">
                  {cities.map((city) => {
                    const isSelected = formData.cities.includes(city.value);
                    return (
                      <label
                        key={city.value}
                        className={`city-chip ${isSelected ? 'is-selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCityToggle(city.value)}
                        />
                        <span>{city.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <label className="form-field">
              <span>Короткое описание</span>
              <textarea
                name="short_description"
                value={formData.short_description}
                onChange={handleFieldChange}
                rows="4"
                placeholder="Короткий текст для карточки в каталоге"
              />
            </label>

            <label className="form-field">
              <span>Исходная ссылка</span>
              <input
                type="url"
                name="source_url"
                value={formData.source_url}
                onChange={handleFieldChange}
                placeholder="https://bank.ru/product"
              />
            </label>

            <label className="form-field form-field--full">
              <span>Описание</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFieldChange}
                rows="7"
                placeholder="Подробно опишите условия, преимущества и ограничения продукта"
              />
            </label>
          </div>

          {(error || success) && (
            <div className={`form-message ${error ? 'is-error' : 'is-success'}`}>
              {error || success}
            </div>
          )}

          <div className="form-footer">
            <Link to="/catalog" className="form-footer__link">
              Перейти в каталог
            </Link>
            <button type="submit" className="primary-button" disabled={isSubmitting || isLoadingCities}>
              {isSubmitting ? 'Добавление...' : 'Добавить продукт'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default AddProductPage;
