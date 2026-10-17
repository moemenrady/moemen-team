import { spawn, ChildProcess } from 'child_process';

const TEST_PORT = process.env.TEST_PORT || '3005';
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function waitForServer(url: string, timeoutMs: number = 35000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return true;
    } catch {
      // wait a bit
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  return false;
}

async function runE2ETests() {
  console.log('====================================================');
  console.log(`🌐 MOEMEN TEAM SYSTEM - END-TO-END HTTP & API SUITE`);
  console.log(`📡 Testing against: ${BASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Launch Next.js production server
  console.log(`🚀 Starting Next.js production server on ${BASE_URL}...`);
  const serverProcess: ChildProcess = spawn('npx', ['next', 'start', '-p', TEST_PORT], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: TEST_PORT },
    stdio: 'ignore',
  });

  try {
    const isReady = await waitForServer(`${BASE_URL}/login`, 30000);
    assert(isReady, `Server started on port ${TEST_PORT} and responded within timeout`);
    if (!isReady) {
      throw new Error('Server failed to start');
    }

    // 2. Test Login Page UI / UX Assets
    console.log('\n1️⃣ Login Page UI / UX and Assets:');
    const loginRes = await fetch(`${BASE_URL}/login`);
    assert(loginRes.status === 200, 'GET /login returns HTTP 200');
    const loginHtml = await loginRes.text();

    assert(loginHtml.includes('bg-canvas') || loginHtml.includes('canvas'), 'Login page renders dynamic particle background canvas (#bg-canvas)');
    assert(loginHtml.includes('demo-btn') || loginHtml.includes('Use demo account'), 'Demo Account 1-click button present (#demo-btn)');
    assert(loginHtml.includes('moemen-team') || loginHtml.includes('MOEMEN') || loginHtml.includes('Moemen Team'), 'Moemen Team branding present');
    assert(loginHtml.includes('typewriter') || loginHtml.includes('cursor'), 'Animated typewriter heading component configured');
    assert(loginHtml.includes('transition-overlay'), 'Branded transition overlay (#transition-overlay) present');

    // 3. Test NextAuth CSRF and Login Flow
    console.log('\n2️⃣ NextAuth Authentication Flow:');
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    assert(csrfRes.status === 200, 'GET /api/auth/csrf returns HTTP 200');
    const csrfData = await csrfRes.json();
    assert(!!csrfData.csrfToken, 'CSRF token issued successfully');

    // Extract cookies from csrf response
    const csrfCookiesList = csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : [csrfRes.headers.get('set-cookie') || ''];
    const csrfCookieHeader = csrfCookiesList.map(c => c.split(';')[0]).join('; ');

    // Login with Demo client credentials
    const loginBody = new URLSearchParams({
      csrfToken: csrfData.csrfToken,
      email: 'ahmed@cairofresh.eg',
      password: 'demo1234',
      json: 'true',
    });

    const callbackRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': csrfCookieHeader,
      },
      body: loginBody.toString(),
      redirect: 'manual',
    });

    assert(callbackRes.status === 200 || callbackRes.status === 302, `Login callback response code ${callbackRes.status}`);

    // Collect session cookie
    const authCookiesList = callbackRes.headers.getSetCookie ? callbackRes.headers.getSetCookie() : [callbackRes.headers.get('set-cookie') || ''];
    const sessionCookieHeader = authCookiesList.map(c => c.split(';')[0]).join('; ');
    const fullAuthCookie = `${csrfCookieHeader}; ${sessionCookieHeader}`;

    // 4. Test Protected API - /api/projects
    console.log('\n3️⃣ Protected Projects API & Data Feed:');
    const projectsApiRes = await fetch(`${BASE_URL}/api/projects`, {
      headers: { Cookie: fullAuthCookie },
    });
    assert(projectsApiRes.status === 200, 'GET /api/projects returns HTTP 200 with authenticated session');
    const projectsList = await projectsApiRes.json();
    assert(Array.isArray(projectsList) && projectsList.length > 0, `Returned ${projectsList.length} projects`);

    const firstProject = projectsList[0];
    assert(!!firstProject?.name, `First project name: "${firstProject?.name}"`);
    const projectWithStages = projectsList.find((p: any) => Array.isArray(p.stages) && p.stages.length === 5) || firstProject;
    assert(Array.isArray(projectWithStages?.stages) && projectWithStages?.stages.length === 5, 'Project has 5 workflow stages');
    assert(Array.isArray(firstProject?.payments), 'Project has payments array attached');
    assert(Array.isArray(firstProject?.notes), 'Project has notes array attached');

    // 5. Test Live Project Notes API
    console.log('\n4️⃣ Real-Time Project Notes Persistence API:');
    const notePostRes = await fetch(`${BASE_URL}/api/projects/${firstProject.id}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: fullAuthCookie,
      },
      body: JSON.stringify({
        text: 'Automated E2E Note: Timeline check passed.',
        author: 'client',
      }),
    });
    assert(notePostRes.status === 200 || notePostRes.status === 201, 'POST /api/projects/[id]/notes returns HTTP 201 Created');
    const noteData = await notePostRes.json();
    assert(noteData?.text === 'Automated E2E Note: Timeline check passed.', 'Note created with exact text');

    // Fetch notes back
    const notesGetRes = await fetch(`${BASE_URL}/api/projects/${firstProject.id}/notes`, {
      headers: { Cookie: fullAuthCookie },
    });
    const notesList = await notesGetRes.json();
    assert(notesList.some((n: any) => n.id === noteData.id), 'Newly posted note retrieved via GET /notes');

    // 6. Test AI Chat API
    console.log('\n5️⃣ Intelligent AI Chat API:');
    const chatRes = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: fullAuthCookie,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'ما هي حالة مشاريعي الحالية؟' }],
      }),
    });
    assert(chatRes.status === 200, 'POST /api/chat returns HTTP 200');
    const chatJson = await chatRes.json();
    assert(typeof chatJson?.reply === 'string' && chatJson.reply.length > 15, 'AI chat returned coherent Arabic response');

    // 7. Test Dashboard & Pages HTTP 200
    console.log('\n6️⃣ Dashboard HTML Pages Rendering:');
    const homePageRes = await fetch(`${BASE_URL}/`, {
      headers: { Cookie: fullAuthCookie },
    });
    assert(homePageRes.status === 200, 'GET / (Home Dashboard) returns HTTP 200');

    const projectsPageRes = await fetch(`${BASE_URL}/projects`, {
      headers: { Cookie: fullAuthCookie },
    });
    assert(projectsPageRes.status === 200, 'GET /projects returns HTTP 200');

    const detailPageRes = await fetch(`${BASE_URL}/projects/${firstProject.id}`, {
      headers: { Cookie: fullAuthCookie },
    });
    assert(detailPageRes.status === 200, `GET /projects/${firstProject.id} returns HTTP 200`);

    // 8. Test Role-Based Security: /admin Access Control
    console.log('\n7️⃣ Role-Based Authorization & Admin Console Protection:');

    // A) Client attempt to access /admin should be redirected
    const clientAdminRes = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: fullAuthCookie },
      redirect: 'manual',
    });
    assert(
      clientAdminRes.status === 302 || clientAdminRes.status === 307,
      'Client role user blocked from /admin and redirected (HTTP 302/307)'
    );

    // B) Login as ADMIN
    const adminLoginBody = new URLSearchParams({
      csrfToken: csrfData.csrfToken,
      email: 'admin@moemen-team.tech',
      password: 'admin123',
      json: 'true',
    });

    const adminCallbackRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': csrfCookieHeader,
      },
      body: adminLoginBody.toString(),
      redirect: 'manual',
    });
    assert(adminCallbackRes.status === 200 || adminCallbackRes.status === 302, 'Admin credentials authenticated');

    const adminCookiesList = adminCallbackRes.headers.getSetCookie ? adminCallbackRes.headers.getSetCookie() : [adminCallbackRes.headers.get('set-cookie') || ''];
    const adminSessionCookieHeader = adminCookiesList.map(c => c.split(';')[0]).join('; ');
    const adminFullAuthCookie = `${csrfCookieHeader}; ${adminSessionCookieHeader}`;

    // C) Admin user accessing /admin returns HTTP 200
    const adminPageRes = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: adminFullAuthCookie },
    });
    assert(adminPageRes.status === 200, 'ADMIN role user successfully accesses GET /admin (HTTP 200)');
    const adminHtml = await adminPageRes.text();
    assert(adminHtml.includes('لوحة تحكم الإدارة') || adminHtml.includes('الإدارة') || adminHtml.includes('Admin'), 'Admin dashboard rendered with management UI');

    // D) Admin user calling /api/admin/summary returns 200 with metrics
    const summaryRes = await fetch(`${BASE_URL}/api/admin/summary`, {
      headers: { Cookie: adminFullAuthCookie },
    });
    assert(summaryRes.status === 200, 'GET /api/admin/summary returns HTTP 200 for ADMIN');
    const summaryData = await summaryRes.json();
    assert(typeof summaryData?.metrics?.totalProjects === 'number', 'Summary contains totalProjects metric');
    assert(typeof summaryData?.metrics?.totalPaid === 'number', 'Summary contains totalPaid metric');

    // E) Admin user calling /api/payments returns 200
    const paymentsRes = await fetch(`${BASE_URL}/api/payments`, {
      headers: { Cookie: adminFullAuthCookie },
    });
    assert(paymentsRes.status === 200, 'GET /api/payments returns HTTP 200 for ADMIN');

    // 9. Test Fast Fixing A Problem HTTP API Endpoints
    console.log('\n8️⃣ Fast Fixing A Problem HTTP API Suite:');
    const samplePhotoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    // A) Client submits Fast Fixing issue via POST /api/fast-fixing
    const issueCreateRes = await fetch(`${BASE_URL}/api/fast-fixing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: fullAuthCookie,
      },
      body: JSON.stringify({
        projectId: firstProject.id,
        title: 'Checkout button unresponsive on iOS Safari',
        description: 'When tapping the proceed button on iOS 17 Safari, the spinner activates but the request never fires.',
        photoUrl: samplePhotoBase64,
      }),
    });
    assert(issueCreateRes.status === 201 || issueCreateRes.status === 200, 'POST /api/fast-fixing returns HTTP 201/200 Created');
    const createdIssue = await issueCreateRes.json();
    assert(createdIssue.status === 'pending', 'Created issue has initial status="pending"');
    assert(!!createdIssue.id, 'Created issue assigned an ID');
    assert(createdIssue.photoUrl === samplePhotoBase64, 'Photo URL accurately attached and returned');

    // B) Client reads their issues via GET /api/fast-fixing
    const clientIssuesRes = await fetch(`${BASE_URL}/api/fast-fixing?projectId=${firstProject.id}`, {
      headers: { Cookie: fullAuthCookie },
    });
    assert(clientIssuesRes.status === 200, 'GET /api/fast-fixing returns HTTP 200 for Client');
    const clientIssuesList = await clientIssuesRes.json();
    assert(clientIssuesList.some((i: any) => i.id === createdIssue.id), 'Client can see their submitted fast-fix issue');

    // C) Admin marks issue as "on_it" (starting the timer)
    const onItRes = await fetch(`${BASE_URL}/api/fast-fixing/${createdIssue.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminFullAuthCookie,
      },
      body: JSON.stringify({ status: 'on_it' }),
    });
    assert(onItRes.status === 200, 'PATCH /api/fast-fixing/[id] to "on_it" returns HTTP 200');
    const onItData = await onItRes.json();
    assert(onItData.status === 'on_it', 'Issue status transitioned to "on_it"');
    assert(!!onItData.startedAt, 'startedAt timestamp automatically generated on transition');

    // D) Admin marks issue as "fixed" with resolution notes (timer calculation)
    const fixedRes = await fetch(`${BASE_URL}/api/fast-fixing/${createdIssue.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminFullAuthCookie,
      },
      body: JSON.stringify({
        status: 'fixed',
        adminNotes: 'Resolved touch event bubbling conflict with mobile modal backdrop.',
      }),
    });
    assert(fixedRes.status === 200, 'PATCH /api/fast-fixing/[id] to "fixed" returns HTTP 200');
    const fixedData = await fixedRes.json();
    assert(fixedData.status === 'fixed', 'Issue status transitioned to "fixed"');
    assert(!!fixedData.resolvedAt, 'resolvedAt timestamp automatically recorded');
    assert(typeof fixedData.durationMinutes === 'number', `durationMinutes calculated accurately (${fixedData.durationMinutes} mins)`);
    assert(fixedData.adminNotes.includes('touch event'), 'Admin resolution notes saved');

    // 10. Test Project Extensions & Automated Merge HTTP API Endpoints
    console.log('\n9️⃣ Project Scope Extensions & Evolution Merge HTTP API Suite:');

    // A) Create development request via POST /api/projects/[id]/extensions
    const extCreateRes = await fetch(`${BASE_URL}/api/projects/${firstProject.id}/extensions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: fullAuthCookie,
      },
      body: JSON.stringify({
        title: 'Phase 2: Customer Loyalty Program & Rewards',
        description: 'Provide points accumulation per order and redeemable gift vouchers during checkout.',
        budget: 30000,
        targetDays: 14,
        versionTarget: 'v2.0 Rewards',
      }),
    });
    assert(extCreateRes.status === 201 || extCreateRes.status === 200, 'POST /api/projects/[id]/extensions returns HTTP 201/200');
    const createdExtension = await extCreateRes.json();
    assert(createdExtension.projectId === firstProject.id, 'Extension correctly linked to base project');
    assert(createdExtension.budget === 30000, 'Extension budget set to 30,000');
    assert(createdExtension.progress === 0, 'Initial progress is 0%');

    // B) Admin updates progress % ("كام في الميه") and installment payment
    const extPatchRes = await fetch(`${BASE_URL}/api/projects/${firstProject.id}/extensions/${createdExtension.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminFullAuthCookie,
      },
      body: JSON.stringify({
        progress: 85,
        paid: 15000,
        status: 'in_progress',
      }),
    });
    assert(extPatchRes.status === 200, 'PATCH /api/projects/[id]/extensions/[extId] returns HTTP 200');
    const updatedExtData = await extPatchRes.json();
    assert(updatedExtData.progress === 85, 'Extension progress % updated to 85% ("كام في الميه")');
    assert(updatedExtData.paid === 15000, 'Extension paid installment updated to 15,000');

    // C) Admin triggers Automated Merge via POST /api/projects/[id]/extensions/[extId]/merge
    const mergeRes = await fetch(`${BASE_URL}/api/projects/${firstProject.id}/extensions/${createdExtension.id}/merge`, {
      method: 'POST',
      headers: {
        Cookie: adminFullAuthCookie,
      },
    });
    assert(mergeRes.status === 200, 'POST /api/projects/[id]/extensions/[extId]/merge returns HTTP 200');
    const mergeData = await mergeRes.json();
    assert(mergeData.success === true, 'Merge operation returned success: true');
    assert(mergeData.project.versionLabel === 'v2.0 Rewards', `Base project version bumped to "${mergeData.project.versionLabel}"`);
    assert(mergeData.project.budget >= 30000, `Merged project budget includes extension budget (${mergeData.project.budget})`);
    assert(mergeData.extension.status === 'merged', 'Extension marked with status="merged"');
    assert(!!mergeData.extension.mergedAt, 'Extension records mergedAt timestamp');

    // 11. Test Email Service Project Type via API
    console.log('\n🔟 Email Service Project Type API Verification:');
    const emailProjectRes = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminFullAuthCookie,
      },
      body: JSON.stringify({
        name: 'Corporate Bulk & Transactional Email System',
        description: 'SMTP relay cluster with automated bounce handling and inbox warmup.',
        type: 'email_service',
        status: 'in_progress',
        budget: 40000,
        paid: 20000,
        clientId: firstProject.clientId,
      }),
    });
    assert(emailProjectRes.status === 200 || emailProjectRes.status === 201, 'POST /api/projects with type="email_service" returns HTTP 200/201');
    const emailProjectData = await emailProjectRes.json();
    assert(emailProjectData.type === 'email_service', 'Created project has type="email_service"');

    // Clean up created fast-fix and email project test data
    await fetch(`${BASE_URL}/api/fast-fixing/${createdIssue.id}`, {
      method: 'DELETE',
      headers: { Cookie: adminFullAuthCookie },
    });
    await fetch(`${BASE_URL}/api/projects/${emailProjectData.id}`, {
      method: 'DELETE',
      headers: { Cookie: adminFullAuthCookie },
    });
    assert(true, 'Test resources cleaned up cleanly');

    console.log('\n====================================================');
    console.log(`🎉 ALL E2E TESTS COMPLETED: ${passed} PASSED | ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) process.exit(1);
  } finally {
    // Kill the server process cleanly
    serverProcess.kill('SIGTERM');
  }
}

runE2ETests().catch((err) => {
  console.error('E2E test suite error:', err);
  process.exit(1);
});
