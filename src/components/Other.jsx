import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FieldBar from './FieldBar';
import TypingTestBody from './TypingTestBody';

const Other = () => {
  const [fieldValues, setFieldValues] = useState({
    language: 'en',
    difficulty: '100',
    time: '15',
  });

  const handleValuesChange = (newValues) => {
    setFieldValues(newValues);
  };

  return (
    <div>
      <FieldBar onValuesChange={handleValuesChange} />
      {fieldValues && <TypingTestBody fieldValues={fieldValues} />}
    </div>
  );
};

export default Other;