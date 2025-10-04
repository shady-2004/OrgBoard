import { Router } from "express";
import { 
  getDashboardStats, 
  getOrganizationsTrend,
  getOfficeOperationsTrend,
  getRecentActivities
} from "../controllers/dashboard.controller";

const router = Router();

router.get("/stats", getDashboardStats);
router.get("/trends/organizations", getOrganizationsTrend);
router.get("/trends/office-operations", getOfficeOperationsTrend);
router.get("/activities", getRecentActivities);

// Note: For expired/nearly-expired employees, use:
// GET /employees/residence/expired
// GET /employees/residence/expiring-soon

export default router;
