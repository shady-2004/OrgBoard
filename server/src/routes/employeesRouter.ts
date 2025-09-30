import{ Router } from "express";
import employeeController from "../controllers/employeeController";
const employeesRouter = Router();

employeesRouter.post("/", employeeController.createEmployee);
employeesRouter.get("/", employeeController.getAllEmployees);
employeesRouter.delete("/:id", employeeController.deleteEmployee);
employeesRouter.patch("/:id", employeeController.updateEmployee);

export default employeesRouter;