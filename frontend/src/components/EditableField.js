import React, { useRef, useEffect } from 'react';
import './EditableField.css';

function EditableField({ value, onChange, className = '', tag = 'span', multiline = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  const handleBlur = () => {
    if (ref.current) {
      const newValue = ref.current.textContent;
      if (newValue !== value) {
        onChange(newValue);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      ref.current.blur();
    }
  };

  const Tag = tag;

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`editable-field ${className}`}
    >
      {value}
    </Tag>
  );
}

export default EditableField;
