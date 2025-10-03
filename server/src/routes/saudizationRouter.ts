import { Router } from "express";
import saudizationController from "../controllers/saudization.controller";
const saudizationRouter = Router();

saudizationRouter.post("/", saudizationController.createSaudizationRecord);
saudizationRouter.get("/", saudizationController.getAllSaudizationsRecords);
saudizationRouter.get("/:id", saudizationController.getSaudizationRecord);
saudizationRouter.patch("/:id", saudizationController.updateSaudizationRecord);
saudizationRouter.delete("/:id", saudizationController.deleteSaudizationRecord);

export default saudizationRouter;