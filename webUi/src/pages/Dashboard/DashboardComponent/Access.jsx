import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Popup from "../../../components/Popup";
import InputBox from "../../../components/Input";

const Access = () => {
	const [showForm, setShowForm] = useState(false);
	const [formData, setFormData] = useState({});
	const [accessEmployee, setAccessEmployee] = useState([]);
	const [editingId, setEditingId] = useState(null);

	useEffect(() => {
		const savedAccessEmployee = localStorage.getItem("accessEmployee");

		if (savedAccessEmployee) {
			try {
				setAccessEmployee(JSON.parse(savedAccessEmployee));
			} catch (error) {
				console.log("Unable to read access employee", error);
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

	//  Assign Access button
	const handleAddAccess = () => {
		setEditingId(null);

		setFormData({
			name: "",
			email: "",
			designation: "",
			password: "",
			permissions: [],
			accessAssigned: false,
		});

		setShowForm(true);
	};
    

	// Manage existing employee access
	const handleManageAccess = (employee) => {
		setEditingId(employee.id);

		setFormData({
			id: employee.id,
			name: employee.name || "",
			email: employee.email || "",
			designation: employee.designation || "",
			permissions: employee.permissions || [],
			accessAssigned: employee.accessAssigned || false,
		});

		setShowForm(true);
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		let updatedAccessEmployee;

		// Manage existing access
		if (editingId) {
			updatedAccessEmployee = accessEmployee.map((employee) =>
				employee.id === editingId
					? {
							...employee,
							name: formData.name,
							email: formData.email,
							designation: formData.designation,
							permissions: formData.permissions || [],
							accessAssigned: true,
						}
					: employee,
			);
		} else {
			// Add new employee access
			const newAccessEmployee = {
				...formData,
				id: Date.now(),
				accessAssigned: true,
			};

			updatedAccessEmployee = [...accessEmployee, newAccessEmployee];
		}

		setAccessEmployee(updatedAccessEmployee);

		localStorage.setItem(
			"accessEmployee",
			JSON.stringify(updatedAccessEmployee),
		);

		setFormData({});
		setEditingId(null);
		setShowForm(false);
	};

	const handleClosePopUp = () => {
		setShowForm(false);
		setFormData({});
		setEditingId(null);
	};

	return (
		<div className="space-y-4 px-4 py-5">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-slate-900">
						Access Management
					</h1>

					<p className="text-sm text-slate-500">
						Manage user access, permissions, and role-based controls across your
						organization.
					</p>
				</div>

				<Button LabelName="Assign Access" onClick={handleAddAccess} />
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
									Email
								</th>

								<th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
									Access Status
								</th>

								<th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
									Action
								</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-slate-100">
							{accessEmployee.length > 0 ? (
								accessEmployee.map((employee, index) => (
									<tr
										key={employee.id}
										className="transition hover:bg-slate-50"
									>
										{/* S.No */}
										<td className="px-5 py-4 text-sm text-slate-500">
											{index + 1}
										</td>

										{/* Employee Name */}
										<td className="px-5 py-4">
											<div className="flex items-center gap-3">
												<div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
													{employee.name?.charAt(0)?.toUpperCase() || "E"}
												</div>

												<div>
													<p className="text-sm font-semibold text-slate-800">
														{employee.name || "N/A"}
													</p>
												</div>
											</div>
										</td>

										{/* Designation */}
										<td className="px-5 py-4 text-sm text-slate-600">
											{employee.designation || "N/A"}
										</td>

										{/* Email */}
										<td className="px-5 py-4 text-sm text-slate-600">
											{employee.email || "N/A"}
										</td>

										{/* Access Status */}
										<td className="px-5 py-4">
											<span
												className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
													employee.accessAssigned
														? "bg-green-50 text-green-600"
														: "bg-red-50 text-red-500"
												}`}
											>
												{employee.accessAssigned ? "Assigned" : "Not Assigned"}
											</span>
										</td>

										{/* Action */}
										<td className="px-5 py-4">
											<Button
												LabelName={
													employee.accessAssigned
														? "Manage Access"
														: "Assign Access"
												}
												variant={
													employee.accessAssigned ? "secondary" : "primary"
												}
												className={
													employee.accessAssigned
														? "border border-slate-200"
														: ""
												}
												onClick={() => handleManageAccess(employee)}
											/>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan="6" className="px-5 py-12 text-center">
										<p className="text-sm font-semibold text-slate-600">
											No employees found
										</p>

										<p className="mt-1 text-xs text-slate-400">
											Click "Assign Access" to add an employee.
										</p>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Access Popup */}
			<Popup
				isOpen={showForm}
				title={
					editingId
						? "Manage Access & Permissions"
						: "Assign Access & Permissions"
				}
				onClose={handleClosePopUp}
			>
				<form onSubmit={handleSubmit} className="space-y-6 p-4">
					<div>
						<p className="text-sm font-medium text-slate-800">
							{editingId ? "Update Employee Access" : "Assign Employee Access"}
						</p>

						<p className="mt-1 text-sm text-slate-500">
							{editingId
								? "Update the permissions available to this employee."
								: "Add employee details and configure their access permissions."}
						</p>
					</div>

					{/* Employee Details */}
					<div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
						<InputBox
							labelName="Full Name"
							placeholder="Enter employee full name"
							type="text"
							name="name"
							value={formData.name || ""}
							onChange={handleChange}
							required
						/>

						<InputBox
							labelName="Email"
							placeholder="Enter employee email"
							type="email"
							name="email"
							value={formData.email || ""}
							onChange={handleChange}
							required
						/>

						<InputBox
							labelName="Designation"
							placeholder="Enter employee designation"
							type="text"
							name="designation"
							value={formData.designation || ""}
							onChange={handleChange}
							required
						/>

						{/* Password only for new access */}
						{!editingId && (
							<InputBox
								labelName="Password"
								placeholder="Create login password"
								type="password"
								name="password"
								value={formData.password || ""}
								onChange={handleChange}
								required
							/>
						)}
					</div>

					{/* Permissions */}
					<div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
						<h3 className="text-sm font-semibold text-slate-800">
							Access Permissions
						</h3>

						<p className="mt-1 text-xs text-slate-500">
							Select the modules this employee can access.
						</p>

						<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
							{[
								"Dashboard",
								"Employees",
								"Attendance",
								"Payroll",
								"Leave Management",
								"Reports",
							].map((permission) => (
								<label
									key={permission}
									className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
								>
									<input
										type="checkbox"
										name="permissions"
										value={permission}
										checked={
											formData.permissions?.includes(permission) || false
										}
										onChange={(e) => {
											const { checked, value } = e.target;

											setFormData((prev) => {
												const permissions = prev.permissions || [];

												return {
													...prev,
													permissions: checked
														? [...permissions, value]
														: permissions.filter((item) => item !== value),
												};
											});
										}}
										className="h-4 w-4"
									/>

									<span className="text-sm text-slate-600">{permission}</span>
								</label>
							))}
						</div>
					</div>

					{/* Buttons */}
					<div className="flex items-center justify-center gap-4 border-t border-slate-100 pt-4">
						<Button
							LabelName={editingId ? "Update Access" : "Assign Access"}
							type="submit"
						/>

						<Button
							LabelName="Cancel"
							variant="secondary"
							type="button"
							onClick={handleClosePopUp}
						/>
					</div>
				</form>
			</Popup>
		</div>
	);
};

export default Access;
