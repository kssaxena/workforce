import Company from "../models/company.model.js";
import ApiError from "../../../core/errors/ApiError.js";

const PROFILE_FIELDS =
  "name legalName registrationNumber email phone website address.addressLine1 address.addressLine2 address.city address.state address.country address.postalCode status";

const getSafeCompanyProfile = (company) => ({
  id: company._id,
  name: company.name,
  legalName: company.legalName || "",
  registrationNumber: company.registrationNumber || "",
  email: company.email,
  phone: company.phone || "",
  website: company.website || "",
  address: {
    addressLine1: company.address?.addressLine1 || "",
    addressLine2: company.address?.addressLine2 || "",
    city: company.address?.city || "",
    state: company.address?.state || "",
    country: company.address?.country || "India",
    postalCode: company.address?.postalCode || "",
  },
  status: company.status,
  createdAt: company.createdAt,
  updatedAt: company.updatedAt,
});

export const getCompanyProfile = async ({ companyId }) => {
  const company = await Company.findById(companyId).select(PROFILE_FIELDS);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return getSafeCompanyProfile(company);
};

export const updateCompanyProfile = async ({ companyId, userId, data }) => {
  const company = await Company.findById(companyId);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  // Prevent another company from using the same company email.
  if (data.email && data.email.toLowerCase() !== company.email) {
    const existingCompany = await Company.findOne({
      email: data.email.toLowerCase(),
      _id: { $ne: company._id },
    }).select("_id");

    if (existingCompany) {
      throw new ApiError(
        409,
        "Another company is already registered with this email",
      );
    }
  }

  const editableFields = [
    "name",
    "legalName",
    "registrationNumber",
    "email",
    "phone",
    "website",
  ];

  for (const field of editableFields) {
    if (data[field] !== undefined) {
      company[field] =
        field === "email" ? data[field].toLowerCase() : data[field];
    }
  }

  company.address = company.address || {};

  // Merge the address so omitted fields are not accidentally erased.
  if (data.address) {
    const addressFields = [
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "country",
      "postalCode",
    ];

    for (const field of addressFields) {
      if (data.address[field] !== undefined) {
        company.address[field] = data.address[field];
      }
    }
  }

  company.updatedBy = userId;

  await company.save();

  return getSafeCompanyProfile(company);
};
