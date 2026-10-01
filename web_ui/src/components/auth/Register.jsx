import { useState } from "react";
import { useNavigate } from "react-router-dom";

import InputBox from "../common/Input";
import Button from "../common/Button";

import { registerCompany } from "../../services/auth";

const initialState = {
  company: {
    name: "",
    legalName: "",
    registrationNumber: "",
    email: "",
    phone: "",
    website: "",

    address: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
    },
  },

  representative: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    designation: "",
  },
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialState);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const updateCompany = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,

      company: {
        ...previous.company,
        [name]: value,
      },
    }));
  };

  const updateAddress = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,

      company: {
        ...previous.company,

        address: {
          ...previous.company.address,

          [name]: value,
        },
      },
    }));
  };

  const updateRepresentative = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,

      representative: {
        ...previous.representative,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    setLoading(true);

    try {
      await registerCompany(formData);

      setSuccess(
        "Company registered successfully. You can now sign in as the Company owner.",
      );

      setTimeout(() => {
        navigate("/login/company", {
          replace: true,
        });
      }, 1200);
    } catch (error) {
      setError(
        error?.data?.message || error?.message || "Unable to register company.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-black text-white">
            W
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            Create your Workforce OS company
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Register your company and create the primary company administrator
            account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Company information
            </h2>

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              <InputBox
                labelName="Company name"
                name="name"
                value={formData.company.name}
                onChange={updateCompany}
                required
              />

              <InputBox
                labelName="Legal name"
                name="legalName"
                value={formData.company.legalName}
                onChange={updateCompany}
              />

              <InputBox
                labelName="Registration number"
                name="registrationNumber"
                value={formData.company.registrationNumber}
                onChange={updateCompany}
              />

              <InputBox
                labelName="Company email"
                name="email"
                type="email"
                value={formData.company.email}
                onChange={updateCompany}
                required
              />

              <InputBox
                labelName="Company phone"
                name="phone"
                value={formData.company.phone}
                onChange={updateCompany}
                required
              />

              <InputBox
                labelName="Website"
                name="website"
                value={formData.company.website}
                onChange={updateCompany}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Company address
            </h2>

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              <InputBox
                labelName="Address line 1"
                name="addressLine1"
                value={formData.company.address.addressLine1}
                onChange={updateAddress}
                required
              />

              <InputBox
                labelName="Address line 2"
                name="addressLine2"
                value={formData.company.address.addressLine2}
                onChange={updateAddress}
              />

              <InputBox
                labelName="City"
                name="city"
                value={formData.company.address.city}
                onChange={updateAddress}
                required
              />

              <InputBox
                labelName="State"
                name="state"
                value={formData.company.address.state}
                onChange={updateAddress}
                required
              />

              <InputBox
                labelName="Country"
                name="country"
                value={formData.company.address.country}
                onChange={updateAddress}
                required
              />

              <InputBox
                labelName="Postal code"
                name="postalCode"
                value={formData.company.address.postalCode}
                onChange={updateAddress}
                required
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Primary administrator
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              This account will automatically receive the SUPER_ADMIN role.
            </p>

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              <InputBox
                labelName="First name"
                name="firstName"
                value={formData.representative.firstName}
                onChange={updateRepresentative}
                required
              />

              <InputBox
                labelName="Last name"
                name="lastName"
                value={formData.representative.lastName}
                onChange={updateRepresentative}
              />

              <InputBox
                labelName="Email"
                name="email"
                type="email"
                value={formData.representative.email}
                onChange={updateRepresentative}
                required
              />

              <InputBox
                labelName="Phone"
                name="phone"
                value={formData.representative.phone}
                onChange={updateRepresentative}
                required
              />

              <InputBox
                labelName="Designation"
                name="designation"
                value={formData.representative.designation}
                onChange={updateRepresentative}
              />

              <InputBox
                labelName="Password"
                name="password"
                type="password"
                value={formData.representative.password}
                onChange={updateRepresentative}
                required
                passwordHint="Minimum 8 characters"
              />
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              LabelName="Back to login"
              onClick={() => navigate("/login/company")}
            />

            <Button
              type="submit"
              LabelName={loading ? "Creating company..." : "Create company"}
              disabled={loading}
            />
          </div>
        </form>
      </div>
    </main>
  );
};

export default Register;
