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
  provider: 'Google' | 'GitHub' | 'LinkedIn' | 'Student Demo';
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
  { id: 30, title: 'Full-Stack Web Architect', company: 'Dell Technologies', location: 'Remote', description: 'Develop modular enterprise cloud portals combining Spring Boot REST services with modern React SPA frontends.', skills: 'java,springboot,react,html,css,mysql', type: 'Remote', ctc: '23.5 LPA' }
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
  { id: 16, title: 'Cloud & DevOps Intern', company: 'Amazon India', location: 'Chennai', description: 'Automate build pipelines, container deployments with Docker, and cloud monitoring on AWS.', duration: '6 Months', stipend: '₹60,000 / mo' }
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
  { id: 30, title: 'Career Growth & Soft Skills', provider: 'LinkedIn Learning', url: 'https://linkedin.com/learning', description: 'Develop communication, teamwork, and leadership skills.', level: 'Beginner' }
];

// Curated Industry Certifications for Full-Stack, Java, Cloud & Database Roles
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
  { id: 14, name: 'Microsoft Certified: Azure Developer Associate (AZ-204)', issuer: 'Microsoft', credentialUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/' }
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
• Aim for clarity and structure rather than perfection.`
};

export const SEED_LINKEDIN_PROFILE_SUMMARY =
  'Full-Stack Developer & Computer Science undergraduate passionate about building scalable Java, Spring Boot microservices and modern React applications. Proven experience architecting RESTful APIs, optimizing MySQL databases, contributing to open-source software, and collaborating in Agile engineering teams.';

export const SEED_LINKEDIN_HEADLINE =
  'Software Engineer Intern @ TechCorp | Full-Stack Developer · Java, Spring Boot, React.js, MySQL | Open Source Contributor';

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
