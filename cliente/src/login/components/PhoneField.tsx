import React from "react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import clsx from "clsx";

const CustomInput = React.forwardRef<HTMLInputElement, any>((props, ref) => (
  <input
    {...props}
    ref={ref}
    className="flex-1 p-2.5 bg-transparent outline-none"
    placeholder="+595..."
  />
));

interface Props {
  value?: string; // puede ser undefined también
  onChange: (value: string | undefined) => void;
}

const PhoneField: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-bold text-white mb-2">Teléfono</label>
      <PhoneInput
        international
        defaultCountry="PY"
        value={value}
        onChange={onChange}
        inputComponent={CustomInput}
        className={clsx(
          "flex w-full rounded-lg border border-gray-300 bg-gray-50",
          "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500",
          "text-gray-900 text-sm pl-3"
        )}
      />
    </div>
  );
};

export default PhoneField;
