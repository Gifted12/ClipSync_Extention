import mongoose from 'mongoose';

const clipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'document'],
    required: true,
  },
  title:        { type: String, trim: true, maxlength: 100, default: 'Untitled' },
  content:      { type: String, default: '' },
  fileUrl:      { type: String, default: '' },
  filePublicId: { type: String, default: '' },
  fileName:     { type: String, default: '' },
  fileSize:     { type: Number, default: 0 },
  mimeType:     { type: String, default: '' },
  isPinned:     { type: Boolean, default: false },
  tags:         [{ type: String, trim: true }],
}, { timestamps: true });

clipSchema.index({ user: 1, createdAt: -1 });
clipSchema.index({ user: 1, type: 1 });

export default mongoose.model('Clip', clipSchema);