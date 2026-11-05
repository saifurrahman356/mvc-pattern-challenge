import { Router } from "express";
import { showContactPage } from "../controllers/contactController";

const router = Router();
router.get("/contact", showContactPage);
export default router;
