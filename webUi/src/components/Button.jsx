import React from "react";

const Button = ({
	LabelName = "",
	onClick,
	className = "",
	type = "button",
	variant = "primary",
	enableIcon = false,
	icon
}) => {
	const Primary = "bg-blue-600 text-white";
	const Secondary = "bg-white text-slate-700";

	return (
		<button
			type={type}
			onClick={onClick}
			className={`${className} ${
				variant === "primary" ? Primary : Secondary
			} w-fit heading capitalize text-wrap text-center text-[12px] cursor-pointer flex justify-center items-center h-fit px-8 py-2 rounded-xl border border-blue-600 font-semibold`}
		>
			{LabelName}

			{enableIcon === true && (
				// icon 
				<span>{icon}</span>
			)}
		</button>
	);
};
export default Button;
