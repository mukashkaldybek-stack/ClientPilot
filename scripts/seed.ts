import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SQLite database with initial ClientPilot records...');

  // Clean existing records
  await prisma.invoice.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();

  // Create Clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Acme Global Corp',
      email: 'billing@acmeglobal.com',
      company: 'Acme Global Inc',
      hourlyRate: 150.0,
      currency: 'USD',
      address: '100 Market Street, San Francisco, CA 94105',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Lumina Design Studio',
      email: 'hello@luminastudio.io',
      company: 'Lumina Creative LLC',
      hourlyRate: 135.0,
      currency: 'USD',
      address: '450 Broadway, Suite 400, New York, NY 10013',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'HyperScale AI Lab',
      email: 'partners@hyperscale.ai',
      company: 'HyperScale Technologies Inc',
      hourlyRate: 180.0,
      currency: 'USD',
      address: '22 Bishopsgate, London EC2N 4BQ, United Kingdom',
    },
  });

  console.log(`Created 3 clients: ${client1.name}, ${client2.name}, ${client3.name}`);

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      clientId: client1.id,
      name: 'Cloud Infrastructure Migration',
      description: 'Kubernetes cluster deployment, Terraform IaC, and zero-downtime DB migration.',
      hourlyRate: 150.0,
      status: 'active',
    },
  });

  const project2 = await prisma.project.create({
    data: {
      clientId: client2.id,
      name: 'Design System & Component Library',
      description: 'Next.js + Tailwind React component library documentation and accessibility testing.',
      hourlyRate: 135.0,
      status: 'active',
    },
  });

  const project3 = await prisma.project.create({
    data: {
      clientId: client3.id,
      name: 'Model Fine-Tuning Pipeline & API',
      description: 'FastAPI streaming gateway, token rate limiter, and vector search embeddings.',
      hourlyRate: 180.0,
      status: 'in_review',
    },
  });

  console.log(`Created 3 projects: ${project1.name}, ${project2.name}, ${project3.name}`);

  // Create Time Entries
  const entry1 = await prisma.timeEntry.create({
    data: {
      projectId: project1.id,
      description: 'Implemented automated Helm charts and ingress routing',
      startTime: new Date(Date.now() - 3 * 3600000),
      endTime: new Date(Date.now() - 1 * 3600000),
      durationSeconds: 7200,
      isActive: false,
      isBilled: false,
    },
  });

  const entry2 = await prisma.timeEntry.create({
    data: {
      projectId: project2.id,
      description: 'Built accessible modal dialog and dropdown components',
      startTime: new Date(Date.now() - 6 * 3600000),
      endTime: new Date(Date.now() - 3.5 * 3600000),
      durationSeconds: 9000,
      isActive: false,
      isBilled: false,
    },
  });

  console.log('Created 2 initial completed time entries.');

  // Create Sample Invoice
  const lineItems = [
    {
      id: 'li_seed_1',
      description: 'VPC Peering and Terraform state backend setup',
      hours: 6.5,
      rate: 150.0,
      amount: 975.0,
    },
    {
      id: 'li_seed_2',
      description: 'CI/CD runner deployment in private subnet',
      hours: 6.0,
      rate: 150.0,
      amount: 900.0,
    },
  ];

  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-001',
      projectId: project1.id,
      clientId: client1.id,
      clientName: client1.name,
      clientAddress: client1.address,
      clientEmail: client1.email,
      issueDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'paid',
      totalHours: 12.5,
      hourlyRate: 150.0,
      totalAmount: 1875.0,
      currency: 'USD',
      lineItemsJson: JSON.stringify(lineItems),
      notes: 'Payment received via Wire Transfer. Thank you for your partnership!',
    },
  });

  console.log(`Created sample invoice: ${invoice1.invoiceNumber} ($${invoice1.totalAmount})`);
  console.log('✅ SQLite Database successfully seeded!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
