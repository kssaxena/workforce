import React from 'react'

const Button = ({
    LabelName = "",
    onClick,
    className= "",
    type= "button",
    variant = "primary",
    enableIcon = false,
}) => {
    const Primary = "bg-blue-600 text-white";
    const Secondary = "bg-white text-slate-700";

    return (
			<button
				type={type}
				onClick={onClick}
				className={`${className} ${
					variant === "primary" ? Primary : Secondary
				} heading capitalize text-wrap text-center cursor-pointer flex justify-center items-center h-fit px-4 py-1 rounded-xl border border-blue-600 text-[8px] font-semibold`}
			>
				{LabelName}

				{enableIcon === true && (
					// icon yahan
					<span></span>
				)}
			</button>
		);

}
export default Button;
