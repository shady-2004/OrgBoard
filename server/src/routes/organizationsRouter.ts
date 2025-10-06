import{ Router } from "express";
import organizationController from "../controllers/organization.controller";
import employeeController from "../controllers/employee.controller";
import dailyOperationController from "../controllers/dailyOperation.controller";
import organizationDailyOperationController from "../controllers/organizationDailyOperation.controller";
import restrict from "../middlewares/restrict";
const organizationsRouter = Router();

// Create: admin, moderator, user
organizationsRouter.post("/", restrict('admin', 'moderator', 'user'), organizationController.createOrganization);

// Read: all authenticated users
organizationsRouter.get("/", organizationController.getAllOrganizations);
organizationsRouter.get("/:id", organizationController.getOrganizationById);
organizationsRouter.get("/names/ids", organizationController.getNamesAndIds);

// Update: admin, moderator only
organizationsRouter.patch("/:id", restrict('admin', 'moderator'), organizationController.updateOrganization);

// Delete: admin only
organizationsRouter.delete("/:id", restrict('admin'), organizationController.deleteOrganization);
organizationsRouter.get("/:id/employees", employeeController.getAllOrgizationEmployees);
organizationsRouter.get("/:id/employees/totals", employeeController.getOrgEmployeesTotals);
organizationsRouter.get("/:id/employees/count", employeeController.getOrgEmployeesCount);
organizationsRouter.get("/:id/employees/names", employeeController.getOrgEmployeesNamesAndIds);
organizationsRouter.get("/:id/daily-operations", dailyOperationController.getAllOrgizationDailyOperations);
organizationsRouter.get("/:id/daily-operations/totals", dailyOperationController.getOrgDailyOperationsTotals);
organizationsRouter.get("/:id/daily-operations/count", dailyOperationController.getOrgDailyOperationsCount);
organizationsRouter.get("/:id/organization-daily-operations", organizationDailyOperationController.getOrgDailyOperations);
export default organizationsRouter;