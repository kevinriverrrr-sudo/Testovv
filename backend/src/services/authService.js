const { v4: uuidv4 } = require('uuid');

// In-memory storage (in production, use a database)
const sessions = new Map();

class AuthService {
  async authenticateWithCookies(cookies) {
    // Validate cookies contain required Funpay authentication
    const hasValidCookies = cookies.some(cookie => 
      cookie.name === 'golden_key' || 
      cookie.name === 'PHPSESSID'
    );

    if (!hasValidCookies) {
      return {
        success: false,
        message: 'Invalid authentication cookies'
      };
    }

    // Create session
    const sessionToken = uuidv4();
    const session = {
      token: sessionToken,
      cookies,
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      userId: this.extractUserIdFromCookies(cookies)
    };

    sessions.set(sessionToken, session);

    return {
      success: true,
      session: {
        token: sessionToken,
        expiresAt: session.expiresAt
      },
      message: 'Authentication successful'
    };
  }

  async validateSession(sessionToken) {
    const session = sessions.get(sessionToken);

    if (!session) {
      return {
        valid: false,
        message: 'Session not found'
      };
    }

    if (Date.now() > session.expiresAt) {
      sessions.delete(sessionToken);
      return {
        valid: false,
        message: 'Session expired'
      };
    }

    return {
      valid: true,
      session: {
        userId: session.userId,
        expiresAt: session.expiresAt
      }
    };
  }

  async logout(sessionToken) {
    sessions.delete(sessionToken);
    return { success: true };
  }

  extractUserIdFromCookies(cookies) {
    // Extract user ID from cookies if available
    const userCookie = cookies.find(c => c.name === 'user_id');
    return userCookie ? userCookie.value : `user_${Date.now()}`;
  }

  // Clean up expired sessions
  cleanupExpiredSessions() {
    const now = Date.now();
    for (const [token, session] of sessions.entries()) {
      if (now > session.expiresAt) {
        sessions.delete(token);
      }
    }
  }
}

// Run cleanup every hour
setInterval(() => {
  new AuthService().cleanupExpiredSessions();
}, 60 * 60 * 1000);

module.exports = new AuthService();
