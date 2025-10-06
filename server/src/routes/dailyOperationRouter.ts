import{ Router } from "express";
import dailyOperationsController from "../controllers/dailyOperation.controller";
import restrict from "../middlewares/restrict";
const dailyOperationsRouter = Router();

// Create: admin, moderator, user
dailyOperationsRouter.post("/", restrict('admin', 'moderator', 'user'), dailyOperationsController.createDailyOperation);

// Read: all authenticated users
dailyOperationsRouter.get("/", dailyOperationsController.getAllDailyOperations);
dailyOperationsRouter.get("/:id", dailyOperationsController.getDailyOperation);

// Update: admin, moderator only
dailyOperationsRouter.patch("/:id", restrict('admin', 'moderator'), dailyOperationsController.updateDailyOperation);

// Delete: admin only
dailyOperationsRouter.delete("/:id", restrict('admin'), dailyOperationsController.deleteDailyOperation);

export default dailyOperationsRouter;