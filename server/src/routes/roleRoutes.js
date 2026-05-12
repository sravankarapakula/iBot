// server/src/routes/roleRoutes.js
import express from "express";
import UserSelection from "../models/userSelection.model.js";

const router = express.Router();

// ─── In-memory role + stack data (mirrors client constants/rolesData.js) ─────
const ROLES = [
  { id: "FE",  title: "Frontend Engineer",    shortDescription: "Build pixel-perfect, performant UIs",                category: "Engineering"    },
  { id: "BE",  title: "Backend Engineer",     shortDescription: "Design scalable APIs and service backends",           category: "Engineering"    },
  { id: "FS",  title: "Full Stack Developer", shortDescription: "Own the entire product from client to cloud",         category: "Engineering"    },
  { id: "DS",  title: "Data Scientist",       shortDescription: "Turn data into decisions with ML & analytics",        category: "Data & AI"      },
  { id: "DEV", title: "DevOps Engineer",      shortDescription: "Automate infrastructure and delivery pipelines",      category: "Infrastructure" },
  { id: "UX",  title: "UI/UX Designer",       shortDescription: "Craft experiences that delight and convert",          category: "Design"         },
  { id: "ML",  title: "ML Engineer",          shortDescription: "Deploy and scale machine learning models",            category: "Data & AI"      },
  { id: "MOB", title: "Mobile Developer",     shortDescription: "Ship cross-platform apps for iOS and Android",        category: "Engineering"    },
];

const STACKS = [
  // Frontend
  { id: "FE-REACT",    roleId: "FE",  name: "React",                  description: "Component-driven UIs with hooks, state management & ecosystem",     keyTools: ["React 18","Vite","Redux Toolkit","React Query","Tailwind CSS"],         tags: ["SPA","Hooks","JSX"] },
  { id: "FE-ANGULAR",  roleId: "FE",  name: "Angular",                description: "Enterprise-grade apps with TypeScript and opinionated structure",    keyTools: ["Angular 17","RxJS","NgRx","Angular Material","TypeScript"],             tags: ["Enterprise","TypeScript","MVC"] },
  { id: "FE-VUE",      roleId: "FE",  name: "Vue.js",                 description: "Progressive framework with composition API and smooth DX",           keyTools: ["Vue 3","Pinia","Nuxt.js","Vite","Vitest"],                              tags: ["Progressive","Composition API","SSR"] },
  // Backend
  { id: "BE-NODE",     roleId: "BE",  name: "Node.js + Express",      description: "Fast REST APIs built with JavaScript, MongoDB, and middleware",      keyTools: ["Express.js","MongoDB","Mongoose","JWT","Jest"],                         tags: ["REST","NoSQL","Async"] },
  { id: "BE-SPRING",   roleId: "BE",  name: "Java Spring Boot",       description: "Production-grade microservices with strong typing and DI",           keyTools: ["Spring Boot","Spring Security","JPA/Hibernate","PostgreSQL","Maven"],   tags: ["Microservices","Java","Enterprise"] },
  { id: "BE-DJANGO",   roleId: "BE",  name: "Django (Python)",        description: "Batteries-included web framework with ORM and admin panel",          keyTools: ["Django","DRF","PostgreSQL","Celery","pytest"],                          tags: ["Python","ORM","REST"] },
  // Full Stack
  { id: "FS-MERN",     roleId: "FS",  name: "MERN Stack",             description: "MongoDB, Express, React & Node — the classic JS full stack",        keyTools: ["React","Node.js","Express","MongoDB","Mongoose"],                       tags: ["JavaScript","NoSQL","REST"] },
  { id: "FS-MEAN",     roleId: "FS",  name: "MEAN Stack",             description: "Angular-powered enterprise full stack with MongoDB",                 keyTools: ["Angular","Node.js","Express","MongoDB","TypeScript"],                   tags: ["TypeScript","Enterprise","NoSQL"] },
  { id: "FS-NEXTPG",   roleId: "FS",  name: "Next.js + PostgreSQL",   description: "SSR/SSG React with a relational database and Prisma ORM",           keyTools: ["Next.js 14","Prisma","PostgreSQL","tRPC","Vercel"],                     tags: ["SSR","SQL","Edge"] },
  // Data Scientist
  { id: "DS-SKLEARN",  roleId: "DS",  name: "Python + scikit-learn",  description: "Classical ML — regression, classification, clustering pipelines",   keyTools: ["Python","scikit-learn","Pandas","NumPy","Matplotlib"],                  tags: ["Classical ML","EDA","Pipelines"] },
  { id: "DS-TF",       roleId: "DS",  name: "Python + TensorFlow",    description: "Deep learning, neural networks and model deployment",               keyTools: ["TensorFlow 2","Keras","NumPy","Jupyter","MLflow"],                      tags: ["Deep Learning","Neural Nets","GPU"] },
  { id: "DS-R",        roleId: "DS",  name: "R + tidyverse",          description: "Statistical computing and publication-quality visualizations",       keyTools: ["R","tidyverse","ggplot2","Shiny","caret"],                              tags: ["Statistics","Visualization","R"] },
  // DevOps
  { id: "DEV-AWS",     roleId: "DEV", name: "AWS + Terraform",        description: "Cloud infrastructure as code on the most popular cloud platform",   keyTools: ["AWS","Terraform","GitHub Actions","Docker","Kubernetes"],               tags: ["IaC","AWS","CI/CD"] },
  { id: "DEV-GCP",     roleId: "DEV", name: "GCP + Kubernetes",       description: "Container orchestration and managed services on Google Cloud",      keyTools: ["GCP","GKE","Helm","ArgoCD","Prometheus"],                               tags: ["Containers","GCP","GitOps"] },
  { id: "DEV-AZURE",   roleId: "DEV", name: "Azure DevOps",           description: "Microsoft ecosystem CI/CD pipelines and AKS orchestration",         keyTools: ["Azure Pipelines","AKS","Bicep","Azure Monitor","Terraform"],            tags: ["Azure","Pipelines","Enterprise"] },
  // UX
  { id: "UX-FIGMA-WEB",roleId: "UX",  name: "Figma — Web Design",     description: "Design systems, responsive layouts and handoff for web products",   keyTools: ["Figma","Auto Layout","Variants","Prototyping","FigJam"],               tags: ["Web","Design Systems","Prototyping"] },
  { id: "UX-FIGMA-MOB",roleId: "UX",  name: "Figma — Mobile Design",  description: "Mobile-first UI, gestures and app store guidelines",               keyTools: ["Figma","iOS HIG","Material Design","Prototyping","Zeplin"],            tags: ["Mobile","iOS","Android"] },
  { id: "UX-ADOBE",    roleId: "UX",  name: "Adobe XD + Illustrator", description: "Vector-precise design and branding for product & marketing",        keyTools: ["Adobe XD","Illustrator","Photoshop","InVision","After Effects"],       tags: ["Branding","Vector","Animation"] },
  // ML Engineer
  { id: "ML-PYTORCH",  roleId: "ML",  name: "PyTorch + MLflow",       description: "Research-to-production deep learning with experiment tracking",     keyTools: ["PyTorch","MLflow","Hugging Face","FastAPI","Docker"],                   tags: ["Deep Learning","Research","Deployment"] },
  { id: "ML-SAGEMAKER",roleId: "ML",  name: "AWS SageMaker",          description: "Managed ML platform for training, deploying and monitoring models", keyTools: ["SageMaker","S3","Lambda","CloudWatch","Step Functions"],                tags: ["AWS","Managed ML","MLOps"] },
  { id: "ML-VERTEX",   roleId: "ML",  name: "GCP Vertex AI",          description: "End-to-end ML with AutoML and custom training on GCP",              keyTools: ["Vertex AI","BigQuery ML","TensorFlow","Kubeflow","GCS"],                tags: ["GCP","AutoML","MLOps"] },
  // Mobile
  { id: "MOB-RN",      roleId: "MOB", name: "React Native",           description: "Cross-platform mobile with JavaScript and a native bridge",         keyTools: ["React Native","Expo","React Navigation","Zustand","Firebase"],          tags: ["Cross-platform","JavaScript","Expo"] },
  { id: "MOB-FLUTTER", roleId: "MOB", name: "Flutter (Dart)",         description: "Pixel-perfect cross-platform apps from a single Dart codebase",    keyTools: ["Flutter","Dart","Riverpod","Firebase","GetX"],                          tags: ["Cross-platform","Dart","Material"] },
  { id: "MOB-SWIFT",   roleId: "MOB", name: "Swift (iOS Native)",     description: "Native iOS development with SwiftUI and the Apple ecosystem",       keyTools: ["Swift","SwiftUI","UIKit","Combine","Core Data"],                        tags: ["iOS","Swift","Native"] },
];

// ─── GET /api/roles ─────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  res.json({ success: true, data: ROLES });
});

// ─── GET /api/roles/:roleId/stacks ──────────────────────────────────────────
router.get("/:roleId/stacks", (req, res) => {
  const { roleId } = req.params;
  const roleStacks = STACKS.filter((s) => s.roleId === roleId.toUpperCase());

  if (roleStacks.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: `No stacks found for role: ${roleId}` });
  }

  res.json({ success: true, data: roleStacks });
});

// ─── POST /api/user/selection ────────────────────────────────────────────────
router.post("/selection", async (req, res) => {
  try {
    const { userId, roleId, stackId, roleName, stackName } = req.body;

    if (!userId || !roleId || !stackId) {
      return res
        .status(400)
        .json({ success: false, message: "userId, roleId and stackId are required" });
    }

    const selection = new UserSelection({
      userId,
      roleId,
      stackId,
      roleName: roleName || "",
      stackName: stackName || "",
    });

    await selection.save();

    res.status(201).json({ success: true, data: selection });
  } catch (err) {
    console.error("❌ Selection save error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/roles/selection/:userId ────────────────────────────────────────
// Fetch latest selection for a user
router.get("/selection/:userId", async (req, res) => {
  try {
    const selection = await UserSelection.findOne({
      userId: req.params.userId,
    }).sort({ selectedAt: -1 });

    if (!selection) {
      return res
        .status(404)
        .json({ success: false, message: "No selection found for this user" });
    }

    res.json({ success: true, data: selection });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
