import React from "react";
import { FaEdit, FaRegArrowAltCircleDown } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const Button = ({
	LabelName = "",
	onClick,
	className = "",
	type = "button",
	variant = "primary",
	enableIcon = false,
	icon,
}) => {
	const Primary = "bg-blue-600 text-white";
	const Secondary = "bg-white text-slate-700";

	return (
		<button
			type={type}
			onClick={onClick}
			className={`${className} ${
				variant === "primary" ? Primary : Secondary
			} w-fit heading capitalize text-wrap text-center text-[12px] cursor-pointer flex justify-center items-center gap-1 h-fit px-4 py-2 rounded-xl border border-blue-600 font-semibold`}
		>
			{/* {enableIcon === true ? (
				<FaEdit />
			) : <FaRegArrowAltCircleDown /> ? (
				<MdDelete />
			) : (
				""
			)} */}
			{LabelName}
		</button>
	);
};
export default Button;
