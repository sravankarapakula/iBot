// src/data/roleInfo.js

const roleInfo = {
  "frontend-developer": {
    title: "Frontend Developer",
    overview:
      "Responsible for creating responsive, accessible, and high-performance web interfaces that ensure great user experience.",
    keySkills: [
      "React / Vue / Angular",
      "JavaScript (ES6+)",
      "HTML5 & CSS3 / TailwindCSS",
      "REST / GraphQL APIs",
      "Performance Optimization",
    ],
    topics: [
      "State management",
      "Component design",
      "Accessibility (a11y)",
      "Testing with Jest / React Testing Library",
      "Frontend build tools (Vite, Webpack)",
    ],
    tips: "Focus on writing reusable components, maintaining performance, and keeping UI consistent. Revise key JavaScript and DOM fundamentals.",
  },

  "backend-developer": {
    title: "Backend Developer",
    overview:
      "Builds and maintains server-side logic, APIs, databases, and integrations that power the web application.",
    keySkills: [
      "Node.js / Express.js / Django / Flask",
      "Database Design (MongoDB, PostgreSQL)",
      "Authentication & Authorization (JWT, OAuth)",
      "API Development (REST, GraphQL)",
      "Scalability & Caching",
    ],
    topics: [
      "Error handling",
      "Middleware architecture",
      "Database normalization",
      "Server deployment & scaling",
      "Security best practices",
    ],
    tips: "Focus on structuring APIs efficiently and practice writing optimized, secure backend logic.",
  },

  "data-scientist": {
    title: "Data Scientist",
    overview:
      "Applies statistical techniques and machine learning to derive insights and build predictive models from data.",
    keySkills: [
      "Python / R",
      "Pandas, NumPy, Scikit-learn",
      "Data Visualization (Matplotlib, Seaborn)",
      "Machine Learning",
      "SQL and Big Data tools",
    ],
    topics: [
      "Feature engineering",
      "Model evaluation metrics",
      "Data cleaning & preprocessing",
      "Supervised vs unsupervised learning",
      "Communication of results",
    ],
    tips: "Emphasize model interpretability and clarity of insights. Understand how data drives business decisions.",
  },
};

export default roleInfo;
