import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import router from "./routes/routes";
import globalErrorHanlder from "./controllers/error.controller";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.set("trust proxy", 1);

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
});

app.use("/OrgBoard/api/v1", limiter);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("combined"));
}

app.use("/OrgBoard/api/v1", router);

app.use(globalErrorHanlder);

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1); // Optional but clean
});

export default app;