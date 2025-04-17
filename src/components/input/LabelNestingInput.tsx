import React, { ChangeEvent, useState } from 'react';

type Props = {
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const LabelNestingInput: React.FC<Props> = (props) => {
  const { label, type = 'text', value, placeholder, required = false, onChange } = props;
  const [focused, setFocused] = useState(false);

  const shouldFloat = focused || value.length > 0;

  return (
    <div className="relative w-full mt-4">
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => typeof onChange == 'function' && onChange(e)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        // className="w-full px-3 pt-6 pb-2 text-sm bg-transparent border border-gray-500 rounded-md text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        className="w-full px-3 pt-6 pb-2 text-sm bg-transparent border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />
      <label
        className={`absolute left-3 transition-all text-sm ${
             'top-1 text-xs text-gray-400'
          // shouldFloat
          // ? 'top-1 text-xs text-blue-400'
          // : 'top-3.5 text-gray-400'
        } pointer-events-none`}
      >
        {label}
      </label>
    </div>
  );
};

export default LabelNestingInput;