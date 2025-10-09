const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

class StorageService {
  constructor() {
    this.storageType = process.env.STORAGE_TYPE || 'local';
    
    if (this.storageType === 's3') {
      this.s3 = new AWS.S3({
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        region: process.env.S3_REGION
      });
      this.bucket = process.env.S3_BUCKET;
    }
  }

  async uploadFile(file, folder = 'documents') {
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = `${folder}/${filename}`;

    if (this.storageType === 's3') {
      return this.uploadToS3(file, filepath);
    } else {
      return this.uploadToLocal(file, filepath);
    }
  }

  async uploadToLocal(file, filepath) {
    const uploadDir = path.join(process.env.UPLOAD_DIR || './uploads', path.dirname(filepath));
    await fs.mkdir(uploadDir, { recursive: true });
    
    const fullPath = path.join(process.env.UPLOAD_DIR || './uploads', filepath);
    await fs.writeFile(fullPath, file.buffer);

    // Generate thumbnail for images
    if (file.mimetype.startsWith('image/')) {
      await this.generateThumbnail(fullPath);
    }

    return {
      path: filepath,
      url: `/uploads/${filepath}`
    };
  }

  async uploadToS3(file, filepath) {
    const params = {
      Bucket: this.bucket,
      Key: filepath,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    const result = await this.s3.upload(params).promise();

    // Generate thumbnail for images
    if (file.mimetype.startsWith('image/')) {
      await this.generateThumbnailS3(file, filepath);
    }

    return {
      path: filepath,
      url: result.Location
    };
  }

  async generateThumbnail(filepath) {
    const thumbnailPath = filepath.replace(/(\.[^.]+)$/, '-thumb$1');
    
    await sharp(filepath)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(thumbnailPath);

    return thumbnailPath;
  }

  async generateThumbnailS3(file, filepath) {
    const thumbnailBuffer = await sharp(file.buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .toBuffer();

    const thumbnailPath = filepath.replace(/(\.[^.]+)$/, '-thumb$1');
    const params = {
      Bucket: this.bucket,
      Key: thumbnailPath,
      Body: thumbnailBuffer,
      ContentType: file.mimetype
    };

    await this.s3.upload(params).promise();
    return thumbnailPath;
  }

  async deleteFile(filepath) {
    if (this.storageType === 's3') {
      await this.s3.deleteObject({
        Bucket: this.bucket,
        Key: filepath
      }).promise();
    } else {
      const fullPath = path.join(process.env.UPLOAD_DIR || './uploads', filepath);
      await fs.unlink(fullPath).catch(() => {});
    }
  }
}

module.exports = new StorageService();
