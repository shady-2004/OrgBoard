import{ Router } from "express";
import employeeController from "../controllers/employee.controller";
const employeesRouter = Router();

employeesRouter.post("/", employeeController.createEmployee);
employeesRouter.get("/", employeeController.getAllEmployees);
employeesRouter.get("/:id", employeeController.getEmployee);
employeesRouter.delete("/:id", employeeController.deleteEmployee);
employeesRouter.patch("/:id", employeeController.updateEmployee);
employeesRouter.get("/residence/expired", employeeController.getEmployeesWithExpiredResidence);
employeesRouter.get("/residence/expiring-soon", employeeController.getEmployeesExpiringSoon);
export default employeesRouter;