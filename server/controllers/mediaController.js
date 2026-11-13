
import { uploadImage } from '../services/cloudinaryService.js';

export async function uploadMedia(req, res) {
  try {
    // Validate uploaded file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image to upload.'
      });
    }

    // Validate image MIME type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only JPG, PNG and WebP images are allowed.'
      });
    }

    // Validate image size (5 MB)
    const maxSize = 5 * 1024 * 1024;

    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'Image size must be 5 MB or smaller.'
      });
    }

    // Upload image to Cloudinary
    const result = await uploadImage(req.file);

    if (!result || !result.secure_url || !result.public_id) {
      throw new Error('Cloudinary did not return valid image details.');
    }

    // Send successful response
    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully.',
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        alt: req.body.alt?.trim() || ''
      }
    });

  } catch (error) {
    console.error('========== CLOUDINARY UPLOAD ERROR ==========');
    console.error('Message:', error.message);
    console.error('HTTP Code:', error.http_code || 'N/A');
    console.error('Error Name:', error.name || 'Unknown');
    console.error('==============================================');

    return res.status(502).json({
      success: false,
      message: 'Image upload failed. Please try again.',
      details: error.message || 'Unknown Cloudinary error',
      code: error.http_code || null
    });
  }
}
