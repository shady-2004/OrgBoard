import { Router } from "express";
import organizationsRouter from "./organizationsRouter";
import officeOperationsRouter from "./officeOperationsRouter";
import saudizationRouter from "./saudizationRouter";
import settingsRouter from "./settingsRouter";
import employeesRouter from "./employeesRouter";
import dailyOperationsRouter from "./dailyOperationRouter";
import userRouter from "./users";
import organizationDailyOperationRouter from "./organizationDailyOperationRouter";
import authRouter from "./authRouter";
import protect from "../middlewares/protect";

const router = Router();

// Mount all routers
router.use('/auth', authRouter);
router.use('/users',protect,userRouter)
router.use('/organizations',protect, organizationsRouter);
router.use('/employees', protect, employeesRouter);
router.use('/daily-operations', protect, dailyOperationsRouter);
router.use('/organization-daily-operations', protect, organizationDailyOperationRouter);
router.use('/office-operations', protect, officeOperationsRouter);
router.use('/saudization', protect, saudizationRouter);
router.use('/settings', protect, settingsRouter);

export default router;