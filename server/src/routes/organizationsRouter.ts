import{ Router } from "express";
import organizationController from "../controllers/organizationController";
const organizationsRouter = Router();


organizationsRouter.post("/", organizationController.createOrganization);
organizationsRouter.get("/", organizationController.getAllOrganizations);
organizationsRouter.delete("/:id", organizationController.deleteOrganization);
organizationsRouter.patch("/:id", organizationController.updateOrganization);
organizationsRouter.get("/:id", organizationController.getOrganizationById);
export default organizationsRouter;