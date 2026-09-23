import {
	FaCalendarAlt,
	FaCheckCircle,
	FaHourglassStart,
	FaLastfmSquare,
	FaRProject,
	FaRupeeSign,
	FaUsers,
} from "react-icons/fa";
import { GoVerified } from "react-icons/go";

export const dashboardSectionList = [
	{
		name: "Overview",
		icon: <GoVerified />,
		query: "overview",
		roles: ["company", "company team", "manager", "employee"],
	},
	{
		name: "Designation",
		icon: <GoVerified />,
		query: "designation",
		subCategory: ["HR", "Manager", "Team Leader", "Executive"],
		roles: ["company", "company team", "manager"],
	},
	{
		name: "Company",
		icon: <GoVerified />,
		query: "companyLevel",
		roles: ["company", "company team", "manager"],
	},
	{
		name: "Employee",
		icon: <GoVerified />,
		query: "employee",
		roles: ["company", "company team", "manager"],
	},
	{
		name: "Subscription",
		icon: <GoVerified />,
		query: "subscription",
		roles: ["company", "company team", "manager"],
	},
	{
		name: "Addition",
		icon: <GoVerified />,
		query: "addition",
		roles: ["company"],
	},
	{
		name: "Access",
		icon: <GoVerified />,
		query: "access",
		roles: ["company", "company team", "manager"],
	},
	{
		name: "Grant",
		icon: <GoVerified />,
		query: "grant",
		roles: ["company", "company team", "manager"],
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
export const recentActivity = [
	{
		serialNumber: "1",
		name: "Rohan Mehta",
		designation: "Team Leader",
		status: "Present",
	},
	{
		serialNumber: "2",
		name: "Akanksha Kumari",
		designation: "UI/UX Developer",
		status: "Absent",
	},
	{
		serialNumber: "3",
		name: "Mouli Das",
		designation: "Salseforce Developer",
		status: "Present",
	},
	{
		serialNumber: "4",
		name: "Neha Kapoor",
		designation: "HR",
		status: "Present",
	},
];
export const EmployeeFieldCard = [
	{
		key: "presentToday",
		remainingKey: "presentRemaining",
		title: "Present Today",
		message: "People Remaining",
		icon: <FaUsers />,
		iconBg: "bg-blue-50",
		iconColor: "text-blue-600",
	},
	{
		key: "lateEntry",
		remainingKey: "onTime",
		title: "Late Entry",
		message: "People are on time",
		icon: <FaCalendarAlt />,
		iconBg: "bg-purple-50",
		iconColor: "text-purple-600",
	},
	{
		key: "onLeave",
		remainingKey: "approvedLeaves",
		title: "On Leave",
		message: "Approved Leaves",
		icon: <FaCheckCircle />,
		iconBg: "bg-green-50",
		iconColor: "text-green-600",
	},
	{
		key: "absent",
		remainingKey: "withoutInformation",
		title: "Absent",
		message: "Without Information",
		icon: <FaRupeeSign />,
		iconBg: "bg-orange-50",
		iconColor: "text-orange-500",
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
