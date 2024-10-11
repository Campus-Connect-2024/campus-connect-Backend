import { Router } from "express";
import { getCsrfToken } from "../controllers/csrf.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router= Router();
router.use(verifyJWT);
router.get('/',getCsrfToken);

export default router;