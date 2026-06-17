import { useEffect } from 'react';

const usePageTitle = (title) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | TravelMate AI` : 'TravelMate AI';
    
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};

export default usePageTitle;
