import React, { useState, useContext } from 'react';
import '../styles/SearchBar.css';
import { SearchContext } from '../context/SearchContext';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const { searchParams, setSearchParams } = useContext(SearchContext);
  const navigate = useNavigate();
  const [localParams, setLocalParams] = useState(searchParams);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalParams({ ...localParams, [name]: value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(localParams);
    navigate('/buses');
  };

  return (
    <section className="search-section">
      <div className="search-container">
        <h2>Book Your Bus Ticket</h2>
        <form className="search-form" onSubmit={handleSearch}>
          <div className="form-group">
            <label htmlFor="source">From</label>
            <input
              type="text"
              id="source"
              name="source"
              placeholder="Departure City"
              value={localParams.source}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="destination">To</label>
            <input
              type="text"
              id="destination"
              name="destination"
              placeholder="Arrival City"
              value={localParams.destination}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={localParams.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="busType">Bus Type</label>
            <select
              id="busType"
              name="busType"
              value={localParams.busType}
              onChange={handleInputChange}
            >
              <option value="">All Types</option>
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
              <option value="Sleeper">Sleeper</option>
              <option value="Seater">Seater</option>
            </select>
          </div>

          <button type="submit" className="search-btn">
            Search Buses
          </button>
        </form>
      </div>
    </section>
  );
};

export default SearchBar;
