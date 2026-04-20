import React, { useState, useMemo } from 'react';
import Controls from '../components/Controls/Controls';
import ProductCard from '../components/ProductCard/ProductCard';
import Pagination from '../components/Pagination/Pagination';
import { offersData } from '../data/offersData';
import './CatalogPage.scss';

const ITEMS_PER_PAGE = 6;

const CatalogPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('newest');
  const [categoryValue, setCategoryValue] = useState('all');
  const [cityValue, setCityValue] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    let result = offersData.filter(offer => {
      const matchCategory = categoryValue === 'all' || offer.category === categoryValue;
      const matchCity = cityValue === 'all' || offer.city === cityValue;
      const matchSearch = searchValue === '' || 
        offer.title.toLowerCase().includes(searchValue.toLowerCase()) || 
        offer.desc.toLowerCase().includes(searchValue.toLowerCase());
      return matchCategory && matchCity && matchSearch;
    });

    result.sort((a, b) => {
      const dA = new Date(a.date);
      const dB = new Date(b.date);
      return sortValue === 'newest' ? dB - dA : dA - dB;
    });
    return result;
  }, [searchValue, sortValue, categoryValue, cityValue]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="catalog-page">
      <Controls 
        searchValue={searchValue}
        onSearchChange={(e) => { setSearchValue(e.target.value); setCurrentPage(1); }}
        sortValue={sortValue}
        onSortChange={handleFilterChange(setSortValue)}
        categoryValue={categoryValue}
        onCategoryChange={handleFilterChange(setCategoryValue)}
        cityValue={cityValue}
        onCityChange={handleFilterChange(setCityValue)}
      />

      <div className="products-grid">
        {paginatedData.length > 0 ? (
          paginatedData.map(offer => <ProductCard key={offer.id} offer={offer} />)
        ) : (
          <div className="no-results">По вашему запросу ничего не найдено 😕</div>
        )}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default CatalogPage;