import { Router } from "express";
import {
  toggleFollowing,
  getUserFollowers,
  getFollowedUsers,
} from "../controllers/follower.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/c/:userId").get(getFollowedUsers).post(toggleFollowing);

router.route("/u/:userId").get(getUserFollowers);

export default router;
