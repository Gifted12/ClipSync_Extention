import express from 'express';
import { getProfile, updateProfile, updatePassword } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/cloudinary.js';

const router = express.Router();

router.use(protect);

router.get('/me', getProfile);
router.put('/me', upload.single('avatar'), updateProfile);
router.put('/me/password', updatePassword);

export default router;
