const mongoose = require("mongoose");

// -------------------- Customer Schema --------------------
const customerSchema = new mongoose.Schema({
  customer_id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  total_spent: {
    type: Number,
    default: 0,
  },
  total_orders: {
    type: Number,
    default: 0,
  },
  last_order_date: {
    type: Date,
  },
  signup_date: {
    type: Date,
    default: Date.now,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
});

// -------------------- Order Schema --------------------
const orderSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
    unique: true,
  },
  customer_id: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  items: {
    type: [String],
    required: true,
  },
  order_date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["completed", "cancelled", "pending", "processing"],
    default: "pending",
  },
});

// -------------------- Model Exports --------------------
const Customer = mongoose.model("Customer", customerSchema);
const Order = mongoose.model("Order", orderSchema);

module.exports = { Customer, Order };
