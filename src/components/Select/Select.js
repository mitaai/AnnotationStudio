import React from 'react';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import styles from './Select.module.scss';

const Select = ({
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
        style={{ color: selectedItem === undefined ? '#757575' : '#424242' }}
        title={selectedItem?.text || 'None'}
      >
        {options.map(({ text, key }) => (
          <Dropdown.Item key={key} onClick={() => setSelectedOptionKey(key)}>{text}</Dropdown.Item>
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

