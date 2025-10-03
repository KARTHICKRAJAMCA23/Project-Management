import mongoose from "mongoose";

const updateSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    message: { type: String, default: "" },
    file: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "in progress", "completed", "rejected"],
      default: "pending",
      lowercase: true,
    },
    role: { type: String, enum: ["employee", "teamleader"], default: "employee" },
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    status: {
      type: String,
      enum: ["pending", "in progress", "completed"],
      default: "pending",
      lowercase: true,
    },
    deadline: { type: Date },
    updates: [updateSchema], // Employee updates
    reviews: [reviewSchema], // Team Leader reviews
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual field for frontend (id)
projectSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export default mongoose.model("Project", projectSchema);
