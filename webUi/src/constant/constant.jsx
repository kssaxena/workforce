import { FaCalendarAlt, FaCheckCircle, FaRupeeSign, FaUsers } from "react-icons/fa";
import { GoVerified } from "react-icons/go";

export const dashboardSectionList = [
	{
		name: "Overview",
		icon: <GoVerified />,
		query: "overview",
	},
	{
		name: "Designation",
		icon: <GoVerified />,
		query: "designation",
		subCategory: ["HR", "Manager", "Team Leader", "Executive"],
	},
	{
		name: "Company",
		icon: <GoVerified />,
		query: "companyLevel",
	},
	{
		name: "Employee",
		icon: <GoVerified />,
		query: "employee",
	},
];

export const employeeFields = [
	{
		labelName: "Name",
		name: "name",
		type: "text",
		placeholder: "Enter employee name",
		required: true,
	},
	{
		labelName: "Contact Number",
		name: "contactNumber",
		type: "tel",
		placeholder: "Enter contact number",
		required: true,
	},
	{
		labelName: "Email",
		name: "email",
		type: "email",
		placeholder: "Enter email address",
		required: true,
	},
	{
		labelName: "Post",
		name: "post",
		type: "select",
		placeholder: "Select post",
		options: [
			{ label: "HR", value: "HR" },
			{ label: "Manager", value: "Manager" },
			{ label: "Team Leader", value: "Team Leader" },
			{ label: "Executive", value: "Executive" },
		],
		required: true,
	},
	{
		labelName: "Address",
		name: "address",
		textArea: true,
		placeholder: "Enter address",
		rows: 3,
	},
	{
		labelName: "Aadhaar",
		name: "aadhaar",
		type: "text",
		placeholder: "Enter Aadhaar number",
	},
	{
		labelName: "PAN",
		name: "pan",
		type: "text",
		placeholder: "Enter PAN number",
	},
	{
		labelName: "Account Number",
		name: "accountNumber",
		type: "text",
		placeholder: "Enter account number",
	},
	{
		labelName: "Joining Date",
		name: "joiningDate",
		type: "date",
		required: true,
	},
	{
		labelName: "CTC",
		name: "ctc",
		type: "number",
		placeholder: "Enter CTC",
	},
	{
		labelName: "In-hand Salary",
		name: "inhandSalary",
		type: "number",
		placeholder: "Enter in-hand salary",
	},
	{
		labelName: "Profile Image",
		name: "profileImage",
		type: "file",
		accept: "image/*",
	},
	{
		labelName: "Employee ID",
		name: "employeeId",
		type: "text",
		placeholder: "Enter employee ID",
		required: true,
	},
	{
		labelName: "Device Provided by Company",
		name: "deviceProvided",
		type: "radio",
		options: [
			{ label: "Yes", value: "yes" },
			{ label: "No", value: "no" },
		],
	},
];

export const stats = [
	{
		title: "Total Meetings",
		value: "24",
		change: "+12%",
		icon: <FaUsers />,
		iconBg: "bg-blue-50",
		iconColor: "text-blue-600",
	},
	{
		title: "Upcoming",
		value: "8",
		change: "+33%",
		icon: <FaCalendarAlt />,
		iconBg: "bg-purple-50",
		iconColor: "text-purple-600",
	},
	{
		title: "Completed",
		value: "15",
		change: "+8%",
		icon: <FaCheckCircle />,
		iconBg: "bg-green-50",
		iconColor: "text-green-600",
	},
	{
		title: "Revenue",
		value: "₹42,500",
		change: "+18%",
		icon: <FaRupeeSign />,
		iconBg: "bg-orange-50",
		iconColor: "text-orange-500",
	},
];
export const meetings = [
	{
		time: "10:00 AM - 10:30 AM",
		title: "Client Consultation",
		person: "Rohan Mehta",
		type: "Zoom Meeting",
		color: "bg-blue-500",
	},
	{
		time: "12:00 PM - 1:00 PM",
		title: "Project Discussion",
		person: "Ananya Sharma",
		type: "Google Meet",
		color: "bg-purple-500",
	},
	{
		time: "3:30 PM - 4:00 PM",
		title: "Follow Up Meeting",
		person: "Vikram Singh",
		type: "Phone Call",
		color: "bg-green-500",
	},
	{
		time: "5:00 PM - 5:45 PM",
		title: "Strategy Call",
		person: "Neha Kapoor",
		type: "Zoom Meeting",
		color: "bg-orange-500",
	},
];
export const recentActivity = [
	{
		date: "08 Sep 2026, 10:00 AM",
		client: "Rohan Mehta",
		event: "Client Consultation",
		status: "Completed",
	},
	{
		date: "08 Sep 2026, 12:00 PM",
		client: "Ananya Sharma",
		event: "Project Discussion",
		status: "Upcoming",
	},
	{
		date: "07 Sep 2026, 03:30 PM",
		client: "Vikram Singh",
		event: "Follow Up Meeting",
		status: "Completed",
	},
	{
		date: "07 Sep 2026, 11:15 AM",
		client: "Neha Kapoor",
		event: "Strategy Call",
		status: "Completed",
	},
];
export const EmployeeFieldCard = [
	{
		title: "Present Today",
		value: "40",
		remainingValue: "124",
		message: "People Remaining",
		icon: <FaUsers />,
		iconBg: "bg-blue-50",
		iconColor: "text-blue-600",
	},
	{
		title: "Late Entry",
		value: "8",
		remainingValue: "12",
		message: "People are on time",
		icon: <FaCalendarAlt />,
		iconBg: "bg-purple-50",
		iconColor: "text-purple-600",
	},
	{
		title: "On Leave",
		value: "4",
		remainingValue: "0",
		message: "Approved Leaves",
		icon: <FaCheckCircle />,
		iconBg: "bg-green-50",
		iconColor: "text-green-600",
	},
	{
		title: "Absent",
		value: "01",
		change: "0",
		message: "Without Information",
		icon: <FaRupeeSign />,
		iconBg: "bg-orange-50",
		iconColor: "text-orange-500",
	},
];
