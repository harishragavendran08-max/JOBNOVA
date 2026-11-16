export interface JobItem {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string;
  type?: string;
  ctc?: string;
}

export interface InternshipItem {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  duration?: string;
  stipend?: string;
}

export interface CourseItem {
  id: number;
  title: string;
  provider: string;
  url: string;
  description: string;
  level?: string;
}

export interface CertificationItem {
  id: number;
  name: string;
  issuer: string;
  credentialUrl: string;
}

export interface WorkExperienceItem {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  description: string;
  skillsUsed?: string[];
  importedFrom?: 'LinkedIn' | 'Manual';
}

export interface UserProfile {
  id: number;
  oauthId: string;
  name: string;
  email: string;
  provider: 'Google' | 'GitHub' | 'LinkedIn' | 'Student Demo' | 'Email';
  headline: string;
  location: string;
  summary: string;
  education?: string;
  skills: string[];
  skillProficiencies?: Record<string, number>;
  dob: string;
  linkedInConnected?: boolean;
  linkedInProfileUrl?: string;
  workHistory?: WorkExperienceItem[];
  lastLinkedInSync?: string;
}

export interface UserSettings {
  showProfilePublicly: boolean;
  receiveJobAlertsEmail: boolean;
  enableEmailNotifications: boolean;
  enableTwoFactorAuth: boolean;
  pushNotifications: boolean;
  weeklyCareerTips: boolean;
  theme: 'light' | 'dark';
  shareLearningProgress: boolean;
  showCertificationBadges: boolean;
  expectedSalaryMinLpa: number;
  expectedSalaryMaxLpa: number;
}

export interface SpringBootDiagnostic {
  id: string;
  severity: 'Critical' | 'High' | 'Medium';
  title: string;
  file: string;
  errorExcerpt: string;
  rootCause: string;
  beforeCode: string;
  afterCode: string;
}

// Exact 20 Jobs from src/main/resources/data.sql
export const SEED_JOBS: JobItem[] = [
  { id: 1, title: 'Software Engineer', company: 'TCS', location: 'Chennai', description: 'Develop enterprise Java & Spring Boot apps.', skills: 'java,springboot,sql', type: 'Full-Time', ctc: '7.5 LPA' },
  { id: 2, title: 'Backend Developer', company: 'Infosys', location: 'Bengaluru', description: 'Work on REST APIs and microservices.', skills: 'java,springboot,hibernate', type: 'Full-Time', ctc: '8.2 LPA' },
  { id: 3, title: 'Frontend Engineer', company: 'Wipro', location: 'Hyderabad', description: 'Build modern web interfaces.', skills: 'html,css,javascript,react', type: 'Full-Time', ctc: '6.8 LPA' },
  { id: 4, title: 'Data Analyst', company: 'HCL', location: 'Noida', description: 'Analyze and visualize data using Python.', skills: 'python,sql,pandas', type: 'Full-Time', ctc: '7.0 LPA' },
  { id: 5, title: 'AI Engineer', company: 'Google India', location: 'Bengaluru', description: 'Build and deploy ML models.', skills: 'python,tensorflow,ai,ml', type: 'Full-Time', ctc: '28.0 LPA' },
  { id: 6, title: 'Cloud Engineer', company: 'Amazon India', location: 'Hyderabad', description: 'Manage AWS cloud infrastructure.', skills: 'aws,cloud,linux,devops', type: 'Full-Time', ctc: '24.0 LPA' },
  { id: 7, title: 'Blockchain Developer', company: 'Accenture', location: 'Mumbai', description: 'Develop blockchain and smart contracts.', skills: 'blockchain,solidity,web3', type: 'Full-Time', ctc: '11.5 LPA' },
  { id: 8, title: 'Full Stack Developer', company: 'Cognizant', location: 'Pune', description: 'Develop end-to-end applications.', skills: 'java,html,css,javascript,mysql', type: 'Full-Time', ctc: '8.5 LPA' },
  { id: 9, title: 'Cybersecurity Analyst', company: 'Tech Mahindra', location: 'Chennai', description: 'Protect systems and networks.', skills: 'cybersecurity,linux,networking', type: 'Full-Time', ctc: '7.8 LPA' },
  { id: 10, title: 'DevOps Engineer', company: 'IBM India', location: 'Bengaluru', description: 'CI/CD, automation and container orchestration.', skills: 'jenkins,docker,kubernetes,aws', type: 'Full-Time', ctc: '14.0 LPA' },
  { id: 11, title: 'Mobile App Developer', company: 'Zoho', location: 'Chennai', description: 'Build Android and iOS apps.', skills: 'flutter,kotlin,java', type: 'Full-Time', ctc: '12.0 LPA' },
  { id: 12, title: 'UI/UX Designer', company: 'Adobe India', location: 'Remote', description: 'Design clean, user-friendly interfaces.', skills: 'uiux,figma,designthinking', type: 'Remote', ctc: '18.5 LPA' },
  { id: 13, title: 'Web Developer', company: 'Flipkart', location: 'Bengaluru', description: 'Create responsive websites.', skills: 'html,css,bootstrap,js', type: 'Full-Time', ctc: '15.0 LPA' },
  { id: 14, title: 'Software Tester', company: 'Capgemini', location: 'Kolkata', description: 'Automate and test web apps.', skills: 'selenium,java,testing', type: 'Full-Time', ctc: '6.5 LPA' },
  { id: 15, title: 'AI Research Intern', company: 'NVIDIA India', location: 'Pune', description: 'Work on AI vision and models.', skills: 'python,pytorch,deeplearning', type: 'Full-Time / R&D', ctc: '22.0 LPA' },
  { id: 16, title: 'Web Application Developer', company: 'Oracle India', location: 'Bengaluru', description: 'Build scalable enterprise web apps.', skills: 'java,jsp,servlet,spring', type: 'Full-Time', ctc: '16.5 LPA' },
  { id: 17, title: 'Game Developer', company: 'Unity Technologies', location: 'Hyderabad', description: 'Develop games using C# and Unity.', skills: 'csharp,unity,3d', type: 'Full-Time', ctc: '14.5 LPA' },
  { id: 18, title: 'Marketing Analyst', company: 'Byjus', location: 'Bengaluru', description: 'Analyze and optimize marketing campaigns.', skills: 'marketing,analytics,excel', type: 'Full-Time', ctc: '7.2 LPA' },
  { id: 19, title: 'Cloud Developer', company: 'Microsoft India', location: 'Hyderabad', description: 'Develop cloud-native applications.', skills: 'azure,csharp,dotnet', type: 'Full-Time', ctc: '26.0 LPA' },
  { id: 20, title: 'Data Engineer', company: 'Reliance Jio', location: 'Mumbai', description: 'Build data pipelines for analytics.', skills: 'python,spark,hadoop,sql', type: 'Full-Time', ctc: '13.5 LPA' },
  { id: 21, title: 'Junior Java & Spring Boot Engineer', company: 'Persistent Systems', location: 'Pune', description: 'Build robust enterprise microservices using Java 17, Spring Boot, Hibernate, and MySQL with Docker containerization.', skills: 'java,springboot,mysql,docker', type: 'Full-Time', ctc: '8.0 LPA' },
  { id: 22, title: 'React.js Frontend Engineer', company: 'Swiggy', location: 'Bengaluru', description: 'Develop responsive high-performance web applications using React.js, TypeScript, Tailwind CSS, and Redux Toolkit.', skills: 'react,javascript,html,css,typescript', type: 'Full-Time', ctc: '19.5 LPA' },
  { id: 23, title: 'Full-Stack SDE (Java + React)', company: 'Razorpay', location: 'Bengaluru', description: 'Architect payments checkout flows and merchant portals using Java Spring Boot backends and React frontends.', skills: 'java,springboot,react,javascript,mysql', type: 'Full-Time', ctc: '22.0 LPA' },
  { id: 24, title: 'MySQL Database Administrator & SRE', company: 'Paytm', location: 'Noida', description: 'Optimize high-throughput MySQL replication clusters, query plans, InnoDB buffer pools, and automated backups.', skills: 'mysql,sql,linux,database', type: 'Full-Time', ctc: '13.0 LPA' },
  { id: 25, title: 'Enterprise Java Platform Engineer', company: 'Cisco India', location: 'Chennai', description: 'Develop distributed networking cloud platforms using Core Java, Spring Cloud, Kafka, and relational databases.', skills: 'java,springboot,kafka,sql', type: 'Full-Time', ctc: '21.0 LPA' },
  { id: 26, title: 'Associate Software Engineer', company: 'LTIMindtree', location: 'Chennai', description: 'Participate in agile software development life cycle building web applications with HTML5, CSS3, JavaScript, and Java.', skills: 'java,javascript,html,css,sql', type: 'Full-Time', ctc: '6.5 LPA' },
  { id: 27, title: 'Frontend UI Engineer', company: 'Freshworks', location: 'Chennai', description: 'Craft polished customer experience interfaces using modern JavaScript, React, CSS3 animations, and web accessibility standards.', skills: 'react,javascript,html,css,uiux', type: 'Full-Time', ctc: '17.0 LPA' },
  { id: 28, title: 'Backend API Developer (Spring Boot)', company: 'PhonePe', location: 'Bengaluru', description: 'Design low-latency financial transaction APIs handling millions of daily requests with Spring Boot and MySQL.', skills: 'java,springboot,mysql,rest-api', type: 'Full-Time', ctc: '25.0 LPA' },
  { id: 29, title: 'Software Development Engineer - 1', company: 'Zoho', location: 'Chennai', description: 'Work directly on core Zoho productivity suite applications using Java, JavaScript, and relational database persistence.', skills: 'java,javascript,mysql,algorithms', type: 'Full-Time', ctc: '10.5 LPA' },
  { id: 30, title: 'Full-Stack Web Architect', company: 'Dell Technologies', location: 'Remote', description: 'Develop modular enterprise cloud portals combining Spring Boot REST services with modern React SPA frontends.', skills: 'java,springboot,react,html,css,mysql', type: 'Remote', ctc: '23.5 LPA' },
  { id: 31, title: 'GenAI & LLM Software Engineer', company: 'Krutrim AI', location: 'Bengaluru', description: 'Architect production RAG pipelines, multi-agent LLM orchestration workflows, and low-latency inference APIs using LangChain, FastAPI, and vector databases.', skills: 'python,genai,llm,langchain,rag,fastapi,vectordb,openai', type: 'Full-Time', ctc: '27.5 LPA' },
  { id: 32, title: 'AI / Machine Learning Engineer', company: 'Flipkart', location: 'Bengaluru', description: 'Train, fine-tune, and deploy deep learning ranking, recommendation, and LLM search models using PyTorch, TensorFlow, and Hugging Face transformers.', skills: 'python,pytorch,tensorflow,huggingface,ml,llm,docker', type: 'Full-Time', ctc: '29.0 LPA' },
  { id: 33, title: 'MLOps Platform Engineer', company: 'Meesho', location: 'Bengaluru', description: 'Build automated ML feature stores, model registries, CI/CD training pipelines, and scalable GPU serving infrastructure on Kubernetes.', skills: 'python,mlflow,airflow,docker,kubernetes,aws', type: 'Full-Time', ctc: '24.5 LPA' },
  { id: 34, title: 'Backend Engineer (Golang / Distributed Systems)', company: 'Gojek', location: 'Bengaluru', description: 'Design high-concurrency Go microservices powering real-time logistics dispatch, Kafka event streaming, and sub-10ms Redis caching.', skills: 'golang,grpc,kafka,postgresql,redis,kubernetes', type: 'Full-Time', ctc: '26.0 LPA' },
  { id: 35, title: 'Systems & Low-Latency Engineer (Rust)', company: 'Zerodha', location: 'Bengaluru', description: 'Engineer ultra-low-latency order routing and market data processing daemons in Rust with zero-allocation memory safety on Linux.', skills: 'rust,tokio,postgresql,redis,linux,networking', type: 'Full-Time', ctc: '28.5 LPA' },
  { id: 36, title: 'Python Backend Engineer (FastAPI & Django)', company: 'Postman', location: 'Bengaluru', description: 'Build scalable developer platform APIs, async task queues, and multi-tenant Postgres data layers using FastAPI and Django.', skills: 'python,fastapi,django,postgresql,redis,docker', type: 'Full-Time', ctc: '21.5 LPA' },
  { id: 37, title: 'Site Reliability Engineer (SRE)', company: 'Atlassian India', location: 'Bengaluru', description: 'Own production reliability, SLO error budgets, Terraform IaC automation, and Prometheus/Grafana observability across multi-region clusters.', skills: 'kubernetes,terraform,prometheus,grafana,aws,python', type: 'Full-Time', ctc: '30.0 LPA' },
  { id: 38, title: 'Cloud Solutions Architect (Multi-Cloud)', company: 'Amazon India', location: 'Hyderabad', description: 'Design resilient, cost-optimized multi-cloud enterprise architectures using Terraform, Kubernetes, serverless workloads, and IAM & VPC security.', skills: 'aws,azure,gcp,terraform,kubernetes,microservices', type: 'Full-Time', ctc: '34.0 LPA' },
  { id: 39, title: 'Senior Data Engineer (Lakehouse & Streaming)', company: 'Databricks India', location: 'Bengaluru', description: 'Architect petabyte-scale batch and streaming lakehouse pipelines using Apache Spark, Kafka, Airflow, dbt, and Snowflake.', skills: 'python,sql,spark,kafka,airflow,dbt,snowflake', type: 'Full-Time', ctc: '29.5 LPA' },
  { id: 40, title: 'Analytics & BI Data Engineer', company: 'Swiggy', location: 'Hyderabad', description: 'Model warehouse star schemas in dbt and Snowflake, optimize analytical SQL queries, and automate executive telemetry datasets.', skills: 'sql,python,dbt,snowflake,pandas,tableau', type: 'Full-Time', ctc: '18.0 LPA' },
  { id: 41, title: 'SDET / QA Automation Engineer', company: 'BrowserStack', location: 'Mumbai', description: 'Build cross-browser end-to-end test frameworks with Playwright and TypeScript alongside automated API contract suites in CI/CD.', skills: 'playwright,selenium,typescript,restassured,cicd,testing', type: 'Full-Time', ctc: '16.0 LPA' },
  { id: 42, title: 'Cloud Security & SOC Engineer', company: 'CrowdStrike India', location: 'Pune', description: 'Monitor cloud workloads, automate AWS IAM least-privilege guardrails, investigate SIEM threat telemetry, and run vulnerability assessments.', skills: 'cybersecurity,aws,iam,siem,linux,networking', type: 'Full-Time', ctc: '22.5 LPA' },
  { id: 43, title: 'Mobile Engineer (React Native & Cross-Platform)', company: 'CRED', location: 'Bengaluru', description: 'Craft smooth 60fps iOS and Android fintech experiences using React Native, TypeScript, native bridges, and offline state sync.', skills: 'react-native,react,typescript,ios,android,rest-api', type: 'Full-Time', ctc: '24.0 LPA' },
  { id: 44, title: 'Node.js & Next.js Full-Stack Engineer', company: 'Zepto', location: 'Remote', description: 'Ship consumer storefront and real-time quick-commerce ops dashboards using Next.js, Node.js, TypeScript, and PostgreSQL.', skills: 'nodejs,nextjs,typescript,react,postgresql,redis', type: 'Remote', ctc: '20.0 LPA' },
  { id: 45, title: 'iOS Software Engineer (Swift & SwiftUI)', company: 'Apple India', location: 'Bengaluru', description: 'Build fluid, low-latency native iOS applications and system frameworks using Swift, SwiftUI, Combine, and Core Animation.', skills: 'swift,swiftui,ios,xcode,mobile', type: 'Full-Time', ctc: '32.0 LPA' },
  { id: 46, title: 'Senior Java & Spring Boot Microservices Engineer', company: 'Stripe India', location: 'Bengaluru', description: 'Architect high-availability global payment settlement services using Java 17, Spring Boot, MySQL, and Apache Kafka.', skills: 'java,springboot,mysql,kafka,rest-api', type: 'Full-Time', ctc: '35.0 LPA' },
  { id: 47, title: 'Full-Stack Engineer (React, TypeScript & Spring Boot)', company: 'Intuit India', location: 'Bengaluru', description: 'Develop AI-driven financial workflows and tax automation products with Spring Boot REST APIs, React, and MySQL.', skills: 'java,springboot,react,typescript,mysql,graphql', type: 'Full-Time', ctc: '24.5 LPA' },
  { id: 48, title: 'Backend Distributed Systems Engineer', company: 'Uber India', location: 'Hyderabad', description: 'Scale real-time trip matching and pricing microservices handling millions of RPM using Go, Java, Kafka, and Redis.', skills: 'golang,java,kafka,mysql,microservices,redis', type: 'Full-Time', ctc: '33.0 LPA' },
  { id: 49, title: 'iOS & Mobile Platform Architect', company: 'Swiggy', location: 'Bengaluru', description: 'Lead consumer iOS app architecture, modular SwiftUI design systems, and 120Hz ProMotion animations for food & quick commerce.', skills: 'ios,swift,swiftui,react-native,mobile,rest-api', type: 'Full-Time', ctc: '28.0 LPA' },
  { id: 50, title: 'Enterprise Java & MySQL Backend Engineer', company: 'PayPal India', location: 'Chennai', description: 'Engineer fault-tolerant risk evaluation and checkout APIs with Java, Spring Boot Bean Validation, Hibernate, and MySQL.', skills: 'java,springboot,mysql,sql,hibernate,rest-api', type: 'Full-Time', ctc: '20.5 LPA' },
  { id: 51, title: 'Frontend Design Systems Engineer (React & CSS)', company: 'Atlassian India', location: 'Remote', description: 'Create accessible, ultra-smooth UI component primitives, spring animations, and dark/light design tokens in React and TypeScript.', skills: 'react,typescript,javascript,html,css,uiux', type: 'Remote', ctc: '26.5 LPA' },
  { id: 52, title: 'Core Java & Low-Latency Trading Engineer', company: 'Goldman Sachs', location: 'Bengaluru', description: 'Build deterministic algorithmic execution services and real-time risk analytics in Core Java, Spring Boot, and SQL.', skills: 'java,springboot,sql,algorithms,linux', type: 'Full-Time', ctc: '29.0 LPA' },
  { id: 53, title: 'Spring Boot Cloud Native Developer', company: 'Walmart Global Tech', location: 'Chennai', description: 'Build omnichannel retail inventory and fulfillment microservices using Java, Spring Boot, MySQL, Docker, and Kubernetes.', skills: 'java,springboot,mysql,kubernetes,docker,azure', type: 'Full-Time', ctc: '19.0 LPA' },
  { id: 54, title: 'GenAI & Foundation Models Engineer', company: 'Adobe India', location: 'Noida', description: 'Develop generative creative workflows, multimodal RAG pipelines, and inference optimization services in Python and PyTorch.', skills: 'python,pytorch,genai,llm,rag,fastapi', type: 'Full-Time', ctc: '31.0 LPA' },
  { id: 55, title: 'Full-Stack Software Engineer (Java + React)', company: 'Salesforce India', location: 'Hyderabad', description: 'Deliver enterprise CRM analytics apps combining Spring Boot backend services, relational SQL schemas, and modern React UIs.', skills: 'java,springboot,javascript,react,html,css,sql', type: 'Full-Time', ctc: '23.0 LPA' },
  { id: 56, title: 'High-Frequency Backend Engineer (Rust & C++)', company: 'Morgan Stanley', location: 'Mumbai', description: 'Design memory-safe, sub-millisecond market connectivity gateways and distributed ledger services in Rust and Linux.', skills: 'rust,cpp,linux,networking,sql,algorithms', type: 'Full-Time', ctc: '27.0 LPA' },
  { id: 57, title: 'Mobile Experience Engineer (iOS / SwiftUI)', company: 'Zomato', location: 'Noida', description: 'Craft fluid iOS live-order tracking interfaces, interactive maps, and smooth gesture transitions using Swift and SwiftUI.', skills: 'swift,swiftui,ios,mobile,rest-api,uiux', type: 'Full-Time', ctc: '22.0 LPA' },
  { id: 58, title: 'Cloud & Kubernetes Platform Engineer', company: 'Coinbase India', location: 'Remote', description: 'Automate zero-trust multi-region Kubernetes clusters, Terraform modules, and Go deployment operators on AWS.', skills: 'kubernetes,golang,aws,terraform,docker,devops', type: 'Remote', ctc: '36.0 LPA' },
  { id: 59, title: 'Embedded & Systems Software Engineer', company: 'Qualcomm India', location: 'Hyderabad', description: 'Develop 5G modem firmware, Linux kernel drivers, and on-device NPU acceleration libraries in C, C++, and Python.', skills: 'c,cpp,python,linux,networking', type: 'Full-Time', ctc: '18.5 LPA' },
  { id: 60, title: 'Data Platform & MySQL Performance Engineer', company: 'Lowes India', location: 'Bengaluru', description: 'Architect high-throughput MySQL clusters, Apache Spark ETL jobs, and Snowflake analytics marts for supply chain telemetry.', skills: 'mysql,sql,python,spark,kafka,snowflake', type: 'Full-Time', ctc: '17.5 LPA' },
  { id: 61, title: 'On-Device AI & Mobile Engineer (iOS / Android)', company: 'Samsung R&D', location: 'Bengaluru', description: 'Optimize on-device neural networks and build native mobile camera and productivity features in Swift, Kotlin, and Java.', skills: 'swift,kotlin,ios,java,python,pytorch', type: 'Full-Time', ctc: '16.8 LPA' },
  { id: 62, title: 'QA Automation & SDET Lead (Java + Playwright)', company: 'Freshworks', location: 'Chennai', description: 'Architect parallel Playwright TypeScript E2E harnesses and Spring Boot REST Assured contract testing pipelines.', skills: 'java,playwright,selenium,typescript,testing,cicd', type: 'Full-Time', ctc: '15.5 LPA' },
  { id: 63, title: 'Application Security & DevSecOps Engineer', company: 'Palo Alto Networks', location: 'Bengaluru', description: 'Secure cloud-native microservices, automate container vulnerability scanning, and harden Kubernetes IAM policies.', skills: 'cybersecurity,kubernetes,aws,python,linux,iam', type: 'Full-Time', ctc: '26.0 LPA' },
  { id: 64, title: 'Product Frontend Engineer (React & Next.js)', company: 'CRED', location: 'Bengaluru', description: 'Build ultra-responsive web experiences with iOS-grade spring animations, TypeScript, React 19, and Tailwind CSS.', skills: 'react,nextjs,typescript,javascript,html,css', type: 'Full-Time', ctc: '25.5 LPA' },
  { id: 65, title: 'Graduate Software Engineer (Java Full-Stack)', company: 'NatWest Group', location: 'Chennai', description: 'Develop digital banking APIs and customer web portals using Java 17, Spring Boot, React.js, HTML5/CSS3, and MySQL.', skills: 'java,springboot,react,javascript,mysql,sql', type: 'Full-Time', ctc: '11.0 LPA' }
];

// Curated Internships with stipends and real software engineering technologies
export const SEED_INTERNSHIPS: InternshipItem[] = [
  { id: 1, title: 'Web Development Intern', company: 'TechNova', location: 'Remote', description: 'Assist in building front-end web apps using HTML, CSS, and JS.', duration: '3 Months', stipend: '₹15,000 / mo' },
  { id: 2, title: 'Java Backend Intern', company: 'TCS', location: 'Chennai', description: 'Develop REST APIs using Java and Spring Boot.', duration: '6 Months', stipend: '₹20,000 / mo' },
  { id: 3, title: 'Data Science Intern', company: 'Infosys', location: 'Remote', description: 'Analyze data using Python and ML algorithms.', duration: '4 Months', stipend: '₹22,000 / mo' },
  { id: 4, title: 'AI Chatbot Intern', company: 'Google India', location: 'Bengaluru', description: 'Integrate OpenAI chatbot models.', duration: '6 Months', stipend: '₹65,000 / mo' },
  { id: 5, title: 'UI/UX Intern', company: 'Adobe India', location: 'Remote', description: 'Design modern interfaces in Figma.', duration: '3 Months', stipend: '₹45,000 / mo' },
  { id: 6, title: 'Cybersecurity Intern', company: 'HCL', location: 'Noida', description: 'Assist in penetration testing and threat analysis.', duration: '6 Months', stipend: '₹18,000 / mo' },
  { id: 7, title: 'DevOps Intern', company: 'Wipro', location: 'Hyderabad', description: 'Work with Docker and CI/CD pipelines.', duration: '4 Months', stipend: '₹20,000 / mo' },
  { id: 8, title: 'Marketing Intern', company: 'Byjus', location: 'Remote', description: 'Assist in online marketing and campaign tracking.', duration: '3 Months', stipend: '₹12,000 / mo' },
  { id: 9, title: 'Spring Boot Backend Intern', company: 'Cognizant', location: 'Chennai', description: 'Assist in developing RESTful microservices, JUnit tests, and MySQL data models for healthcare clients.', duration: '6 Months', stipend: '₹22,000 / mo' },
  { id: 10, title: 'React & Frontend Web Intern', company: 'Zoho', location: 'Chennai', description: 'Build interactive user components, state management workflows, and responsive layouts using React and CSS3.', duration: '6 Months', stipend: '₹25,000 / mo' },
  { id: 11, title: 'Full-Stack Developer Intern', company: 'Freshworks', location: 'Chennai', description: 'Work across full-stack features connecting Java backends with dynamic JavaScript/React web interfaces.', duration: '4 Months', stipend: '₹35,000 / mo' },
  { id: 12, title: 'Database & SQL Engineering Intern', company: 'TCS', location: 'Bengaluru', description: 'Query optimization, schema indexing, and stored procedure development on enterprise MySQL systems.', duration: '3 Months', stipend: '₹18,000 / mo' },
  { id: 13, title: 'Software Engineering Summer Intern', company: 'Microsoft India', location: 'Hyderabad', description: 'Join Azure cloud or developer tooling teams building reliable cloud services and modern web experiences.', duration: '2 Months', stipend: '₹80,000 / mo' },
  { id: 14, title: 'Java Software Development Intern', company: 'Oracle India', location: 'Bengaluru', description: 'Develop cloud infrastructure modules, automated testing suites, and API endpoints using Java 17.', duration: '6 Months', stipend: '₹40,000 / mo' },
  { id: 15, title: 'Frontend Engineering Intern', company: 'Swiggy', location: 'Remote', description: 'Implement consumer-facing web experiences using HTML5, CSS3, modern JavaScript, and React components.', duration: '3 Months', stipend: '₹30,000 / mo' },
  { id: 16, title: 'Cloud & DevOps Intern', company: 'Amazon India', location: 'Chennai', description: 'Automate build pipelines, container deployments with Docker, and cloud monitoring on AWS.', duration: '6 Months', stipend: '₹60,000 / mo' },
  { id: 17, title: 'GenAI & LLM Engineering Intern', company: 'Krutrim AI', location: 'Bengaluru', description: 'Build RAG pipelines, prompt evaluation harnesses, and FastAPI endpoints using Python, LangChain, and vector databases.', duration: '6 Months', stipend: '₹45,000 / mo' },
  { id: 18, title: 'Golang & Cloud Microservices Intern', company: 'Razorpay', location: 'Bengaluru', description: 'Develop high-throughput backend services in Go, Docker, Kafka, and PostgreSQL for payment observability.', duration: '6 Months', stipend: '₹50,000 / mo' },
  { id: 19, title: 'Data Engineering & Spark Intern', company: 'Databricks India', location: 'Hyderabad', description: 'Build ETL data pipelines with Python, SQL, Apache Spark, dbt, and Airflow on cloud data lakehouses.', duration: '4 Months', stipend: '₹55,000 / mo' },
  { id: 20, title: 'QA Automation & Playwright Intern', company: 'BrowserStack', location: 'Remote', description: 'Write automated cross-browser E2E test suites using Playwright, TypeScript, and CI/CD workflows.', duration: '3 Months', stipend: '₹28,000 / mo' }
];

// Exact 30 Courses from src/main/resources/data.sql
export const SEED_COURSES: CourseItem[] = [
  { id: 1, title: 'HTML & CSS from Scratch', provider: 'Coursera', url: 'https://coursera.org/learn/html-css', description: 'Learn to structure and style modern websites using HTML5 and CSS3.', level: 'Beginner' },
  { id: 2, title: 'JavaScript Mastery', provider: 'Udemy', url: 'https://udemy.com/course/javascript-mastery', description: 'Understand core JavaScript, ES6, and build interactive web apps.', level: 'Intermediate' },
  { id: 3, title: 'Complete Java Developer', provider: 'Coursera', url: 'https://coursera.org/learn/java', description: 'Master Java programming for backend and enterprise systems.', level: 'Intermediate' },
  { id: 4, title: 'Python for Beginners', provider: 'edX', url: 'https://edx.org/course/python-basics', description: 'Start coding in Python and learn data handling, loops, and OOP.', level: 'Beginner' },
  { id: 5, title: 'Spring Boot Complete Guide', provider: 'Udemy', url: 'https://udemy.com/course/spring-boot', description: 'Develop full-stack applications using Spring Boot and REST APIs.', level: 'Advanced' },
  { id: 6, title: 'AI and Machine Learning Foundations', provider: 'Coursera', url: 'https://coursera.org/learn/machine-learning', description: 'Explore supervised and unsupervised learning using Python.', level: 'Intermediate' },
  { id: 7, title: 'C Programming Fundamentals', provider: 'Udemy', url: 'https://udemy.com/course/c-programming', description: 'Learn how to code in C for system and embedded programming.', level: 'Beginner' },
  { id: 8, title: 'C++ Masterclass', provider: 'Coursera', url: 'https://coursera.org/learn/cpp', description: 'Object-oriented programming and problem-solving using C++.', level: 'Intermediate' },
  { id: 9, title: 'Bootstrap 5 UI Design', provider: 'Coursera', url: 'https://coursera.org/learn/bootstrap', description: 'Design stunning and responsive websites using Bootstrap.', level: 'Beginner' },
  { id: 10, title: 'AWS Cloud Practitioner Essentials', provider: 'Amazon AWS', url: 'https://aws.amazon.com/training/', description: 'Understand AWS cloud architecture, IAM, and deployment.', level: 'Beginner' },
  { id: 11, title: 'Git & GitHub Crash Course', provider: 'YouTube', url: 'https://youtube.com/playlist?list=git-course', description: 'Master version control, branching, and open-source contribution.', level: 'Beginner' },
  { id: 12, title: 'Database Management with MySQL', provider: 'Udemy', url: 'https://udemy.com/course/mysql-database', description: 'Learn SQL queries, joins, normalization, and database design.', level: 'Beginner' },
  { id: 13, title: 'REST API Design & Development', provider: 'Coursera', url: 'https://coursera.org/learn/rest-api', description: 'Design secure and scalable RESTful APIs using Java & Spring.', level: 'Intermediate' },
  { id: 14, title: 'UI/UX Design with Figma', provider: 'Google', url: 'https://grow.google/uxdesign', description: 'Learn wireframing, prototyping, and user research in Figma.', level: 'Beginner' },
  { id: 15, title: 'Linux Command Line Basics', provider: 'edX', url: 'https://edx.org/course/linux-basics', description: 'Navigate Linux systems, shell scripting, and server administration.', level: 'Beginner' },
  { id: 16, title: 'Full Stack Web Development Bootcamp', provider: 'Udemy', url: 'https://udemy.com/course/fullstack-web', description: 'Build complete web apps with frontend, backend, and databases.', level: 'Intermediate' },
  { id: 17, title: 'Data Science with Python & Pandas', provider: 'Coursera', url: 'https://coursera.org/learn/data-science-python', description: 'Perform data cleaning, analysis, and visualization with Pandas.', level: 'Intermediate' },
  { id: 18, title: 'Deep Learning with TensorFlow', provider: 'DeepLearning.AI', url: 'https://deeplearning.ai/courses', description: 'Build neural networks, CNNs, and NLP models with TensorFlow.', level: 'Advanced' },
  { id: 19, title: 'Cybersecurity Essentials', provider: 'Cisco Networking Academy', url: 'https://netacad.com/courses/cybersecurity', description: 'Understand network security, cryptography, and mitigate security threats.', level: 'Beginner' },
  { id: 20, title: 'Cloud Computing with Microsoft Azure', provider: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/training/azure/', description: 'Build and deploy scalable apps on Azure Cloud.', level: 'Intermediate' },
  { id: 21, title: 'Data Structures & Algorithms in Java', provider: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/courses/dsa', description: 'Master problem solving and competitive programming.', level: 'Intermediate' },
  { id: 22, title: 'DevOps with Docker and Jenkins', provider: 'Udemy', url: 'https://udemy.com/course/devops-docker-jenkins', description: 'Build CI/CD pipelines and automate deployments.', level: 'Advanced' },
  { id: 23, title: 'ReactJS & Modern Frontend', provider: 'Coursera', url: 'https://coursera.org/learn/reactjs', description: 'Learn component-based development and React hooks.', level: 'Intermediate' },
  { id: 24, title: 'Angular Framework Crash Course', provider: 'Udemy', url: 'https://udemy.com/course/angular-crash-course', description: 'Develop scalable single-page web applications with Angular.', level: 'Intermediate' },
  { id: 25, title: 'Flutter App Development', provider: 'Google', url: 'https://flutter.dev/learn', description: 'Build cross-platform apps for Android and iOS using Flutter.', level: 'Intermediate' },
  { id: 26, title: 'Artificial Intelligence in Business', provider: 'edX', url: 'https://edx.org/course/ai-business', description: 'Use AI tools and automation for business solutions.', level: 'Beginner' },
  { id: 27, title: 'Big Data & Hadoop Fundamentals', provider: 'Coursera', url: 'https://coursera.org/learn/big-data', description: 'Learn data engineering using Hadoop and Spark.', level: 'Advanced' },
  { id: 28, title: 'Ethical Hacking & Penetration Testing', provider: 'Udemy', url: 'https://udemy.com/course/ethical-hacking', description: 'Learn hacking techniques and cybersecurity defense.', level: 'Advanced' },
  { id: 29, title: 'AI with ChatGPT & OpenAI API', provider: 'Udemy', url: 'https://udemy.com/course/chatgpt-openai', description: 'Integrate AI APIs to build smart applications.', level: 'Intermediate' },
  { id: 30, title: 'Career Growth & Soft Skills', provider: 'LinkedIn Learning', url: 'https://linkedin.com/learning', description: 'Develop communication, teamwork, and leadership skills.', level: 'Beginner' },
  { id: 31, title: 'Generative AI, RAG & LangChain Engineering', provider: 'DeepLearning.AI', url: 'https://www.deeplearning.ai/short-courses/', description: 'Build production RAG pipelines, vector search, and LLM agents with Python and FastAPI.', level: 'Intermediate' },
  { id: 32, title: 'Go (Golang) Microservices & gRPC Systems', provider: 'Udemy', url: 'https://udemy.com/course/golang-microservices', description: 'Master concurrency, gRPC, Kafka event streaming, and PostgreSQL with Go.', level: 'Intermediate' },
  { id: 33, title: 'Kubernetes, Terraform & Site Reliability (SRE)', provider: 'Coursera', url: 'https://coursera.org/learn/kubernetes-terraform-sre', description: 'Automate infrastructure with Terraform and operate resilient Kubernetes clusters.', level: 'Advanced' },
  { id: 34, title: 'Modern Data Engineering with Spark, dbt & Snowflake', provider: 'Coursera', url: 'https://coursera.org/learn/modern-data-engineering', description: 'Design lakehouse pipelines with Python, Apache Spark, Airflow, dbt, and Snowflake.', level: 'Intermediate' }
];

// Curated Industry Certifications across Full-Stack, AI/Data, Cloud, DevOps & Security
export const SEED_CERTIFICATIONS: CertificationItem[] = [
  { id: 1, name: 'Java SE 11 Developer', issuer: 'Oracle', credentialUrl: 'https://education.oracle.com/java-se-11-developer' },
  { id: 2, name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon', credentialUrl: 'https://aws.amazon.com/certification/' },
  { id: 3, name: 'Google Data Analytics Certificate', issuer: 'Google', credentialUrl: 'https://grow.google/certificates/data-analytics' },
  { id: 4, name: 'Microsoft Azure Fundamentals', issuer: 'Microsoft', credentialUrl: 'https://learn.microsoft.com/en-us/certifications' },
  { id: 5, name: 'Python Programming Professional Certificate', issuer: 'Coursera', credentialUrl: 'https://coursera.org/professional-certificates/python' },
  { id: 6, name: 'Cybersecurity Analyst Professional', issuer: 'IBM', credentialUrl: 'https://www.ibm.com/training/cybersecurity' },
  { id: 7, name: 'Spring Framework Developer', issuer: 'VMware', credentialUrl: 'https://spring.io/certification' },
  { id: 8, name: 'Oracle Certified Professional: Java SE 17 Developer', issuer: 'Oracle', credentialUrl: 'https://education.oracle.com/oracle-certified-professional-java-se-17-developer' },
  { id: 9, name: 'Meta Front-End Developer Professional Certificate', issuer: 'Coursera', credentialUrl: 'https://www.coursera.org/professional-certificates/meta-front-end-developer' },
  { id: 10, name: 'AWS Certified Developer – Associate', issuer: 'Amazon', credentialUrl: 'https://aws.amazon.com/certification/certified-developer-associate/' },
  { id: 11, name: 'Google Associate Cloud Engineer', issuer: 'Google', credentialUrl: 'https://cloud.google.com/learn/certification/cloud-engineer' },
  { id: 12, name: 'MySQL 8.0 Database Developer Certified Professional', issuer: 'Oracle', credentialUrl: 'https://education.oracle.com/mysql-80-database-developer' },
  { id: 13, name: 'IBM Full Stack Software Developer Certificate', issuer: 'IBM', credentialUrl: 'https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer' },
  { id: 14, name: 'Microsoft Certified: Azure Developer Associate (AZ-204)', issuer: 'Microsoft', credentialUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/' },
  { id: 15, name: 'Certified Kubernetes Administrator (CKA)', issuer: 'CNCF', credentialUrl: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/' },
  { id: 16, name: 'HashiCorp Certified: Terraform Associate', issuer: 'HashiCorp', credentialUrl: 'https://developer.hashicorp.com/certifications/infrastructure-automation' },
  { id: 17, name: 'AWS Certified Machine Learning – Specialty', issuer: 'Amazon', credentialUrl: 'https://aws.amazon.com/certification/certified-machine-learning-specialty/' },
  { id: 18, name: 'Databricks Certified Data Engineer Associate', issuer: 'Databricks', credentialUrl: 'https://www.databricks.com/learn/certification/data-engineer-associate' }
];

// Predefined knowledge base from GeminiController.java + extended topics
export const CAREER_KNOWLEDGE_BASE: Record<string, string> = {
  resume: `Resume Tips for Freshers & Students:
• Keep it clear and concise (1 page for freshers).
• Highlight academic/personal projects, internships, and quantified achievements.
• Start each bullet with strong action verbs (Built, Engineered, Designed, Optimized).
• Include direct links to your LinkedIn, GitHub, and live portfolio.
• Tailor keywords to match the job description (e.g., Java, Spring Boot, SQL, React).`,
  interview: `Interview Preparation Checklist:
• Practice common HR & technical questions like "Tell me about yourself" and project deep-dives.
• Research the company's tech stack and recent product launches before the interview.
• Use the STAR method (Situation, Task, Action, Result) for behavioral questions.
• Prepare 1–2 thoughtful questions to ask the interviewer at the end.
• Test your audio/video setup and arrive 10 minutes early.`,
  linkedin: `LinkedIn Profile Optimization:
• Use a clear, professional headshot and a clean banner.
• Write a keyword-rich headline (e.g., "CS Undergrad | Java, Spring Boot & React | Seeking SDE Roles").
• Summarize your core stack, projects, and career goals in the About section.
• Add verified certifications (Oracle Java, AWS, Google Data Analytics) and request skill endorsements.
• Share short posts documenting projects you build and bugs you solve.`,
  'soft skills': `Essential Workplace Soft Skills:
• Clear written and verbal communication
• Collaborative teamwork and code review etiquette
• Structured problem-solving and debugging mindset
• Adaptability to new frameworks and feedback
• Time management and sprint prioritization`,
  yourself: `Framework for "Tell Me About Yourself":
• Start with your current education and core engineering focus.
• Highlight 1–2 flagship projects (like JobNova!) and the technologies used.
• Mention relevant internships, hackathons, or certifications earned.
• Conclude with why you are excited about this specific role and team.
Example:
"I'm a Computer Science student specializing in Java, Spring Boot, and modern web development. Recently, I built JobNova, a full-stack career portal integrating REST APIs, OAuth2, and an AI Career Assistant..."`,
  rejection: `Handling Job Rejection Constructively:
• Don't take rejection personally — hiring depends on many timing and role factors.
• Politely ask the recruiter or interviewer for 1–2 areas of technical feedback.
• Review any coding or system design questions that felt difficult during the round.
• Keep applying consistently while shipping improvements to your portfolio.`,
  'first job': `Preparing for Your First Software Engineering Role:
• Master core fundamentals: Git, Java/Spring Boot or Python/JS, SQL joins, and REST APIs.
• Practice Data Structures & Algorithms (Arrays, HashMaps, Trees, Graphs) daily.
• Build 2–3 end-to-end deployable projects with clean README documentation.
• Practice explaining your architectural decisions and debugging steps aloud.`,
  communication: `Improving Technical & Professional Communication:
• Read engineering blogs and technical documentation daily.
• Practice explaining complex code concepts in simple terms.
• Record mock interview answers to refine pacing and clarity.
• Listen actively to the full question before structuring your answer.
• Aim for clarity and structure rather than perfection.`,
  genai: `GenAI, LLM & MLOps Career Roadmap:
• Master Python, FastAPI, structured tool/function calling, and RAG architectures with vector databases.
• Learn evaluation frameworks (latency, groundedness, retrieval precision) alongside PyTorch & Hugging Face.
• Understand containerization (Docker), model registries (MLflow), and GPU serving on Kubernetes.`,
  golang: `Backend Systems Career Path (Go, Rust & Microservices):
• Practice concurrency patterns (goroutines/channels in Go; async/Tokio ownership in Rust).
• Build gRPC + REST services backed by PostgreSQL, Redis caching, and Kafka event streams.
• Benchmark throughput, p99 latency, and graceful shutdowns under load.`,
  cloud: `Cloud, DevOps & SRE Essential Skills:
• Automate infrastructure as code with Terraform and container orchestration on Kubernetes.
• Build observability pipelines using Prometheus, Grafana, OpenTelemetry, and SLO error budgets.
• Pair AWS/Azure/GCP networking & IAM least-privilege security with CI/CD pipelines.`,
  'data engineering': `Data Engineering & Lakehouse Stack:
• Write strong analytical SQL (window functions, query plan tuning) alongside Python & PySpark.
• Model dimensional tables using dbt, schedule DAGs with Airflow, and stream events via Kafka into Snowflake.`
};

export const SEED_LINKEDIN_PROFILE_SUMMARY =
  'Full-Stack Developer & Computer Science undergraduate passionate about building scalable Java, Spring Boot microservices and modern React applications. Proven experience architecting RESTful APIs, optimizing MySQL databases, contributing to open-source software, and collaborating in Agile engineering teams.';

export const SEED_LINKEDIN_HEADLINE =
  'Software Engineer Intern @ TechCorp | Full-Stack Developer · Java, Spring Boot, React.js, MySQL | Open Source Contributor';

export const SEED_LINKEDIN_EDUCATION =
  'B.E. in Computer Science & Engineering · Anna University, Chennai (2023–2027) · CGPA: 8.9/10 · Coursework: Distributed Systems, DBMS, Algorithms & Spring Boot';

export const SEED_LINKEDIN_SKILLS: string[] = [
  'docker',
  'kubernetes',
  'rest-api',
  'microservices',
  'git'
];

export const SEED_LINKEDIN_WORK_HISTORY: WorkExperienceItem[] = [
  {
    id: 'exp-linkedin-1',
    title: 'Software Engineering Intern',
    company: 'TechCorp India',
    location: 'Chennai (Hybrid)',
    startDate: 'Jan 2024',
    endDate: 'Present',
    current: true,
    description: 'Architecting scalable RESTful microservices using Java 17 and Spring Boot 3. Optimized database queries and indexes in MySQL, cutting API p95 response times by 28%. Collaborated in bi-weekly Agile sprints with Git version control, CI/CD pipelines, and Docker containerization.',
    skillsUsed: ['java', 'springboot', 'mysql', 'docker'],
    importedFrom: 'LinkedIn'
  },
  {
    id: 'exp-linkedin-2',
    title: 'Full-Stack Project Lead (Open Source)',
    company: 'DevGuild Community',
    location: 'Remote',
    startDate: 'Jun 2023',
    endDate: 'Dec 2023',
    current: false,
    description: 'Led a team of 4 student developers to build an open-source campus recruitment portal in React and Node.js. Integrated OAuth2 authentication, built real-time analytics, and authored automated test suites achieving 92% coverage.',
    skillsUsed: ['react', 'javascript', 'html', 'css'],
    importedFrom: 'LinkedIn'
  }
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 1,
  oauthId: 'google-oauth2-student-101',
  name: 'Harish Ragavendran',
  email: 'harishragavendran56@gmail.com',
  provider: 'Google',
  headline: 'Full-Stack Developer — Java, Spring Boot, React.js, JavaScript, HTML5, CSS3 & MySQL',
  location: 'Chennai, India',
  summary: 'Full-stack Computer Science student building web applications with Java, Spring Boot, React.js, JavaScript, HTML5, CSS3, and MySQL. Actively exploring Software Engineer and Full-Stack Developer opportunities.',
  education: 'B.E. in Computer Science & Engineering · Anna University, Chennai (2023–2027)',
  skills: ['java', 'springboot', 'react', 'javascript', 'html', 'css', 'mysql'],
  dob: 'Not provided by OAuth provider',
  linkedInConnected: false,
  linkedInProfileUrl: 'https://linkedin.com/in/harish-ragavendran',
  workHistory: []
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  showProfilePublicly: true,
  receiveJobAlertsEmail: true,
  enableEmailNotifications: true,
  enableTwoFactorAuth: false,
  pushNotifications: true,
  weeklyCareerTips: true,
  theme: 'light',
  shareLearningProgress: false,
  showCertificationBadges: true,
  expectedSalaryMinLpa: 8.0,
  expectedSalaryMaxLpa: 16.0
};

// Detailed root-cause diagnostics of the user's uploaded SpringBootProjectJOBNOVA-main zip
export const SPRING_BOOT_DIAGNOSTICS: SpringBootDiagnostic[] = [
  {
    id: 'err-openai-autoconfig',
    severity: 'Critical',
    title: '1. Startup Crash: BeanCreationException (openAiAudioSpeechModel)',
    file: 'JOBNOVA/JOBNOVA/output.txt & pom.xml',
    errorExcerpt: `org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'openAiAudioSpeechModel' defined in class path resource [org/springframework/ai/model/openai/autoconfigure/OpenAiAudioSpeechAutoConfiguration.class]: Failed to instantiate [org.springframework.ai.openai.OpenAiAudioSpeechModel]: OpenAI API key must be set. Use the connection property: spring.ai.openai.api-key`,
    rootCause: 'Stale Spring AI OpenAI starter classes in target/classes (and <spring-ai.version> in outer pom.xml) triggered OpenAiAudioSpeechAutoConfiguration on startup without an OpenAI API key, crashing Tomcat before context initialization could finish.',
    beforeCode: `<!-- Outer pom.xml had unused Spring AI properties & stale target/classes -->
<properties>
    <java.version>17</java.version>
    <spring-ai.version>1.0.3</spring-ai.version>
</properties>`,
    afterCode: `<!-- Clean pom.xml + run './mvnw clean spring-boot:run' to purge stale target/ beans -->
<properties>
    <java.version>17</java.version>
</properties>`
  },
  {
    id: 'err-nested-directory',
    severity: 'Critical',
    title: '2. Nested Folder Mismatch (Found 0 JPA Repositories)',
    file: 'JOBNOVA/JOBNOVA/ vs JOBNOVA/JOBNOVA/JOBNOVA/',
    errorExcerpt: `Finished Spring Data repository scanning in 14 ms. Found 0 JPA repository interfaces.
Cannot find template location: classpath:/templates/`,
    rootCause: 'The outer directory (JOBNOVA/JOBNOVA) only contained 2 files (JobnovaApplication.java and a broken CertificationController.java), while all 20+ actual models, repositories, services, controllers, data.sql, and static HTML pages were nested one folder deeper in JOBNOVA/JOBNOVA/JOBNOVA/.',
    beforeCode: `JOBNOVA/JOBNOVA/src/main/java/com/example/JOBNOVA/
├── controller/CertificationController.java  (only 1 controller!)
└── JOBNOVA/JobnovaApplication.java          (no models, repos, or static HTML!)`,
    afterCode: `Consolidated all source files into the root Maven project:
src/main/java/com/example/JOBNOVA/
├── JobnovaApplication.java
├── config/SecurityConfig.java
├── controller/ (Certification, Gemini, Internship, Job, Learning, User)
├── model/      (Certification, Course, Internship, Job, User)
├── repository/ (Certification, Course, Internship, Job, User)
└── service/    (Certification, Internship, Job, Learning, User)`
  },
  {
    id: 'err-cert-controller',
    severity: 'Critical',
    title: '3. Circular Self-Injection & Infinite Recursion in CertificationController',
    file: 'src/main/java/com/example/JOBNOVA/controller/CertificationController.java',
    errorExcerpt: `private final CertificationController service;
public CertificationController(CertificationController service) { this.service = service; }
@GetMapping public Object all() { return service.all(); }`,
    rootCause: 'CertificationController injected CertificationController (itself!) instead of CertificationService, causing a Spring circular dependency failure on startup and a StackOverflowError if all() is invoked. Also, CertificationController was missing from the inner project folder.',
    beforeCode: `@RestController
@RequestMapping("/api/certifications")
public class CertificationController {
    private final CertificationController service;
    public CertificationController(CertificationController service) {
        this.service = service;
    }
    @GetMapping
    public Object all() { return service.all(); }
}`,
    afterCode: `@RestController
@RequestMapping("/api/certifications")
@CrossOrigin(origins = "*")
public class CertificationController {
    private final CertificationService service;
    public CertificationController(CertificationService service) {
        this.service = service;
    }
    @GetMapping
    public List<Certification> all() { return service.all(); }
}`
  },
  {
    id: 'err-package-mismatch',
    severity: 'High',
    title: '4. Java Package Declaration Mismatch (com.example.JOBNOVA.JOBNOVA vs com.example.JOBNOVA)',
    file: 'src/main/java/com/example/JOBNOVA/**/*.java',
    errorExcerpt: `package com.example.JOBNOVA; // in JobnovaApplication.java
package com.example.JOBNOVA.JOBNOVA.model; // in Job.java (located in com/example/JOBNOVA/model)`,
    rootCause: 'Files inside src/main/java/com/example/JOBNOVA/controller, model, repository, and service declared package com.example.JOBNOVA.JOBNOVA.*, which did not match their filesystem path and mismatched JobnovaApplication in the outer folder.',
    beforeCode: `// File path: src/main/java/com/example/JOBNOVA/model/Job.java
package com.example.JOBNOVA.JOBNOVA.model;`,
    afterCode: `// Unified package declarations matching folder structure:
package com.example.JOBNOVA.model;`
  },
  {
    id: 'err-security-config',
    severity: 'High',
    title: '5. Spring Security Blocking REST APIs & Frontend Pages',
    file: 'src/main/java/com/example/JOBNOVA/config/SecurityConfig.java',
    errorExcerpt: `.requestMatchers("/", "/index.html", "/css/**", "/js/**", "/images/**", "/h2-console/**", "/static/**", "/ai.html", "/api/ai/**").permitAll()
.anyRequest().authenticated()`,
    rootCause: 'SecurityConfig blocked /api/jobs, /api/internships, /api/courses, /api/certifications, /home.html, /jobs.html, /internships.html, /learning.html, and /certifications.html unless authenticated with live OAuth2 client secrets.',
    beforeCode: `.requestMatchers(
    "/", "/index.html", "/css/**", "/js/**", "/images/**",
    "/h2-console/**", "/static/**", "/ai.html", "/api/ai/**"
).permitAll()`,
    afterCode: `.requestMatchers(
    "/", "/index.html", "/home.html", "/jobs.html",
    "/internships.html", "/learning.html", "/certifications.html",
    "/profile.html", "/settings.html", "/ai.html",
    "/css/**", "/js/**", "/images/**", "/static/**",
    "/h2-console/**", "/api/**", "/user"
).permitAll()`
  },
  {
    id: 'err-hardcoded-port',
    severity: 'Medium',
    title: '6. Hardcoded localhost:8080 Fetch & Deprecated FrameOptions in static/js/app.js',
    file: 'src/main/resources/static/js/app.js',
    errorExcerpt: `const res = await fetch("http://localhost:8080/api/ai/ask", { ... });`,
    rootCause: 'Hardcoding http://localhost:8080 in app.js breaks when running on a different port or cloud URL, and profile logic in app.js called /api/user/me while UserController exposed /user.',
    beforeCode: `const res = await fetch("http://localhost:8080/api/ai/ask", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt })
});`,
    afterCode: `const res = await fetch("/api/ai/ask", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt })
});`
  }
];
