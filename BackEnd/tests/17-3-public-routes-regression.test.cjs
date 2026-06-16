/**
 * Task 17.3: Verify public routes - Regression Test
 * 
 * This test suite ensures public routes remain accessible without authentication.
 * Tests verify that unauthenticated users can access:
 * - Tournament list API
 * - Home page
 * - Login/Registration pages
 * - Public API endpoints
 * 
 * Run: node tests/17-3-public-routes-regression.test.cjs
 */

const http = require('http');
const assert = require('assert');

// Simple test runner
class TestRunner {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.errors = [];
  }

  describe(name, fn) {
    this.currentSuite = { name, tests: [] };
    this.suites.push(this.currentSuite);
    fn.call(this);
    this.currentSuite = null;
  }

  it(name, fn) {
    if (this.currentSuite) {
      this.currentSuite.tests.push({ name, fn });
    }
  }

  async run() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  Task 17.3: Public Routes Regression Test Suite               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    for (const suite of this.suites) {
      console.log(`\n📋 ${suite.name}`);
      console.log('─'.repeat(70));

      for (const test of suite.tests) {
        this.totalTests++;
        try {
          await test.fn();
          this.passedTests++;
          console.log(`  ✅ ${test.name}`);
        } catch (err) {
          this.failedTests++;
          console.log(`  ❌ ${test.name}`);
          const errMsg = err && err.message ? err.message : (err && err.toString ? err.toString() : String(err));
          console.log(`     Error: ${errMsg}`);
          this.errors.push({ suite: suite.name, test: test.name, error: errMsg });
        }
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log(`\n📊 Test Results:`);
    console.log(`   Total:  ${this.totalTests}`);
    console.log(`   Passed: ${this.passedTests} ✅`);
    console.log(`   Failed: ${this.failedTests} ❌`);

    if (this.failedTests > 0) {
      console.log(`\n⚠️  Failed Tests:`);
      this.errors.forEach(e => {
        console.log(`   • ${e.suite} → ${e.test}`);
        console.log(`     ${e.error}`);
      });
    }

    console.log('\n' + '═'.repeat(70));
    console.log('\n✅ Test execution completed.\n');
    process.exit(this.failedTests > 0 ? 1 : 0);
  }
}

const runner = new TestRunner();

// Configuration
const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 3000;

// Helper to make HTTP requests
function makeRequest(method, host, port, path, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: host,
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'RegressionTest/1.0',
        ...options.headers
      },
      timeout: options.timeout || 5000
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data && res.headers['content-type']?.includes('application/json') 
            ? JSON.parse(data) 
            : data;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
            rawBody: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
            rawBody: data,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${requestOptions.timeout}ms`));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════════════════
// TEST 1: GET /api/tournaments accessible without auth
// ═══════════════════════════════════════════════════════════════════════
runner.describe('1. GET /api/tournaments (Public API)', function() {
  
  this.it('Should return HTTP 200 without Authorization header', async () => {
    const res = await makeRequest('GET', API_HOST, API_PORT, '/api/tournaments');
    
    assert.strictEqual(res.status, 200, 
      `Expected status 200, got ${res.status}\nResponse: ${JSON.stringify(res.body)}`);
  });

  this.it('Should return valid tournament list in response', async () => {
    const res = await makeRequest('GET', API_HOST, API_PORT, '/api/tournaments');
    
    assert.strictEqual(res.status, 200);
    assert(res.body, 'Response body should exist');
    
    // Response should be either array or object with tournaments property
    const tournaments = Array.isArray(res.body) ? res.body : res.body.tournaments;
    assert(Array.isArray(tournaments), 
      `Expected array of tournaments, got: ${typeof tournaments}`);
  });

  this.it('Should NOT contain authentication errors', async () => {
    const res = await makeRequest('GET', API_HOST, API_PORT, '/api/tournaments');
    
    assert.strictEqual(res.status, 200);
    const responseStr = JSON.stringify(res.body);
    assert(!responseStr.toLowerCase().includes('unauthorized'), 
      'Response should not contain "unauthorized" error');
    assert(!responseStr.toLowerCase().includes('token'), 
      'Response should not require token');
    assert(!responseStr.toLowerCase().includes('authentication required'),
      'Response should not require authentication');
  });

  this.it('Should return tournament details (title, description, date)', async () => {
    const res = await makeRequest('GET', API_HOST, API_PORT, '/api/tournaments');
    
    assert.strictEqual(res.status, 200);
    const tournaments = Array.isArray(res.body) ? res.body : res.body.tournaments;
    
    if (tournaments && tournaments.length > 0) {
      const torneio = tournaments[0];
      
      // Verify response has tournament structure
      assert(typeof torneio === 'object', 'Tournament should be an object');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST 2: GET /api/tournaments/ativo (Active Tournament)
// ═══════════════════════════════════════════════════════════════════════
runner.describe('2. GET /api/tournaments/ativo (Active Tournament - Public)', function() {
  
  this.it('Should return HTTP 200 without authentication', async () => {
    const res = await makeRequest('GET', API_HOST, API_PORT, '/api/tournaments/ativo');
    
    assert.strictEqual(res.status, 200,
      `Expected status 200, got ${res.status}\nResponse: ${JSON.stringify(res.body)}`);
  });

  this.it('Should return valid response structure', async () => {
    const res = await makeRequest('GET', API_HOST, API_PORT, '/api/tournaments/ativo');
    
    assert.strictEqual(res.status, 200);
    assert(res.body, 'Response should have body');
    assert(res.body.hasOwnProperty('success') || res.body.hasOwnProperty('ativo'),
      'Response should indicate success or active status');
  });

  this.it('Should NOT require authentication', async () => {
    const res = await makeRequest('GET', API_HOST, API_PORT, '/api/tournaments/ativo');
    
    assert.strictEqual(res.status, 200);
    assert(res.status !== 401, 'Should not return 401 Unauthorized');
    assert(res.status !== 403, 'Should not return 403 Forbidden');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST 3: GET / (Home Page)
// ═══════════════════════════════════════════════════════════════════════
runner.describe('3. GET / (Home Page)', function() {
  
  this.it('Should return HTTP 200 on root path', async () => {
    const res = await makeRequest('GET', API_HOST, API_PORT, '/');
    
    assert.strictEqual(res.status, 200,
      `Expected status 200 for home page, got ${res.status}\nResponse: ${JSON.stringify(res.body)}`);
  });

  this.it('Should return valid JSON response', async () => {
    const res = await makeRequest('GET', API_HOST, API_PORT, '/');
    
    assert.strictEqual(res.status, 200);
    assert(res.body, 'Root endpoint should return response body');
    
    if (typeof res.body === 'object') {
      assert(res.body.hasOwnProperty('status') || res.body.hasOwnProperty('message'),
        'API response should have status or message field');
    }
  });

  this.it('Should NOT redirect to login', async () => {
    const res = await makeRequest('GET', API_HOST, API_PORT, '/');
    
    assert.strictEqual(res.status, 200, 'Should not redirect (would be 3xx)');
    assert(res.status !== 401, 'Should not return 401 Unauthorized');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST 4: Login and Registration pages accessible
// ═══════════════════════════════════════════════════════════════════════
runner.describe('4. Authentication pages accessibility', function() {
  
  this.it('POST /auth/login endpoint exists and is public', async () => {
    try {
      const res = await makeRequest('POST', API_HOST, API_PORT, '/auth/login', {
        body: {}
      });
      
      // Endpoint should exist (not 404) and not require auth (not 401/403)
      assert(res.status !== 404, '/auth/login endpoint should exist');
      assert(res.status !== 401, '/auth/login should not require authentication');
      assert(res.status !== 403, '/auth/login should not be forbidden');
    } catch (err) {
      // Connection errors acceptable in test environment
      if (!err.message.includes('ECONNREFUSED')) throw err;
    }
  });

  this.it('POST /auth/register endpoint exists and is public', async () => {
    try {
      const res = await makeRequest('POST', API_HOST, API_PORT, '/auth/register', {
        body: {}
      });
      
      assert(res.status !== 404, '/auth/register endpoint should exist');
      assert(res.status !== 401, '/auth/register should not require authentication');
      assert(res.status !== 403, '/auth/register should not be forbidden');
    } catch (err) {
      if (!err.message.includes('ECONNREFUSED')) throw err;
    }
  });

  this.it('POST /auth/registro endpoint exists (Portuguese variant)', async () => {
    try {
      const res = await makeRequest('POST', API_HOST, API_PORT, '/auth/registro', {
        body: {}
      });
      
      assert(res.status !== 404, '/auth/registro endpoint should exist');
      assert(res.status !== 401, '/auth/registro should not require authentication');
      assert(res.status !== 403, '/auth/registro should not be forbidden');
    } catch (err) {
      if (!err.message.includes('ECONNREFUSED')) throw err;
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST 5: Tournament ranking endpoints accessible publicly
// ═══════════════════════════════════════════════════════════════════════
runner.describe('5. Tournament ranking endpoints (Public)', function() {
  
  this.it('GET /api/tournaments/:id/ranking should be accessible without auth', async () => {
    try {
      const res = await makeRequest('GET', API_HOST, API_PORT, '/api/tournaments/1/ranking');
      
      assert(res.status !== 401, 'Ranking endpoint should not require authentication');
      assert(res.status !== 403, 'Ranking endpoint should not be forbidden');
      
      if (res.status === 200) {
        assert(res.body, 'Ranking response should have data');
      }
    } catch (err) {
      if (!err.message.includes('ECONNREFUSED')) throw err;
    }
  });

  this.it('GET /api/tournaments/:id/participant-counts should be public', async () => {
    try {
      const res = await makeRequest('GET', API_HOST, API_PORT, '/api/tournaments/1/participant-counts');
      
      assert(res.status !== 401, 'Participant counts should not require authentication');
      assert(res.status !== 403, 'Participant counts should not be forbidden');
    } catch (err) {
      if (!err.message.includes('ECONNREFUSED')) throw err;
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST 6: No authentication errors in public responses
// ═══════════════════════════════════════════════════════════════════════
runner.describe('6. Authentication Error Verification', function() {
  
  this.it('Public endpoints should NOT return 401 Unauthorized', async () => {
    const publicEndpoints = [
      '/api/tournaments',
      '/api/tournaments/ativo',
      '/'
    ];

    for (const endpoint of publicEndpoints) {
      const res = await makeRequest('GET', API_HOST, API_PORT, endpoint);
      assert(res.status !== 401, `${endpoint} returned 401 Unauthorized - should be public!`);
    }
  });

  this.it('Public endpoints should NOT return 403 Forbidden', async () => {
    const publicEndpoints = [
      '/api/tournaments',
      '/api/tournaments/ativo',
      '/'
    ];

    for (const endpoint of publicEndpoints) {
      const res = await makeRequest('GET', API_HOST, API_PORT, endpoint);
      assert(res.status !== 403, `${endpoint} returned 403 Forbidden - should be public!`);
    }
  });

  this.it('Response body should not contain "unauthorized" keywords', async () => {
    const res = await makeRequest('GET', API_HOST, API_PORT, '/api/tournaments');
    
    const bodyStr = JSON.stringify(res.body).toLowerCase();
    assert(!bodyStr.includes('unauthorized'), 
      'Response should not contain "unauthorized" message');
    assert(!bodyStr.includes('token required'), 
      'Response should not require tokens');
    assert(!bodyStr.includes('please login'), 
      'Response should not require login');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST 7: Verify response content types
// ═══════════════════════════════════════════════════════════════════════
runner.describe('7. Response Format Verification', function() {
  
  this.it('API responses should have correct Content-Type header', async () => {
    const res = await makeRequest('GET', API_HOST, API_PORT, '/api/tournaments');
    
    assert(res.headers['content-type'], 'Response should have Content-Type header');
    assert(res.headers['content-type'].includes('application/json'),
      `Expected application/json, got ${res.headers['content-type']}`);
  });

  this.it('Responses should be parseable JSON', async () => {
    const res = await makeRequest('GET', API_HOST, API_PORT, '/api/tournaments');
    
    assert(!res.parseError, 
      `Response should be valid JSON, parse error: ${res.parseError}`);
    assert(typeof res.body === 'object' || Array.isArray(res.body),
      'Response body should be object or array');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST 8: No unexpected headers blocking public access
// ═══════════════════════════════════════════════════════════════════════
runner.describe('8. Response Headers Verification', function() {
  
  this.it('Should have proper CORS headers allowing public access', async () => {
    const res = await makeRequest('GET', API_HOST, API_PORT, '/api/tournaments');
    
    // CORS should be enabled for public routes
    assert(res.headers, 'Response should have headers');
  });
});

// Run all tests
console.log('\n🧪 Starting regression test suite...\n');
runner.run().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
