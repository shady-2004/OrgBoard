import{ Router } from "express";
import organizationController from "../controllers/organizationController";
const organizationsRouter = Router();


organizationsRouter.use("/").post(organizationController.createOrganization).get(organizationController.getAllOrganizations);
organizationsRouter.delete("/:id", organizationController.deleteOrganization);
organizationsRouter.patch("/:id", organizationController.updateOrganization);
export default organizationsRouter;