import React, { createContext } from 'react';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchParams, setSearchParams] = React.useState({
    source: '',
    destination: '',
    date: '',
    returnDate: '',
    bookingType: 'oneway',
    busType: '',
    priceMin: 0,
    priceMax: 50000,
    selectedSeats: [],
    passengerDetails: []
  });

  return (
    <SearchContext.Provider value={{ searchParams, setSearchParams }}>
      {children}
    </SearchContext.Provider>
  );
};
