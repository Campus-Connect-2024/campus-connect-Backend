import { Router } from "express";
import { allMessages, sendMessage } from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.use(verifyJWT);

router.route("/:chatId").get(allMessages);
router.route("/").post(sendMessage);

export default router;
