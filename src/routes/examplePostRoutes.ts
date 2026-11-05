import { Router } from "express";
import { getExamplePost } from "../controllers/examplePostController";

const router = Router();
router.get("/example-post", getExamplePost);
export default router;
