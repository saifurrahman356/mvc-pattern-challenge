import { Router } from "express";
import * as postController from "../controllers/postController";

const router = Router();
router.get("/", postController.showPosts);
router.get("/posts/:slug", postController.showPost);
export default router;
