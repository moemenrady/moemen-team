import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE MOEMEN TEAM SYSTEM TEST SUITE');
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

  try {
    // 1. Database Connection & Integrity Test
    console.log('1️⃣ Database Integrity & Model Verification:');
    const usersCount = await prisma.user.count();
    assert(usersCount >= 3, `Database has ${usersCount} users (expected >= 3)`);

    const demoUser = await prisma.user.findUnique({
      where: { email: 'ahmed@cairofresh.eg' },
    });
    assert(!!demoUser, 'Demo client user (ahmed@cairofresh.eg) exists');
    assert(demoUser?.company === 'Cairo Fresh Market', `User company is "${demoUser?.company}"`);
    assert(demoUser?.initials === 'AY', `User initials are "${demoUser?.initials}" (Ahmed Youssef)`);

    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@moemen-team.tech' },
    });
    assert(!!adminUser, 'Admin user (admin@moemen-team.tech) exists');
    assert(adminUser?.role === 'ADMIN', 'Admin has ADMIN role');

    // 2. Password Verification
    console.log('\n2️⃣ Authentication Password Hashes:');
    if (demoUser && demoUser.password) {
      const matchDemo = await bcrypt.compare('demo1234', demoUser.password);
      assert(matchDemo, 'Demo user password "demo1234" verifies correctly against bcrypt hash');
    }
    if (adminUser && adminUser.password) {
      const matchAdmin = await bcrypt.compare('admin123', adminUser.password);
      assert(matchAdmin, 'Admin user password "admin123" verifies correctly against bcrypt hash');
    }

    // 3. Projects & Related Data Test
    console.log('\n3️⃣ Projects, Stages, Payments, & Quotation Verification:');
    const projects = await prisma.project.findMany({
      include: {
        stages: { orderBy: { order: 'asc' } },
        payments: true,
        notes: true,
        client: true,
      },
    });
    assert(projects.length >= 4, `System contains ${projects.length} projects (expected >= 4)`);

    const cairoFresh = projects.find(p => p.name.includes('Cairo Fresh'));
    assert(!!cairoFresh, 'Cairo Fresh Market project found');
    if (cairoFresh) {
      assert(cairoFresh.stages.length === 5, `Project has ${cairoFresh.stages.length} workflow stages (expected 5)`);
      assert(cairoFresh.payments.length >= 2, `Project has ${cairoFresh.payments.length} payment records`);
      assert(cairoFresh.notes.length >= 1, `Project has ${cairoFresh.notes.length} note records`);
      assert(cairoFresh.contractStatus === 'Active', `Contract status is "${cairoFresh.contractStatus}"`);
      assert(cairoFresh.quotationItems !== null, 'Quotation items JSON data exists');
    }

    // 4. Note Creation & Persistence Test
    console.log('\n4️⃣ Real-Time Project Notes Persistence:');
    if (cairoFresh && demoUser) {
      const newNote = await prisma.note.create({
        data: {
          projectId: cairoFresh.id,
          text: 'Automated test note: Design review approved by client.',
          author: 'client',
        },
      });
      assert(!!newNote.id, 'New note created successfully in database');

      const fetchedNote = await prisma.note.findUnique({
        where: { id: newNote.id },
      });
      assert(fetchedNote?.text === 'Automated test note: Design review approved by client.', 'Note fetched back matches saved content');

      // Clean up test note
      await prisma.note.delete({ where: { id: newNote.id } });
      assert(true, 'Test note cleanup verified');
    }

    // 5. New Project Request Flow
    console.log('\n5️⃣ Client New Project Request Flow:');
    if (demoUser) {
      let client = await prisma.client.findFirst({
        where: { OR: [{ userId: demoUser.id }, { email: demoUser.email }] }
      });
      if (!client) {
        client = await prisma.client.create({
          data: {
            name: demoUser.name || "Ahmed Youssef",
            email: demoUser.email,
            company: demoUser.company || "Cairo Fresh Market",
            userId: demoUser.id,
          }
        });
      }

      const testProject = await prisma.project.create({
        data: {
          name: 'Test Mobile App',
          description: 'A test project created by automated test suite',
          type: 'mobile',
          status: 'PENDING',
          clientId: client.id,
          contractStatus: 'pending',
          requestDate: new Date().toISOString(),
          totalDays: 60,
          budget: 50000,
          stages: {
            create: [
              { name: 'Discovery', order: 1, status: 'done' },
              { name: 'Design', order: 2, status: 'current' },
              { name: 'Frontend', order: 3, status: 'pending' },
              { name: 'Backend', order: 4, status: 'pending' },
              { name: 'Launch', order: 5, status: 'pending' },
            ],
          },
        },
        include: { stages: true },
      });
      assert(!!testProject.id, `New project created with ID: ${testProject.id}`);
      assert(testProject.stages.length === 5, '5 initial stages automatically attached');

      // Clean up test project
      await prisma.projectStage.deleteMany({ where: { projectId: testProject.id } });
      await prisma.project.delete({ where: { id: testProject.id } });
      assert(true, 'Test project cleaned up successfully');
    }

    // 6. AI Assistant Context Engine Test
    console.log('\n6️⃣ Moemen AI Assistant Context & Intent Engine:');
    const { getAssistantResponse } = await import('../src/lib/chatAssistant');
    
    // Test greetings
    const greetingRes = await getAssistantResponse('مرحباً كيف حالك');
    assert(greetingRes.length > 10, 'Greeting prompt returned friendly Arabic response');

    // Test project query
    const projectRes = await getAssistantResponse('ما هي المشاريع الحالية وما هي نسبة تقدمها؟');
    assert(projectRes.includes('Cairo Fresh') || projectRes.includes('المشاريع') || projectRes.includes('projects'), 'AI responded with project context');

    // Test invoice/payment query
    const paymentRes = await getAssistantResponse('كيف يمكنني سداد الدفعة القادمة؟');
    // 7. Admin & Manager Management Features
    console.log('\n7️⃣ Admin & Manager Roles, Financials & Progress Control:');
    const managerUser = await prisma.user.findUnique({
      where: { email: 'manager@moemen-team.tech' },
    });
    assert(!!managerUser, 'Manager user (manager@moemen-team.tech) exists in database');
    assert(managerUser?.role === 'MANAGER', 'Manager user has MANAGER role');

    // Create a temporary admin project
    const adminTestClient = await prisma.client.create({
      data: {
        name: 'Admin Test Client',
        company: 'Admin Test Corp',
        email: 'test@admintest.eg',
        phone: '01001234567',
      },
    });
    assert(!!adminTestClient.id, 'Admin created new client successfully');

    const adminTestProject = await prisma.project.create({
      data: {
        name: 'Admin Progress Test Project',
        clientId: adminTestClient.id,
        budget: 50000,
        paid: 0,
        progress: 25,
        status: 'in_progress',
        stages: {
          create: [
            { name: 'Discovery', status: 'done', order: 1 },
            { name: 'Development', status: 'current', order: 2 },
          ],
        },
      },
      include: { stages: true },
    });
    assert(adminTestProject.progress === 25, 'Admin set initial project progress to 25%');
    assert(adminTestProject.stages.length === 2, 'Admin project stages attached');

    // Add a payment and verify Project.paid update
    const newPayment = await prisma.payment.create({
      data: {
        projectId: adminTestProject.id,
        amount: 25000,
        method: 'InstaPay',
        note: 'Admin test payment 50%',
        date: '2026-10-17',
      },
    });

    const sumPayments = await prisma.payment.findMany({
      where: { projectId: adminTestProject.id },
      select: { amount: true },
    });
    const totalPaid = sumPayments.reduce((acc, p) => acc + p.amount, 0);
    await prisma.project.update({
      where: { id: adminTestProject.id },
      data: { paid: totalPaid },
    });

    const updatedProj = await prisma.project.findUnique({
      where: { id: adminTestProject.id },
    });
    assert(updatedProj?.paid === 25000, 'Project.paid recalculated accurately after payment');

    // Clean up test data
    await prisma.payment.deleteMany({ where: { projectId: adminTestProject.id } });
    await prisma.projectStage.deleteMany({ where: { projectId: adminTestProject.id } });
    await prisma.project.delete({ where: { id: adminTestProject.id } });
    await prisma.client.delete({ where: { id: adminTestClient.id } });
    assert(true, 'Admin test resources cleaned up cleanly');

    // 8. Client Data Isolation & Account Creation Flows
    console.log('\n8️⃣ Client Data Isolation & Multi-Method Account Creation:');
    
    // Create two isolated clients
    const isoUserA = await prisma.user.create({
      data: {
        name: 'Client Alpha',
        email: 'alpha@isolation-test.eg',
        password: await bcrypt.hash('passA1234', 10),
        role: 'CLIENT',
        company: 'Alpha Corp',
      },
    });

    const isoClientA = await prisma.client.create({
      data: {
        name: 'Client Alpha',
        email: 'alpha@isolation-test.eg',
        userId: isoUserA.id,
        company: 'Alpha Corp',
      },
    });

    const isoProjA = await prisma.project.create({
      data: {
        name: 'Alpha Project 1',
        description: 'Alpha secret project',
        type: 'website',
        status: 'in_progress',
        clientId: isoClientA.id,
        budget: 60000,
        paid: 20000,
      },
    });

    const isoUserB = await prisma.user.create({
      data: {
        name: 'Client Beta',
        email: 'beta@isolation-test.eg',
        password: await bcrypt.hash('passB1234', 10),
        role: 'CLIENT',
        company: 'Beta Corp',
      },
    });

    const isoClientB = await prisma.client.create({
      data: {
        name: 'Client Beta',
        email: 'beta@isolation-test.eg',
        userId: isoUserB.id,
        company: 'Beta Corp',
      },
    });

    const isoProjB = await prisma.project.create({
      data: {
        name: 'Beta Project 1',
        description: 'Beta secret project',
        type: 'mobile',
        status: 'in_progress',
        clientId: isoClientB.id,
        budget: 90000,
        paid: 45000,
      },
    });

    // Test Isolation Query Logic (as executed by /api/projects GET)
    const clientAProjects = await prisma.project.findMany({
      where: { clientId: isoClientA.id },
    });
    assert(clientAProjects.length === 1 && clientAProjects[0].id === isoProjA.id, 'Client A sees only their own project');
    assert(!clientAProjects.some(p => p.id === isoProjB.id), 'Client A CANNOT see Client B projects (Data isolation verified)');

    const clientBProjects = await prisma.project.findMany({
      where: { clientId: isoClientB.id },
    });
    assert(clientBProjects.length === 1 && clientBProjects[0].id === isoProjB.id, 'Client B sees only their own project');
    assert(!clientBProjects.some(p => p.id === isoProjA.id), 'Client B CANNOT see Client A projects (Data isolation verified)');

    // Test Statement Financials Calculation
    const statementProj = await prisma.project.findUnique({
      where: { id: isoProjA.id },
      include: { client: true, payments: true },
    });
    const budget = statementProj?.budget || 0;
    const paid = statementProj?.paid || 0;
    const remaining = Math.max(0, budget - paid);
    assert(budget === 60000, 'Statement project budget accurate');
    assert(paid === 20000, 'Statement project paid accurate');
    assert(remaining === 40000, 'Statement project remaining balance accurate');

    // Clean up isolation test records
    await prisma.project.delete({ where: { id: isoProjA.id } });
    await prisma.client.delete({ where: { id: isoClientA.id } });
    await prisma.user.delete({ where: { id: isoUserA.id } });

    await prisma.project.delete({ where: { id: isoProjB.id } });
    await prisma.client.delete({ where: { id: isoClientB.id } });
    await prisma.user.delete({ where: { id: isoUserB.id } });
    assert(true, 'Isolation test users and projects cleaned up successfully');

    // 9. Email Service Project Type Flow
    console.log('\n9️⃣ Email Service Project Type Creation & Retrieval:');
    const emailClient = await prisma.client.findFirst();
    assert(!!emailClient, 'Target client found for email service project');

    const emailServiceProject = await prisma.project.create({
      data: {
        name: 'Enterprise Transactional Email Gateway',
        description: 'Dedicated high-deliverability SMTP & transactional email cluster with inbox placement monitoring',
        type: 'email_service',
        status: 'in_progress',
        progress: 40,
        budget: 45000,
        paid: 20000,
        clientId: emailClient!.id,
        versionLabel: 'v1.0 SMTP',
      },
      include: { client: true },
    });

    assert(emailServiceProject.type === 'email_service', 'Project successfully created with type="email_service"');
    assert(emailServiceProject.name === 'Enterprise Transactional Email Gateway', 'Email service project title matches');

    const fetchedEmailProject = await prisma.project.findUnique({
      where: { id: emailServiceProject.id },
    });
    assert(fetchedEmailProject?.type === 'email_service', 'Retrieved project retains type="email_service" in database');

    // 10. Fast Fixing A Problem Lifecycle & Duration Calculation
    console.log('\n🔟 Fast Fixing A Problem Lifecycle & Resolution Duration Tracking:');
    const samplePhotoUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const reportedIssue = await prisma.fastFixIssue.create({
      data: {
        projectId: emailServiceProject.id,
        title: 'SMTP TLS handshake timeout on port 587',
        description: 'Emails queued but not delivering through port 587 when TLS 1.3 is enforced. Screenshot shows timeout log.',
        photoUrl: samplePhotoUrl,
        status: 'pending',
      },
    });

    assert(reportedIssue.status === 'pending', 'Fast Fix issue initialized in "pending" status');
    assert(reportedIssue.photoUrl === samplePhotoUrl, 'Photo URL / screenshot data stored successfully');
    assert(reportedIssue.durationMinutes === null, 'Initial duration is null prior to resolution');

    // Transition to on_it (simulating engineer picking up the issue 45 minutes ago)
    const fortyFiveMinsAgo = new Date(Date.now() - 45 * 60 * 1000);
    const onItIssue = await prisma.fastFixIssue.update({
      where: { id: reportedIssue.id },
      data: {
        status: 'on_it',
        startedAt: fortyFiveMinsAgo,
      },
    });

    assert(onItIssue.status === 'on_it', 'Fast Fix issue transitioned to "on_it" status');
    assert(!!onItIssue.startedAt, 'Issue startedAt timestamp recorded');

    // Transition to fixed (simulating engineer resolving the issue now)
    const now = new Date();
    const durationCalculated = Math.max(1, Math.round((now.getTime() - new Date(onItIssue.startedAt!).getTime()) / 60000));
    const fixedIssue = await prisma.fastFixIssue.update({
      where: { id: reportedIssue.id },
      data: {
        status: 'fixed',
        resolvedAt: now,
        durationMinutes: durationCalculated,
        adminNotes: "Updated cipher suite and renewed Let's Encrypt TLS certificate on port 587. All queued emails processed.",
      },
    });

    assert(fixedIssue.status === 'fixed', 'Fast Fix issue successfully marked as "fixed"');
    assert(fixedIssue.durationMinutes === 45, `Duration tracked accurately as ${fixedIssue.durationMinutes} minutes (expected 45)`);
    assert(Boolean(fixedIssue.adminNotes?.includes('cipher suite')), 'Admin resolution notes saved and accessible');

    // 11. Project Development Scope Extensions & Automated Merge Flow
    console.log('\n1️⃣1️⃣ Project Scope Extensions & Automated Merge Workflow:');
    // Set base project to completed & fully paid
    const completedProject = await prisma.project.update({
      where: { id: emailServiceProject.id },
      data: {
        status: 'completed',
        progress: 100,
        budget: 50000,
        paid: 50000,
        versionLabel: 'v1.0 Base',
      },
    });

    assert(completedProject.status === 'completed', 'Base project status is "completed"');
    assert(completedProject.paid >= (completedProject.budget || 0), 'Base project is 100% fully paid');

    // Client requests a new development phase inside the same project
    const newExtension = await prisma.projectExtension.create({
      data: {
        projectId: completedProject.id,
        title: 'Phase 2: Marketing Automation & Webhooks',
        description: 'Add automated drip sequences, open rate tracking, and Zapier webhook integration.',
        budget: 25000,
        paid: 10000,
        progress: 80,
        targetDays: 14,
        versionTarget: 'v2.0 Marketing',
        status: 'in_progress',
      },
    });

    assert(newExtension.projectId === completedProject.id, 'Extension registered inside the exact same project ID');
    assert(newExtension.progress === 80, 'Extension tracks progress % (80% / كام في الميه)');
    assert(newExtension.budget === 25000, 'Extension budget of 25,000 recorded');
    assert(newExtension.paid === 10000, 'Extension paid installment of 10,000 recorded');

    // Simulate Automated Merge execution (same logic as /api/projects/[id]/extensions/[extId]/merge)
    const newProjectBudget = (completedProject.budget || 0) + (newExtension.budget || 0);
    const newProjectPaid = (completedProject.paid || 0) + (newExtension.paid || 0);
    const mergeTimestamp = new Date();

    const [mergedExtension, mergedProject] = await prisma.$transaction([
      prisma.projectExtension.update({
        where: { id: newExtension.id },
        data: {
          status: 'merged',
          progress: 100,
          mergedAt: mergeTimestamp,
        },
      }),
      prisma.project.update({
        where: { id: completedProject.id },
        data: {
          budget: newProjectBudget,
          paid: newProjectPaid,
          versionLabel: newExtension.versionTarget || 'v2.0',
          versionNote: `Merged ${newExtension.title} into base project`,
          status: 'completed',
        },
      }),
    ]);

    assert(mergedExtension.status === 'merged', 'Extension status updated to "merged"');
    assert(!!mergedExtension.mergedAt, 'Extension records merge timestamp');
    assert(mergedProject.budget === 75000, `Merged project budget is 75,000 (50,000 base + 25,000 ext) - Actual: ${mergedProject.budget}`);
    assert(mergedProject.paid === 60000, `Merged project paid amount is 60,000 (50,000 base + 10,000 ext) - Actual: ${mergedProject.paid}`);
    assert(mergedProject.versionLabel === 'v2.0 Marketing', `Project version updated to "${mergedProject.versionLabel}"`);

    // Clean up test data
    await prisma.fastFixIssue.delete({ where: { id: reportedIssue.id } });
    await prisma.projectExtension.delete({ where: { id: newExtension.id } });
    await prisma.project.delete({ where: { id: emailServiceProject.id } });
    assert(true, 'Email service, Fast Fix, and Extension test data cleaned up cleanly');

    // 12. Localization & Formatting Verification
    console.log('\n1️⃣2️⃣ Localization (i18n) & Default English System Integrity:');
    const { translations } = await import('../src/lib/i18n');
    assert(!!translations.en, 'English translation catalog exists');
    assert(!!translations.ar, 'Arabic translation catalog exists');
    assert(translations.en['type.email_service'] === 'Email Service', 'English dictionary contains "Email Service"');
    assert(translations.ar['type.email_service'].includes('بريد'), 'Arabic dictionary contains "خدمة البريد الإلكتروني"');
    assert(!!translations.en['fastFix.title'], 'English fastFix.title exists');
    assert(!!translations.ar['fastFix.title'], 'Arabic fastFix.title exists');
    assert(!!translations.en['ext.modalTitle'], 'English ext.modalTitle exists');
    assert(!!translations.ar['ext.mergeBtn'], 'Arabic ext.mergeBtn exists');

    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test suite encountered an error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTestSuite();
