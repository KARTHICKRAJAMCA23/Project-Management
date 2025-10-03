import mongoose from "mongoose";

const teamLeaderSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }, // hide password
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }], // employees under them
    role: { type: String, enum: ["teamleader"], default: "teamleader" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual field for frontend (id)
teamLeaderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Hash password before save
import bcrypt from "bcryptjs";
teamLeaderSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
teamLeaderSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password when returning JSON
teamLeaderSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("TeamLeader", teamLeaderSchema);
