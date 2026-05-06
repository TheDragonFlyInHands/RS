import React, { useState, useEffect } from 'react';
import Controls from '../components/Controls/Controls';
import ProductCard from '../components/ProductCard/ProductCard';
import Pagination from '../components/Pagination/Pagination';
import './CatalogPage.scss';
import { apiGet } from '../api/client';

const ITEMS_PER_PAGE = 8;

const CatalogPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('newest');
  const [categoryValue, setCategoryValue] = useState('all');
  const [cityValue, setCityValue] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [productIds, setProductIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);

  // Загружаем города один раз при первом монтировании страницы.
  useEffect(() => {
    const run = async () => {
      try {
        const data = await apiGet('/cities/', { cache: true, cacheTtlMs: 60 * 60 * 1000 });
        setCities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Ошибка загрузки городов:', error);
      }
    };

    run();
  }, []);

  // Перезапрашиваем продукты при изменении фильтров.
  useEffect(() => {
    setCurrentPage(1);
    fetchProductIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, sortValue, categoryValue, cityValue]);

  // Загружаем id продуктов с сервера по текущим фильтрам.
  const fetchProductIds = async () => {
    setLoading(true);

    try {
      const params = {
        category: categoryValue,
        city_id: cityValue,
        search: searchValue,
        sort: sortValue,
      };

      const data = await apiGet('/products/filter/', {
        cache: false,
        cacheTtlMs: 0,
        params,
      });

      setProductIds(Array.isArray(data?.ids) ? data.ids : []);
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(productIds.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedIds = productIds.slice(startIndex, endIndex);

  // Универсальный обработчик смены селектов/инпутов фильтра.
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

      {loading && <div className="loading-spinner">Загрузка предложений...</div>}

      {!loading && (
        <>
          <div className="products-grid">
            {paginatedIds.length > 0 ? (
              paginatedIds.map((id) => <ProductCard key={id} id={id} />)
            ) : (
              <div className="no-results">По вашему запросу ничего не найдено</div>
            )}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
};

export default CatalogPage;
