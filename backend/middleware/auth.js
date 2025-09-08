const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Development mode bypass for testing
    if (token === 'dev-token-for-testing' && process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Bypassing JWT validation');
      req.user = {
        userId: 1,
        role: 'admin'
      };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = auth;
