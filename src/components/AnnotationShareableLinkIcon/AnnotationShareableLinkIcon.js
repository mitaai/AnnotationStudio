import {
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { Link45deg } from 'react-bootstrap-icons';

import { copyToClipboard } from '../../utils/docUIUtils';

export default function AnnotationShareableLinkIcon({
  onExited = () => {},
  link,
  setAlerts,
  top = 4,
  right = 3,
  paddingTop = 2,
  paddingRight = 2,
  paddingBottom = 2,
  paddingLeft = 2,
  borderRadius = 1,
  border = 'none',
}) {
  return (
    <>
      <OverlayTrigger
        onExited={onExited}
        overlay={(
          <Tooltip className="styled-tooltip annotation-shareable-link-styled-tooltip">
            <div>
              <strong>Copy shareable link to clipboard.</strong>
            </div>
            Only individuals who have access to this annotation will be able to view it.
          </Tooltip>
    )}
      >
        <div
          className="annotation-shareable-link-icon-container"
          style={{
            top, right, paddingTop, paddingRight, paddingBottom, paddingLeft, borderRadius, border,
          }}
        >
          <Link45deg
            className="annotation-shareable-link-icon"
            size={16}
            onClick={() => {
              // eslint-disable-next-line no-undef
              copyToClipboard(document, link);
              setAlerts((prevState) => [...prevState, { text: 'Link copied to clipboard', variant: 'success' }]);
            }}
          />
        </div>
      </OverlayTrigger>
      <style jsx global>
        {`

        .annotation-shareable-link-styled-tooltip .tooltip-inner {
          max-width: 240px !important;
        }

        .annotation-shareable-link-icon-container {
          transition: background 0.25s;
          background: rgb(245, 245, 245);
          color: #ABABAB;
          position: absolute;
          z-index: 2;
        }

        .annotation-shareable-link-icon-container:hover {
          background: #EFF5FF !important;
        }

        .annotation-shareable-link-icon {
          color: #ABABAB;
          transition: color 0.25s;
        }

        .annotation-shareable-link-icon-container:hover .annotation-shareable-link-icon {
          color: #015999 !important;
        }

        `}
      </style>
    </>
  );
}
