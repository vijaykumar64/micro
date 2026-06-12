import { Router } from 'express';
import { upload } from '../middleware/upload';
import * as ctrl from '../controllers/file.controller';

const router = Router();

router.post('/upload', upload.single('file'), ctrl.uploadFile);
router.get('/', ctrl.listFiles);
router.get('/:fileId/download', ctrl.downloadFile);
router.delete('/:fileId', ctrl.deleteFile);

export default router;
