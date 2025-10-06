import { Router } from "express";
import saudizationController from "../controllers/saudization.controller";
import restrict from "../middlewares/restrict";
const saudizationRouter = Router();

// Create: admin, moderator, user
saudizationRouter.post("/", restrict('admin', 'moderator', 'user'), saudizationController.createSaudizationRecord);

// Read: all authenticated users
saudizationRouter.get("/", saudizationController.getAllSaudizationsRecords);
saudizationRouter.get("/:id", saudizationController.getSaudizationRecord);

// Update: admin, moderator only
saudizationRouter.patch("/:id", restrict('admin', 'moderator'), saudizationController.updateSaudizationRecord);

// Delete: admin only
saudizationRouter.delete("/:id", restrict('admin'), saudizationController.deleteSaudizationRecord);

export default saudizationRouter;