import { Router } from "express";
import { accessChat, fetchChats } from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.use(verifyJWT);

router.route("/").post(accessChat);
router.route("/").get(fetchChats);

export default router;
