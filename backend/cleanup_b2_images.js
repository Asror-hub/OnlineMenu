const B2 = require('backblaze-b2');
require('dotenv').config();

class B2CleanupService {
  constructor() {
    this.b2 = new B2({
      applicationKeyId: process.env.B2_ACCOUNT_ID,
      applicationKey: process.env.B2_APPLICATION_KEY
    });
    
    this.bucketId = process.env.B2_BUCKET_ID;
    this.bucketName = process.env.B2_BUCKET_NAME;
  }

  async initialize() {
    try {
      await this.b2.authorize();
      console.log('✅ B2 authorization successful');
    } catch (error) {
      console.error('❌ B2 authorization failed:', error);
      throw error;
    }
  }

  async listAllImages() {
    try {
      console.log('🔍 Listing all images in B2 bucket...');
      
      let allFiles = [];
      let startFileName = null;
      let hasMore = true;
      
      while (hasMore) {
        const response = await this.b2.listFileNames({
          bucketId: this.bucketId,
          maxFileCount: 1000,
          startFileName: startFileName
        });
        
        const files = response.data.files;
        allFiles = allFiles.concat(files);
        
        if (files.length < 1000) {
          hasMore = false;
        } else {
          startFileName = files[files.length - 1].fileName;
        }
      }
      
      console.log(`📊 Found ${allFiles.length} total files in B2 bucket`);
      return allFiles;
    } catch (error) {
      console.error('❌ Failed to list files:', error);
      throw error;
    }
  }

  async deleteImage(fileName, fileId) {
    try {
      await this.b2.deleteFileVersion({
        fileName: fileName,
        fileId: fileId
      });
      console.log(`🗑️  Deleted: ${fileName}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete ${fileName}:`, error);
      return false;
    }
  }

  async cleanupAllImages() {
    try {
      console.log('🚀 Starting B2 image cleanup...');
      
      // Get all files
      const allFiles = await this.listAllImages();
      
      if (allFiles.length === 0) {
        console.log('✅ No images found to delete');
        return;
      }
      
      // Filter for menu-images only
      const menuImages = allFiles.filter(file => 
        file.fileName.startsWith('menu-images/')
      );
      
      console.log(`🍽️  Found ${menuImages.length} menu images to delete`);
      
      if (menuImages.length === 0) {
        console.log('✅ No menu images found to delete');
        return;
      }
      
      // Delete all menu images
      let successCount = 0;
      let failCount = 0;
      
      for (const file of menuImages) {
        const success = await this.deleteImage(file.fileName, file.fileId);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
        
        // Small delay to avoid overwhelming B2 API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('\n📊 Cleanup Summary:');
      console.log(`✅ Successfully deleted: ${successCount} images`);
      console.log(`❌ Failed to delete: ${failCount} images`);
      console.log(`📁 Total menu images processed: ${menuImages.length}`);
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      throw error;
    }
  }

  async cleanupSpecificImages(imageUrls) {
    try {
      console.log('🎯 Starting cleanup of specific images...');
      
      let successCount = 0;
      let failCount = 0;
      
      for (const imageUrl of imageUrls) {
        try {
          // Extract filename from URL
          const fileName = imageUrl.split('/').pop();
          if (fileName) {
            const fullFileName = `menu-images/${fileName}`;
            console.log(`🔍 Looking for: ${fullFileName}`);
            
            // Find the file in B2
            const fileList = await this.b2.listFileNames({
              bucketId: this.bucketId,
              maxFileCount: 1000,
              startFileName: fullFileName,
              prefix: fullFileName
            });
            
            const fileToDelete = fileList.data.files.find(file => file.fileName === fullFileName);
            
            if (fileToDelete) {
              const success = await this.deleteImage(fileToDelete.fileName, fileToDelete.fileId);
              if (success) {
                successCount++;
              } else {
                failCount++;
              }
            } else {
              console.log(`⚠️  File not found: ${fullFileName}`);
              failCount++;
            }
          }
        } catch (error) {
          console.error(`❌ Error processing ${imageUrl}:`, error);
          failCount++;
        }
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('\n📊 Specific Cleanup Summary:');
      console.log(`✅ Successfully deleted: ${successCount} images`);
      console.log(`❌ Failed to delete: ${failCount} images`);
      
    } catch (error) {
      console.error('❌ Specific cleanup failed:', error);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const cleanupService = new B2CleanupService();
  
  try {
    await cleanupService.initialize();
    
    // Option 1: Clean up ALL menu images
    console.log('\n🔄 Option 1: Clean up ALL menu images');
    await cleanupService.cleanupAllImages();
    
    // Option 2: Clean up specific images from database (uncomment if needed)
    // console.log('\n🔄 Option 2: Clean up specific images from database');
    // const specificImages = [
    //   'https://f004.backblazeb2.com/file/qr-menu/menu-images/image-1756619926338-220470670.png',
    //   'https://f004.backblazeb2.com/file/qr-menu/menu-images/image-1756619236304-585089899.png'
    // ];
    // await cleanupService.cleanupSpecificImages(specificImages);
    
    console.log('\n🎉 B2 cleanup completed successfully!');
    
  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = B2CleanupService;

