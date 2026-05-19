import Clip from '../models/Clip.js';
import { cloudinary } from '../middleware/cloudinary.js';


export const getClips = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 20 } = req.query;
    const query = { user: req.user.id };
    if (type && type !== 'all') query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    const clips = await Clip.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Clip.countDocuments(query);
    res.json({ clips, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const createClip = async (req, res) => {
  try {
    const { type, title, content, tags } = req.body;
    const clipData = { user: req.user.id, type, title, content, tags: tags ? JSON.parse(tags) : [] };

    if (req.file) {
      clipData.fileUrl = req.file.path;
      clipData.filePublicId = req.file.filename;
      clipData.fileName = req.file.originalname;
      clipData.fileSize = req.file.size;
      clipData.mimeType = req.file.mimetype;
      if (type === 'image') clipData.content = req.file.path;
    }

    const clip = await Clip.create(clipData);
    res.status(201).json(clip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const updateClip = async (req, res) => {
  try {
    const clip = await Clip.findOne({ _id: req.params.id, user: req.user.id });
    if (!clip) return res.status(404).json({ message: 'Clip not found' });

    const { title, content, isPinned, tags } = req.body;
    if (title !== undefined) clip.title = title;
    if (content !== undefined) clip.content = content;
    if (isPinned !== undefined) clip.isPinned = isPinned;
    if (tags !== undefined) clip.tags = JSON.parse(tags);

    await clip.save();
    res.json(clip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const deleteClip = async (req, res) => {
  try {
    const clip = await Clip.findOne({ _id: req.params.id, user: req.user.id });
    if (!clip) return res.status(404).json({ message: 'Clip not found' });

    if (clip.filePublicId) {
      await cloudinary.uploader.destroy(clip.filePublicId, {
        resource_type: clip.type === 'image' ? 'image' : 'raw',
      });
    }
    await clip.deleteOne();
    res.json({ message: 'Clip deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
