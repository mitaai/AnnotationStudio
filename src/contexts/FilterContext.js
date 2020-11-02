import React from 'react';

const FilterThemes = {
  filtered: {
    color: '#28a745',
    highlight: 'rgba(40, 167, 69, 0.5)',
  },
  unfiltered: {
    color: '#007bff',
    highlight: 'rgba(255,255,10, 0.3)',
  },
};

const FilterContext = React.createContext();
export { FilterContext, FilterThemes };
