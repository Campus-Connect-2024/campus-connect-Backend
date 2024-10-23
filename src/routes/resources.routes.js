import { Router } from "express";
import { verifyJWT,verifyRole } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createResource } from "../controllers/resource.controller.js";

const router = Router();
router.use(verifyJWT); 

router
    .route("/")
    .post( verifyRole(["moderator","admin"]),
        upload.fields([
            {
              name: "resourceFile",
              maxCount: 1,
            },
          ]),createResource);

export default router;

