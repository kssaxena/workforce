import { useState } from "react";

const InputBox = ({
  labelName = "",
  placeholder = "",
  className = "",
  type = "text",
  name = "",
  value = "",
  onChange = () => {},
  required = false,
  disabled = false,
  onClick = () => {},
  onKeyDown = () => {},
  labelClassName = "",
  passwordHint = "",
  textArea = false,
  rows = 4,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";

  return (
    <div className="w-full py-3">
      {labelName && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium text-gray-700 mb-2 capitalize ${labelClassName}`}
        >
          {labelName}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {!textArea ? (
        <div className="relative">
          <input
            id={name}
            name={name}
            type={isPasswordField ? (showPassword ? "text" : "password") : type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            onClick={onClick}
            onKeyDown={onKeyDown}
            className={`w-full py-2 px-4 ${isPasswordField ? "pr-12" : ""} border border-gray-300 rounded-lg bg-neutral-50 text-gray-700 outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-500 transition hover:shadow-md disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
          />

          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          )}
        </div>
      ) : (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          onClick={onClick}
          onKeyDown={onKeyDown}
          rows={rows}
          className={`w-full py-2 px-4 border border-gray-300 rounded-lg bg-neutral-50 text-gray-700 outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-500 transition hover:shadow-md disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
        />
      )}

      {isPasswordField && passwordHint && (
        <p className="mt-1 text-xs text-gray-500">{passwordHint}</p>
      )}
    </div>
  );
};

export default InputBox;