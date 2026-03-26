import {
  Button,
  Checkbox,
  Form,
  FormGroup,
  FormHelperText,
  TextInput,
} from '@patternfly/react-core';
import React, { useState } from 'react';

const DEFAULT_TERM_1 = '1';
const DEFAULT_TERM_2 = '7';
const DEFAULT_TERM_3 = '15';

const VALIDATION_ORDER_MSG = 'Terms must be ordered in ascending order.';

const parseTermDays = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }
  const n = Number.parseInt(trimmed, 10);
  return Number.isFinite(n) ? n : null;
};

const RosCustomTimeframes: React.FC = () => {
  const [term1, setTerm1] = useState('');
  const [term2, setTerm2] = useState('');
  const [term3, setTerm3] = useState('');
  const [businessHours, setBusinessHours] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [timezone, setTimezone] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const term1HasValue = term1.trim() !== '';
  const term2HasValue = term2.trim() !== '';
  const term2Disabled = !term1HasValue;
  const term3Disabled = !term2HasValue;

  const validateAscending = (): boolean => {
    const v1 = parseTermDays(term1);
    const v2 = parseTermDays(term2);
    const v3 = parseTermDays(term3);
    if (v1 !== null && v2 !== null && v1 >= v2) {
      setValidationError(VALIDATION_ORDER_MSG);
      return false;
    }
    if (v2 !== null && v3 !== null && v2 >= v3) {
      setValidationError(VALIDATION_ORDER_MSG);
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSave = () => {
    validateAscending();
  };

  const handleReset = () => {
    setValidationError(null);
    setTerm1(DEFAULT_TERM_1);
    setTerm2(DEFAULT_TERM_2);
    setTerm3(DEFAULT_TERM_3);
    setBusinessHours(false);
    setStartTime('');
    setEndTime('');
    setTimezone('');
  };

  return (
    <Form>
      <FormGroup label="Term 1" fieldId="ros-custom-term-1">
        <TextInput
          id="ros-custom-term-1"
          type="number"
          value={term1}
          onChange={(_e, val) => setTerm1(val)}
          placeholder={DEFAULT_TERM_1}
        />
      </FormGroup>
      <FormGroup label="Term 2" fieldId="ros-custom-term-2">
        <TextInput
          id="ros-custom-term-2"
          type="number"
          value={term2}
          onChange={(_e, val) => setTerm2(val)}
          isDisabled={term2Disabled}
          placeholder={DEFAULT_TERM_2}
        />
      </FormGroup>
      <FormGroup label="Term 3" fieldId="ros-custom-term-3">
        <TextInput
          id="ros-custom-term-3"
          type="number"
          value={term3}
          onChange={(_e, val) => setTerm3(val)}
          isDisabled={term3Disabled}
          placeholder={DEFAULT_TERM_3}
        />
      </FormGroup>

      <FormGroup fieldId="ros-custom-business-hours">
        <Checkbox
          id="ros-custom-business-hours"
          label="Restrict analysis to business hours"
          isChecked={businessHours}
          onChange={(_e, checked) => setBusinessHours(checked)}
        />
      </FormGroup>

      {businessHours && (
        <>
          <FormGroup label="Start time" fieldId="ros-custom-start-time">
            <TextInput
              id="ros-custom-start-time"
              value={startTime}
              onChange={(_e, val) => setStartTime(val)}
            />
          </FormGroup>
          <FormGroup label="End time" fieldId="ros-custom-end-time">
            <TextInput
              id="ros-custom-end-time"
              value={endTime}
              onChange={(_e, val) => setEndTime(val)}
            />
          </FormGroup>
          <FormGroup label="Timezone" fieldId="ros-custom-timezone">
            <TextInput id="ros-custom-timezone" value={timezone} onChange={(_e, val) => setTimezone(val)} />
          </FormGroup>
        </>
      )}

      {validationError && (
        <FormHelperText>
          <span>{validationError}</span>
        </FormHelperText>
      )}

      <FormGroup>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>{' '}
        <Button variant="secondary" onClick={handleReset}>
          Reset to defaults
        </Button>
      </FormGroup>
    </Form>
  );
};

export default RosCustomTimeframes;
