import React from 'react';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import styles from './Select.module.scss';

const Select = ({
  style = {},
  selectedOptionKey,
  setSelectedOptionKey = () => {},
  options = [],
  inSelectInput,
}) => {
  const selectedItem = options.find(({ key }) => key === selectedOptionKey);

  return (
    <>
      <DropdownButton
        className={`${styles.selectContainer} ${inSelectInput ? styles.selectInputStyles : ''}`}
        style={{ color: selectedItem === undefined ? '#757575' : '#424242', ...style }}
        title={selectedItem?.text || 'None'}
      >
        {options.map(({ text, key, disabled }) => (
          <Dropdown.Item
            key={key}
            onClick={disabled ? () => {} : () => setSelectedOptionKey(key)}
            disabled={disabled}
          >
            {text}
          </Dropdown.Item>
        ))}
      </DropdownButton>
      <style jsx global>
        {`
          #select-container.dropown-toggle::after {
              position: relative !important;
              top: 2px !important;
          }
      `}
      </style>
    </>
  );
};

export default Select;

