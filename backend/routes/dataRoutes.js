const express = require("express");
const router = express.Router();
const { Customer, Order } = require("../model/schemas"); // Update path if different
const Campaign = require("../model/Campaign"); // Your campaign model file
const {
  generateQueryFromNLP,
  generateTitleFromNLP,
  generateMessageFromNLP,
} = require("../genAi/OpenAi");

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
}

router.post("/generate-message", async (req, res) => {
  const { campaignId, segment } = req.body;
  console.log(campaignId, segment);

  if (!campaignId || !segment) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const generatedMessage = await generateMessageFromNLP(campaignId, segment);
    res.json({ success: true, generatedMessage });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate message." });
  }
});

router.post("/nlp-to-query", async (req, res) => {
  const { description } = req.body;
  console.log("Received description:", description);

  if (!description) {
    return res.status(400).json({ error: "Missing description" });
  }

  try {
    const query = await generateQueryFromNLP(description);
    const title = await generateTitleFromNLP(description);

    return res.json({ query, title });
  } catch (err) {
    console.error("NLP to query failed:", err);
    return res.status(500).json({ error: "Failed to generate query" });
  }
});

// POST /api/communication-log
router.post("/communication-log", async (req, res) => {
  try {
    const { campaignId, message, modes } = req.body;

    if (!campaignId || !message || !modes || !Array.isArray(modes)) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const total = campaign.audienceSize || 0;

    // Calculate exact 90% and 10% split with whole numbers
    let failed = Math.floor(total * 0.1); // always 10% rounded down
    let sent = total - failed;

    const newLog = {
      message,
      modes,
      stats: {
        total,
        sent,
        failed,
      },
      createdAt: new Date(),
    };

    // Save the log
    campaign.communicationLog.push(newLog);
    await campaign.save();

    res.status(201).json({
      success: true,
      message: "Communication log saved successfully",
      log: newLog,
    });
  } catch (err) {
    console.error("Error saving communication log:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/create-campaign
router.post("/create-campaign", isAuthenticated, async (req, res) => {
  const { name, audienceSegment, audienceSize } = req.body;

  if (!name || !audienceSegment || audienceSize === undefined) {
    return res.status(400).json({
      message: "Name, audience segment, and audience size are required",
    });
  }

  let parsedQuery;
  try {
    parsedQuery =
      typeof audienceSegment === "string"
        ? JSON.parse(audienceSegment)
        : audienceSegment;
  } catch (err) {
    return res.status(400).json({ message: "Invalid audience segment JSON" });
  }

  try {
    const matchedCustomers = await Customer.find(parsedQuery).select("_id");

    const campaign = new Campaign({
      name,
      audienceSegment: parsedQuery,
      audienceSize,
      customers: matchedCustomers.map((c) => c._id),
    });

    await campaign.save();

    res.status(201).json(campaign);
  } catch (err) {
    console.error("Error creating campaign:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/campaign/:id", isAuthenticated, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate(
      "customers",
      "name email phone"
    ); // only select desired fields

    if (!campaign) return res.status(404).json({ message: "Not found" });

    res.json(campaign);
  } catch (err) {
    console.error("Error fetching campaign:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/audience-size", isAuthenticated, async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  let parsedQuery;
  try {
    parsedQuery = typeof query === "string" ? JSON.parse(query) : query;
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON query" });
  }

  try {
    const count = await Customer.countDocuments(parsedQuery);
    return res.status(200).json({ size: count });
  } catch (error) {
    console.error("Error counting customers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/customers/:customer_id
router.get("/customers/:customer_id", isAuthenticated, async (req, res) => {
  const customerId = req.params.customer_id;

  try {
    // Find customer by customer_id field (not _id)
    const customer = await Customer.findOne({ customer_id: customerId });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Return only id and name
    res.json({ id: customer.customer_id, name: customer.name });
  } catch (err) {
    console.error("Error fetching customer:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/latest-customer-id
router.get("/latest-customer-id", isAuthenticated, async (req, res) => {
  try {
    const latest = await Customer.findOne().sort({ customer_id: -1 });
    const nextId = latest ? String(Number(latest.customer_id) + 1) : "10001";
    res.json({ nextCustomerId: nextId });
  } catch (err) {
    console.error("Error fetching latest customer ID:", err);
    res.status(500).json({ message: "Failed to get latest customer ID" });
  }
});

router.get("/latest-order-id", isAuthenticated, async (req, res) => {
  try {
    const latest = await Order.findOne().sort({ order_id: -1 });
    const nextId = latest ? String(Number(latest.order_id) + 1) : "10001";
    res.json({ nextOrderId: nextId });
  } catch (err) {
    console.error("Error fetching latest order ID:", err);
    res.status(500).json({ message: "Failed to get latest order ID" });
  }
});

router.get("/get-dashboard-data", isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userName = req.user.displayName || req.user.name || "Unknown";

    // Aggregate totals
    const totalAmountResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalAmountSpent: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const totalAmountSpent =
      totalAmountResult.length > 0 ? totalAmountResult[0].totalAmountSpent : 0;
    const totalOrders =
      totalAmountResult.length > 0 ? totalAmountResult[0].totalOrders : 0;

    // Fetch all customers and orders
    // Optionally you can limit fields by passing second argument to find()
    const customers = await Customer.find({});
    const orders = await Order.find({});
    const campaigns = await Campaign.find({});

    res.json({
      name: userName,
      totalAmountSpent,
      totalCustomers: customers.length,
      totalOrders,
      customers, // array of all customer docs
      orders, // array of all order docs
      campaigns, // ✅ added campaigns data
    });
  } catch (error) {
    console.error("Error retrieving dashboard data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// -------------------- Add Customer --------------------
router.post("/add-customer", isAuthenticated, async (req, res) => {
  try {
    const { customer_id, name, email, phone } = req.body;

    const existingCustomer = await Customer.findOne({ customer_id });
    if (existingCustomer) {
      return res.status(409).json({ message: "Customer already exists" });
    }

    const newCustomer = new Customer({
      customer_id,
      name,
      email,
      phone,
    });

    await newCustomer.save();
    res
      .status(201)
      .json({ message: "Customer added successfully", customer: newCustomer });
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({
      message: "Error adding customer",
      error: error.message || error,
    });
  }
});

// -------------------- Add Order --------------------
router.post("/add-order", isAuthenticated, async (req, res) => {
  try {
    const { order_id, customer_id, amount, items, status } = req.body;

    const customer = await Customer.findOne({ customer_id });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const newOrder = new Order({
      order_id,
      customer_id,
      amount,
      items,
      status,
    });

    // Save Order
    await newOrder.save();

    // Update Customer Stats
    customer.total_spent += amount;
    customer.total_orders += 1;
    customer.last_order_date = newOrder.order_date;
    await customer.save();

    res.status(201).json({ message: "Order placed", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error });
  }
});

module.exports = router;
