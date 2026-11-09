import express from "express";
import { showLoginPage, login } from "../controllers/loginController";

const router = express.Router();

router.get("/", showLoginPage);
router.post("/", login);

export default router;
