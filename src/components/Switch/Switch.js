/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import styles from './Switch.module.scss';

const Switch = ({
  isOn, handleToggle, onColor, width = 40, height, tooltipMessage,
}) => {
  const widthHeightRatio = 2;
  const w = width || height * widthHeightRatio;
  const h = w / widthHeightRatio;
  const v = h - (w / 20);
  const x = w / 50;

  const extraStyling = tooltipMessage ? { position: 'absolute', top: 0, right: -h } : {};

  const content = (
    <>
      <input
        checked={isOn}
        onChange={handleToggle}
        className={styles['react-switch-checkbox']}
        id="react-switch-new"
        type="checkbox"
      />
      <label
        style={{
          background: isOn && onColor, width: w, height: h, borderRadius: w, ...extraStyling,
        }}
        className={styles['react-switch-label']}
        htmlFor="react-switch-new"
      >
        <span
          style={{
            borderRadius: v, width: v, height: v, top: x, left: isOn ? `calc(100% - ${x}px)` : x, transform: isOn ? 'translateX(-100%)' : undefined,
          }}
          className={styles['react-switch-button']}
        />
      </label>
    </>
  );
  // const y = h + w / 10;
  return tooltipMessage ? (
    <OverlayTrigger
      key="create-new-document"
      placement="bottom"
      overlay={(
        <Tooltip
          style={{ position: 'relative' }}
          className="styled-tooltip bottom"
        >
          {tooltipMessage}
        </Tooltip>
      )}
    >
      <div style={{
        height: h, marginBotom: -h, position: 'relative', left: -h,
      }}
      >
        {content}
      </div>

    </OverlayTrigger>
  ) : content;
};

export default Switch;

