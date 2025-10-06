import { Router } from 'express';
import organizationDailyOperationController from '../controllers/organizationDailyOperation.controller';
import restrict from '../middlewares/restrict';
const organizationDailyOperationRouter = Router();

// Create: admin, moderator, user
organizationDailyOperationRouter.post('/', restrict('admin', 'moderator', 'user'), organizationDailyOperationController.createOrgDailyOperation);

// Read: all authenticated users
organizationDailyOperationRouter.get('/', organizationDailyOperationController.getAllOrgDailyOperations);
organizationDailyOperationRouter.get('/:id', organizationDailyOperationController.getOrgDailyOperationById);

// Update: admin, moderator only
organizationDailyOperationRouter.patch('/:id', restrict('admin', 'moderator'), organizationDailyOperationController.updateOrgDailyOperation);

// Delete: admin only
organizationDailyOperationRouter.delete('/:id', restrict('admin'), organizationDailyOperationController.deleteOrgDailyOperation);
export default organizationDailyOperationRouter;