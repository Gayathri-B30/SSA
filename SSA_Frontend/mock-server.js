import http from 'http';

const PORT = 3000;

const server = http.createServer((req, res) => {
  // CORS Headers (in case of direct requests)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse body for POST requests
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    console.log(`[Mock Server] Received ${req.method} ${req.url}`);
    
    // 1. POST /api/auth/login or /auth/login
    if (req.method === 'POST' && (req.url === '/api/auth/login' || req.url === '/auth/login')) {
      try {
        const credentials = JSON.parse(body || '{}');
        const { userId, password } = credentials;

        console.log(`[Mock Server] Login attempt for userId: "${userId}"`);

        // Validate credentials
        // main login uses (superadmin, Admin@123), superadmin login page uses (superadmin, password123)
        if (
          userId === 'superadmin' && 
          (password === 'Admin@123' || password === 'password123')
        ) {
          const user = {
            id: 'superadmin-id',
            userId: 'superadmin',
            name: 'Super Admin',
            email: 'superadmin@sundarsundram.com',
            role: 'Super Admin',
            avatar: ''
          };
          const token = 'mock-jwt-token-xyz-12345';

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ user, token }));
          console.log('[Mock Server] Login successful!');
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid User ID or Password. Please try again.' }));
          console.log('[Mock Server] Login failed: invalid credentials');
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Bad Request: Invalid JSON' }));
      }
      return;
    }

    // 2. GET /api/auth/me or /auth/me
    if (req.method === 'GET' && (req.url === '/api/auth/me' || req.url === '/auth/me')) {
      const authHeader = req.headers['authorization'] || '';
      console.log(`[Mock Server] /auth/me request with auth header: "${authHeader}"`);

      if (authHeader.startsWith('Bearer ')) {
        const user = {
          id: 'superadmin-id',
          userId: 'superadmin',
          name: 'Super Admin',
          email: 'superadmin@sundarsundram.com',
          role: 'Super Admin',
          avatar: ''
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
        console.log('[Mock Server] /auth/me session validated');
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Unauthorized' }));
        console.log('[Mock Server] /auth/me unauthorized');
      }
      return;
    }

    // 3. Fallback / Not Found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not Found' }));
    console.log(`[Mock Server] 404 Not Found for ${req.method} ${req.url}`);
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`Mock Backend Server is running on http://localhost:${PORT}`);
  console.log(`Proxy requests from Vite will be handled here.`);
  console.log(`==================================================\n`);
});
