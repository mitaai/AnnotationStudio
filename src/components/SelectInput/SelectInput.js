/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import { X } from 'react-bootstrap-icons';
import Select from '../Select';
import styles from './SelectInput.module.scss';

const SelectInput = ({
  selectedOptionKey,
  setSelectedOptionKey = () => {},
  value,
  valuePlaceholder = 'Name',
  setValue = () => {},
  options = [],
  style = {},
  onDelete = () => {},
}) => {
  const [focused, setFocused] = useState();

  const hasSelectOptions = Array.isArray(options) && options.length > 0;
  const borderRadius = hasSelectOptions ? '0px 6px 6px 0px': '6px';

  return (
    <div className={`${styles.selectInputContainer} ${focused ? styles.focused : ''}`} style={style}>
      {Array.isArray(options) && options.length > 0 && <div
        style={{ width: 150 }}
      >
        <Select
          options={options}
          selectedOptionKey={selectedOptionKey}
          setSelectedOptionKey={setSelectedOptionKey}
          inSelectInput
        />
      </div>}
      <input
        style={{
          flex: 1, padding: '6px 10px', borderRadius, color: '#424242',
        }}
        placeholder={valuePlaceholder}
        value={value}
        onChange={(ev) => setValue(ev.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused()}
      />
      <div className={styles.deleteBtnContainer}>
        <div
          className={styles.deleteBtn}
          onClick={onDelete}
        >
          <X size={20} />
        </div>
      </div>
    </div>
  );
};

export default SelectInput;

