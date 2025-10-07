import{ Router } from "express";
import officeOperationsController from "../controllers/officeOperation.controller";
import restrict from "../middlewares/restrict";
const officeOperationsRouter = Router();

// Create: admin, moderator, user
officeOperationsRouter.post("/", restrict('admin', 'moderator', 'user'), officeOperationsController.createOfficeOperation);

// Read: all authenticated users
officeOperationsRouter.get("/", officeOperationsController.getAllOfficeOperations);
officeOperationsRouter.get("/:id", officeOperationsController.getOfficeOperation);

// Update: admin, moderator only
officeOperationsRouter.patch("/:id", restrict('admin', 'moderator'), officeOperationsController.updateOfficeOperation);

// Delete: admin only
officeOperationsRouter.delete("/:id", restrict('admin'), officeOperationsController.deleteOfficeOperation);
export default officeOperationsRouter;