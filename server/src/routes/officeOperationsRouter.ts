import{ Router } from "express";
import officeOperationsController from "../controllers/officeOperationController";
const officeOperationsRouter = Router();
officeOperationsRouter.post("/", officeOperationsController.createOfficeOperation);
officeOperationsRouter.get("/", officeOperationsController.getAllOfficeOperations);
officeOperationsRouter.delete("/:id", officeOperationsController.deleteOfficeOperation);
officeOperationsRouter.patch("/:id", officeOperationsController.updateOfficeOperation);
officeOperationsRouter.get("/:id", officeOperationsController.getOfficeOperation);
export default officeOperationsRouter;