import React from 'react';

const useBoolean = () => {
  const [state, setState] = React.useState();

  const handleTrue = () => setState(true);
  const handleFalse = () => setState(false);
  const handleToggle = () => setState(!state);

  return [
    state,
    {
      setTrue: handleTrue,
      setFalse: handleFalse,
      setToggle: handleToggle,
    },
  ];
};

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

  });

  const breakPoints = [
    ['isTabletOrMobile', 1224],
    ['isDesktopOrLaptop', 1824],
    ['isTabletOrMobile', Infinity],
  ];

  React.useEffect(() => {
    // eslint-disable-next-line no-undef
    const w = window;
    // Handler to call on window resize
    function handleResize() {
      const obj = {
        width: w.innerWidth,
        height: w.innerHeight,
      };

      // setting the screen breakpoint
      obj[breakPoints.find(([, maxWidth]) => obj.width <= maxWidth)[0]] = true;

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
  useBoolean,
  useWindowSize,
};
