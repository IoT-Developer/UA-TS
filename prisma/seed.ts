import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.$transaction([
    prisma.lessonProgress.deleteMany(),
    prisma.quizAttempt.deleteMany(),
    prisma.question.deleteMany(),
    prisma.quiz.deleteMany(),
    prisma.lesson.deleteMany(),
    prisma.module.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.certificate.deleteMany(),
    prisma.order.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.course.deleteMany(),
    prisma.category.deleteMany(),
  ]);

  // ----- Categories -----
  const [iotCat, embeddedCat, aiCat, automationCat] = await Promise.all([
    prisma.category.create({ data: { slug: 'iot', name: 'Industrial IoT', description: 'Connected sensors, gateways, and cloud platforms', order: 1 } }),
    prisma.category.create({ data: { slug: 'embedded', name: 'Embedded Systems', description: 'Microcontrollers, RTOS, firmware', order: 2 } }),
    prisma.category.create({ data: { slug: 'ai-ml', name: 'AI for Engineering', description: 'Applied ML for sensor data, vision, and control', order: 3 } }),
    prisma.category.create({ data: { slug: 'automation', name: 'Industrial Automation', description: 'PLC, SCADA, robotics, control systems', order: 4 } }),
  ]);

  // ----- Instructor -----
  const instructor = await prisma.user.upsert({
    where: { email: 'admin@unifiedautomation.in' },
    update: {},
    create: {
      clerkId: 'seed_instructor_placeholder',
      email: 'admin@unifiedautomation.in',
      name: 'Unified Automation Faculty',
      role: 'ADMIN',
    },
  });

  // ----- Course 1: Industrial IoT (4 modules, 16 lessons) -----
  await prisma.course.create({
    data: {
      slug: 'industrial-iot-esp32-node-red',
      title: 'Industrial IoT with ESP32 & Node-RED',
      subtitle: 'Build connected factory-grade sensors from scratch',
      description: 'A hands-on track that takes you from soldering your first sensor to deploying a multi-node IoT system with cloud dashboards. You will work with real hardware (ESP32, MQTT brokers, Node-RED flows) and ship a final project that monitors a simulated production line.',
      level: 'INTERMEDIATE',
      status: 'PUBLISHED',
      durationMinutes: 1860,
      lessonCount: 16,
      priceInPaise: 149900,
      mrpInPaise: 499900,
      whatYoullLearn: [
        'Wire and program ESP32 with sensors and actuators',
        'Set up MQTT brokers and design pub/sub topics',
        'Build real-time dashboards in Node-RED',
        'Deploy a multi-device IoT system end to end',
        'Handle network reliability and OTA updates',
      ],
      prerequisites: ['Basic C/C++ familiarity', 'Comfortable with breadboarding'],
      targetAudience: ['ECE/EEE students', 'Mechatronics learners', 'Hobbyists scaling up'],
      categoryId: iotCat.id,
      instructorId: instructor.id,
      publishedAt: new Date(),
      modules: {
        create: [
          {
            title: 'Foundations',
            order: 0,
            lessons: {
              create: [
                { title: 'Welcome and what we will build', type: 'VIDEO', durationSeconds: 480, isFreePreview: true, order: 0 },
                { title: 'Setting up your ESP32 toolchain', type: 'VIDEO', durationSeconds: 1320, isFreePreview: false, order: 1 },
                { title: 'Your first blink: hello hardware', type: 'VIDEO', durationSeconds: 900, isFreePreview: true, order: 2 },
                { title: 'Understanding the GPIO architecture', type: 'TEXT', durationSeconds: 600, isFreePreview: false, order: 3 },
              ],
            },
          },
          {
            title: 'Sensors and signals',
            order: 1,
            lessons: {
              create: [
                { title: 'Reading analog vs digital sensors', type: 'VIDEO', durationSeconds: 1500, isFreePreview: false, order: 0 },
                { title: 'I2C deep dive: BME280 weather sensor', type: 'VIDEO', durationSeconds: 1800, isFreePreview: false, order: 1 },
                { title: 'SPI explained with a real example', type: 'VIDEO', durationSeconds: 1620, isFreePreview: false, order: 2 },
                { title: 'Sensor datasheet reading guide', type: 'PDF', durationSeconds: 1200, isFreePreview: false, order: 3 },
              ],
            },
          },
          {
            title: 'Networking and MQTT',
            order: 2,
            lessons: {
              create: [
                { title: 'WiFi setup and reliability patterns', type: 'VIDEO', durationSeconds: 1380, isFreePreview: false, order: 0 },
                { title: 'MQTT: the language of IoT', type: 'VIDEO', durationSeconds: 1500, isFreePreview: true, order: 1 },
                { title: 'Building your first publisher', type: 'VIDEO', durationSeconds: 1800, isFreePreview: false, order: 2 },
                { title: 'Subscribe and react: completing the loop', type: 'VIDEO', durationSeconds: 1620, isFreePreview: false, order: 3 },
              ],
            },
          },
          {
            title: 'Cloud and dashboards',
            order: 3,
            lessons: {
              create: [
                { title: 'Setting up a Mosquitto broker', type: 'VIDEO', durationSeconds: 1080, isFreePreview: false, order: 0 },
                { title: 'Node-RED installation and tour', type: 'VIDEO', durationSeconds: 1320, isFreePreview: false, order: 1 },
                { title: 'Building a real-time dashboard', type: 'VIDEO', durationSeconds: 2100, isFreePreview: false, order: 2 },
                { title: 'OTA firmware updates', type: 'VIDEO', durationSeconds: 1500, isFreePreview: false, order: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // ----- Course 2: PLC Programming -----
  await prisma.course.create({
    data: {
      slug: 'plc-tia-portal-fundamentals',
      title: 'PLC Programming with Siemens TIA Portal',
      subtitle: 'Industrial automation from ladder logic to SCADA',
      description: 'Learn the language of factories. This course covers Siemens S7-1200/1500 programming, ladder logic, function blocks, HMI design, and SCADA integration — using TIA Portal simulator throughout, so you do not need physical hardware to start.',
      level: 'BEGINNER',
      status: 'PUBLISHED',
      durationMinutes: 1440,
      lessonCount: 12,
      priceInPaise: 199900,
      mrpInPaise: 599900,
      whatYoullLearn: [
        'Program Siemens PLCs in ladder, FBD, and SCL',
        'Design HMIs that operators actually understand',
        'Connect PLCs to SCADA systems',
        'Debug logic with TIA Portal simulator',
        'Apply IEC 61131-3 best practices',
      ],
      prerequisites: ['No prior PLC experience needed', 'Windows laptop for TIA Portal'],
      targetAudience: ['EEE/Mechanical students', 'Career switchers into industrial automation'],
      categoryId: automationCat.id,
      instructorId: instructor.id,
      publishedAt: new Date(),
      modules: {
        create: [
          {
            title: 'TIA Portal essentials', order: 0,
            lessons: { create: [
              { title: 'What is a PLC and why ladder logic?', type: 'VIDEO', durationSeconds: 600, isFreePreview: true, order: 0 },
              { title: 'Installing TIA Portal and first project', type: 'VIDEO', durationSeconds: 1200, isFreePreview: false, order: 1 },
              { title: 'Tags, addresses, and memory areas', type: 'VIDEO', durationSeconds: 1500, isFreePreview: false, order: 2 },
            ]},
          },
          {
            title: 'Ladder logic in depth', order: 1,
            lessons: { create: [
              { title: 'Contacts, coils, and basic combinations', type: 'VIDEO', durationSeconds: 1800, isFreePreview: false, order: 0 },
              { title: 'Timers, counters, and edge detection', type: 'VIDEO', durationSeconds: 2100, isFreePreview: false, order: 1 },
              { title: 'Function blocks and reusable logic', type: 'VIDEO', durationSeconds: 1620, isFreePreview: false, order: 2 },
            ]},
          },
          {
            title: 'HMI and SCADA integration', order: 2,
            lessons: { create: [
              { title: 'Designing operator screens', type: 'VIDEO', durationSeconds: 1800, isFreePreview: false, order: 0 },
              { title: 'Tag connection and live data', type: 'VIDEO', durationSeconds: 1500, isFreePreview: false, order: 1 },
              { title: 'Alarm management 101', type: 'VIDEO', durationSeconds: 1320, isFreePreview: false, order: 2 },
            ]},
          },
          {
            title: 'Final project', order: 3,
            lessons: { create: [
              { title: 'Bottle-filling line: requirements', type: 'TEXT', durationSeconds: 600, isFreePreview: false, order: 0 },
              { title: 'Building the PLC program', type: 'VIDEO', durationSeconds: 2700, isFreePreview: false, order: 1 },
              { title: 'Building the HMI and submitting', type: 'VIDEO', durationSeconds: 1800, isFreePreview: false, order: 2 },
            ]},
          },
        ],
      },
    },
  });

  // ----- Course 3: STM32 Embedded -----
  await prisma.course.create({
    data: {
      slug: 'embedded-c-stm32-rtos',
      title: 'Embedded C on STM32 with FreeRTOS',
      subtitle: 'Bare-metal to real-time, the right way',
      description: 'A rigorous embedded course built around STM32F4 boards. You will write peripheral drivers from scratch, then layer FreeRTOS on top to build a multi-task firmware system. Heavy focus on debugging with ST-Link and reading datasheets like an engineer.',
      level: 'INTERMEDIATE',
      status: 'PUBLISHED',
      durationMinutes: 2100,
      lessonCount: 12,
      priceInPaise: 249900,
      mrpInPaise: 699900,
      whatYoullLearn: [
        'Write GPIO, UART, SPI, I2C drivers from scratch',
        'Use HAL vs LL libraries effectively',
        'Build multi-task systems with FreeRTOS',
        'Debug with ST-Link, breakpoints, and logic analyzers',
        'Read and interpret 1000-page reference manuals',
      ],
      prerequisites: ['Solid C programming', 'Basic digital electronics'],
      targetAudience: ['ECE final-year students', 'Firmware developers leveling up'],
      categoryId: embeddedCat.id,
      instructorId: instructor.id,
      publishedAt: new Date(),
      modules: {
        create: [
          {
            title: 'Bare-metal foundations', order: 0,
            lessons: { create: [
              { title: 'STM32 architecture and clock tree', type: 'VIDEO', durationSeconds: 1800, isFreePreview: true, order: 0 },
              { title: 'Setting up STM32CubeIDE', type: 'VIDEO', durationSeconds: 1200, isFreePreview: false, order: 1 },
              { title: 'GPIO from scratch — register level', type: 'VIDEO', durationSeconds: 2400, isFreePreview: false, order: 2 },
            ]},
          },
          {
            title: 'Peripheral drivers', order: 1,
            lessons: { create: [
              { title: 'UART transmit and receive', type: 'VIDEO', durationSeconds: 2100, isFreePreview: false, order: 0 },
              { title: 'I2C driver with sensor example', type: 'VIDEO', durationSeconds: 2400, isFreePreview: false, order: 1 },
              { title: 'SPI and DMA-driven transfers', type: 'VIDEO', durationSeconds: 2700, isFreePreview: false, order: 2 },
            ]},
          },
          {
            title: 'FreeRTOS basics', order: 2,
            lessons: { create: [
              { title: 'Tasks, scheduler, and stack sizing', type: 'VIDEO', durationSeconds: 1800, isFreePreview: false, order: 0 },
              { title: 'Queues for inter-task communication', type: 'VIDEO', durationSeconds: 1620, isFreePreview: false, order: 1 },
              { title: 'Semaphores and mutexes', type: 'VIDEO', durationSeconds: 1500, isFreePreview: false, order: 2 },
            ]},
          },
          {
            title: 'Debugging like a pro', order: 3,
            lessons: { create: [
              { title: 'ST-Link, breakpoints, and watch expressions', type: 'VIDEO', durationSeconds: 1800, isFreePreview: false, order: 0 },
              { title: 'Reading the reference manual', type: 'TEXT', durationSeconds: 900, isFreePreview: false, order: 1 },
              { title: 'When the debugger lies', type: 'VIDEO', durationSeconds: 1380, isFreePreview: false, order: 2 },
            ]},
          },
        ],
      },
    },
  });

  // ----- Course 4: ML for Sensor Data -----
  await prisma.course.create({
    data: {
      slug: 'ml-for-sensor-data',
      title: 'Machine Learning for Sensor Data',
      subtitle: 'Time-series, anomaly detection, and edge inference',
      description: 'The applied ML course for engineers. We skip MNIST and Kaggle clichés — instead you work with real vibration, current, and temperature datasets to predict equipment failures, detect anomalies, and deploy models on edge devices.',
      level: 'ADVANCED',
      status: 'PUBLISHED',
      durationMinutes: 1680,
      lessonCount: 12,
      priceInPaise: 299900,
      mrpInPaise: 799900,
      whatYoullLearn: [
        'Engineer features from time-series sensor data',
        'Train and evaluate anomaly detection models',
        'Build predictive maintenance pipelines',
        'Deploy ML models on Raspberry Pi and ESP32',
        'Work with industry datasets (NASA, CWRU, MIMII)',
      ],
      prerequisites: ['Python proficiency', 'Basic linear algebra and statistics'],
      targetAudience: ['ECE/CSE students', 'Engineers transitioning to ML roles'],
      categoryId: aiCat.id,
      instructorId: instructor.id,
      publishedAt: new Date(),
      modules: {
        create: [
          {
            title: 'Time-series fundamentals', order: 0,
            lessons: { create: [
              { title: 'Why sensor data is different', type: 'VIDEO', durationSeconds: 1200, isFreePreview: true, order: 0 },
              { title: 'Resampling, smoothing, and outlier handling', type: 'VIDEO', durationSeconds: 1800, isFreePreview: false, order: 1 },
              { title: 'Feature engineering for vibration data', type: 'VIDEO', durationSeconds: 2100, isFreePreview: false, order: 2 },
            ]},
          },
          {
            title: 'Anomaly detection', order: 1,
            lessons: { create: [
              { title: 'Statistical baselines and control charts', type: 'VIDEO', durationSeconds: 1620, isFreePreview: false, order: 0 },
              { title: 'Isolation Forests and DBSCAN', type: 'VIDEO', durationSeconds: 1800, isFreePreview: false, order: 1 },
              { title: 'Autoencoders for unsupervised detection', type: 'VIDEO', durationSeconds: 2100, isFreePreview: false, order: 2 },
            ]},
          },
          {
            title: 'Predictive maintenance', order: 2,
            lessons: { create: [
              { title: 'CWRU bearing dataset deep-dive', type: 'VIDEO', durationSeconds: 1800, isFreePreview: false, order: 0 },
              { title: 'Building an RUL (remaining useful life) model', type: 'VIDEO', durationSeconds: 2700, isFreePreview: false, order: 1 },
              { title: 'Evaluating PdM models — what matters', type: 'VIDEO', durationSeconds: 1500, isFreePreview: false, order: 2 },
            ]},
          },
          {
            title: 'Edge deployment', order: 3,
            lessons: { create: [
              { title: 'TensorFlow Lite conversion and quantization', type: 'VIDEO', durationSeconds: 1800, isFreePreview: false, order: 0 },
              { title: 'Deploying to Raspberry Pi 4', type: 'VIDEO', durationSeconds: 2100, isFreePreview: false, order: 1 },
              { title: 'TF-Lite Micro on ESP32', type: 'VIDEO', durationSeconds: 1800, isFreePreview: false, order: 2 },
            ]},
          },
        ],
      },
    },
  });

  console.log('✅ Seeded 4 categories, 1 instructor, 4 published courses with full curriculum');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
