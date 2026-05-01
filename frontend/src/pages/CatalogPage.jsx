import React, { useState, useEffect } from 'react';
import Controls from '../components/Controls/Controls';
import ProductCard from '../components/ProductCard/ProductCard';
import Pagination from '../components/Pagination/Pagination';
import './CatalogPage.scss';

const ITEMS_PER_PAGE = 8;

const CatalogPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('newest');
  const [categoryValue, setCategoryValue] = useState('all');
  const [cityValue, setCityValue] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Состояние для списка ID продуктов
  const [productIds, setProductIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Новое состояние для списка городов
  const [cities, setCities] = useState([]);

  // 🔹 Запрос списка городов при монтировании компонента
  useEffect(() => {
    const fetchCities = async () => {
      try {
        // Запрос к эндпоинту, который мы создавали ранее
        const response = await fetch('http://localhost:8000/server_cm/cities/');
        if (response.ok) {
          const data = await response.json();
          setCities(data);
        }
      } catch (error) {
        console.error('Ошибка загрузки городов:', error);
      }
    };

    fetchCities();
  }, []);

  // Функция запроса к серверу (получаем список ID продуктов)
  const fetchProductIds = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: categoryValue,
        city_id: cityValue, // Отправляем ID выбранного города
        search: searchValue,
        sort: sortValue
      });

      const response = await fetch(`http://localhost:8000/server_cm/products/filter/?${params}`);
      const data = await response.json();

      if (data.ids) {
        setProductIds(data.ids);
      }
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error);
    } finally {
      setLoading(false);
    }
  };

  // Запускаем запрос продуктов при изменении фильтров
  useEffect(() => {
    setCurrentPage(1); // Сбрасываем на 1 страницу при новом поиске
    fetchProductIds();
  }, [searchValue, sortValue, categoryValue, cityValue]);

  // Логика пагинации
  const totalPages = Math.ceil(productIds.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedIds = productIds.slice(startIndex, endIndex);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
  };

  return (
    <div className="catalog-page">
      <Controls 
        searchValue={searchValue}
        onSearchChange={(e) => setSearchValue(e.target.value)}
        sortValue={sortValue}
        onSortChange={handleFilterChange(setSortValue)}
        categoryValue={categoryValue}
        onCategoryChange={handleFilterChange(setCategoryValue)}
        cityValue={cityValue}
        onCityChange={handleFilterChange(setCityValue)}
        cities={cities}
      />

      {/* Индикатор загрузки */}
      {loading && <div className="loading-spinner">Загрузка предложений...</div>}

      {!loading && (
        <>
          <div className="products-grid">
            {paginatedIds.length > 0 ? (
              paginatedIds.map(id => (
                <ProductCard key={id} id={id} />
              ))
            ) : (
              <div className="no-results">По вашему запросу ничего не найдено 😕</div>
            )}
          </div>

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default CatalogPage;