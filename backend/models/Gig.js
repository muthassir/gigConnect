const mongoose = require("mongoose");

const gigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
    min: 0,
  },
  budgetType: {
    type: String,
    enum: ["hourly", "fixed"],
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  skillsRequired: [
    {
      type: String,
    },
  ],
  status: {
    type: String,
    enum: ["open", "in-progress", "completed", "cancelled"],
    default: "open",
  },
  applications: [
    {
      freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      proposal: String,
      bidAmount: Number,
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
      appliedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  hiredFreelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Gig", gigSchema);
