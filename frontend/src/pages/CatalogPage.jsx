import React, { useState, useEffect } from 'react';
import Controls from '../components/Controls/Controls';
import ProductCard from '../components/ProductCard/ProductCard'; // Ожидаем, что он принимает prop id
import Pagination from '../components/Pagination/Pagination';
import './CatalogPage.scss';

const ITEMS_PER_PAGE = 8;

const CatalogPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('newest');
  const [categoryValue, setCategoryValue] = useState('all');
  const [cityValue, setCityValue] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Состояние для списка ID от сервера
  const [productIds, setProductIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Функция запроса к серверу
  const fetchProductIds = async () => {
    setLoading(true);
    try {
      // Формируем URL с параметрами
      const params = new URLSearchParams({
        category: categoryValue,
        city_id: cityValue,
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

  // Запускаем запрос при изменении любого фильтра
  useEffect(() => {
    setCurrentPage(1); // Сбрасываем на 1 страницу при новом поиске
    fetchProductIds();
  }, [searchValue, sortValue, categoryValue, cityValue]);

  // Логика пагинации (теперь режем массив ID)
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
      />

      {/* Индикатор загрузки */}
      {loading && <div className="loading-spinner">Загрузка предложений...</div>}

      {!loading && (
        <>
          <div className="products-grid">
            {paginatedIds.length > 0 ? (
              paginatedIds.map(id => (
                // Передаем только ID. Карточка сама скачает данные
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