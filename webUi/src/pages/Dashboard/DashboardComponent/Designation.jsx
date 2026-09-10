import React, { useState } from "react";
import { employeeFields } from "../../../constant/constant";
import InputBox from "../../../components/Input";
import Button from "../../../components/Button";

function Designation() {
	const [showForm, setShowForm] = useState(false);

	return (
		<div className="w-full h-full overflow-y-auto p-3">
			{/* Add Button */}
			{!showForm && (
				<div className="flex justify-end">
					<Button LabelName="Add" onClick={() => setShowForm(true)} />
				</div>
			)}

			{/* Form */}
			{showForm && (
				<form className="space-y-6 border rounded-lg border-neutral-100 shadow-xl bg-blue-50 p-4">
					<div className="mb-6">
						<h1 className="text-xl md:text-2xl font-semibold text-slate-800">
							Add New Team Member
						</h1>
						<p className="mt-1 text-sm text-slate-500">
							Enter the employee details below to create a new team member
							profile.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
						{employeeFields.map((field) => (
							<InputBox
								key={field.name}
								labelName={field.labelName}
								placeholder={field.placeholder}
								type={field.type}
								options={field.options}
								required={field.required}
								name={field.name}
							/>
						))}
					</div>

					{/* Buttons */}
					<div className="flex justify-center items-center w-full gap-4 p-4">
						<Button LabelName="Submit" type="submit" />

						<Button
							LabelName="Cancel"
							variant="secondary"
							onClick={() => setShowForm(false)}
						/>
					</div>
				</form>
			)}
		</div>
	);
}

export default Designation;
