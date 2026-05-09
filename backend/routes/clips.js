import express from 'express';
import { getClips, createClip, updateClip, deleteClip } from '../controllers/clipController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/cloudinary.js';

const router = express.Router();

router.use(protect);

router.get('/', getClips);
router.post('/', upload.single('file'), createClip);
router.put('/:id', upload.single('file'), updateClip);
router.delete('/:id', deleteClip);

export default router;
