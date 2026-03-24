import React, { useState, useEffect, useContext } from 'react';
import '../styles/Buses.css';
import { busAPI } from '../services/api';
import BusCard from '../components/BusCard';
import { SearchContext } from '../context/SearchContext';
import { toast } from 'react-toastify';

const Buses = () => {
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 50000,
    busType: '',
    sortBy: 'price'
  });
  const { searchParams } = useContext(SearchContext);

  useEffect(() => {
    fetchBuses();
  }, [searchParams]);

  const fetchBuses = async () => {
    setIsLoading(true);
    try {
      const response = await busAPI.searchBuses({
        source: searchParams.source,
        destination: searchParams.destination,
        date: searchParams.date,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        busType: filters.busType
      });

      if (response.data.success) {
        let filteredBuses = response.data.buses;

        // Sort buses
        if (filters.sortBy === 'price') {
          filteredBuses.sort((a, b) => a.price - b.price);
        } else if (filters.sortBy === 'rating') {
          filteredBuses.sort((a, b) => b.rating - a.rating);
        }

        setBuses(filteredBuses);
      }
    } catch (error) {
      toast.error('Failed to fetch buses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleApplyFilters = () => {
    fetchBuses();
  };

  return (
    <div className="buses-container">
      <div className="buses-sidebar">
        <h3>Filters</h3>

        <div className="filter-group">
          <label>Price Range</label>
          <div className="price-inputs">
            <input
              type="number"
              name="priceMin"
              value={filters.priceMin}
              onChange={handleFilterChange}
              placeholder="Min"
            />
            <span>-</span>
            <input
              type="number"
              name="priceMax"
              value={filters.priceMax}
              onChange={handleFilterChange}
              placeholder="Max"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Bus Type</label>
          <select name="busType" value={filters.busType} onChange={handleFilterChange}>
            <option value="">All Types</option>
            <option value="AC">AC</option>
            <option value="Non-AC">Non-AC</option>
            <option value="Sleeper">Sleeper</option>
            <option value="Seater">Seater</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By</label>
          <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
            <option value="price">Price (Low to High)</option>
            <option value="rating">Rating (High to Low)</option>
          </select>
        </div>

        <button className="apply-filters-btn" onClick={handleApplyFilters}>
          Apply Filters
        </button>
      </div>

      <div className="buses-main">
        <h2>Available Buses</h2>
        {isLoading ? (
          <p className="loading">Loading buses...</p>
        ) : buses.length > 0 ? (
          <div className="buses-list">
            {buses.map((bus) => (
              <BusCard key={bus._id} bus={bus} />
            ))}
          </div>
        ) : (
          <p className="no-buses">No buses found for your search.</p>
        )}
      </div>
    </div>
  );
};

export default Buses;
