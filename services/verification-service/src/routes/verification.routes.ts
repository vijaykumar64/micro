import { Router } from 'express';
import * as ctrl from '../controllers/verification.controller';

const router = Router();
router.get('/internal/count', ctrl.internalCount);
router.post('/', ctrl.submit);
router.get('/', ctrl.listMine);
router.get('/pending', ctrl.listPending);
router.get('/:id', ctrl.getOne);
router.put('/:id/review', ctrl.review);
export default router;
