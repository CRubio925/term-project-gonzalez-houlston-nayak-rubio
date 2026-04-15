import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { addClient, removeClient } from "../types/sse.js";

const router = Router();

router.get("/", requireAuth, (request, response) => {
  const user = request.session.user;

  if (!user) {
    response.redirect("/auth/login");
    return;
  }

  const userId = user.id;
  const clientId = addClient(response, userId);

  console.log(`SSE client ${String(clientId)} connected (user ${String(userId)})`);

  request.on("close", () => {
    removeClient(clientId);
  });
});

export default router;
