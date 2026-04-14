import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, (request, response) => {
  const { user } = request.session;
  response.render("lobby", { user });
});

router.get("/players", requireAuth, (_request, response) => {
  const players = [
    { id: 1, email: "person1@example.com" },
    { id: 2, email: "person2@example.com" },
    { id: 3, email: "person3@example.com" },
  ];
  response.json({ players });
});

export default router;
