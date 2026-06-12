import { Router } from 'express';
import * as ctrl from '../controllers/notification.controller';

const router = Router();
router.post('/internal/send', ctrl.internalSend);
router.get('/', ctrl.list);
router.get('/unread-count', ctrl.unreadCount);
router.put('/read-all', ctrl.markAllRead);
router.get('/preferences', ctrl.getPrefs);
router.put('/preferences', ctrl.updatePrefs);
router.put('/:id/read', ctrl.markRead);
export default router;
