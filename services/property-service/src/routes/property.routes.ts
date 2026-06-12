import { Router } from 'express';
import * as ctrl from '../controllers/property.controller';

const router = Router();
router.get('/internal/count', ctrl.internalCount);
router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/my', ctrl.listMine);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
export default router;
