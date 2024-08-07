import { Router } from 'express';
import {
    getAllPosts,
    publishAPost,
    getPostById,
    updatePost,
    deletePost,
    togglePublishStatus
} from "../controllers/post.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllPosts)
    .post(
        upload.fields([
            {
                name: "MediaFile",
                maxCount: 1,
            }
            
        ]),
        publishAPost
    );

router
    .route("/:postId")
    .get(getPostById)
    .delete(deletePost)
    .patch(upload.single("MediaFile"), updatePost);

router.route("/toggle/publish/:postId").patch(togglePublishStatus);

export default router