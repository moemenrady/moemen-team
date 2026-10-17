import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.payment.deleteMany();
  await prisma.note.deleteMany();
  await prisma.projectStage.deleteMany();
  await prisma.task.deleteMany();
  await prisma.document.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');
  const demoPassword = await bcrypt.hash('demo1234', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Client user (Ahmed Youssef)
  const clientUser = await prisma.user.create({
    data: {
      id: 'usr_ahmed',
      name: 'Ahmed Youssef',
      email: 'ahmed@cairofresh.eg',
      password: demoPassword,
      role: 'CLIENT',
      initials: 'AY',
      company: 'Cairo Fresh Market',
      clientSince: 'Nov 2025',
    },
  });

  // Admin user
  const adminUser = await prisma.user.create({
    data: {
      id: 'usr_admin',
      name: 'Moemen',
      email: 'admin@moemen-team.tech',
      password: adminPassword,
      role: 'ADMIN',
      initials: 'MT',
      company: 'Moemen Team',
      clientSince: 'Jan 2022',
    },
  });

  // Manager user
  const managerUser = await prisma.user.create({
    data: {
      id: 'usr_manager',
      name: 'Mohamed Adel',
      email: 'manager@moemen-team.tech',
      password: adminPassword,
      role: 'MANAGER',
      initials: 'MA',
      company: 'Moemen Team',
    },
  });

  console.log('Creating clients...');
  const clientCairoFresh = await prisma.client.create({
    data: {
      id: 'cli_cairofresh',
      name: 'Ahmed Youssef',
      email: 'ahmed@cairofresh.eg',
      company: 'Cairo Fresh Market',
      userId: clientUser.id,
    },
  });

  const clientBrolosy = await prisma.client.create({
    data: {
      id: 'cli_brolosy',
      name: 'البرلسي للتطوير العقاري',
      company: 'Al-Brolosy Real Estate Development',
    },
  });

  const clientFokus = await prisma.client.create({
    data: {
      id: 'cli_fokus',
      name: 'FOKUS Workspace & Cafe',
      company: 'FOKUS Workspace',
    },
  });

  console.log('Creating projects with full details...');

  // Project 1: Cairo Fresh Market
  const p1 = await prisma.project.create({
    data: {
      id: 'p1',
      name: 'Cairo Fresh Market — E-Commerce Platform',
      type: 'website',
      status: 'in_progress',
      progress: 64,
      description: 'Full e-commerce platform with online ordering, delivery-slot booking and inventory management across four branches.',
      contractDate: '2026-06-01',
      contractStatus: 'Active',
      totalDays: 130,
      budget: 180000,
      paid: 120000,
      versionLabel: 'v0.9 Beta',
      versionNote: 'Last updated Aug 18, 2026',
      clientId: clientCairoFresh.id,
      quotationItems: JSON.stringify([
        { item: 'Discovery & UX Research', amount: 15000 },
        { item: 'UI/UX Design', amount: 25000 },
        { item: 'Frontend Development', amount: 55000 },
        { item: 'Backend & Database', amount: 50000 },
        { item: 'Payment Gateway Integration', amount: 20000 },
        { item: 'QA & Deployment', amount: 15000 },
      ]),
      stages: {
        create: [
          { name: 'Discovery', status: 'done', order: 1 },
          { name: 'Design', status: 'done', order: 2 },
          { name: 'Development', status: 'current', order: 3 },
          { name: 'Testing', status: 'pending', order: 4 },
          { name: 'Launch', status: 'pending', order: 5 },
        ],
      },
      payments: {
        create: [
          { date: '2026-06-03', amount: 90000, method: 'Bank Transfer', note: 'Deposit (50%) — Discovery & Design' },
          { date: '2026-07-25', amount: 30000, method: 'InstaPay', note: 'Milestone 2 — Design approved' },
        ],
      },
      notes: {
        create: [
          { author: 'team', text: 'Design phase approved. Moving into frontend development this week.', createdAt: new Date('2026-07-26') },
          { author: 'client', text: 'Looks great! Can we add Arabic language support to the checkout page?', createdAt: new Date('2026-07-27') },
          { author: 'team', text: 'Great idea, added to scope for the next sprint at no extra cost.', createdAt: new Date('2026-07-28') },
        ],
      },
    },
  });

  // Project 2: Nile Logistics
  const p2 = await prisma.project.create({
    data: {
      id: 'p2',
      name: 'Nile Logistics — Dispatch Automation',
      type: 'automation',
      status: 'in_review',
      progress: 34,
      description: 'Automated dispatch and route optimization system integrating with the existing fleet-tracking platform.',
      contractDate: '2026-07-20',
      contractStatus: 'Active',
      totalDays: 70,
      budget: 95000,
      paid: 47500,
      versionLabel: 'Wireframes v1',
      versionNote: 'First interactive preview coming soon',
      clientId: clientCairoFresh.id,
      quotationItems: JSON.stringify([
        { item: 'Workflow Mapping & Requirements', amount: 12000 },
        { item: 'Automation Engine Development', amount: 43000 },
        { item: 'Fleet API Integration', amount: 25000 },
        { item: 'Testing & Handover', amount: 15000 },
      ]),
      stages: {
        create: [
          { name: 'Discovery', status: 'done', order: 1 },
          { name: 'Design', status: 'current', order: 2 },
          { name: 'Development', status: 'pending', order: 3 },
          { name: 'Testing', status: 'pending', order: 4 },
          { name: 'Launch', status: 'pending', order: 5 },
        ],
      },
      payments: {
        create: [
          { date: '2026-07-22', amount: 47500, method: 'Vodafone Cash', note: 'Deposit (50%) to begin project' },
        ],
      },
      notes: {
        create: [
          { author: 'client', text: 'Can the dashboard show driver locations in real time?', createdAt: new Date('2026-08-05') },
          { author: 'team', text: 'Yes, live GPS tracking is included in the fleet integration phase.', createdAt: new Date('2026-08-06') },
        ],
      },
    },
  });

  // Project 3: Zamalek Dental Studio
  const p3 = await prisma.project.create({
    data: {
      id: 'p3',
      name: 'Zamalek Dental Studio — Booking App',
      type: 'mobile',
      status: 'completed',
      progress: 100,
      description: 'Patient booking and reminders app for a multi-doctor dental clinic, with push notifications and calendar sync.',
      contractDate: '2025-11-15',
      contractStatus: 'Completed',
      totalDays: 78,
      budget: 140000,
      paid: 140000,
      versionLabel: 'Final Release — v1.0',
      versionNote: 'Live on the App Store & Google Play',
      clientId: clientCairoFresh.id,
      quotationItems: JSON.stringify([
        { item: 'Discovery & UX', amount: 12000 },
        { item: 'UI Design (iOS/Android)', amount: 23000 },
        { item: 'App Development', amount: 65000 },
        { item: 'Push Notifications & Calendar Sync', amount: 25000 },
        { item: 'QA, App Store & Play Store Deployment', amount: 15000 },
      ]),
      stages: {
        create: [
          { name: 'Discovery', status: 'done', order: 1 },
          { name: 'Design', status: 'done', order: 2 },
          { name: 'Development', status: 'done', order: 3 },
          { name: 'Testing', status: 'done', order: 4 },
          { name: 'Launch', status: 'done', order: 5 },
        ],
      },
      payments: {
        create: [
          { date: '2025-11-18', amount: 70000, method: 'Bank Transfer', note: 'Deposit (50%)' },
          { date: '2026-01-10', amount: 50000, method: 'InstaPay', note: 'Milestone — Beta delivered' },
          { date: '2026-02-01', amount: 20000, method: 'Bank Transfer', note: 'Final payment on delivery' },
        ],
      },
      notes: {
        create: [
          { author: 'team', text: 'Final version delivered and live on both app stores!', createdAt: new Date('2026-02-01') },
          { author: 'client', text: 'Amazing work, thank you team!', createdAt: new Date('2026-02-03') },
        ],
      },
    },
  });

  // Project 4: Alexandria Textiles
  const p4 = await prisma.project.create({
    data: {
      id: 'p4',
      name: 'Alexandria Textiles — Inventory Desktop System',
      type: 'desktop',
      status: 'requested',
      progress: 0,
      description: 'Custom desktop application for inventory and production tracking across two factory floors.',
      requestDate: '2026-08-18',
      clientId: clientCairoFresh.id,
      notes: {
        create: [
          { author: 'client', text: 'We would love this to also print daily production reports automatically.', createdAt: new Date('2026-08-18') },
        ],
      },
    },
  });

  // Project 5: Al-Brolosy Digital Platform V1
  await prisma.project.create({
    data: {
      id: 'p5',
      name: 'Al-Brolosy Digital Platform V1',
      type: 'website',
      status: 'in_progress',
      progress: 70,
      description: 'Real estate development portal with interactive maps, unit availability and automated WhatsApp reservations.',
      contractDate: '2026-07-01',
      contractStatus: 'Active',
      totalDays: 90,
      budget: 75000,
      paid: 50000,
      versionLabel: 'v1.2 Staging',
      versionNote: 'Testing WhatsApp booking engine',
      clientId: clientBrolosy.id,
      quotationItems: JSON.stringify([
        { item: 'Featured Project Section', amount: 15000 },
        { item: 'Unit Types Management', amount: 20000 },
        { item: 'WhatsApp Booking', amount: 10000 },
        { item: 'Location-based Journey', amount: 30000 },
      ]),
      stages: {
        create: [
          { name: 'Discovery', status: 'done', order: 1 },
          { name: 'Design', status: 'done', order: 2 },
          { name: 'Development', status: 'current', order: 3 },
          { name: 'Testing', status: 'pending', order: 4 },
          { name: 'Launch', status: 'pending', order: 5 },
        ],
      },
      payments: {
        create: [
          { date: '2026-07-05', amount: 50000, method: 'Bank Transfer', note: 'Initial milestone' },
        ],
      },
      notes: {
        create: [
          { author: 'team', text: 'Location-based filtering deployed to staging.', createdAt: new Date('2026-08-10') },
        ],
      },
    },
  });

  // Project 6: FOKUS Management System
  await prisma.project.create({
    data: {
      id: 'p6',
      name: 'FOKUS Management System',
      type: 'desktop',
      status: 'in_progress',
      progress: 50,
      description: 'Hybrid cloud ERP and native desktop application with silent receipt printing and cash drawer hardware integration.',
      contractDate: '2026-08-01',
      contractStatus: 'Active',
      totalDays: 60,
      budget: 200000,
      paid: 100000,
      versionLabel: 'v0.5 Desktop Release',
      versionNote: 'Thermal printer driver connected',
      clientId: clientFokus.id,
      quotationItems: JSON.stringify([
        { item: 'Cloud ERP Core (12 Modules)', amount: 130000 },
        { item: 'Desktop Reception & Hardware Layer', amount: 50000 },
        { item: 'Workspace & Meeting Room Modules', amount: 45000 },
      ]),
      stages: {
        create: [
          { name: 'Discovery', status: 'done', order: 1 },
          { name: 'Design', status: 'done', order: 2 },
          { name: 'Development', status: 'current', order: 3 },
          { name: 'Testing', status: 'pending', order: 4 },
          { name: 'Launch', status: 'pending', order: 5 },
        ],
      },
      payments: {
        create: [
          { date: '2026-08-02', amount: 100000, method: 'Bank Transfer', note: 'Deposit (50%)' },
        ],
      },
      notes: {
        create: [
          { author: 'team', text: 'Hardware integration testing scheduled for next week.', createdAt: new Date('2026-08-14') },
        ],
      },
    },
  });

  console.log('Database seeded with complete Moemen Team projects & clients!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
