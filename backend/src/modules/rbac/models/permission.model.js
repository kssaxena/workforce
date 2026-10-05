import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    module: { type: String, required: true, trim: true },
    resource: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

permissionSchema.index({ module: 1, resource: 1, action: 1 });

const Permission = mongoose.model("Permission", permissionSchema);

export default Permission;
