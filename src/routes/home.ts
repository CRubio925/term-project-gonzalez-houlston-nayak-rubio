import { Router } from "express";

const router = Router();
//home route
router.get("/", (request, response) => {
  if (request.session.user?.id) {
    response.redirect("/lobby");
  } else {
    response.redirect("/auth/login");
  }
});

export default router;
