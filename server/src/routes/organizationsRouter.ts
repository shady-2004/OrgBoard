import{ Router } from "express";
import organizationController from "../controllers/organization.controller";
import employeeController from "../controllers/employee.controller";
import dailyOperationController from "../controllers/dailyOperation.controller";
const organizationsRouter = Router();


organizationsRouter.post("/", organizationController.createOrganization);
organizationsRouter.get("/", organizationController.getAllOrganizations);
organizationsRouter.delete("/:id", organizationController.deleteOrganization);
organizationsRouter.patch("/:id", organizationController.updateOrganization);
organizationsRouter.get("/:id", organizationController.getOrganizationById);
organizationsRouter.get("/names/ids", organizationController.getNamesAndIds);
organizationsRouter.get("/:id/employees", employeeController.getAllOrgizationEmployees);
organizationsRouter.get("/:id/employees/totals", employeeController.getOrgEmployeesTotals);
organizationsRouter.get("/:id/employees/count", employeeController.getOrgEmployeesCount);
organizationsRouter.get("/:id/employees/names", employeeController.getOrgEmployeesNamesAndIds);
organizationsRouter.get("/:id/daily-operations", dailyOperationController.getAllOrgizationDailyOperations);
organizationsRouter.get("/:id/daily-operations/totals", dailyOperationController.getOrgDailyOperationsTotals);
organizationsRouter.get("/:id/daily-operations/count", dailyOperationController.getOrgDailyOperationsCount);
export default organizationsRouter;