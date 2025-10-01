import{ Router } from "express";
import dailyOperationsController from "../controllers/dailyOperationController";
const dailyOperationsRouter = Router();

dailyOperationsRouter.post("/", dailyOperationsController.createDailyOperation);
dailyOperationsRouter.get("/", dailyOperationsController.getAllDailyOperations);
dailyOperationsRouter.delete("/:id", dailyOperationsController.deleteDailyOperation);
dailyOperationsRouter.patch("/:id", dailyOperationsController.updateDailyOperation);
dailyOperationsRouter.get("/:id", dailyOperationsController.getDailyOperation);

export default dailyOperationsRouter;