import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import InputBox from "../common/Input";
import Button from "../common/Button";

import useAuth from "../../hooks/useAuth";

const PORTALS = {
  company: {
    title: "Company Login",
    description: "Sign in as the company owner or Super Admin.",
  },

  companyTeam: {
    title: "Company Team Login",
    description: "Sign in to manage HR and company operations.",
  },

  manager: {
    title: "Manager / Team Leader Login",
    description: "Sign in to manage your assigned workforce.",
  },

  employee: {
    title: "Employee Login",
    description: "Sign in to access your employee workspace.",
  },
};

const Login = () => {
  const { type = "employee" } = useParams();

  const navigate = useNavigate();

  const { login, loading } = useAuth();

  const portal = PORTALS[type] || PORTALS.employee;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    try {
      await login({
        ...formData,
        portal: type,
      });

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to sign in.",
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-8">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-black text-white">
            W
          </div>

          <h1 className="text-2xl font-black text-slate-950">{portal.title}</h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {portal.description}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <InputBox
            labelName="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <InputBox
            labelName="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            LabelName={loading ? "Signing in..." : "Sign in"}
            disabled={loading}
            className="mt-5 w-full"
          />
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don't have a company account?
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="ml-1 font-semibold text-blue-600 hover:underline"
          >
            Register company
          </button>
        </div>
      </div>
    </main>
  );
};

export default Login;
