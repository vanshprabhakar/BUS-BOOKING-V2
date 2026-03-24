import React, { useState, useContext } from 'react';
import '../styles/SearchBar.css';
import { SearchContext } from '../context/SearchContext';
import { busAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SearchBar = () => {
  const { searchParams, setSearchParams } = useContext(SearchContext);
  const navigate = useNavigate();
  const [localParams, setLocalParams] = useState(searchParams);
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [womenOnly, setWomenOnly] = useState(false);
  const [selectedDate, setSelectedDate] = useState(searchParams.date || '');

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDateToInput = (dateObj) => {
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${dateObj.getFullYear()}-${month}-${day}`;
  };
  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setLocalParams({ ...localParams, [name]: value });

    if (name === 'source' || name === 'destination') {
      setActiveField(name);
      if (!value) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await busAPI.getSuggestions(value);
        if (response.data.success) {
          setSuggestions(response.data.suggestions);
        }
      } catch (error) {
        setSuggestions([]);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (!localParams.date) {
      toast.error('Please select travel date');
      return;
    }

    if (localParams.bookingType === 'roundtrip' && !localParams.returnDate) {
      return toast.error('Please select a return date for round trip');
    }

    setSearchParams({ ...localParams, womenOnly });
    navigate('/buses');
  };

  return (
    <section className="search-section">
      <div className="search-container">
        <h2>Book Your Bus Ticket</h2>
        <form className="search-form" onSubmit={handleSearch}>
          {/* From - To Section */}
          <div className="source-dest-group">
            <div>
              <label htmlFor="source">From</label>
              <div className="form-group" style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="source"
                  name="source"
                  placeholder="e.g. Mumbai"
                  value={localParams.source}
                  onChange={handleInputChange}
                  required
                />
                {activeField === 'source' && suggestions.length > 0 && (
                  <div className="suggestions-dropdown">
                    {suggestions.map((item) => (
                      <div
                        key={item}
                        className="suggestion-item"
                        onClick={() => {
                          setLocalParams({ ...localParams, source: item });
                          setSuggestions([]);
                          setActiveField(null);
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="swap-btn"
              onClick={() =>
                setLocalParams({
                  ...localParams,
                  source: localParams.destination,
                  destination: localParams.source
                })
              }
              aria-label="Swap source and destination"
            >
              ↔
            </button>

            <div>
              <label htmlFor="destination">To</label>
              <div className="form-group" style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  placeholder="e.g. Hyderabad"
                  value={localParams.destination}
                  onChange={handleInputChange}
                  required
                />
                {activeField === 'destination' && suggestions.length > 0 && (
                  <div className="suggestions-dropdown">
                    {suggestions.map((item) => (
                      <div
                        key={item}
                        className="suggestion-item"
                        onClick={() => {
                          setLocalParams({ ...localParams, destination: item });
                          setSuggestions([]);
                          setActiveField(null);
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trip Type and Women-only Bus Row */}
          <div className="trip-options-row">
            <div className="trip-type-group">
              <label>Trip Type</label>
              <div className="trip-radio-group">
                <label>
                  <input
                    type="radio"
                    name="bookingType"
                    value="oneway"
                    checked={localParams.bookingType === 'oneway'}
                    onChange={handleInputChange}
                  />
                  One-way
                </label>
                <label>
                  <input
                    type="radio"
                    name="bookingType"
                    value="roundtrip"
                    checked={localParams.bookingType === 'roundtrip'}
                    onChange={handleInputChange}
                  />
                  Round-trip
                </label>
              </div>
            </div>

            <div className="women-bus-group">
              <label>Women-only Bus</label>
              <div className="women-toggle-container">
                <button
                  type="button"
                  className={womenOnly ? 'toggle on' : 'toggle off'}
                  onClick={() => setWomenOnly((v) => !v)}
                >
                  {womenOnly ? 'ON' : 'OFF'}
                </button>
                <span style={{ color: '#666', fontSize: '13px' }}>
                  {womenOnly ? 'Only women buses shown' : 'All buses shown'}
                </span>
              </div>
            </div>
          </div>

          {/* Date Chips Section */}
          <div className="date-chips-section">
            <div className="date-chips-label">Quick Select:</div>
            <div className="date-chips">
              <button
                type="button"
                className={selectedDate === formatDateToInput(today) ? 'chip active' : 'chip'}
                onClick={() => {
                  const date = formatDateToInput(today);
                  setLocalParams({ ...localParams, date });
                  setSelectedDate(date);
                }}
              >
                Today
              </button>
              <button
                type="button"
                className={selectedDate === formatDateToInput(tomorrow) ? 'chip active' : 'chip'}
                onClick={() => {
                  const date = formatDateToInput(tomorrow);
                  setLocalParams({ ...localParams, date });
                  setSelectedDate(date);
                }}
              >
                Tomorrow
              </button>
            </div>
          </div>

          {/* Dates Section */}
          <div style={{ display: 'grid', gridTemplateColumns: localParams.bookingType === 'roundtrip' ? '1fr 1fr' : '1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="date">Departure Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={localParams.date}
                onChange={(e) => {
                  handleInputChange(e);
                  setSelectedDate(e.target.value);
                }}
                required
              />
            </div>

            {localParams.bookingType === 'roundtrip' && (
              <div className="form-group">
                <label htmlFor="returnDate">Return Date</label>
                <input
                  type="date"
                  id="returnDate"
                  name="returnDate"
                  value={localParams.returnDate}
                  onChange={handleInputChange}
                  required
                  min={localParams.date || ''}
                />
              </div>
            )}
          </div>

          {/* Bus Type */}
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

          {/* Search Button */}
          <button type="submit" className="search-btn">
            Search Buses
          </button>
        </form>
      </div>
    </section>
  );
};

export default SearchBar;
