import { Router } from 'express';
import organizationDailyOperationController from '../controllers/organizationDailyOperation.controller';
const organizationDailyOperationRouter = Router();
organizationDailyOperationRouter.post('/', organizationDailyOperationController.createOrgDailyOperation);
organizationDailyOperationRouter.get('/', organizationDailyOperationController.getAllOrgDailyOperations);
organizationDailyOperationRouter.get('/:id', organizationDailyOperationController.getOrgDailyOperationById);
organizationDailyOperationRouter.delete('/:id', organizationDailyOperationController.deleteOrgDailyOperation);
organizationDailyOperationRouter.patch('/:id', organizationDailyOperationController.updateOrgDailyOperation);
export default organizationDailyOperationRouter;