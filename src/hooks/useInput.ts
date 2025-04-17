import { ChangeEvent, useState } from 'react';

const useInput = <T = undefined>(defaultValue: T) => {
  const [value, setValue] = useState<T>(defaultValue);

  const onChange = (e) => setValue(e.target.value);

  return { value, setValue, onChange };
};

export default useInput;
