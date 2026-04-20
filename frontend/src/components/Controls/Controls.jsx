import React from 'react';
import { categories, cities } from '../../data/offersData';
import './Controls.scss';

const Controls = ({ 
  searchValue, onSearchChange, 
  sortValue, onSortChange, 
  categoryValue, onCategoryChange, 
  cityValue, onCityChange 
}) => {
  return (
    <div className="controls">
      
      <div className="controls__filters">
        <select value={sortValue} onChange={onSortChange} className="filter-select">
          <option value="newest">📅 Сначала новые</option>
          <option value="oldest">📅 Сначала старые</option>
        </select>
        
        <select value={categoryValue} onChange={onCategoryChange} className="filter-select">
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        
        <select value={cityValue} onChange={onCityChange} className="filter-select">
          {cities.map(city => (
            <option key={city.value} value={city.value}>{city.label}</option>
          ))}
        </select>
      </div>

      <input 
        type="text" 
        value={searchValue}
        onChange={onSearchChange}
        className="controls__search"
        placeholder="🔍 Поиск по названию банка или предложению..."
      />
    </div>
  );
};

export default Controls;