const express = require("express");
const dotenv = require("dotenv");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Fashion Store API is running",
  });
});

// Database test
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    if (!Number.isInteger(page) || page < 1) {
      page = 1;
    }

    if (!Number.isInteger(limit) || limit < 1) {
      limit = 8;
    }

    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";

    const offset = (page - 1) * limit;

    const whereClause = search ? "WHERE name ILIKE $1 OR category ILIKE $1" : "";
    const searchParam = search ? [`%${search}%`] : [];

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM products ${whereClause}`,
      searchParam
    );

    const totalProducts = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.max(
      Math.ceil(totalProducts / limit),
      1
    );

    const result = await pool.query(
      `SELECT * FROM products ${whereClause}
       ORDER BY id DESC
       LIMIT $${searchParam.length + 1} OFFSET $${searchParam.length + 2}`,
      [...searchParam, limit, offset]
    );

    res.json({
      success: true,
      products: result.rows,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
});

// Register user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});


// Login user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// Protected user route
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
});
const PORT = process.env.PORT || 5001;

// Add product to cart
app.post("/api/cart", authMiddleware, async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "feature coming soon",
      });
    }

    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await pool.query(
      "SELECT id, name, price, stock FROM products WHERE id = $1",
      [productId]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.rows[0].stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    const result = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING *`,
      [req.user.userId, productId, quantity]
    );

    res.status(201).json({
      success: true,
      message: "Product added to cart",
      cartItem: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
    });
  }
});

// Get user's cart
app.get("/api/cart", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        cart_items.id,
        cart_items.quantity,
        products.id AS product_id,
        products.name,
        products.price,
        products.image_url,
        products.stock
       FROM cart_items
       JOIN products ON cart_items.product_id = products.id
       WHERE cart_items.user_id = $1
       ORDER BY cart_items.id DESC`,
      [req.user.userId]
    );

    const items = result.rows.map((item) => ({
      ...item,
      item_total: Number(item.price) * item.quantity,
    }));

    const total = items.reduce(
      (sum, item) => sum + item.item_total,
      0
    );

    res.json({
      success: true,
      items,
      total,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
});

// Update cart quantity
app.put("/api/cart/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await pool.query(
      "SELECT id, stock FROM products WHERE id = $1",
      [productId]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.rows[0].stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    const result = await pool.query(
      `UPDATE cart_items
       SET quantity = $1
       WHERE user_id = $2 AND product_id = $3
       RETURNING *`,
      [quantity, req.user.userId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.json({
      success: true,
      message: "Cart quantity updated",
      cartItem: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
});

// Remove product from cart
app.delete("/api/cart/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await pool.query(
      `DELETE FROM cart_items
       WHERE user_id = $1 AND product_id = $2
       RETURNING *`,
      [req.user.userId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.json({
      success: true,
      message: "Product removed from cart",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to remove product from cart",
    });
  }
});

// Create order from cart
app.post("/api/orders", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const cartResult = await client.query(
      `SELECT
        cart_items.product_id,
        cart_items.quantity,
        products.price,
        products.stock
       FROM cart_items
       JOIN products ON cart_items.product_id = products.id
       WHERE cart_items.user_id = $1`,
      [req.user.userId]
    );

    if (cartResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    let totalAmount = 0;

    for (const item of cartResult.rows) {
      if (item.quantity > item.stock) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${item.product_id}`,
        });
      }

      totalAmount += Number(item.price) * item.quantity;
    }

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, status)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, total_amount, status, created_at`,
      [req.user.userId, totalAmount, "pending"]
    );

    const order = orderResult.rows[0];

    for (const item of cartResult.rows) {
      await client.query(
        `INSERT INTO order_items
         (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [
          order.id,
          item.product_id,
          item.quantity,
          item.price,
        ]
      );

      await client.query(
        `UPDATE products
         SET stock = stock - $1
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query(
      "DELETE FROM cart_items WHERE user_id = $1",
      [req.user.userId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        id: order.id,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});