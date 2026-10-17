import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Globe,
  LoaderCircle,
  MapPin,
  Save,
  ShieldCheck,
} from "lucide-react";

import useAuth from "../../../hooks/useAuth";
import {
  getCompanyProfile,
  updateCompanyProfile,
} from "../../../services/company";

const EMPTY_PROFILE = {
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
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
  required = false,
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-bold text-slate-600">
      {label}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </span>

    <input
      type={type}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
    />
  </label>
);

const Section = ({ icon: Icon, title, description, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
    <div className="mb-5 flex items-start gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={19} />
      </div>

      <div>
        <h2 className="text-sm font-black text-slate-900">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
      </div>
    </div>

    {children}
  </section>
);

const CompanyProfile = () => {
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission("COMPANY_UPDATE");

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCompanyProfile();

        if (!cancelled) {
          setProfile({
            ...EMPTY_PROFILE,
            ...response.data?.data,
            address: {
              ...EMPTY_PROFILE.address,
              ...response.data?.data?.address,
            },
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load the company profile.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      address: {
        ...current.address,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canUpdate || saving) return;

    try {
      setSaving(true);
      setError("");
      setStatus("");

      const payload = {
        name: profile.name.trim(),
        legalName: profile.legalName.trim(),
        registrationNumber: profile.registrationNumber.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        website: profile.website.trim(),
        address: {
          addressLine1: profile.address.addressLine1.trim(),
          addressLine2: profile.address.addressLine2.trim(),
          city: profile.address.city.trim(),
          state: profile.address.state.trim(),
          country: profile.address.country.trim(),
          postalCode: profile.address.postalCode.trim(),
        },
      };

      const response = await updateCompanyProfile(payload);

      setProfile((current) => ({
        ...current,
        ...response.data?.data,
        address: {
          ...current.address,
          ...response.data?.data?.address,
        },
      }));

      setStatus("Company profile saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the company profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-sm font-medium text-slate-500">
        <LoaderCircle className="animate-spin" size={20} />
        Loading company profile...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="text-blue-600" size={21} />
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              Company Profile
            </h1>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your organization’s registered details and business contact
            information.
          </p>
        </div>

        {profile.status && (
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <span className="size-2 rounded-full bg-emerald-500" />
            {profile.status}
          </span>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {status && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <CheckCircle2 size={17} />
          {status}
        </div>
      )}

      {!canUpdate && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          You have read-only access to this profile. Contact a company
          administrator if any details need to be changed.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section
          icon={Building2}
          title="Business information"
          description="The primary identity and registration details of your company."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              label="Company name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!canUpdate}
              required
            />

            <InputField
              label="Legal business name"
              name="legalName"
              value={profile.legalName}
              onChange={handleChange}
              disabled={!canUpdate}
            />

            <InputField
              label="Registration number"
              name="registrationNumber"
              value={profile.registrationNumber}
              onChange={handleChange}
              disabled={!canUpdate}
            />
          </div>
        </Section>

        <Section
          icon={Globe}
          title="Contact information"
          description="Business contact details used to identify and reach your organization."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              label="Company email"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!canUpdate}
              required
            />

            <InputField
              label="Company phone"
              name="phone"
              type="tel"
              value={profile.phone}
              onChange={handleChange}
              disabled={!canUpdate}
            />

            <div className="sm:col-span-2">
              <InputField
                label="Website"
                name="website"
                type="url"
                value={profile.website}
                onChange={handleChange}
                disabled={!canUpdate}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </Section>

        <Section
          icon={MapPin}
          title="Registered address"
          description="Your organization's official business address."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <InputField
                label="Address line 1"
                name="addressLine1"
                value={profile.address.addressLine1}
                onChange={handleAddressChange}
                disabled={!canUpdate}
              />
            </div>

            <div className="sm:col-span-2">
              <InputField
                label="Address line 2"
                name="addressLine2"
                value={profile.address.addressLine2}
                onChange={handleAddressChange}
                disabled={!canUpdate}
              />
            </div>

            <InputField
              label="City"
              name="city"
              value={profile.address.city}
              onChange={handleAddressChange}
              disabled={!canUpdate}
            />

            <InputField
              label="State"
              name="state"
              value={profile.address.state}
              onChange={handleAddressChange}
              disabled={!canUpdate}
            />

            <InputField
              label="Country"
              name="country"
              value={profile.address.country}
              onChange={handleAddressChange}
              disabled={!canUpdate}
            />

            <InputField
              label="Postal code"
              name="postalCode"
              value={profile.address.postalCode}
              onChange={handleAddressChange}
              disabled={!canUpdate}
            />
          </div>
        </Section>

        <div className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-2 text-xs leading-5 text-slate-400">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            Only authorized users can update company details.
          </div>

          {canUpdate && (
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : (
                <Save size={17} />
              )}
              {saving ? "Saving..." : "Save changes"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;
