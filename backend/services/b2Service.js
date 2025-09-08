const B2 = require('backblaze-b2');
require('dotenv').config();

class B2Service {
  constructor() {
    this.b2 = new B2({
      applicationKeyId: process.env.B2_ACCOUNT_ID,
      applicationKey: process.env.B2_APPLICATION_KEY
    });
    
    this.bucketId = process.env.B2_BUCKET_ID;
    this.bucketName = process.env.B2_BUCKET_NAME;
    this.publicUrl = process.env.B2_PUBLIC_URL;
    this.downloadUrl = process.env.B2_DOWNLOAD_URL;
  }

  async initialize() {
    try {
      await this.b2.authorize();
      console.log('B2 authorization successful');
    } catch (error) {
      console.error('B2 authorization failed:', error);
      throw error;
    }
  }

  async uploadImage(file, filename) {
    try {
      // Ensure B2 is authorized
      if (!this.b2.authorization) {
        await this.initialize();
      }

      // Get upload URL
      const uploadUrl = await this.b2.getUploadUrl(this.bucketId);
      
      // Upload file
      const uploadResult = await this.b2.uploadFile({
        uploadUrl: uploadUrl.data.uploadUrl,
        uploadAuthToken: uploadUrl.data.authorizationToken,
        fileName: `menu-images/${filename}`,
        data: file.buffer,
        mime: file.mimetype,
        contentLength: file.size
      });

      // Construct public URL
      const publicUrl = `${this.publicUrl}/${uploadResult.data.fileName}`;
      
      console.log('File uploaded to B2 successfully:', publicUrl);
      
      return {
        success: true,
        fileId: uploadResult.data.fileId,
        fileName: uploadResult.data.fileName,
        publicUrl: publicUrl,
        size: file.size,
        mimeType: file.mimetype
      };
    } catch (error) {
      console.error('B2 upload failed:', error);
      throw error;
    }
  }

  async deleteImage(fileName) {
    try {
      // Ensure B2 is authorized
      if (!this.b2.authorization) {
        await this.initialize();
      }

      // List files to find the file by name
      const fileList = await this.b2.listFileNames({
        bucketId: this.bucketId,
        maxFileCount: 1000,
        startFileName: fileName,
        prefix: fileName
      });

      // Find the file with matching name
      const fileToDelete = fileList.data.files.find(file => file.fileName === fileName);
      
      if (!fileToDelete) {
        console.log('File not found in B2:', fileName);
        return { success: false, message: 'File not found' };
      }

      // Delete file using fileId
      await this.b2.deleteFileVersion({
        fileName: fileToDelete.fileName,
        fileId: fileToDelete.fileId
      });

      console.log('File deleted from B2 successfully:', fileName);
      return { success: true };
    } catch (error) {
      console.error('B2 delete failed:', error);
      throw error;
    }
  }

  getPublicUrl(fileName) {
    return `${this.publicUrl}/${fileName}`;
  }
}

module.exports = new B2Service();
