/**
 * Preset tech-stack catalog for course pages.
 *
 * iconUrl uses devicon (https://devicon.dev) — MIT-licensed, CDN-hosted, free.
 * Some entries fall back to simpleicons.org for tools devicon doesn't cover.
 * For absolutely custom logos (uploaded by admin), the slug starts with "custom:"
 * and iconUrl points to a Cloudinary URL.
 */

export interface TechStackItem {
  slug: string;
  name: string;
  iconUrl: string;
  category: TechCategory;
}

export type TechCategory =
  | 'embedded'
  | 'industrial'
  | 'language'
  | 'ai'
  | 'web'
  | 'iot'
  | 'robotics'
  | 'tools'
  | 'india';

const DEVICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';
const SIMPLEICONS_BASE = 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons';

function devicon(slug: string, variant: string = 'original'): string {
  return `${DEVICON_BASE}/${slug}/${slug}-${variant}.svg`;
}

function simpleicon(slug: string): string {
  return `${SIMPLEICONS_BASE}/${slug}.svg`;
}

export const TECH_STACKS: TechStackItem[] = [
  // 🔌 Embedded & Hardware
  { slug: 'arduino', name: 'Arduino', iconUrl: devicon('arduino'), category: 'embedded' },
  { slug: 'esp32', name: 'ESP32', iconUrl: simpleicon('espressif'), category: 'embedded' },
  { slug: 'raspberrypi', name: 'Raspberry Pi', iconUrl: devicon('raspberrypi'), category: 'embedded' },
  { slug: 'stm32', name: 'STM32', iconUrl: simpleicon('stmicroelectronics'), category: 'embedded' },
  { slug: 'pic', name: 'PIC MCU', iconUrl: simpleicon('microchiptechnology'), category: 'embedded' },
  { slug: 'freertos', name: 'FreeRTOS', iconUrl: simpleicon('freebsd'), category: 'embedded' },
  { slug: 'embedded-c', name: 'Embedded C', iconUrl: devicon('c'), category: 'embedded' },
  { slug: 'kicad', name: 'KiCad', iconUrl: simpleicon('kicad'), category: 'embedded' },
  { slug: 'proteus', name: 'Proteus', iconUrl: simpleicon('labview'), category: 'embedded' },
  { slug: 'nodered', name: 'Node-RED', iconUrl: simpleicon('nodered'), category: 'embedded' },

  // 🛠️ Industrial Automation
  { slug: 'plc', name: 'PLC', iconUrl: simpleicon('rockwellautomation'), category: 'industrial' },
  { slug: 'ladder-logic', name: 'Ladder Logic', iconUrl: simpleicon('codeblocks'), category: 'industrial' },
  { slug: 'scada', name: 'SCADA', iconUrl: simpleicon('grafana'), category: 'industrial' },
  { slug: 'siemens', name: 'Siemens TIA', iconUrl: simpleicon('siemens'), category: 'industrial' },
  { slug: 'modbus', name: 'Modbus', iconUrl: simpleicon('opensearch'), category: 'industrial' },

  // 💻 Programming Languages
  { slug: 'c', name: 'C', iconUrl: devicon('c'), category: 'language' },
  { slug: 'cpp', name: 'C++', iconUrl: devicon('cplusplus'), category: 'language' },
  { slug: 'python', name: 'Python', iconUrl: devicon('python'), category: 'language' },
  { slug: 'java', name: 'Java', iconUrl: devicon('java'), category: 'language' },
  { slug: 'javascript', name: 'JavaScript', iconUrl: devicon('javascript'), category: 'language' },
  { slug: 'typescript', name: 'TypeScript', iconUrl: devicon('typescript'), category: 'language' },
  { slug: 'go', name: 'Go', iconUrl: devicon('go'), category: 'language' },
  { slug: 'rust', name: 'Rust', iconUrl: devicon('rust'), category: 'language' },
  { slug: 'kotlin', name: 'Kotlin', iconUrl: devicon('kotlin'), category: 'language' },
  { slug: 'swift', name: 'Swift', iconUrl: devicon('swift'), category: 'language' },
  { slug: 'csharp', name: 'C#', iconUrl: devicon('csharp'), category: 'language' },
  { slug: 'matlab', name: 'MATLAB', iconUrl: devicon('matlab'), category: 'language' },

  // 🧠 AI & Machine Learning
  { slug: 'tensorflow', name: 'TensorFlow', iconUrl: devicon('tensorflow'), category: 'ai' },
  { slug: 'pytorch', name: 'PyTorch', iconUrl: devicon('pytorch'), category: 'ai' },
  { slug: 'sklearn', name: 'scikit-learn', iconUrl: devicon('scikitlearn'), category: 'ai' },
  { slug: 'pandas', name: 'Pandas', iconUrl: devicon('pandas'), category: 'ai' },
  { slug: 'numpy', name: 'NumPy', iconUrl: devicon('numpy'), category: 'ai' },
  { slug: 'jupyter', name: 'Jupyter', iconUrl: devicon('jupyter'), category: 'ai' },
  { slug: 'opencv', name: 'OpenCV', iconUrl: devicon('opencv'), category: 'ai' },
  { slug: 'keras', name: 'Keras', iconUrl: simpleicon('keras'), category: 'ai' },

  // 🌐 Web & Backend
  { slug: 'react', name: 'React', iconUrl: devicon('react'), category: 'web' },
  { slug: 'nextjs', name: 'Next.js', iconUrl: devicon('nextjs', 'plain'), category: 'web' },
  { slug: 'nodejs', name: 'Node.js', iconUrl: devicon('nodejs'), category: 'web' },
  { slug: 'express', name: 'Express', iconUrl: devicon('express', 'original'), category: 'web' },
  { slug: 'flask', name: 'Flask', iconUrl: devicon('flask'), category: 'web' },
  { slug: 'django', name: 'Django', iconUrl: devicon('django', 'plain'), category: 'web' },
  { slug: 'nestjs', name: 'NestJS', iconUrl: devicon('nestjs'), category: 'web' },
  { slug: 'tailwind', name: 'Tailwind CSS', iconUrl: devicon('tailwindcss', 'plain'), category: 'web' },
  { slug: 'vue', name: 'Vue', iconUrl: devicon('vuejs'), category: 'web' },
  { slug: 'mongodb', name: 'MongoDB', iconUrl: devicon('mongodb'), category: 'web' },

  // 📡 IoT & Cloud
  { slug: 'mqtt', name: 'MQTT', iconUrl: simpleicon('mqtt'), category: 'iot' },
  { slug: 'aws', name: 'AWS', iconUrl: devicon('amazonwebservices', 'plain-wordmark'), category: 'iot' },
  { slug: 'azure', name: 'Azure', iconUrl: devicon('azure'), category: 'iot' },
  { slug: 'googlecloud', name: 'Google Cloud', iconUrl: devicon('googlecloud'), category: 'iot' },
  { slug: 'firebase', name: 'Firebase', iconUrl: devicon('firebase', 'plain'), category: 'iot' },
  { slug: 'thingsboard', name: 'ThingsBoard', iconUrl: simpleicon('thingiverse'), category: 'iot' },
  { slug: 'homeassistant', name: 'Home Assistant', iconUrl: simpleicon('homeassistant'), category: 'iot' },
  { slug: 'grafana', name: 'Grafana', iconUrl: devicon('grafana'), category: 'iot' },

  // 🤖 Robotics
  { slug: 'ros', name: 'ROS', iconUrl: simpleicon('ros'), category: 'robotics' },
  { slug: 'gazebo', name: 'Gazebo', iconUrl: simpleicon('googlegemini'), category: 'robotics' },
  { slug: 'unity', name: 'Unity (sim)', iconUrl: devicon('unity'), category: 'robotics' },
  { slug: 'solidworks', name: 'SolidWorks', iconUrl: simpleicon('dassaultsystemes'), category: 'robotics' },

  // 🛢️ Tools & DevOps
  { slug: 'git', name: 'Git', iconUrl: devicon('git'), category: 'tools' },
  { slug: 'github', name: 'GitHub', iconUrl: devicon('github'), category: 'tools' },
  { slug: 'docker', name: 'Docker', iconUrl: devicon('docker'), category: 'tools' },
  { slug: 'vscode', name: 'VS Code', iconUrl: devicon('vscode'), category: 'tools' },
  { slug: 'linux', name: 'Linux', iconUrl: devicon('linux'), category: 'tools' },
  { slug: 'postgresql', name: 'PostgreSQL', iconUrl: devicon('postgresql'), category: 'tools' },

  // 🇮🇳 India-focused / college-popular tools
  { slug: 'tinkercad', name: 'TinkerCad', iconUrl: simpleicon('tinkercad'), category: 'india' },
  { slug: 'proteus-vsm', name: 'Proteus VSM', iconUrl: simpleicon('proteus'), category: 'india' },
  { slug: 'mplab', name: 'MPLAB X', iconUrl: simpleicon('microchiptechnology'), category: 'india' },
  { slug: 'fusion360', name: 'Fusion 360', iconUrl: simpleicon('autodesk'), category: 'india' },
  { slug: 'ansys', name: 'ANSYS', iconUrl: simpleicon('ansys'), category: 'india' },
];

export const CATEGORY_LABELS: Record<TechCategory, string> = {
  embedded: 'Embedded & Hardware',
  industrial: 'Industrial Automation',
  language: 'Programming Languages',
  ai: 'AI & Machine Learning',
  web: 'Web & Backend',
  iot: 'IoT & Cloud',
  robotics: 'Robotics',
  tools: 'Tools & DevOps',
  india: 'India-focused',
};

/**
 * Stored tech stack on a course is a JSON array of these.
 * For presets, slug matches one in TECH_STACKS.
 * For custom uploads, slug starts with "custom:" and iconUrl is a Cloudinary URL.
 */
export interface StoredTechStack {
  slug: string;
  name: string;
  iconUrl: string;
}

export function findTechStack(slug: string): TechStackItem | undefined {
  return TECH_STACKS.find((t) => t.slug === slug);
}

export function isCustomTechStack(slug: string): boolean {
  return slug.startsWith('custom:');
}
