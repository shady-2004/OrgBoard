import { Router } from 'express';
import organizationDailyOperationController from '../controllers/organizationDailyOperationController';
const organizationDailyOperationRouter = Router();
organizationDailyOperationRouter.post('/', organizationDailyOperationController.createOrgDailyOperation);
organizationDailyOperationRouter.get('/', organizationDailyOperationController.getAllOrgDailyOperations);
organizationDailyOperationRouter.delete('/:id', organizationDailyOperationController.deleteOrgDailyOperation);
organizationDailyOperationRouter.patch('/:id', organizationDailyOperationController.updateOrgDailyOperation);
organizationDailyOperationRouter.get('/:id', organizationDailyOperationController.getOrgDailyOperations);
export default organizationDailyOperationRouter;