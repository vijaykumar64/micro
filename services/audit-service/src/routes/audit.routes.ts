import { Router } from 'express';
import * as ctrl from '../controllers/audit.controller';

const router = Router();
router.post('/internal/log', ctrl.internalLog);
router.get('/', ctrl.getLogs);
router.get('/user/:userId', ctrl.getUserLogs);
router.get('/resource/:resourceType/:resourceId', ctrl.getResourceHistory);
export default router;
