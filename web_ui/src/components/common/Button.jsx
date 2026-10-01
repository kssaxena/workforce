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
  disabled = false,
}) => {
  const Primary = "bg-blue-600 text-white";
  const Secondary = "bg-white text-slate-700";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${className} ${
        variant === "primary" ? Primary : Secondary
      } w-fit heading capitalize text-wrap text-center text-[12px] cursor-pointer flex justify-center items-center gap-1 h-fit px-4 py-2 rounded-xl border border-blue-600 font-semibold disabled:cursor-not-allowed disabled:opacity-60`}
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
