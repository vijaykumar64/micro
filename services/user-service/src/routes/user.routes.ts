import { Router } from 'express';
import * as ctrl from '../controllers/user.controller';

const router = Router();

router.get('/profile', ctrl.getOwnProfile);
router.put('/profile', ctrl.updateOwnProfile);
router.get('/admin/profiles', ctrl.listAllProfiles);
router.delete('/admin/profiles/:userId', ctrl.deleteUserProfile);
router.post('/internal/profiles', ctrl.createInternalProfile);

export default router;
