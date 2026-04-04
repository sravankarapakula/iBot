// server/src/models/userSelection.model.js
import mongoose from "mongoose";

const userSelectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roleId: {
      type: String,
      required: true,
      trim: true,
    },
    stackId: {
      type: String,
      required: true,
      trim: true,
    },
    roleName: {
      type: String,
      trim: true,
    },
    stackName: {
      type: String,
      trim: true,
    },
    selectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index to quickly fetch latest selection per user
userSelectionSchema.index({ userId: 1, selectedAt: -1 });

export default mongoose.model("UserSelection", userSelectionSchema);
