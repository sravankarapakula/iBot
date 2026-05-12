// src/constants/rolesData.js
// ─── Single source of truth for predefined roles and their stacks ───────────

export const ROLES = [
  {
    id: "FE",
    title: "Frontend Engineer",
    shortDescription: "Build pixel-perfect, performant UIs",
    category: "Engineering",
    color: "from-blue-500/25 to-cyan-500/25",
    accent: "#60a5fa",
  },
  {
    id: "BE",
    title: "Backend Engineer",
    shortDescription: "Design scalable APIs and service backends",
    category: "Engineering",
    color: "from-emerald-500/25 to-teal-500/25",
    accent: "#34d399",
  },
  {
    id: "FS",
    title: "Full Stack Developer",
    shortDescription: "Own the entire product from client to cloud",
    category: "Engineering",
    color: "from-violet-500/25 to-purple-500/25",
    accent: "#a78bfa",
  },
  {
    id: "DS",
    title: "Data Scientist",
    shortDescription: "Turn data into decisions with ML & analytics",
    category: "Data & AI",
    color: "from-pink-500/25 to-rose-500/25",
    accent: "#f472b6",
  },
  {
    id: "DEV",
    title: "DevOps Engineer",
    shortDescription: "Automate infrastructure and delivery pipelines",
    category: "Infrastructure",
    color: "from-orange-500/25 to-amber-500/25",
    accent: "#fb923c",
  },
  {
    id: "UX",
    title: "UI/UX Designer",
    shortDescription: "Craft experiences that delight and convert",
    category: "Design",
    color: "from-fuchsia-500/25 to-pink-500/25",
    accent: "#e879f9",
  },
  {
    id: "ML",
    title: "ML Engineer",
    shortDescription: "Deploy and scale machine learning models",
    category: "Data & AI",
    color: "from-indigo-500/25 to-sky-500/25",
    accent: "#818cf8",
  },
  {
    id: "MOB",
    title: "Mobile Developer",
    shortDescription: "Ship cross-platform apps for iOS and Android",
    category: "Engineering",
    color: "from-lime-500/25 to-green-500/25",
    accent: "#a3e635",
  },
];

export const STACKS = [
  // ── Frontend ────────────────────────────────────────────────────────────────
  {
    id: "FE-REACT",
    roleId: "FE",
    name: "React",
    description: "Component-driven UIs with hooks, state management & ecosystem",
    keyTools: ["React 18", "Vite", "Redux Toolkit", "React Query", "Tailwind CSS"],
    tags: ["SPA", "Hooks", "JSX"],
  },
  {
    id: "FE-ANGULAR",
    roleId: "FE",
    name: "Angular",
    description: "Enterprise-grade apps with TypeScript and opinionated structure",
    keyTools: ["Angular 17", "RxJS", "NgRx", "Angular Material", "TypeScript"],
    tags: ["Enterprise", "TypeScript", "MVC"],
  },
  {
    id: "FE-VUE",
    roleId: "FE",
    name: "Vue.js",
    description: "Progressive framework with composition API and smooth DX",
    keyTools: ["Vue 3", "Pinia", "Nuxt.js", "Vite", "Vitest"],
    tags: ["Progressive", "Composition API", "SSR"],
  },

  // ── Backend ──────────────────────────────────────────────────────────────────
  {
    id: "BE-NODE",
    roleId: "BE",
    name: "Node.js + Express",
    description: "Fast REST APIs built with JavaScript, MongoDB, and middleware",
    keyTools: ["Express.js", "MongoDB", "Mongoose", "JWT", "Jest"],
    tags: ["REST", "NoSQL", "Async"],
  },
  {
    id: "BE-SPRING",
    roleId: "BE",
    name: "Java Spring Boot",
    description: "Production-grade microservices with strong typing and DI",
    keyTools: ["Spring Boot", "Spring Security", "JPA/Hibernate", "PostgreSQL", "Maven"],
    tags: ["Microservices", "Java", "Enterprise"],
  },
  {
    id: "BE-DJANGO",
    roleId: "BE",
    name: "Django (Python)",
    description: "Batteries-included web framework with ORM and admin panel",
    keyTools: ["Django", "DRF", "PostgreSQL", "Celery", "pytest"],
    tags: ["Python", "ORM", "REST"],
  },

  // ── Full Stack ───────────────────────────────────────────────────────────────
  {
    id: "FS-MERN",
    roleId: "FS",
    name: "MERN Stack",
    description: "MongoDB, Express, React & Node — the classic JavaScript full stack",
    keyTools: ["React", "Node.js", "Express", "MongoDB", "Mongoose"],
    tags: ["JavaScript", "NoSQL", "REST"],
  },
  {
    id: "FS-MEAN",
    roleId: "FS",
    name: "MEAN Stack",
    description: "Angular-powered enterprise full stack with MongoDB",
    keyTools: ["Angular", "Node.js", "Express", "MongoDB", "TypeScript"],
    tags: ["TypeScript", "Enterprise", "NoSQL"],
  },
  {
    id: "FS-NEXTPG",
    roleId: "FS",
    name: "Next.js + PostgreSQL",
    description: "SSR/SSG React with a relational database and Prisma ORM",
    keyTools: ["Next.js 14", "Prisma", "PostgreSQL", "tRPC", "Vercel"],
    tags: ["SSR", "SQL", "Edge"],
  },

  // ── Data Scientist ───────────────────────────────────────────────────────────
  {
    id: "DS-SKLEARN",
    roleId: "DS",
    name: "Python + scikit-learn",
    description: "Classical ML — regression, classification, clustering pipelines",
    keyTools: ["Python", "scikit-learn", "Pandas", "NumPy", "Matplotlib"],
    tags: ["Classical ML", "EDA", "Pipelines"],
  },
  {
    id: "DS-TF",
    roleId: "DS",
    name: "Python + TensorFlow",
    description: "Deep learning, neural networks and model deployment",
    keyTools: ["TensorFlow 2", "Keras", "NumPy", "Jupyter", "MLflow"],
    tags: ["Deep Learning", "Neural Nets", "GPU"],
  },
  {
    id: "DS-R",
    roleId: "DS",
    name: "R + tidyverse",
    description: "Statistical computing and publication-quality visualizations",
    keyTools: ["R", "tidyverse", "ggplot2", "Shiny", "caret"],
    tags: ["Statistics", "Visualization", "R"],
  },

  // ── DevOps ───────────────────────────────────────────────────────────────────
  {
    id: "DEV-AWS",
    roleId: "DEV",
    name: "AWS + Terraform",
    description: "Cloud infrastructure as code on the most popular cloud platform",
    keyTools: ["AWS", "Terraform", "GitHub Actions", "Docker", "Kubernetes"],
    tags: ["IaC", "AWS", "CI/CD"],
  },
  {
    id: "DEV-GCP",
    roleId: "DEV",
    name: "GCP + Kubernetes",
    description: "Container orchestration and managed services on Google Cloud",
    keyTools: ["GCP", "GKE", "Helm", "ArgoCD", "Prometheus"],
    tags: ["Containers", "GCP", "GitOps"],
  },
  {
    id: "DEV-AZURE",
    roleId: "DEV",
    name: "Azure DevOps",
    description: "Microsoft ecosystem CI/CD pipelines and AKS orchestration",
    keyTools: ["Azure Pipelines", "AKS", "Bicep", "Azure Monitor", "Terraform"],
    tags: ["Azure", "Pipelines", "Enterprise"],
  },

  // ── UI/UX ────────────────────────────────────────────────────────────────────
  {
    id: "UX-FIGMA-WEB",
    roleId: "UX",
    name: "Figma — Web Design",
    description: "Design systems, responsive layouts and handoff for web products",
    keyTools: ["Figma", "Auto Layout", "Variants", "Prototyping", "FigJam"],
    tags: ["Web", "Design Systems", "Prototyping"],
  },
  {
    id: "UX-FIGMA-MOB",
    roleId: "UX",
    name: "Figma — Mobile Design",
    description: "Mobile-first UI patterns, gestures and app store guidelines",
    keyTools: ["Figma", "iOS HIG", "Material Design", "Prototyping", "Zeplin"],
    tags: ["Mobile", "iOS", "Android"],
  },
  {
    id: "UX-ADOBE",
    roleId: "UX",
    name: "Adobe XD + Illustrator",
    description: "Vector-precise design and branding for product and marketing teams",
    keyTools: ["Adobe XD", "Illustrator", "Photoshop", "InVision", "After Effects"],
    tags: ["Branding", "Vector", "Animation"],
  },

  // ── ML Engineer ──────────────────────────────────────────────────────────────
  {
    id: "ML-PYTORCH",
    roleId: "ML",
    name: "PyTorch + MLflow",
    description: "Research-to-production deep learning with experiment tracking",
    keyTools: ["PyTorch", "MLflow", "Hugging Face", "FastAPI", "Docker"],
    tags: ["Deep Learning", "Research", "Deployment"],
  },
  {
    id: "ML-SAGEMAKER",
    roleId: "ML",
    name: "AWS SageMaker",
    description: "Managed ML platform for training, deploying and monitoring models",
    keyTools: ["SageMaker", "S3", "Lambda", "CloudWatch", "Step Functions"],
    tags: ["AWS", "Managed ML", "MLOps"],
  },
  {
    id: "ML-VERTEX",
    roleId: "ML",
    name: "GCP Vertex AI",
    description: "End-to-end ML with AutoML and custom model training on GCP",
    keyTools: ["Vertex AI", "BigQuery ML", "TensorFlow", "Kubeflow", "GCS"],
    tags: ["GCP", "AutoML", "MLOps"],
  },

  // ── Mobile ───────────────────────────────────────────────────────────────────
  {
    id: "MOB-RN",
    roleId: "MOB",
    name: "React Native",
    description: "Cross-platform mobile with JavaScript and a native bridge",
    keyTools: ["React Native", "Expo", "React Navigation", "Zustand", "Firebase"],
    tags: ["Cross-platform", "JavaScript", "Expo"],
  },
  {
    id: "MOB-FLUTTER",
    roleId: "MOB",
    name: "Flutter (Dart)",
    description: "Pixel-perfect cross-platform apps from a single Dart codebase",
    keyTools: ["Flutter", "Dart", "Riverpod", "Firebase", "GetX"],
    tags: ["Cross-platform", "Dart", "Material"],
  },
  {
    id: "MOB-SWIFT",
    roleId: "MOB",
    name: "Swift (iOS Native)",
    description: "Native iOS development with SwiftUI and the Apple ecosystem",
    keyTools: ["Swift", "SwiftUI", "UIKit", "Combine", "Core Data"],
    tags: ["iOS", "Swift", "Native"],
  },
];

// Helper — get stacks for a given roleId
export function getStacksForRole(roleId) {
  return STACKS.filter((s) => s.roleId === roleId);
}

// Helper — get role by id
export function getRoleById(roleId) {
  return ROLES.find((r) => r.id === roleId) || null;
}
