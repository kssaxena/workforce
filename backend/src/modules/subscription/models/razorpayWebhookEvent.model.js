import mongoose from "mongoose";

const razorpayWebhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    eventType: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["RECEIVED", "PROCESSED", "IGNORED"],
      default: "RECEIVED",
    },

    lastError: {
      type: String,
      default: null,
    },

    processedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model(
  "RazorpayWebhookEvent",
  razorpayWebhookEventSchema,
);
