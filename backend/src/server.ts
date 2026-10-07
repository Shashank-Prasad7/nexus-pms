import app from './app';
import { prisma } from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✓ Successfully connected to Database');

    app.listen(PORT, () => {
      console.log(`🚀 PMS Server running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to Database:', error);
    process.exit(1);
  }
};

startServer();
