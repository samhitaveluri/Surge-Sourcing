import app from '../app';
import { Server } from 'http';
import http from 'http';

// Helper to make HTTP requests against the in-memory/running express app
const makeRequest = (
  server: Server,
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<{ status: number; body: any }> => {
  return new Promise((resolve, reject) => {
    const addr = server.address() as any;
    const port = addr.port;

    const payload = body ? JSON.stringify(body) : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload).toString();
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: `/api${path}`,
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : null;
            resolve({ status: res.statusCode || 500, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode || 500, body: data });
          }
        });
      }
    );

    req.on('error', reject);

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

async function runTests() {
  console.log('--- STARTING BACKEND API VERIFICATION SUITE ---');

  const server = app.listen(0); // Random free port
  let buyerToken = '';
  let supplierToken = '';
  let createdRfqId = 0;

  try {
    // 1. Test Health Check
    console.log('\n[1] Testing /api/health');
    const health = await makeRequest(server, 'GET', '/health');
    console.log(`Status: ${health.status}, Response:`, health.body);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Test Buyer Registration
    const timestamp = Date.now();
    console.log('\n[2] Testing Buyer Registration');
    const buyerReg = await makeRequest(server, 'POST', '/auth/register', {
      name: 'Test Buyer Corp',
      email: `buyer_${timestamp}@test.com`,
      password: 'Password123!',
      role: 'BUYER',
    });
    console.log(`Status: ${buyerReg.status}, Message: ${buyerReg.body.message}`);
    if (buyerReg.status !== 201 || !buyerReg.body.data.token) {
      throw new Error('Buyer registration failed');
    }
    buyerToken = buyerReg.body.data.token;

    // 3. Test Supplier Registration
    console.log('\n[3] Testing Supplier Registration');
    const supplierReg = await makeRequest(server, 'POST', '/auth/register', {
      name: 'Test Supplier Ltd',
      email: `supplier_${timestamp}@test.com`,
      password: 'Password123!',
      role: 'SUPPLIER',
    });
    console.log(`Status: ${supplierReg.status}, Message: ${supplierReg.body.message}`);
    if (supplierReg.status !== 201 || !supplierReg.body.data.token) {
      throw new Error('Supplier registration failed');
    }
    supplierToken = supplierReg.body.data.token;

    // 4. Test Duplicate Email
    console.log('\n[4] Testing Duplicate Email Registration (Negative Test)');
    const dupReg = await makeRequest(server, 'POST', '/auth/register', {
      name: 'Duplicate',
      email: `buyer_${timestamp}@test.com`,
      password: 'Password123!',
      role: 'BUYER',
    });
    console.log(`Status: ${dupReg.status}, Error: ${dupReg.body.message}`);
    if (dupReg.status !== 409) throw new Error('Duplicate email should return 409');

    // 5. Test Invalid Login Credentials
    console.log('\n[5] Testing Invalid Login (Negative Test)');
    const invalidLogin = await makeRequest(server, 'POST', '/auth/login', {
      email: `buyer_${timestamp}@test.com`,
      password: 'WrongPassword!',
    });
    console.log(`Status: ${invalidLogin.status}, Error: ${invalidLogin.body.message}`);
    if (invalidLogin.status !== 401) throw new Error('Invalid login should return 401');

    // 6. Test Valid Login
    console.log('\n[6] Testing Valid Login');
    const validLogin = await makeRequest(server, 'POST', '/auth/login', {
      email: `buyer_${timestamp}@test.com`,
      password: 'Password123!',
    });
    console.log(`Status: ${validLogin.status}, Success: ${validLogin.body.success}`);
    if (validLogin.status !== 200 || !validLogin.body.data.token) throw new Error('Valid login failed');

    // 7. Test /api/auth/me
    console.log('\n[7] Testing /api/auth/me');
    const me = await makeRequest(server, 'GET', '/auth/me', null, buyerToken);
    console.log(`Status: ${me.status}, User Role: ${me.body.data.role}`);
    if (me.status !== 200 || me.body.data.role !== 'BUYER') throw new Error('/auth/me failed');

    // 8. Test Supplier attempting to Create RFQ (RBAC Negative Test)
    console.log('\n[8] Testing Supplier attempting to Create RFQ (RBAC Negative Test)');
    const supplierCreateRfq = await makeRequest(
      server,
      'POST',
      '/rfqs',
      {
        productName: 'Illegal RFQ',
        description: 'Should be rejected',
        quantity: 10,
        deliveryLocation: 'Delhi',
        deadline: new Date(Date.now() + 10000000).toISOString(),
      },
      supplierToken
    );
    console.log(`Status: ${supplierCreateRfq.status}, Error: ${supplierCreateRfq.body.message}`);
    if (supplierCreateRfq.status !== 403) throw new Error('Supplier creating RFQ should return 403');

    // 9. Test Past Deadline Validation (Validation Negative Test)
    console.log('\n[9] Testing Past Deadline Validation (Negative Test)');
    const pastDeadlineRfq = await makeRequest(
      server,
      'POST',
      '/rfqs',
      {
        productName: 'Past Deadline RFQ',
        description: 'Should fail validation',
        quantity: 10,
        deliveryLocation: 'Delhi',
        deadline: new Date(Date.now() - 1000000).toISOString(),
      },
      buyerToken
    );
    console.log(`Status: ${pastDeadlineRfq.status}, Error: ${pastDeadlineRfq.body.message}`);
    if (pastDeadlineRfq.status !== 400) throw new Error('Past deadline should return 400');

    // 10. Test Buyer Creating Valid RFQ
    console.log('\n[10] Testing Buyer Creating Valid RFQ');
    const validRfq = await makeRequest(
      server,
      'POST',
      '/rfqs',
      {
        productName: 'Industrial Heavy Duty Shelving Units',
        description: 'Need 50 industrial steel storage shelves for warehouse facility in Gurgaon.',
        quantity: 50,
        deliveryLocation: 'Gurgaon, Haryana',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
      buyerToken
    );
    console.log(`Status: ${validRfq.status}, RFQ ID: ${validRfq.body.data.id}`);
    if (validRfq.status !== 201) throw new Error('Valid RFQ creation failed');
    createdRfqId = validRfq.body.data.id;

    // 11. Test Buyer viewing own RFQs
    console.log('\n[11] Testing Buyer Viewing Own RFQs');
    const myRfqs = await makeRequest(server, 'GET', '/rfqs/my', null, buyerToken);
    console.log(`Status: ${myRfqs.status}, Count: ${myRfqs.body.data.length}`);
    if (myRfqs.status !== 200 || myRfqs.body.data.length === 0) throw new Error('Get my RFQs failed');

    // 12. Test Supplier browsing and searching RFQs
    console.log('\n[12] Testing Supplier Browsing & Searching RFQs');
    const browseRfqs = await makeRequest(server, 'GET', '/rfqs?search=Shelving', null, supplierToken);
    console.log(`Status: ${browseRfqs.status}, Search Results: ${browseRfqs.body.data.length}`);
    if (browseRfqs.status !== 200 || browseRfqs.body.data.length === 0) throw new Error('Browse RFQs failed');

    // 13. Test Buyer attempting to submit quotation (RBAC Negative Test)
    console.log('\n[13] Testing Buyer submitting quotation (RBAC Negative Test)');
    const buyerQuote = await makeRequest(
      server,
      'POST',
      '/quotations',
      {
        rfqId: createdRfqId,
        quotedPrice: 150000,
        estimatedDeliveryTime: '5 days',
      },
      buyerToken
    );
    console.log(`Status: ${buyerQuote.status}, Error: ${buyerQuote.body.message}`);
    if (buyerQuote.status !== 403) throw new Error('Buyer submitting quotation should return 403');

    // 14. Test Supplier Submitting Valid Quotation
    console.log('\n[14] Testing Supplier Submitting Valid Quotation');
    const supplierQuote = await makeRequest(
      server,
      'POST',
      '/quotations',
      {
        rfqId: createdRfqId,
        quotedPrice: 145000,
        estimatedDeliveryTime: '7 business days',
        message: 'Includes installation and heavy anchor bolts.',
      },
      supplierToken
    );
    console.log(`Status: ${supplierQuote.status}, Quotation ID: ${supplierQuote.body.data.id}`);
    if (supplierQuote.status !== 201) throw new Error('Quotation submission failed');

    // 15. Test Duplicate Quotation (Negative Test)
    console.log('\n[15] Testing Duplicate Quotation Submission (Negative Test)');
    const dupQuote = await makeRequest(
      server,
      'POST',
      '/quotations',
      {
        rfqId: createdRfqId,
        quotedPrice: 140000,
        estimatedDeliveryTime: '6 days',
      },
      supplierToken
    );
    console.log(`Status: ${dupQuote.status}, Error: ${dupQuote.body.message}`);
    if (dupQuote.status !== 409) throw new Error('Duplicate quotation should return 409');

    // 16. Test Supplier Viewing My Quotations
    console.log('\n[16] Testing Supplier Viewing My Quotations');
    const myQuotes = await makeRequest(server, 'GET', '/quotations/my', null, supplierToken);
    console.log(`Status: ${myQuotes.status}, Count: ${myQuotes.body.data.length}`);
    if (myQuotes.status !== 200 || myQuotes.body.data.length === 0) throw new Error('Get my quotations failed');

    // 17. Test Buyer Viewing RFQ with Quotations
    console.log('\n[17] Testing Buyer Viewing RFQ with Received Quotations');
    const rfqWithQuotes = await makeRequest(server, 'GET', `/rfqs/${createdRfqId}`, null, buyerToken);
    console.log(
      `Status: ${rfqWithQuotes.status}, Received Quotes: ${rfqWithQuotes.body.data.quotations?.length}`
    );
    if (rfqWithQuotes.status !== 200 || rfqWithQuotes.body.data.quotations?.length !== 1) {
      throw new Error('Buyer viewing RFQ quotations failed');
    }

    // 18. Test Updating RFQ
    console.log('\n[18] Testing Buyer Updating Own RFQ');
    const updateRfq = await makeRequest(
      server,
      'PUT',
      `/rfqs/${createdRfqId}`,
      {
        description: 'Updated description with additional technical specifications.',
      },
      buyerToken
    );
    console.log(`Status: ${updateRfq.status}, Updated: ${updateRfq.body.data.description.includes('Updated')}`);
    if (updateRfq.status !== 200) throw new Error('RFQ update failed');

    // 19. Test Deleting RFQ
    console.log('\n[19] Testing Buyer Deleting Own RFQ');
    const deleteRfq = await makeRequest(server, 'DELETE', `/rfqs/${createdRfqId}`, null, buyerToken);
    console.log(`Status: ${deleteRfq.status}, Message: ${deleteRfq.body.message}`);
    if (deleteRfq.status !== 200) throw new Error('RFQ delete failed');

    console.log('\n==========================================');
    console.log(' ALL 19 API TESTS PASSED SUCCESSFULLY! ');
    console.log('==========================================');
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('\n API TEST SUITE FAILED:', err);
  process.exit(1);
});
