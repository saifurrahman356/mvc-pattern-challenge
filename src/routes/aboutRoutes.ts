import { Router } from "express";
import { getAboutPage } from "../controllers/aboutController";

const router = Router();
router.get("/about", getAboutPage);
export default router;
