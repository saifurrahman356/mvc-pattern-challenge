import express from "express";
import nunjucks from "nunjucks";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postsRouter from "./routes/postRoutes";
import apiRouter from "./routes/apiRoutes";
import aboutRouter from "./routes/aboutRoutes";
import contactRouter from "./routes/contactRoutes";
import examplePostRouter from "./routes/examplePostRoutes";
import adminRouter from "./routes/adminRoutes";
import loginRouter from "./routes/loginRoutes";
import { closeDB, connectDB } from "./db/database";
import { requireAdmin } from "./middleware/requireAdmin";
import cookieParser from "cookie-parser";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const assetsDir = path.join(projectRoot, "src", "assets");
const cssDir = path.join(projectRoot, "src", "css");
const viewsDir = path.join("views");

nunjucks.configure(viewsDir, { autoescape: true, express: app, watch: true });
app.use(express.static(path.resolve("public")));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/assets", express.static(assetsDir));
app.use("/css", express.static(cssDir));
app.use("/", postsRouter);
app.use("/", aboutRouter);
app.use("/", contactRouter);
app.use("/", examplePostRouter);
app.use("/api", apiRouter);
// Admin with Basic Authentication
//app.use("/admin", basicAuth, adminRouter);

// Admin with session-based authentication

app.use("/login", loginRouter);
app.use("/admin", requireAdmin, adminRouter);

const port = Number(process.env.PORT) || 3000;

connectDB().then(() => {
  console.log("Database connected");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Closing database connection...");
  await closeDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing database connection...");
  await closeDB();
  process.exit(0);
});
