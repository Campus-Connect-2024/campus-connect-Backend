import { Router } from "express";
import {
  toggleCommentLike,
  togglePostLike,
  getLikedPosts,
} from "../controllers/likes.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/p/:postId").post(togglePostLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/posts").get(getLikedPosts);

export default router;
