import React, { createContext } from 'react';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchParams, setSearchParams] = React.useState({
    source: '',
    destination: '',
    date: '',
    busType: '',
    priceMin: 0,
    priceMax: 50000
  });

  return (
    <SearchContext.Provider value={{ searchParams, setSearchParams }}>
      {children}
    </SearchContext.Provider>
  );
};
