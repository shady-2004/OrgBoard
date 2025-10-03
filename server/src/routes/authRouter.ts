import{ Router } from "express";
import authController from "../controllers/auth.controller";
import protect from "../middlewares/protect";

const authRouter = Router();

authRouter.post("/login", authController.login);
authRouter.post("/signup", authController.signUp);
authRouter.patch("/update-password", protect, authController.changePassword);

export default authRouter;