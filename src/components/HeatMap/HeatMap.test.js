/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import HeatMap from './HeatMap';
import { DocumentFiltersContext, DocumentAnnotationsContext } from '../../contexts/DocumentContext';

test('renders heatmap', async () => {
  const { getByTestId } = render(
    <DocumentAnnotationsContext.Provider
      value={[[], jest.fn(), jest.fn(), jest.fn()]}
    >
      <DocumentFiltersContext.Provider value={[[], jest.fn()]}>
        <HeatMap
          pdf={false}
        />
      </DocumentFiltersContext.Provider>
    </DocumentAnnotationsContext.Provider>,
  );
  const heatMap = getByTestId('heat-map');
  expect(heatMap).toBeInTheDocument();
});

