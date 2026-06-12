import { Router } from 'express';
import * as ctrl from '../controllers/work-items.controller';

const router = Router();
router.get('/internal/count', ctrl.internalCount);
router.post('/', ctrl.create);
router.get('/', ctrl.listMine);
router.get('/all', ctrl.listAll);
router.get('/:id', ctrl.getOne);
router.put('/:id/status', ctrl.updateStatus);
router.put('/:id', ctrl.update);
export default router;
