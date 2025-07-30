import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import { cloudinary, getUploadPreset } from '../config/cloudinary.config.js';
import verifyMiddleware from '../middlewares/verifyMiddleware.js';
import fs from 'fs';

const router = express.Router();

// Upload single image
router.post('/image', verifyMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    console.log('Uploading file to Cloudinary:', req.file.path);

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'blog-images',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      resource_type: 'auto'
    });

    // Delete the local file after upload
    fs.unlinkSync(req.file.path);

    console.log('Upload successful:', result.secure_url);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up local file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      success: false, 
      message: 'Error uploading image to Cloudinary' 
    });
  }
});

// Upload multiple images
router.post('/images', verifyMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image files provided' 
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'blog-images',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          resource_type: 'auto'
        });

        // Delete the local file after upload
        fs.unlinkSync(file.path);

        return {
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes
        };
      } catch (error) {
        // Clean up local file if upload fails
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw error;
      }
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: results
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    
    // Clean up any remaining local files
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Error uploading images to Cloudinary' 
    });
  }
});

// Delete image from Cloudinary
router.delete('/image/:public_id', verifyMiddleware, async (req, res) => {
  try {
    const { public_id } = req.params;

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete image'
      });
    }

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting image from Cloudinary' 
    });
  }
});

// Unsigned upload endpoint (no authentication required)
router.post('/unsigned', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    console.log('Uploading file to Cloudinary (unsigned):', req.file.path);

    // Upload to Cloudinary using unsigned upload
    const result = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: getUploadPreset(),
      folder: 'blog-images',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      resource_type: 'auto'
    });

    // Delete the local file after upload
    fs.unlinkSync(req.file.path);

    console.log('Unsigned upload successful:', result.secure_url);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });

  } catch (error) {
    console.error('Unsigned upload error:', error);
    
    // Clean up local file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      success: false, 
      message: 'Error uploading image to Cloudinary' 
    });
  }
});

export default router; 