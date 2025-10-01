import{ Router } from "express";
import organizationController from "../controllers/organizationController";
import employeeController from "../controllers/employeeController";
import dailyOperationController from "../controllers/dailyOperationController";
const organizationsRouter = Router();


organizationsRouter.post("/", organizationController.createOrganization);
organizationsRouter.get("/", organizationController.getAllOrganizations);
organizationsRouter.delete("/:id", organizationController.deleteOrganization);
organizationsRouter.patch("/:id", organizationController.updateOrganization);
organizationsRouter.get("/:id", organizationController.getOrganizationById);
organizationsRouter.get("/names/ids", organizationController.getNamesAndIds);
organizationsRouter.get("/:id/employees", employeeController.getAllOrgizationEmployees);
organizationsRouter.get("/:id/daily-operations", dailyOperationController.getAllOrgizationDailyOperations);
export default organizationsRouter;