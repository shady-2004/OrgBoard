import { Router } from "express";
import userController from "../controllers/user.controller";
import restrict from "../middlewares/restrict";
const userRouter = Router();

userRouter.post("/", restrict('admin'), userController.addUser);
userRouter.get("/", restrict('admin'), userController.getAllUsers);
userRouter.delete("/:id", restrict('admin'), userController.removeUser);

export default userRouter;