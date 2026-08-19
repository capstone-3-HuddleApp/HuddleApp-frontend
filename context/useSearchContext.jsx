import { createContext, useState, useContext } from 'react';

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // console.log(searchResults)
  // console.log(searchQuery)
  return (
    <SearchContext.Provider value={{ searchResults, setSearchResults, searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used inside SearchProvider');
  }
  return context;
}