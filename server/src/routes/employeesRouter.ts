import{ Router } from "express";
import employeeController from "../controllers/employee.controller";
import restrict from "../middlewares/restrict";
const employeesRouter = Router();

// Create: admin, moderator, user
employeesRouter.post("/", restrict('admin', 'moderator', 'user'), employeeController.createEmployee);

// Read: all authenticated users
employeesRouter.get("/", employeeController.getAllEmployees);
employeesRouter.get("/:id", employeeController.getEmployee);
employeesRouter.get("/residence/expired", employeeController.getEmployeesWithExpiredResidence);
employeesRouter.get("/residence/expiring-soon", employeeController.getEmployeesExpiringSoon);

// Update: admin, moderator only
employeesRouter.patch("/:id", restrict('admin', 'moderator'), employeeController.updateEmployee);

// Delete: admin only
employeesRouter.delete("/:id", restrict('admin'), employeeController.deleteEmployee);
export default employeesRouter;