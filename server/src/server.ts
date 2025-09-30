import dotenv from "dotenv";
dotenv.config();
import app from "./app";


(async () => {
  try {

    const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

    app.listen(PORT, () => {
      console.log(`🚀 App started at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();