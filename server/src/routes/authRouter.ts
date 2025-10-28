import{ Router } from "express";
import authController from "../controllers/auth.controller";
import protect from "../middlewares/protect";
import restrict from "../middlewares/restrict";

const authRouter = Router();

authRouter.post("/login", authController.login);
authRouter.post("/signup", authController.signUp);
authRouter.patch("/update-password", protect, authController.changePassword);
authRouter.get("/me", protect, authController.me);

export default authRouter;