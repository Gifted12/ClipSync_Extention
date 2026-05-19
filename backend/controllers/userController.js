import User from '../models/User.js';
import { cloudinary } from '../middleware/cloudinary.js';


export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const { name, theme } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (theme) user.theme = theme;

    if (req.file) {
    
      if (user.avatar?.publicId) {
        await cloudinary.uploader.destroy(user.avatar.publicId);
      }
      user.avatar = { url: req.file.path, publicId: req.file.filename };
    }

    await user.save();
    res.json({ id: user._id, name: user.name, email: user.email, avatar: user.avatar, theme: user.theme });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (user.provider === 'google' && !user.password) {
      return res.status(400).json({ message: 'Google accounts cannot change password here' });
    }
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
