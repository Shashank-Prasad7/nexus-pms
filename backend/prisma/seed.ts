import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with sample test data...');

  // Create demo user
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  const testUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Alex Johnson',
      password: passwordHash,
    },
  });

  console.log(`👤 Demo User created: ${testUser.email} / Password123!`);

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Cloud Platform Migration',
      description: 'Migrating legacy on-prem services to AWS and containerized microservices.',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-06-30'),
      userId: testUser.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Redesign',
      description: 'Revamping the customer-facing mobile UI/UX with modern glassmorphism aesthetic.',
      status: 'NOT_STARTED',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-08-15'),
      userId: testUser.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Annual Security Audit',
      description: 'Comprehensive penetration testing, dependency auditing, and compliance verification.',
      status: 'COMPLETED',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-02-28'),
      userId: testUser.id,
    },
  });

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        name: 'Configure Terraform scripts for VPC',
        description: 'Set up multi-AZ VPC, subnets, and security groups.',
        priority: 'HIGH',
        status: 'COMPLETED',
        dueDate: new Date('2026-02-10'),
        projectId: project1.id,
        userId: testUser.id,
      },
      {
        name: 'Set up Kubernetes cluster',
        description: 'Deploy EKS cluster with autoscaling node groups.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: new Date('2026-04-20'),
        projectId: project1.id,
        userId: testUser.id,
      },
      {
        name: 'Migrate PostgreSQL database',
        description: 'Execute zero-downtime database replication and verification.',
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: new Date('2026-05-15'),
        projectId: project1.id,
        userId: testUser.id,
      },
      {
        name: 'Design high-fidelity Figma prototypes',
        description: 'Complete wireframes and component library tokens.',
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: new Date('2026-04-25'),
        projectId: project2.id,
        userId: testUser.id,
      },
      {
        name: 'Run SAST and DAST vulnerability scan',
        description: 'Automated vulnerability analysis across all repositories.',
        priority: 'HIGH',
        status: 'COMPLETED',
        dueDate: new Date('2026-01-20'),
        projectId: project3.id,
        userId: testUser.id,
      },
      {
        name: 'Resolve critical CVE findings',
        description: 'Update vulnerable NPM packages and container base images.',
        priority: 'HIGH',
        status: 'COMPLETED',
        dueDate: new Date('2026-02-15'),
        projectId: project3.id,
        userId: testUser.id,
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
