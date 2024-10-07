import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String, // cloudinary url
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    skills:{
      type:[String],
      default: []

    },
    about:{
      type: String,
      default: ""
    },
    education: [
    {
      degree: { type: String, required: true },  // Example: "Bachelor of Science"
      institution: { type: String, required: true },  // Example: "University of XYZ"
      fieldOfStudy: { type: String, required: true },  // Example: "Computer Science"
      startDate: { type: Date },  // When the user started this education
      endDate: { type: Date },  // When the user finished this education (optional)
      grade: { type: String },  // Optional, for GPA or grade (e.g. "3.8/4.0", "First Class")
      description: { type: String }  // Optional, for additional details (e.g., achievements)
    }
  ],
  socialLinks: {
      twitter: { type: String }, // Optional Twitter link
      linkedin: { type: String }, // Optional LinkedIn link
      github: { type: String }, // Optional GitHub link
      instagram: { type: String }, // Optional Instagram link
      facebook: { type: String }, // Optional Facebook link
    },
    refreshToken: {
      type: String,
    },
    profileHeader: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
