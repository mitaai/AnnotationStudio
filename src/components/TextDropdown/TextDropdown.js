import {
  Dropdown,
} from 'react-bootstrap';
import styles from './TextDropdown.module.scss';


export default function TextDropdown({
  showArrow,
  showButton,
  disabled,
  selectedKey,
  setSelectedKey,
  options = [],
  style = {},
}) {
  return (
    <Dropdown
      className={`${styles.textDropdown} ${showArrow && styles.showArrow} ${showButton && styles.showButton} ${disabled && styles.disabled}`}
      style={style}
    >
      <Dropdown.Toggle disabled={disabled}>
        {options.find(({ key }) => key === selectedKey)?.text || 'undefined'}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {options.map(({ text, key }) => (
          <Dropdown.Item key={key} onClick={() => setSelectedKey(key)} active={key === selectedKey}>
            {text}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
