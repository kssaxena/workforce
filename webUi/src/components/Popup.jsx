import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const Popup = ({
	isOpen,
	onClose,
	title = "",
	children,
	width = "max-w-lg",
}) => {
	// Background scroll disable
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}

		return () => {
			document.body.style.overflow = "auto";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				className={`relative w-full ${width} rounded-2xl bg-white shadow-2xl`}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
					<h2 className="text-lg font-semibold text-slate-900">{title}</h2>

					<button
						
						onClick={onClose}
						className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
					>
						<FaTimes className="text-sm" />
					</button>
				</div>

				{/* Content */}
				<div className="max-h-[80vh] overflow-y-auto p-5">{children}</div>
			</div>
		</div>
	);
};

export default Popup;
