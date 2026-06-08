const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

const uploadToCloudinary = (buffer, folder = 'sharma-watches') => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
      resource_type: 'image',
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url:      result.secure_url,
          publicId: result.public_id,
          width:    result.width,
          height:   result.height,
          format:   result.format,
          size:     result.bytes,
        });
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return null;
  }
};

const deleteMultipleFromCloudinary = async (publicIds) => {
  if (!publicIds || publicIds.length === 0) return;
  const promises = publicIds.map((id) => deleteFromCloudinary(id));
  return Promise.allSettled(promises);
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
};