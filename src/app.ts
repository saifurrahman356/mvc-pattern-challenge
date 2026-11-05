import express from "express";
import nunjucks from "nunjucks";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postsRouter from "./routes/postRoutes";
import aboutRouter from "./routes/aboutRoutes";
import contactRouter from "./routes/contactRoutes";
import examplePostRouter from "./routes/examplePostRoutes";
import adminRouter from "./routes/adminRoutes";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const assetsDir = path.join(projectRoot, "src", "assets");
const cssDir = path.join(projectRoot, "src", "css");

nunjucks.configure(projectRoot, { autoescape: true, express: app });
app.use(express.urlencoded({ extended: true }));
app.use("/assets", express.static(assetsDir));
app.use("/css", express.static(cssDir));
app.use(postsRouter);
app.use(aboutRouter);
app.use(contactRouter);
app.use(examplePostRouter);
app.use("/admin", adminRouter);

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
