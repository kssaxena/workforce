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

	// Radio related props
	options = [],
	radioDirection = "row",
}) => {
	const [showPassword, setShowPassword] = useState(false);

	const isPasswordField = type === "password";
	const isRadio = type === "radio";

	return (
		<div className="w-full py-3">
			{/* Label */}
			{labelName && (
				<label
					htmlFor={name}
					className={`block text-sm font-medium text-gray-700 mb-2 capitalize ${labelClassName}`}
				>
					{labelName}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}

			{/* ================= RADIO ================= */}
			{isRadio ? (
				<div
					className={`flex ${
						radioDirection === "column" ? "flex-col" : "flex-row flex-wrap"
					} gap-4 ${className}`}
				>
					{options.map((option, index) => {
						const optionValue =
							typeof option === "object" ? option.value : option;

						const optionLabel =
							typeof option === "object" ? option.label : option;

						return (
							<label
								key={index}
								className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
							>
								<input
									type="radio"
									name={name}
									value={optionValue}
									checked={value === optionValue}
									onChange={onChange}
									disabled={disabled}
									required={required && index === 0}
									className="h-4 w-4 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
								/>

								<span>{optionLabel}</span>
							</label>
						);
					})}
				</div>
			) : textArea ? (
				/* ================= TEXTAREA ================= */
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
			) : (
				/* ================= NORMAL INPUT ================= */
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
						className={`w-full py-2 px-4 ${
							isPasswordField ? "pr-12" : ""
						} border border-gray-300 rounded-lg bg-neutral-50 text-gray-700 outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-500 transition hover:shadow-md disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
					/>

					{/* Password Show / Hide */}
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
			)}

			{/* Password Hint */}
			{isPasswordField && passwordHint && (
				<p className="mt-1 text-xs text-gray-500">{passwordHint}</p>
			)}
		</div>
	);
};

export default InputBox;
