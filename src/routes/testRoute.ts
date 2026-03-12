import { Router } from "express";
import db from "../db/connection.js";

const router = Router();
//every time this page loads, we will insert a record into our created table "test_table",
//and then we fetch all of the records and return them as JSON, to be able to write and retrieve data
router.get("/", async (_request, response) => {
  const message = `${_request.method} ${_request.path} at ${new Date().toLocaleDateString()}`;

  await db.none("INSERT INTO test_table (message) VALUES ($1)", [message]);
  const records = await db.any("SELECT * FROM test_table");

  response.json(records);
});

router.post("/", async (request, response) => {
  try {
    const { message } = request.body;

    if (!message) {
      return response.status(400).json({ error: "you need a message" });
    }

    await db.none("INSERT INTO test_table (message) VALUES ($1)", [message]);
    const records = await db.any("SELECT * FROM test_table ORDER BY id DESC");

    return response.json(records);
  } catch {
    return response.status(500).json({ error: "Database error" });
  }
});
export default router;
