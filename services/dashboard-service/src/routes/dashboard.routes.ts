import { Router } from 'express';
import * as ctrl from '../controllers/dashboard.controller';

const router = Router();

router.get('/stats', ctrl.getStats);
router.get('/admin/stats', ctrl.getAdminStats);
router.get('/activity', ctrl.getActivity);
router.post('/internal/log', ctrl.logActivityInternal);

export default router;
