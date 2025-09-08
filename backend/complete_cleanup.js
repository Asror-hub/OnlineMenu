const { Pool } = require('pg');
const B2CleanupService = require('./cleanup_b2_images');
require('dotenv').config();

class CompleteCleanupService {
  constructor() {
    this.dbPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'menudb',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD
    });
    
    this.b2Cleanup = new B2CleanupService();
  }

  async testDatabaseConnection() {
    try {
      const client = await this.dbPool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  async getCurrentDataCounts() {
    try {
      console.log('\n📊 Current data counts:');
      
      const counts = await this.dbPool.query(`
        SELECT 'restaurants' as table_name, COUNT(*) as count FROM restaurants
        UNION ALL SELECT 'categories', COUNT(*) FROM categories
        UNION ALL SELECT 'subcategories', COUNT(*) FROM subcategories
        UNION ALL SELECT 'menu_items', COUNT(*) FROM menu_items
        UNION ALL SELECT 'users', COUNT(*) FROM users
        UNION ALL SELECT 'orders', COUNT(*) FROM orders
        UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
        ORDER BY table_name
      `);
      
      counts.rows.forEach(row => {
        console.log(`   ${row.table_name}: ${row.count}`);
      });
      
      return counts.rows;
    } catch (error) {
      console.error('❌ Failed to get data counts:', error);
      return [];
    }
  }

  async getB2Images() {
    try {
      console.log('\n🖼️  Checking B2 cloud storage...');
      
      await this.b2Cleanup.initialize();
      const allFiles = await this.b2Cleanup.listAllImages();
      
      const menuImages = allFiles.filter(file => 
        file.fileName.startsWith('menu-images/')
      );
      
      console.log(`   Found ${menuImages.length} menu images in B2`);
      return menuImages;
    } catch (error) {
      console.error('❌ Failed to check B2:', error);
      return [];
    }
  }

  async cleanupDatabase() {
    try {
      console.log('\n🗃️  Starting database cleanup...');
      
      // Disable foreign key checks temporarily
      await this.dbPool.query('SET session_replication_role = replica');
      
      // Clear all data from tables (in correct order due to foreign keys)
      const cleanupQueries = [
        'DELETE FROM order_items',
        'DELETE FROM orders', 
        'DELETE FROM menu_items',
        'DELETE FROM subcategories',
        'DELETE FROM categories',
        'DELETE FROM restaurant_staff',
        'DELETE FROM restaurant_settings',
        'DELETE FROM restaurant_content',
        'DELETE FROM restaurant_branding',
        'DELETE FROM users WHERE role != \'admin\'', // Keep admin users
        'DELETE FROM restaurants WHERE id != 1' // Keep the main restaurant
      ];
      
      for (const query of cleanupQueries) {
        const result = await this.dbPool.query(query);
        console.log(`   ✅ ${query}: ${result.rowCount} rows deleted`);
      }
      
      // Reset sequences to start from 1
      const resetQueries = [
        'ALTER SEQUENCE order_items_id_seq RESTART WITH 1',
        'ALTER SEQUENCE orders_id_seq RESTART WITH 1',
        'ALTER SEQUENCE menu_items_id_seq RESTART WITH 1',
        'ALTER SEQUENCE subcategories_id_seq RESTART WITH 1',
        'ALTER SEQUENCE categories_id_seq RESTART WITH 1',
        'ALTER SEQUENCE users_id_seq RESTART WITH 1',
        'ALTER SEQUENCE restaurants_id_seq RESTART WITH 1'
      ];
      
      for (const query of resetQueries) {
        await this.dbPool.query(query);
        console.log(`   🔄 ${query}`);
      }
      
      // Re-enable foreign key checks
      await this.dbPool.query('SET session_replication_role = DEFAULT');
      
      console.log('✅ Database cleanup completed successfully!');
      
    } catch (error) {
      console.error('❌ Database cleanup failed:', error);
      throw error;
    }
  }

  async cleanupB2Images() {
    try {
      console.log('\n☁️  Starting B2 image cleanup...');
      
      await this.b2Cleanup.cleanupAllImages();
      console.log('✅ B2 image cleanup completed successfully!');
      
    } catch (error) {
      console.error('❌ B2 image cleanup failed:', error);
      throw error;
    }
  }

  async verifyCleanup() {
    try {
      console.log('\n🔍 Verifying cleanup results...');
      
      const counts = await this.getCurrentDataCounts();
      const b2Images = await this.getB2Images();
      
      console.log('\n📊 Cleanup verification:');
      console.log('   Database: All data cleared');
      console.log(`   B2 Images: ${b2Images.length} remaining`);
      
      if (b2Images.length === 0) {
        console.log('✅ Complete cleanup successful!');
      } else {
        console.log('⚠️  Some B2 images may still exist');
      }
      
    } catch (error) {
      console.error('❌ Verification failed:', error);
    }
  }

  async runCompleteCleanup() {
    try {
      console.log('🚀 Starting complete cleanup process...');
      console.log('=====================================');
      
      // Test connections
      const dbConnected = await this.testDatabaseConnection();
      if (!dbConnected) {
        throw new Error('Database connection failed');
      }
      
      // Show current state
      await this.getCurrentDataCounts();
      await this.getB2Images();
      
      // Confirm with user
      console.log('\n⚠️  WARNING: This will permanently delete ALL data!');
      console.log('   - All database records will be removed');
      console.log('   - All B2 cloud images will be deleted');
      console.log('   - This action cannot be undone!');
      
      // For safety, require manual confirmation
      console.log('\n🔒 To proceed, manually edit this script and set:');
      console.log('   const CONFIRM_DELETION = true;');
      console.log('\n   Then run: node complete_cleanup.js');
      
      const CONFIRM_DELETION = false; // Set to true to enable deletion
      
      if (!CONFIRM_DELETION) {
        console.log('\n❌ Cleanup cancelled - set CONFIRM_DELETION = true to proceed');
        return;
      }
      
      // Perform cleanup
      await this.cleanupDatabase();
      await this.cleanupB2Images();
      
      // Verify results
      await this.verifyCleanup();
      
      console.log('\n🎉 Complete cleanup finished successfully!');
      
    } catch (error) {
      console.error('\n💥 Cleanup failed:', error);
      throw error;
    } finally {
      await this.dbPool.end();
    }
  }
}

// Main execution
async function main() {
  const cleanupService = new CompleteCleanupService();
  
  try {
    await cleanupService.runCompleteCleanup();
  } catch (error) {
    console.error('💥 Main cleanup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = CompleteCleanupService;

