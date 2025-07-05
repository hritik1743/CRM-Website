const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    audienceSegment: {
      type: Object, 
      required: true,
    },
    audienceSize: {
      type: Number,
      default: 0,
    },
    customers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
    ],
    communicationLog: [
      {
        message: String,
        modes: [String],
        stats: {
          sent: Number,
          failed: Number,
          total: Number,
        },
        createdAt: Date,
      },
    ],
    stats: {
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Campaign", campaignSchema);
