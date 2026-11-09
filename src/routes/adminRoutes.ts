import { Router } from "express";
import {
  showNewPostFormForAdmin,
  showPostsForAdmin,
  createNewPostForAdmin,
  showEditablePostFormForAdmin,
  updatePostForAdmin,
  deletePostForAdmin,
} from "../controllers/adminPostController";

const router = Router();
router.get("/", showPostsForAdmin);
router.get("/posts/new", showNewPostFormForAdmin);
router.get("/posts/:slug/edit", showEditablePostFormForAdmin);
router.post("/posts", createNewPostForAdmin);
router.post("/posts/:slug", updatePostForAdmin);
router.post("/posts/:slug/delete", deletePostForAdmin);
export default router;
