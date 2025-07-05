const mongoose = require("mongoose");
const { Customer } = require("./model/schemas"); // Update the path accordingly
const { faker } = require("@faker-js/faker");

const MONGODB_URI = "mongodb://localhost:27017/myapp_db"; // Replace with your DB URI

async function seedCustomers(num = 25) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    const existingCount = await Customer.countDocuments();
    const baseId = 10001 + existingCount;

    const customers = [];

    for (let i = 0; i < num; i++) {
      const customer = new Customer({
        customer_id: (baseId + i).toString(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(), 
        total_spent: 0,
        total_orders: 0,
        last_order_date: null,
        signup_date: faker.date.past(),
        is_active: true,
      });

      customers.push(customer);
    }

    await Customer.insertMany(customers);
    console.log(`${num} customers added.`);
    process.exit();
  } catch (err) {
    console.error("Error seeding customers:", err);
    process.exit(1);
  }
}

seedCustomers(25); // Change the number to insert more or fewer
