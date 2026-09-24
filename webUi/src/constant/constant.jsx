import {
	FaChartPie,
	FaUserTie,
	FaBuilding,
	FaUsers,
	FaCreditCard,
	FaPlusCircle,
	FaUserShield,
	FaKey,
	FaMoneyCheckAlt,
	FaCalendarAlt,
	FaCheckCircle,
	FaHourglassStart,
	FaRupeeSign,

} from "react-icons/fa";
import { GoVerified } from "react-icons/go";

export const dashboardSectionList = [
	{
		name: "Access",
		icon: <FaUserShield />,
		query: "access",
		roles: ["company", "company team", "manager"],
	},
	{
		name: "Analytics",
		icon: <FaChartPie />,
		query: "analytics",
		roles: ["company", "company team", "manager", "employee"],
	},
	{
		name: "Attendance",
		icon: <FaPlusCircle />,
		query: "attendance",
		roles: ["company"],
	},
	// {
	// 	name: "Company",
	// 	icon: <FaBuilding />,
	// 	query: "companyLevel",
	// 	roles: ["company", "company team", "manager"],
	// },
	{
		name: "Employee",
		icon: <FaUserTie />,
		query: "employee",
		subCategory: ["HR", "Manager", "Team Leader", "Executive"],
		roles: ["company", "company team", "manager"],
	},

	{
		name: "Employee Profile",
		icon: <FaUsers />,
		query: "employeeProfile",
		roles: ["company", "company team", "manager"],
	},
	// {
	// 	name: "Grant",
	// 	icon: <FaKey />,
	// 	query: "grant",
	// 	roles: ["company", "company team", "manager"],
	// },

	{
		name: "Payroll",
		icon: <FaMoneyCheckAlt />,
		query: "payroll",
		roles: ["company", "company team", "manager"],
	},
	// {
	// 	name: "Subscription",
	// 	icon: <FaCreditCard />,
	// 	query: "subscription",
	// 	roles: ["company", "company team", "manager"],
	// },
];

export const employeeFields = [
	{
		labelName: "Name",
		name: "name",
		type: "text",
		placeholder: "Enter employee name",
		
	},
	{
		labelName: "Contact Number",
		name: "contactNumber",
		type: "tel",
		placeholder: "Enter contact number",
		
	},
	{
		labelName: "Email",
		name: "email",
		type: "email",
		placeholder: "Enter email address",
		
	},
	{
		labelName: "Department",
		name: "department",
		type: "select",
		placeholder: "Select post",
		options: [
			{ label: "HR", value: "HR" },
			{ label: "Manager", value: "Manager" },
			{ label: "Team Leader", value: "Team Leader" },
			{ label: "Executive", value: "Executive" },
		],
		
	},
	{
		labelName: "Designation",
		name: "designation",
		type: "text",
		placeholder: "Enter your designation",
		
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
		id: 1,
		title: "Total Employee",
		value: "24",
		icon: <FaUsers />,
		iconBg: "bg-blue-50",
		iconColor: "text-blue-600",
	},
	{
		id: 2,
		title: "Present Today",
		value: "8",
		change: "+33%",
		icon: <FaCalendarAlt />,
		iconBg: "bg-purple-50",
		iconColor: "text-purple-600",
	},
	{
		id: 3,
		title: "On Leave",
		value: "15",
		change: "+8%",
		icon: <FaCheckCircle />,
		iconBg: "bg-green-50",
		iconColor: "text-green-600",
	},
	{
		id: 4,
		title: "Late Entry",
		value: "5",
		change: "+18%",
		icon: <FaHourglassStart />,
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

export const loginHeader = {
	company: {
		title: "Company Sign In",
		description: "Sign in to manage your organization and workforce.",
	},

	companyTeam: {
		title: "Company Team Sign In",
		description: "Access your HR and workforce management tools.",
	},

	manager: {
		title: "Manager Sign In",
		description: "Manage your team and track workforce performance.",
	},

	employee: {
		title: "Employee Sign In",
		description: "Access your profile, attendance and work information.",
	},
};
