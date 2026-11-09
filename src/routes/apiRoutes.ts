import express from "express";
import {
  createPost,
  deletePost,
  updatePost,
  showAllPosts,
} from "../controllers/apiPostController";

const router = express.Router();
router.get("/posts", showAllPosts);
router.post("/posts", createPost);
router.put("/posts/:slug", updatePost);
router.delete("/posts/:slug", deletePost);

export default router;
