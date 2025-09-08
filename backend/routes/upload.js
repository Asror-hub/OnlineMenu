const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure S3 client for Backblaze B2
const s3Client = new S3Client({
  region: 'us-west-004',
  endpoint: process.env.B2_DOWNLOAD_URL,
  credentials: {
    accessKeyId: process.env.B2_ACCOUNT_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY
  }
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload single image
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `menu-items/${fileName}`;

    const uploadParams = {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read',
      Metadata: {
        'original-name': req.file.originalname,
        'uploaded-by': req.user.userId.toString()
      }
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const imageUrl = `${process.env.B2_PUBLIC_URL}/${key}`;

    res.json({
      message: 'Image uploaded successfully',
      image_url: imageUrl,
      key: key
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Delete image (optional - if you want to allow deletion)
router.delete('/image/:key', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { key } = req.params;
    
    // You can implement image deletion logic here if needed
    // For now, we'll just return success as Backblaze handles storage management
    
    res.json({ message: 'Image deletion request received' });
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
