import express from 'express';
import { sql } from '../config/db.js';

const router = express.Router();

router.post("/", async (req, res) => {
  // Handle POST request to add a transaction
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || amount === undefined || !category || !user_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const transaction = await sql`
        INSERT INTO transactions (user_id, title, amount, category)
        VALUES (${user_id}, ${title}, ${amount}, ${category})
        RETURNING *
    `;
    console.log("Transaction added:", transaction[0]); // Log the added transaction
    res.status(201).json(transaction[0]); // Return the created transaction
  } catch (error) {
    console.error("Error adding transaction:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const transactions = await sql`
      SELECT * FROM transactions WHERE user_id = ${user_id} ORDER BY created_at DESC
    `;
    res.status(200).json(transactions); // Return the list of transactions
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }
    const result = await sql`
      DELETE FROM transactions WHERE id = ${id}
    `;
    // result.count is available if using postgres.js; otherwise, check result.rowCount or similar for your DB client
    if (result.count === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    } else {
      console.log("Transaction deleted:", id); // Log the deleted transaction
      return res
        .status(200)
        .json({ message: "Transaction deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const balanceResult = await sql`
        SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE user_id = ${userId}
      `;
    const incomeResult = await sql`
        SELECT COALESCE(SUM(amount), 0) as income FROM transactions WHERE user_id = ${userId} AND amount > 0
      `;
    const expensesResult = await sql`
        SELECT COALESCE(SUM(amount), 0) as expenses FROM transactions WHERE user_id = ${userId} AND amount < 0
      `;
    res.status(200).json({
      balance: parseFloat(balanceResult[0].balance),
      income: parseFloat(incomeResult[0].income),
      expenses: parseFloat(expensesResult[0].expenses),
    });
  } catch (error) {
    console.error("Error fetching transaction summary:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;