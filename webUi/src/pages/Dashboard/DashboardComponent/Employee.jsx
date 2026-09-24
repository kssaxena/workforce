import React, { useEffect, useState } from "react";
import { employeeFields } from "../../../constant/constant";
import InputBox from "../../../components/Input";
import Button from "../../../components/Button";
import Popup from "../../../components/Popup";
import EmployeeProfile from "./EmployeeProfile";

const Employee = ({ onViewEmployeeProfile }) => {
	const [showForm, setShowForm] = useState(false);
	const [formData, setFormData] = useState({});
	const [employees, setEmployees] = useState([]);

	useEffect(() => {
		const savedEmployees = localStorage.getItem("employees");
		

		if (savedEmployees) {
			try {
				setEmployees(JSON.parse(savedEmployees));
			} catch (error) {
				console.log("Unable to read employees", error);
			}
		}
	}, []);

	const handleChange = (e) => {
		const { name, value, files } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: files ? files[0] : value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const newEmployee = {
			...formData,
			id: Date.now(),
			status: "Present",
		};

		const updatedEmployees = [...employees, newEmployee];

		setEmployees(updatedEmployees);
		localStorage.setItem("employees", JSON.stringify(updatedEmployees));

		setFormData({});
		setShowForm(false);
	};

	const handleClosePopup = () => {
		setShowForm(false);
		setFormData({});
	};

	return (
		<div className="w-full h-full overflow-y-auto p-3 space-y-4">
			{/* Add Employee */}
			<div className="flex justify-end">
				<Button LabelName="Add Employee" onClick={() => setShowForm(true)} />
			</div>

			{/* Employee Table */}
			<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead>
							<tr className="border-b border-slate-200 bg-slate-50">
								<th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
									S. No
								</th>

								<th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
									Employee Name
								</th>

								<th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
									Designation
								</th>

								<th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
									Department
								</th>

								<th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
									Action
								</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-slate-100">
							{employees.length > 0 ? (
								employees.map((employee, index) => (
									<tr
										key={employee.id}
										className="transition hover:bg-slate-50"
									>
										<td className="px-5 py-4 text-sm text-slate-500">
											{index + 1}
										</td>

										<td className="px-5 py-4">
											<div className="flex items-center gap-3">
												<div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
													{employee.name?.charAt(0)?.toUpperCase() || "E"}
												</div>

												<div>
													<p className="text-sm font-semibold text-slate-800">
														{employee.name || "N/A"}
													</p>

													{/* {employee.employeeId && (
														<p className="text-xs text-slate-400">
															{employee.employeeId}
														</p>
													)} */}
												</div>
											</div>
										</td>

										<td className="px-5 py-4 text-sm text-slate-600">
											{employee.designation || "N/A"}
										</td>

										<td className="px-5 py-4 text-sm text-slate-600">
											{employee.department || "N/A"}
										</td>

										<td className="px-5 py-4">
											<Button
												LabelName="View"
												variant="secondary"
												className="border-none"
												onClick={() => onViewEmployeeProfile(employee)}
											/>
											{/* <Button
												LabelName="Delete"
												className="border-none bg-red-500 "
												onClick={() => removeEmployees()}
											/> */}
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan="5" className="px-5 py-12 text-center">
										<p className="text-sm font-semibold text-slate-600">
											No employees found
										</p>

										<p className="mt-1 text-xs text-slate-400">
											Add employees to see them here.
										</p>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Add Employee Popup */}
			<Popup
				isOpen={showForm}
				onClose={handleClosePopup}
				title="Add New Team Member"
				width="max-w-4xl"
			>
				<form onSubmit={handleSubmit} className="space-y-6">
					<p className="text-sm text-slate-500">
						Enter the employee details below to create a new team member
						profile.
					</p>

					<div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
						{employeeFields.map((field) => (
							<InputBox
								key={field.name}
								labelName={field.labelName}
								placeholder={field.placeholder}
								type={field.type}
								options={field.options}
								required={field.required}
								name={field.name}
								value={formData[field.name] || ""}
								onChange={handleChange}
							/>
						))}
					</div>

					<div className="flex justify-center gap-4 border-t border-slate-100 pt-5">
						<Button LabelName="Submit" type="submit" />

						<Button
							LabelName="Cancel"
							variant="secondary"
							type="button"
							onClick={handleClosePopup}
						/>
					</div>
				</form>
			</Popup>
		</div>
	);
};

export default Employee;
