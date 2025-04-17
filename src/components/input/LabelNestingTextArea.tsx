import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

type Props = {
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}

const LabelNestingTextArea: React.FC<Props> = (props) => {
  const { label, type = 'text', value, placeholder, required = false, onChange } = props;
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>();
  const shouldFloat = focused || value.length > 0;

  // TODO: make this work
  useEffect(() => {
    if (textareaRef) {
      const resizingListener = () => {
        textareaRef.current.style.height = `auto`;
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight} px`;
      };
      const textareaElement = textareaRef.current;

      textareaElement.addEventListener('input', resizingListener);

      return () => {
        textareaElement.removeEventListener('input', resizingListener);
      }
    }
  }, []);

  return (
    <div className="relative w-full max-h-96 mt-4">
      <textarea
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => typeof onChange == 'function' && onChange(e)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        // className="w-full px-3 pt-6 pb-2 text-sm bg-transparent border border-gray-500 rounded-md text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        className="w-full min-h-32 px-3 pt-6 pb-2 text-sm bg-transparent border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        ref={textareaRef}
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

export default LabelNestingTextArea;