import express from "express";

import { currentUser } from "../middlewares/current-user.js";
import { requireAuth } from "../middlewares/require-auth.js";

const router = express.Router();

router.get("/api/users/currentuser", currentUser, requireAuth, (req, res) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };