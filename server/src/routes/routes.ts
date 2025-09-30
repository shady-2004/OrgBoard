import { Router } from "express";
import organizationsRouter from "./organizationsRouter";
import officeOperationsRouter from "./officeOperationsRouter";
import saudizationRouter from "./saudizationRouter";
import settingsRouter from "./settingsRouter";
import employeesRouter from "./employeesRouter";
import dailyOperationsRouter from "./dailyOperationRouter";
import userRouter from "./users";
import organizationDailyOperationRouter from "./organizationDailyOperationRouter";

const router = Router();

// Mount all routers
router.use('/users',userRouter)
router.use('/organizations', organizationsRouter);
router.use('/employees', employeesRouter);
router.use('/daily-operations', dailyOperationsRouter);
router.use('organizationDailyOperations', organizationDailyOperationRouter);
router.use('/office-operations', officeOperationsRouter);
router.use('/saudization', saudizationRouter);
router.use('/settings', settingsRouter);

export default router;