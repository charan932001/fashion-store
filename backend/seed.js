const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const products = [
  {
    name: "Classic White Shirt",
    description: "A clean and comfortable classic white shirt.",
    price: 49.99,
    image_url: "https://placehold.co/600x800?text=White+Shirt",
    category: "Shirts",
    stock: 20,
  },
  {
    name: "Black Oversized T-Shirt",
    description: "Relaxed fit oversized cotton t-shirt.",
    price: 29.99,
    image_url: "https://placehold.co/600x800?text=Black+T-Shirt",
    category: "T-Shirts",
    stock: 30,
  },
  {
    name: "Blue Denim Jeans",
    description: "Classic blue denim jeans with a comfortable fit.",
    price: 69.99,
    image_url: "https://placehold.co/600x800?text=Blue+Jeans",
    category: "Jeans",
    stock: 15,
  },
  {
    name: "Beige Casual Jacket",
    description: "Lightweight jacket for a modern casual look.",
    price: 89.99,
    image_url: "https://placehold.co/600x800?text=Beige+Jacket",
    category: "Jackets",
    stock: 10,
  },
];

async function seedProducts() {
  try {
    await pool.query("DELETE FROM products");

    for (const product of products) {
      await pool.query(
        `INSERT INTO products
        (name, description, price, image_url, category, stock)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          product.name,
          product.description,
          product.price,
          product.image_url,
          product.category,
          product.stock,
        ]
      );
    }

    console.log("Products seeded successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await pool.end();
  }
}

seedProducts();