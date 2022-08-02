import React from 'react';

// Hook
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = React.useState({
    width: undefined,
    height: undefined,
    isDesktopOrLaptop: true, // default
    isBigScreen: false,
    isTabletOrMobile: false,
    isMobilePhone: false,
    smallerThanOrEqual: {
      isBigScreen: true,
      isDesktopOrLaptop: true,
      isTabletOrMobile: false,
      isMobilePhone: false,
    },
    greaterThan: {
      isBigScreen: false,
      isDesktopOrLaptop: false,
      isTabletOrMobile: true,
      isMobilePhone: true,
    },
  });

  const breakPoints = [
    ['isMobilePhone', 600],
    ['isTabletOrMobile', 1224],
    ['isDesktopOrLaptop', 1824],
    ['isBigScreen', Infinity],
  ];

  React.useEffect(() => {
    // eslint-disable-next-line no-undef
    const w = window;
    // Handler to call on window resize
    function handleResize() {
      const obj = {
        width: w.innerWidth,
        height: w.innerHeight,
        greaterThan: {},
        smallerThanOrEqual: {},
      };

      let foundScreenSize = false;
      // setting the screen breakpoint
      breakPoints.map(([key, maxWidth]) => {
        const bool = obj.width <= maxWidth;
        if (!foundScreenSize) {
          obj[key] = bool;
          foundScreenSize = bool;
        }

        obj.greaterThan[key] = !bool;
        obj.smallerThanOrEqual[key] = bool;
        return null;
      });

      // Set window width/height to state
      setWindowSize(obj);
    }
    // Add event listener
    // eslint-disable-next-line no-undef
    window.addEventListener('resize', handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => w.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

export {
  // eslint-disable-next-line import/prefer-default-export
  useWindowSize,
};
