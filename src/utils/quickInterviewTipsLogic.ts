import { JobItem } from '../data/seedData';

export type QuickTipFocusArea =
  | 'Core Depth'
  | 'Architecture & Trade-offs'
  | 'Production Scenario';

export interface QuickInterviewTipQuestion {
  id: string;
  skillKey: string;
  skillLabel: string;
  focusArea: QuickTipFocusArea;
  question: string;
  whatInterviewersLookFor: string[];
  quickTip: string;
}

export interface QuickInterviewTipsBundle {
  jobId: number;
  jobTitle: string;
  company: string;
  stackLabels: string[];
  summaryTip: string;
  questions: [
    QuickInterviewTipQuestion,
    QuickInterviewTipQuestion,
    QuickInterviewTipQuestion
  ];
}

interface SkillTipTemplate {
  label: string;
  canonicalKey: string;
  focusArea: QuickTipFocusArea;
  question: string;
  signals: string[];
  quickTip: string;
}

const SKILL_TIP_TEMPLATES: Record<string, SkillTipTemplate> = {
  java: {
    label: 'Java',
    canonicalKey: 'java',
    focusArea: 'Core Depth',
    question:
      'How do Java Streams, CompletableFuture, and HashMap collision handling (linked list to Red-Black tree) behave under high concurrency?',
    signals: ['hashCode/equals contract', 'ConcurrentHashMap', 'non-blocking async', 'JVM memory'],
    quickTip:
      'Anchor your answer in time complexity (O(1) average to O(log n) tree bins) and mention thread-safety trade-offs.'
  },
  springboot: {
    label: 'Spring Boot',
    canonicalKey: 'springboot',
    focusArea: 'Architecture & Trade-offs',
    question:
      'In Spring Boot, how do @Transactional rollback rules, @RestControllerAdvice exception mapping, and HikariCP pooling protect production APIs?',
    signals: ['Proxy AOP boundaries', 'checked vs unchecked rollback', 'DTO @Valid', 'connection pool sizing'],
    quickTip:
      'Mention the self-invocation pitfall with @Transactional and why DTOs decouple API contracts from JPA entities.'
  },
  spring: {
    label: 'Spring Framework',
    canonicalKey: 'springboot',
    focusArea: 'Architecture & Trade-offs',
    question:
      'Why is constructor-based dependency injection preferred over field injection (@Autowired) in Spring beans?',
    signals: ['Immutability (final fields)', 'unit testability', 'circular dependency detection'],
    quickTip:
      'Point out that constructor injection prevents NullPointerException in plain unit tests without starting a Spring context.'
  },
  hibernate: {
    label: 'Hibernate / JPA',
    canonicalKey: 'hibernate',
    focusArea: 'Production Scenario',
    question:
      'How do you detect and eliminate the N+1 query problem in Hibernate/JPA without over-fetching unused associations?',
    signals: ['JOIN FETCH', '@EntityGraph', 'FetchType.LAZY', 'hibernate.show_sql / statistics'],
    quickTip:
      'Contrast default @OneToMany LAZY loading with targeted JOIN FETCH queries for list views.'
  },
  mysql: {
    label: 'MySQL',
    canonicalKey: 'mysql',
    focusArea: 'Production Scenario',
    question:
      'How do you design a composite B-Tree index in MySQL and read EXPLAIN output to eliminate a full table scan on filtered job searches?',
    signals: ['Leftmost prefix rule', 'covering index', 'EXPLAIN type/rows/Extra', 'InnoDB row locks'],
    quickTip:
      'Explain column ordering in composite indexes (equality predicates first, range columns after) and mention avoiding SELECT *.'
  },
  sql: {
    label: 'SQL',
    canonicalKey: 'sql',
    focusArea: 'Core Depth',
    question:
      'When would you choose a window function (ROW_NUMBER / RANK) over a GROUP BY subquery, and how do isolation levels prevent dirty or phantom reads?',
    signals: ['Window partitioning', 'Repeatable Read vs Read Committed', 'MVCC', 'LEFT vs INNER JOIN'],
    quickTip:
      'Highlight that window functions keep row-level detail while aggregating, whereas GROUP BY collapses rows.'
  },
  postgresql: {
    label: 'PostgreSQL',
    canonicalKey: 'postgresql',
    focusArea: 'Production Scenario',
    question:
      'When should you choose JSONB with a GIN index versus normalized relational tables in PostgreSQL?',
    signals: ['GIN indexing', 'MVCC & VACUUM', 'schema enforcement', 'query planner statistics'],
    quickTip:
      'Recommend relational columns for strict foreign keys/joins and JSONB+GIN for sparse, evolving metadata attributes.'
  },
  database: {
    label: 'Databases',
    canonicalKey: 'database',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do you decide between vertical indexing/partitioning and adding a read replica or cache layer when database read latency spikes?',
    signals: ['Read/write ratio', 'cache invalidation', 'replication lag', 'connection pooling'],
    quickTip:
      'Walk through measuring slow query logs and missing indexes first before introducing replication lag complexity.'
  },
  redis: {
    label: 'Redis',
    canonicalKey: 'redis',
    focusArea: 'Production Scenario',
    question:
      'How do you prevent cache stampedes and stale reads when using Redis as a cache-aside layer in front of a relational database?',
    signals: ['TTL + jitter', 'mutex/single-flight lock', 'write-through vs cache-aside', 'eviction policies'],
    quickTip:
      'Mention adding randomized TTL jitter so hot keys do not expire simultaneously under traffic bursts.'
  },
  react: {
    label: 'React.js',
    canonicalKey: 'react',
    focusArea: 'Core Depth',
    question:
      'How do React key reconciliation, derived state, and useMemo/useCallback prevent stale closures and redundant re-renders in interactive lists?',
    signals: ['Stable unique keys', 'derived vs duplicated state', 'effect cleanup', 'referential equality'],
    quickTip:
      'Explain why array index keys break stateful row selection/animations and why derived state beats syncing extra useEffect hooks.'
  },
  nextjs: {
    label: 'Next.js',
    canonicalKey: 'nextjs',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do you decide between Server Components (SSR/RSC), Static Generation (SSG), and Client Components in a Next.js App Router application?',
    signals: ['Bundle size reduction', 'SEO & TTFB', 'hydration boundaries', 'revalidate / caching'],
    quickTip:
      'Keep data fetching and secrets in Server Components and push "use client" strictly to interactive leaf controls.'
  },
  typescript: {
    label: 'TypeScript',
    canonicalKey: 'typescript',
    focusArea: 'Core Depth',
    question:
      'How do discriminated unions, generics, and type predicates eliminate runtime null/shape bugs across API responses?',
    signals: ['Narrowing', 'unknown vs any', 'exhaustive never check', 'strictNullChecks'],
    quickTip:
      'Give a concrete API loading/error/success discriminated union example using a never exhaustiveness helper.'
  },
  javascript: {
    label: 'JavaScript',
    canonicalKey: 'javascript',
    focusArea: 'Core Depth',
    question:
      'How do the Event Loop microtask queue, closures, and AbortController work together to prevent race conditions in live search inputs?',
    signals: ['Microtasks vs macrotasks', 'lexical scope', 'AbortController cleanup', 'debouncing'],
    quickTip:
      'Explain cancelling stale in-flight fetch() promises with AbortController so slower earlier responses never overwrite newer results.'
  },
  js: {
    label: 'JavaScript',
    canonicalKey: 'javascript',
    focusArea: 'Core Depth',
    question:
      'How do the Event Loop microtask queue, closures, and AbortController work together to prevent race conditions in live search inputs?',
    signals: ['Microtasks vs macrotasks', 'lexical scope', 'AbortController cleanup', 'debouncing'],
    quickTip:
      'Explain cancelling stale in-flight fetch() promises with AbortController so slower earlier responses never overwrite newer results.'
  },
  html: {
    label: 'HTML5',
    canonicalKey: 'html',
    focusArea: 'Core Depth',
    question:
      'How do semantic landmarks, native form controls, and ARIA attributes improve both SEO and keyboard/screen-reader accessibility?',
    signals: ['<main>/<nav>/<button>', 'label association', 'aria-live / aria-pressed', 'tab order'],
    quickTip:
      'Emphasize preferring native <button> and <label> elements over clickable <div>s so keyboard focus and Enter/Space work automatically.'
  },
  css: {
    label: 'CSS3',
    canonicalKey: 'css',
    focusArea: 'Architecture & Trade-offs',
    question:
      'When do you use CSS Grid versus Flexbox for responsive layouts, and how do stacking contexts (z-index) and container queries behave?',
    signals: ['2D Grid vs 1D Flex', 'stacking context triggers', 'prefers-reduced-motion', 'layout shift (CLS)'],
    quickTip:
      'Note that transform/opacity/filter create new stacking contexts, which commonly explains unexpected z-index clipping on dropdowns.'
  },
  bootstrap: {
    label: 'Bootstrap',
    canonicalKey: 'css',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How does Bootstrap’s 12-column responsive breakpoint system prevent layout overflow across mobile and desktop viewports?',
    signals: ['Mobile-first media queries', 'gutter spacing', 'utility overrides', 'CSS specificity'],
    quickTip:
      'Highlight customizing Sass variables rather than overriding framework classes with !important.'
  },
  nodejs: {
    label: 'Node.js',
    canonicalKey: 'nodejs',
    focusArea: 'Architecture & Trade-offs',
    question:
      'Why can CPU-bound tasks block Node.js’s single-threaded event loop, and how do Streams, Worker Threads, and async I/O keep throughput high?',
    signals: ['libuv thread pool', 'backpressure in Streams', 'Worker Threads', 'graceful shutdown'],
    quickTip:
      'Distinguish non-blocking network I/O (handled by OS kernel epoll/kqueue) from heavy CPU computation that needs Worker Threads.'
  },
  python: {
    label: 'Python',
    canonicalKey: 'python',
    focusArea: 'Core Depth',
    question:
      'How does Python’s Global Interpreter Lock (GIL) affect multithreading vs multiprocessing vs asyncio for I/O-bound and CPU-bound workloads?',
    signals: ['GIL & CPU contention', 'asyncio event loop', 'multiprocessing / C-extensions', 'generators & memory'],
    quickTip:
      'State clearly: use asyncio/threads for network I/O and multiprocessing (or vectorized NumPy/C libs) for CPU-heavy work.'
  },
  django: {
    label: 'Django',
    canonicalKey: 'django',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do select_related and prefetch_related optimize Django ORM queries, and how does middleware order affect authentication and caching?',
    signals: ['SQL JOIN vs IN query', 'QuerySet laziness', 'CSRF/Session middleware', 'DRF serializers'],
    quickTip:
      'Remember select_related for ForeignKey/OneToOne (SQL JOIN) and prefetch_related for ManyToMany/reverse relations.'
  },
  fastapi: {
    label: 'FastAPI',
    canonicalKey: 'fastapi',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How does FastAPI combine ASGI async endpoints, Pydantic validation, and dependency injection, and when should a route use def instead of async def?',
    signals: ['Threadpool for sync def', 'blocking event loop trap', 'Pydantic v2 schema', 'Depends() lifecycle'],
    quickTip:
      'Crucial gotcha: calling blocking DB drivers inside an async def endpoint stalls the entire ASGI event loop—use sync def or an async driver.'
  },
  pandas: {
    label: 'Pandas',
    canonicalKey: 'pandas',
    focusArea: 'Production Scenario',
    question:
      'How do you avoid slow DataFrame row iteration (.iterrows) and reduce memory usage when transforming multi-gigabyte CSV or Parquet datasets?',
    signals: ['Vectorized NumPy ops', 'categorical dtypes', 'chunksize streaming', 'copy-on-write'],
    quickTip:
      'Mention converting low-cardinality object strings to category dtype and replacing apply/iterrows with vectorized operations.'
  },
  genai: {
    label: 'GenAI / LLM',
    canonicalKey: 'genai',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do you reduce LLM hallucinations, control token latency, and evaluate prompt regressions systematically in production?',
    signals: ['Grounding / RAG', 'structured JSON outputs', 'golden eval dataset', 'streaming + fallback'],
    quickTip:
      'Tie reliability to deterministic JSON schema validation plus offline LLM-as-judge or golden-set regression metrics.'
  },
  llm: {
    label: 'LLM Systems',
    canonicalKey: 'genai',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do temperature, top-p, context window limits, and prompt caching impact output consistency, cost, and time-to-first-token?',
    signals: ['KV cache / prompt caching', 'token budgeting', 'guardrails', 'latency vs quality'],
    quickTip:
      'Explain keeping static system instructions first to maximize prefix prompt-cache hits and setting low temperature for extraction tasks.'
  },
  rag: {
    label: 'RAG Pipelines',
    canonicalKey: 'rag',
    focusArea: 'Production Scenario',
    question:
      'If a RAG pipeline retrieves irrelevant chunks or misses exact keyword matches, how do chunking strategy, hybrid search, and reranking fix it?',
    signals: ['BM25 + dense vector hybrid', 'cross-encoder reranker', 'chunk overlap & metadata filters', 'recall@k'],
    quickTip:
      'Recommend combining lexical BM25 with semantic embeddings plus a cross-encoder reranker before stuffing context into the prompt.'
  },
  langchain: {
    label: 'LangChain',
    canonicalKey: 'langchain',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do you design observable multi-step tool-calling agents with bounded retries, timeouts, and structured outputs?',
    signals: ['Tool schema validation', 'max-iterations guard', 'tracing/telemetry', 'human-in-the-loop'],
    quickTip:
      'Emphasize capping agent loop steps and validating every tool argument before execution to avoid runaway token spend.'
  },
  vectordb: {
    label: 'Vector Databases',
    canonicalKey: 'vectordb',
    focusArea: 'Core Depth',
    question:
      'How do HNSW and IVF approximate nearest-neighbor indexes trade off recall, memory footprint, and p99 query latency with metadata filtering?',
    signals: ['HNSW graph traversal', 'cosine vs dot product', 'pre- vs post-filtering', 'embedding dimensionality'],
    quickTip:
      'Highlight the post-filtering pitfall: strict metadata filters applied after top-k ANN search can return fewer results than requested.'
  },
  openai: {
    label: 'LLM APIs',
    canonicalKey: 'genai',
    focusArea: 'Production Scenario',
    question:
      'How do you handle rate limits (HTTP 429), exponential backoff, and structured function calling reliably in an LLM-backed backend?',
    signals: ['Exponential backoff + jitter', 'circuit breaker', 'schema enforcement', 'token rate quotas'],
    quickTip:
      'Mention isolating API keys strictly on the backend and streaming partial responses via SSE/WebSockets for perceived speed.'
  },
  huggingface: {
    label: 'Hugging Face',
    canonicalKey: 'huggingface',
    focusArea: 'Core Depth',
    question:
      'How do you fine-tune an open-weights transformer efficiently using LoRA/QLoRA and benchmark quantized inference throughput?',
    signals: ['PEFT / LoRA adapters', '4-bit/8-bit quantization', 'tokenization padding', 'vLLM / batching'],
    quickTip:
      'Explain that LoRA freezes base weights and trains low-rank adapter matrices, cutting GPU VRAM requirements dramatically.'
  },
  pytorch: {
    label: 'PyTorch',
    canonicalKey: 'pytorch',
    focusArea: 'Core Depth',
    question:
      'How do autograd computation graphs, mixed precision (AMP), and DataLoader num_workers / pin_memory accelerate training without OOM errors?',
    signals: ['loss.backward() & zero_grad()', 'torch.no_grad()', 'fp16/bf16 grad scaling', 'gradient accumulation'],
    quickTip:
      'Mention forgetting optimizer.zero_grad() accumulates gradients intentionally for larger effective batch sizes—or causes bugs if unintended.'
  },
  tensorflow: {
    label: 'TensorFlow',
    canonicalKey: 'tensorflow',
    focusArea: 'Core Depth',
    question:
      'How do tf.data input pipelines (.prefetch/.cache) and SavedModel serving prevent GPU starvation during training and inference?',
    signals: ['tf.data prefetching', '@tf.function graph tracing', 'TensorFlow Serving', 'batch inference'],
    quickTip:
      'Point out overlapping CPU preprocessing with GPU training steps via dataset.prefetch(tf.data.AUTOTUNE).'
  },
  ai: {
    label: 'Applied AI',
    canonicalKey: 'ai',
    focusArea: 'Production Scenario',
    question:
      'How do you measure offline model accuracy against online business metrics and catch silent data drift after deployment?',
    signals: ['Precision/Recall/F1', 'train-serve skew', 'feature drift', 'A/B shadow deployment'],
    quickTip:
      'Always connect offline validation metrics to a real latency budget and post-deploy drift monitoring.'
  },
  ml: {
    label: 'Machine Learning',
    canonicalKey: 'ml',
    focusArea: 'Core Depth',
    question:
      'How do you diagnose high bias vs high variance, handle severe class imbalance, and avoid target leakage during cross-validation?',
    signals: ['PR-AUC vs ROC-AUC', 'pipeline scaling inside CV folds', 'regularization (L1/L2)', 'SMOTE / class weights'],
    quickTip:
      'Mention fitting scalers/imputers strictly inside each training fold—fitting on the full dataset leaks test distribution.'
  },
  deeplearning: {
    label: 'Deep Learning',
    canonicalKey: 'deeplearning',
    focusArea: 'Core Depth',
    question:
      'Why do residual connections, LayerNorm/BatchNorm, and attention scaling (1/sqrt(dk)) stabilize deep neural network optimization?',
    signals: ['Vanishing gradients', 'softmax saturation', 'BatchNorm train vs eval', 'AdamW weight decay'],
    quickTip:
      'Explain that scaling dot-product attention prevents huge logits from pushing softmax into near-zero gradient regions.'
  },
  mlflow: {
    label: 'MLflow / MLOps',
    canonicalKey: 'mlflow',
    focusArea: 'Production Scenario',
    question:
      'How do you version datasets, hyperparameters, and model artifacts for reproducible promotion from staging to production?',
    signals: ['Experiment tracking', 'Model Registry stages', 'reproducible seed/env', 'rollback strategy'],
    quickTip:
      'Link tracking URI + model signature validation so schema mismatches fail CI before reaching production endpoints.'
  },
  golang: {
    label: 'Golang',
    canonicalKey: 'golang',
    focusArea: 'Core Depth',
    question:
      'How do Go’s GMP scheduler, buffered vs unbuffered channels, and context.Context cancellation prevent goroutine leaks in microservices?',
    signals: ['Context propagation/timeouts', 'select with ctx.Done()', 'race detector (-race)', 'sync.WaitGroup / errgroup'],
    quickTip:
      'Always emphasize checking ctx.Done() inside long-running goroutines and running tests with go test -race.'
  },
  grpc: {
    label: 'gRPC / Protobuf',
    canonicalKey: 'grpc',
    focusArea: 'Architecture & Trade-offs',
    question:
      'When does gRPC over HTTP/2 outperform REST/JSON, and how do you evolve Protobuf schemas without breaking older clients?',
    signals: ['Binary serialization', 'HTTP/2 multiplexing', 'field numbers never reused', 'deadlines/interceptors'],
    quickTip:
      'Highlight reserving deprecated Protobuf field numbers and propagating per-hop RPC deadlines so cascading retries don’t overload services.'
  },
  kafka: {
    label: 'Apache Kafka',
    canonicalKey: 'kafka',
    focusArea: 'Production Scenario',
    question:
      'How do Kafka partition keys preserve event ordering, and how do you achieve at-least-once processing safely with idempotent consumers?',
    signals: ['Consumer groups', 'partition key ordering', 'offset commit timing', 'dead-letter queue (DLQ)'],
    quickTip:
      'Explain that ordering is guaranteed only within a single partition, and duplicate delivery requires idempotent database writes.'
  },
  microservices: {
    label: 'Microservices',
    canonicalKey: 'microservices',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do you maintain data consistency across microservice boundaries using the Saga / Transactional Outbox pattern instead of distributed 2PC?',
    signals: ['Outbox table + CDC', 'compensating transactions', 'circuit breaker', 'distributed tracing (OpenTelemetry)'],
    quickTip:
      'Explain the dual-write problem: writing to DB + publishing to Kafka atomically requires the Outbox pattern.'
  },
  rust: {
    label: 'Rust',
    canonicalKey: 'rust',
    focusArea: 'Core Depth',
    question:
      'How do Rust’s ownership, borrowing (&T vs &mut T), and lifetimes guarantee memory and data-race safety at compile time without a garbage collector?',
    signals: ['Single mutable xor multiple shared refs', 'Send & Sync traits', 'RAII Drop', 'Zero-cost abstractions'],
    quickTip:
      'Give a crisp example of Send/Sync enforcing thread safety at compile time and why Arc<Mutex<T>> is explicit.'
  },
  tokio: {
    label: 'Tokio Async Rust',
    canonicalKey: 'tokio',
    focusArea: 'Production Scenario',
    question:
      'Why must you avoid calling blocking std::fs or heavy synchronous loops directly inside a Tokio async task, and how does spawn_blocking solve it?',
    signals: ['Work-stealing executor starvation', 'tokio::task::spawn_blocking', 'tokio::select! cancellation safety'],
    quickTip:
      'Mention cancellation safety in tokio::select! loops so partially polled futures do not drop buffered items.'
  },
  aws: {
    label: 'AWS Cloud',
    canonicalKey: 'aws',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do you design a multi-AZ highly available web backend on AWS using VPC public/private subnets, ALB, IAM least privilege, and RDS?',
    signals: ['Private subnet DB isolation', 'IAM roles vs static keys', 'Auto Scaling + ALB health checks', 'S3 pre-signed URLs'],
    quickTip:
      'Always stress IAM Roles for EC2/ECS/Lambda rather than embedding long-lived access keys in environment variables.'
  },
  azure: {
    label: 'Microsoft Azure',
    canonicalKey: 'azure',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do Managed Identities, Azure Key Vault, and Virtual Network integration secure a cloud-native API without hardcoded credentials?',
    signals: ['Managed Identity (RBAC)', 'Key Vault rotation', 'Availability Zones', 'Private Endpoints'],
    quickTip:
      'Highlight replacing connection strings/secrets with passwordless Managed Identity authentication.'
  },
  gcp: {
    label: 'Google Cloud (GCP)',
    canonicalKey: 'gcp',
    focusArea: 'Architecture & Trade-offs',
    question:
      'When would you deploy a backend workload on Cloud Run vs GKE, and how do IAM service accounts and Cloud SQL Auth Proxy secure traffic?',
    signals: ['Serverless scale-to-zero vs K8s control', 'Workload Identity', 'Cloud SQL Proxy', 'VPC Serverless Connector'],
    quickTip:
      'Contrast Cloud Run’s zero-ops request-based autoscaling with GKE for stateful/custom sidecar networking.'
  },
  cloud: {
    label: 'Cloud Architecture',
    canonicalKey: 'cloud',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do horizontal autoscaling, health probes, and graceful connection draining prevent dropped requests during deployments?',
    signals: ['Readiness vs Liveness probes', 'SIGTERM handling', 'stateless app servers', 'multi-region failover'],
    quickTip:
      'Explain why readiness probes remove unhealthy pods from load balancer rotation without restarting them prematurely.'
  },
  docker: {
    label: 'Docker',
    canonicalKey: 'docker',
    focusArea: 'Production Scenario',
    question:
      'How do multi-stage Dockerfiles, layer cache ordering, and non-root users shrink container image sizes and harden runtime security?',
    signals: ['Multi-stage build', 'COPY dependency manifest first', 'non-root USER', '.dockerignore'],
    quickTip:
      'Give a concrete layer-order example: copy pom.xml/package.json and install dependencies before copying src/ so code edits reuse cached layers.'
  },
  kubernetes: {
    label: 'Kubernetes',
    canonicalKey: 'kubernetes',
    focusArea: 'Production Scenario',
    question:
      'What happens when a Pod hits its CPU limit vs memory limit (OOMKilled), and how do readinessProbe, HPA, and PodDisruptionBudget keep rollouts safe?',
    signals: ['CPU throttling vs Memory OOMKilled', 'requests vs limits', 'RollingUpdate maxUnavailable', 'liveness vs readiness'],
    quickTip:
      'State clearly: CPU is compressible (throttled), memory is incompressible (OOMKilled).'
  },
  terraform: {
    label: 'Terraform (IaC)',
    canonicalKey: 'terraform',
    focusArea: 'Production Scenario',
    question:
      'Why is remote state locking essential for team Terraform workflows, and how do you recover safely from manual console drift?',
    signals: ['Remote backend + state lock', 'terraform plan review', 'import / state rm', 'modular workspaces'],
    quickTip:
      'Emphasize encrypted remote state (S3+lock/GCS) and running terraform plan in CI before applying changes.'
  },
  cicd: {
    label: 'CI/CD Pipelines',
    canonicalKey: 'cicd',
    focusArea: 'Production Scenario',
    question:
      'How do you structure a fast, reliable CI/CD pipeline with test parallelization, immutable build artifacts, and automated canary rollbacks?',
    signals: ['Build once deploy everywhere', 'lint/unit/integration stages', 'smoke health checks', 'blue-green / canary'],
    quickTip:
      'Explain building and signing one immutable container digest rather than rebuilding source code separately for staging and production.'
  },
  jenkins: {
    label: 'Jenkins',
    canonicalKey: 'cicd',
    focusArea: 'Production Scenario',
    question:
      'How do Declarative Jenkinsfiles, ephemeral build agents, and Credentials Binding prevent pipeline drift and secret leaks?',
    signals: ['Pipeline as Code', 'masking secrets', 'parallel stages', 'agent isolation'],
    quickTip:
      'Recommend Dockerized ephemeral agents so builds don’t pollute shared Jenkins worker state.'
  },
  linux: {
    label: 'Linux Systems',
    canonicalKey: 'linux',
    focusArea: 'Production Scenario',
    question:
      'If a production Linux server slows down with high load average, how do you distinguish CPU saturation, memory swapping, and disk I/O wait?',
    signals: ['top/htop %wa vs %us', 'vmstat / iostat', 'ss / lsof open sockets', 'file descriptor limits (ulimit)'],
    quickTip:
      'Walk systematically through CPU, memory/swap, disk I/O, and network sockets (USE method: Utilization, Saturation, Errors).'
  },
  prometheus: {
    label: 'Prometheus',
    canonicalKey: 'observability',
    focusArea: 'Production Scenario',
    question:
      'Why should Prometheus labels avoid high-cardinality values like user_id, and how do Counter rate() and Histogram quantiles measure p99 latency?',
    signals: ['Cardinality explosion', 'histogram_quantile', 'pull scraping model', 'RED/USE metrics'],
    quickTip:
      'Point out that high-cardinality labels blow up time-series memory; put user IDs in traces/logs, not metric labels.'
  },
  grafana: {
    label: 'Grafana & Alerts',
    canonicalKey: 'observability',
    focusArea: 'Production Scenario',
    question:
      'How do you design actionable SLO burn-rate dashboards and alerts in Grafana so engineers aren’t woken up by noisy transient spikes?',
    signals: ['Multi-window SLO burn rate', 'for: duration window', 'latency percentiles vs averages', 'runbook links'],
    quickTip:
      'Explain why p95/p99 latency exposes tail slowdowns that mean averages hide completely.'
  },
  devops: {
    label: 'DevOps / SRE',
    canonicalKey: 'devops',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do error budgets, blameless postmortems, and zero-downtime database migrations balance release velocity with reliability?',
    signals: ['SLI/SLO/SLA', 'expand-and-contract DB migrations', 'observability pillars', 'automation'],
    quickTip:
      'Use expand-and-contract (additive column -> dual write -> backfill -> drop old column) to guarantee backward-compatible rollbacks.'
  },
  spark: {
    label: 'Apache Spark',
    canonicalKey: 'spark',
    focusArea: 'Production Scenario',
    question:
      'How do you diagnose and resolve wide shuffle skew and OutOfMemory errors in a Spark job joining a massive fact table with a small dimension table?',
    signals: ['Broadcast hash join', 'narrow vs wide transformations', 'salting skewed keys', 'Adaptive Query Execution (AQE)'],
    quickTip:
      'Lead with broadcast(small_df) to eliminate the network shuffle entirely when one table fits in executor memory.'
  },
  hadoop: {
    label: 'Hadoop / HDFS',
    canonicalKey: 'hadoop',
    focusArea: 'Architecture & Trade-offs',
    question:
      'Why does the "small files problem" degrade HDFS NameNode memory and MapReduce/Spark task startup times, and how does Parquet compaction fix it?',
    signals: ['NameNode metadata RAM', 'columnar Parquet + predicate pushdown', 'block size alignment'],
    quickTip:
      'Explain storing data in right-sized columnar Parquet files so queries skip irrelevant row groups and columns.'
  },
  dbt: {
    label: 'dbt Analytics',
    canonicalKey: 'dbt',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do incremental models, ref() lineage DAGs, and schema/data tests prevent broken downstream dashboards in dbt?',
    signals: ['is_incremental() unique_key', 'source freshness tests', 'not_null/unique/accepted_values', 'staging -> mart layers'],
    quickTip:
      'Mention handling late-arriving data in incremental models using a lookback window on the timestamp predicate.'
  },
  airflow: {
    label: 'Apache Airflow',
    canonicalKey: 'airflow',
    focusArea: 'Production Scenario',
    question:
      'Why must Airflow DAG tasks be idempotent, and how do catchup, backfill, and XCom limits affect pipeline reliability?',
    signals: ['Idempotent partition overwrites', 'logical_date / execution_date', 'avoid large XComs', 'retries & SLAs'],
    quickTip:
      'State clearly: pass S3/GCS file paths via XCom rather than raw payloads, and overwrite by partition date on reruns.'
  },
  snowflake: {
    label: 'Snowflake',
    canonicalKey: 'snowflake',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do Snowflake micro-partitions, clustering keys, and virtual warehouse auto-suspend optimize both query speed and compute credit cost?',
    signals: ['Storage/compute separation', 'partition pruning', 'Time Travel & Zero-Copy Cloning', 'result cache'],
    quickTip:
      'Mention Zero-Copy Cloning for instant dev/QA environments without duplicating underlying storage.'
  },
  analytics: {
    label: 'Data Analytics',
    canonicalKey: 'analytics',
    focusArea: 'Core Depth',
    question:
      'How do you validate metric definitions, handle survivorship bias or missing data, and ensure stakeholder dashboards match source-of-truth tables?',
    signals: ['Metric reconciliation', 'cohort analysis', 'outliers vs median', 'reproducible SQL views'],
    quickTip:
      'Always verify denominator definitions and date-timezone boundaries before comparing trends across tools.'
  },
  tableau: {
    label: 'Tableau / BI',
    canonicalKey: 'analytics',
    focusArea: 'Production Scenario',
    question:
      'When should you choose a Tableau Extract over a Live connection, and how do Level of Detail (LOD) expressions affect dashboard query speed?',
    signals: ['FIXED/INCLUDE/EXCLUDE LOD', 'Hyper extracts vs live warehouse', 'context filters order of operations'],
    quickTip:
      'Point out Tableau’s order of operations: context filters narrow data before FIXED LOD calculations run.'
  },
  excel: {
    label: 'Excel Modeling',
    canonicalKey: 'excel',
    focusArea: 'Core Depth',
    question:
      'How do XLOOKUP / INDEX-MATCH, PivotTables, and Power Query clean and reconcile multi-sheet datasets without fragile hard-coded cell references?',
    signals: ['Dynamic arrays / XLOOKUP', 'Power Query repeatable ETL', 'data validation rules'],
    quickTip:
      'Highlight Power Query for repeatable raw-data cleanup instead of manual copy-paste transforms.'
  },
  playwright: {
    label: 'Playwright',
    canonicalKey: 'testing',
    focusArea: 'Production Scenario',
    question:
      'How do Playwright’s auto-waiting web-first assertions and user-facing locators eliminate flaky tests compared to hard-coded sleep() calls?',
    signals: ['getByRole / getByTestId', 'auto-waiting assertions', 'network mocking (page.route)', 'trace viewer'],
    quickTip:
      'Contrast brittle CSS/XPath selectors and waitForTimeout() with accessible getByRole() locators and await expect(locator).toBeVisible().'
  },
  selenium: {
    label: 'Selenium WebDriver',
    canonicalKey: 'testing',
    focusArea: 'Core Depth',
    question:
      'Why is mixing Implicit Waits and Explicit Waits dangerous in Selenium, and how does the Page Object Model keep suites maintainable?',
    signals: ['WebDriverWait + ExpectedConditions', 'StaleElementReferenceException', 'POM encapsulation'],
    quickTip:
      'Recommend setting implicit wait to 0 and relying consistently on explicit WebDriverWait conditions.'
  },
  testing: {
    label: 'QA & Test Automation',
    canonicalKey: 'testing',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do you apply the Testing Pyramid (unit, API integration, E2E) so regressions are caught in seconds without maintaining brittle end-to-end suites?',
    signals: ['Fast deterministic unit tests', 'API contract tests', 'critical-path E2E', 'test isolation'],
    quickTip:
      'Explain keeping E2E tests focused on critical user journeys while validating edge cases at the unit and API layers.'
  },
  restassured: {
    label: 'REST Assured',
    canonicalKey: 'restassured',
    focusArea: 'Production Scenario',
    question:
      'How do you validate HTTP status codes, JSON Schema contracts, and authenticated flows cleanly in REST Assured?',
    signals: ['RequestSpecification reuse', 'JSON Schema validation', 'Auth token injection', 'idempotent test data'],
    quickTip:
      'Mention extracting a shared RequestSpecification and asserting JSON schema types alongside business values.'
  },
  cybersecurity: {
    label: 'Cybersecurity',
    canonicalKey: 'cybersecurity',
    focusArea: 'Core Depth',
    question:
      'How do you defend a web application against OWASP Top 10 risks like SQL Injection, Broken Access Control (IDOR), and XSS end-to-end?',
    signals: ['Parameterized queries', 'server-side authorization checks', 'CSP & output encoding', 'HttpOnly/SameSite cookies'],
    quickTip:
      'Emphasize never trusting client-provided IDs/roles—always verify resource ownership on the server for every request.'
  },
  siem: {
    label: 'SIEM & SOC Triage',
    canonicalKey: 'siem',
    focusArea: 'Production Scenario',
    question:
      'When a SIEM correlation rule fires on suspicious credential-stuffing or lateral movement, what log sources and steps confirm true vs false positives?',
    signals: ['Auth + proxy + endpoint logs', 'alert correlation', 'IOC enrichment', 'containment & escalation'],
    quickTip:
      'Describe correlating identity provider logs, source IP reputation, and endpoint process trees before isolating hosts.'
  },
  iam: {
    label: 'IAM & Zero Trust',
    canonicalKey: 'iam',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do OAuth 2.0 / OIDC authorization code flow with PKCE, RBAC, and short-lived tokens enforce Least Privilege?',
    signals: ['Authorization Code + PKCE', 'JWT signature/expiry validation', 'RBAC/ABAC', 'secret rotation'],
    quickTip:
      'Point out why PKCE protects public SPA/mobile clients against authorization code interception.'
  },
  networking: {
    label: 'Networking',
    canonicalKey: 'networking',
    focusArea: 'Core Depth',
    question:
      'Walk through what happens from DNS lookup and TCP/TLS handshake to HTTP response when a user loads a web app behind a load balancer.',
    signals: ['DNS resolution', 'TCP 3-way handshake', 'TLS certificate/key exchange', 'L4 vs L7 load balancing'],
    quickTip:
      'Keep the sequence crisp: DNS -> TCP SYN/SYN-ACK/ACK -> TLS 1.3 handshake -> HTTP request/response.'
  },
  android: {
    label: 'Android',
    canonicalKey: 'android',
    focusArea: 'Core Depth',
    question:
      'How do Android ViewModel, Lifecycle-aware Coroutines (repeatOnLifecycle), and Room preserve UI state safely across configuration changes?',
    signals: ['ViewModel survives rotation', 'StateFlow collection', 'Main-thread ANR prevention', 'WorkManager'],
    quickTip:
      'Mention collecting Flows with repeatOnLifecycle(STARTED) so backgrounded UI stops wasting resources.'
  },
  kotlin: {
    label: 'Kotlin',
    canonicalKey: 'kotlin',
    focusArea: 'Core Depth',
    question:
      'How do Kotlin structured concurrency (CoroutineScope, Dispatchers.IO vs Default) and sealed classes simplify safe asynchronous state?',
    signals: ['Cancellation propagation', 'sealed interface states', 'null safety', 'Flow cold streams'],
    quickTip:
      'Explain Dispatcher selection: Main for UI, IO for network/disk, Default for CPU parsing/sorting.'
  },
  ios: {
    label: 'iOS / Swift',
    canonicalKey: 'ios',
    focusArea: 'Core Depth',
    question:
      'How do Swift ARC weak/unowned references prevent retain cycles in closures, and how do async/await Actors protect mutable shared state?',
    signals: ['[weak self] capture lists', 'value (struct) vs reference (class)', '@MainActor UI updates'],
    quickTip:
      'Contrast [weak self] (optional, safe when deallocated) vs [unowned self] (crashes if target outlives closure).'
  },
  flutter: {
    label: 'Flutter',
    canonicalKey: 'flutter',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do Flutter’s Widget/Element/RenderObject trees enable 60/120fps rendering, and how do const constructors reduce rebuild work?',
    signals: ['Immutable Widgets vs Elements', 'const widgets', 'Isolates for heavy JSON', 'Keys in lists'],
    quickTip:
      'Explain offloading heavy JSON parsing with compute()/Isolate.run so the UI frame budget (<16ms) stays smooth.'
  },
  'react-native': {
    label: 'React Native',
    canonicalKey: 'react-native',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How does the New Architecture (JSI + Fabric + TurboModules) eliminate JSON bridge serialization bottlenecks in React Native?',
    signals: ['Synchronous JSI C++ bindings', 'FlatList virtualization', 'UI vs JS thread animations'],
    quickTip:
      'Highlight running animations on the native UI thread (Reanimated/useNativeDriver) to prevent JS-thread frame drops.'
  },
  csharp: {
    label: 'C#',
    canonicalKey: 'dotnet',
    focusArea: 'Core Depth',
    question:
      'How do async/await state machines, IDisposable/using blocks, and LINQ deferred execution affect memory and SQL generation?',
    signals: ['ConfigureAwait / Task allocation', 'IQueryable vs IEnumerable', 'Garbage Collector generations'],
    quickTip:
      'Point out the common LINQ trap: calling .ToList() too early pulls entire tables into memory instead of filtering in SQL.'
  },
  dotnet: {
    label: '.NET / ASP.NET Core',
    canonicalKey: 'dotnet',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do ASP.NET Core service lifetimes (Transient, Scoped, Singleton) work, and why is injecting a Scoped DbContext into a Singleton a bug?',
    signals: ['Captive dependency trap', 'Middleware pipeline', 'Minimal APIs / EF Core tracking', 'AsNoTracking()'],
    quickTip:
      'Call out the captive dependency bug and mention AsNoTracking() for read-only EF Core queries.'
  },
  solidity: {
    label: 'Solidity',
    canonicalKey: 'solidity',
    focusArea: 'Production Scenario',
    question:
      'How does the Checks-Effects-Interactions pattern (plus ReentrancyGuard) prevent reentrancy exploits in Solidity smart contracts?',
    signals: ['Update state before external call', 'integer overflow checks (0.8+)', 'gas optimization / storage packing'],
    quickTip:
      'Emphasize strictly updating balances before calling msg.sender.call{value:...} and auditing external callbacks.'
  },
  blockchain: {
    label: 'Blockchain',
    canonicalKey: 'blockchain',
    focusArea: 'Core Depth',
    question:
      'How do finality, gas fees, and Layer-2 rollups (Optimistic vs ZK) balance decentralization, security, and transaction throughput?',
    signals: ['Consensus & finality', 'fraud proofs vs validity proofs', 'on-chain vs off-chain storage'],
    quickTip:
      'Contrast 7-day challenge windows on Optimistic Rollups with cryptographic validity proofs on ZK Rollups.'
  },
  web3: {
    label: 'Web3 / dApps',
    canonicalKey: 'web3',
    focusArea: 'Production Scenario',
    question:
      'How do you handle wallet transaction lifecycle states (signing, pending, confirmation, chain reorgs) cleanly in a Web3 frontend?',
    signals: ['EIP-1193 provider', 'nonce / gas estimation', 'optimistic pending UX', 'off-chain indexing (The Graph)'],
    quickTip:
      'Highlight reading indexed event logs for fast UI rendering rather than scanning raw RPC blocks.'
  },
  figma: {
    label: 'Figma & Design Systems',
    canonicalKey: 'uiux',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do Figma Auto Layout, Design Tokens (Variables), and Component Variants translate cleanly into responsive production CSS?',
    signals: ['Semantic color/spacing tokens', 'interactive component states', 'developer handoff specs'],
    quickTip:
      'Connect design tokens directly to CSS custom properties so Light/Dark themes update consistently.'
  },
  uiux: {
    label: 'UI/UX Design',
    canonicalKey: 'uiux',
    focusArea: 'Core Depth',
    question:
      'How do you evaluate visual hierarchy, WCAG AA color contrast (4.5:1), and error/empty states when designing a complex workflow?',
    signals: ['WCAG contrast & focus rings', 'progressive disclosure', 'usability testing metrics', 'cognitive load'],
    quickTip:
      'Walk through an actual before/after friction point you simplified using user feedback or task-completion metrics.'
  },
  designthinking: {
    label: 'Product & Design Thinking',
    canonicalKey: 'uiux',
    focusArea: 'Production Scenario',
    question:
      'Walk through how you move from ambiguous user pain points and low-fidelity prototypes to validated metrics before engineering commits code.',
    signals: ['Problem framing', 'rapid prototyping', 'usability validation', 'success KPIs'],
    quickTip:
      'Emphasize testing assumptions cheaply with prototypes before investing full sprint cycles.'
  },
  unity: {
    label: 'Unity',
    canonicalKey: 'unity',
    focusArea: 'Core Depth',
    question:
      'Why do physics calculations belong in FixedUpdate() instead of Update(), and how does Object Pooling prevent GC frame spikes?',
    signals: ['Frame-rate independence (Time.deltaTime)', 'GC allocation avoidance', 'Update vs FixedUpdate'],
    quickTip:
      'Explain pooling projectiles/particles up front instead of Instantiate()/Destroy() loops during gameplay.'
  },
  '3d': {
    label: '3D Graphics / WebGL',
    canonicalKey: '3d',
    focusArea: 'Production Scenario',
    question:
      'How do draw-call batching/instancing, LODs, and compressed textures keep frame times under 16ms across lower-end GPUs?',
    signals: ['InstancedMesh / batching', 'triangle & shader complexity', 'texture atlasing', 'frustum culling'],
    quickTip:
      'Point out that reducing draw calls via instancing often yields bigger FPS wins than shaving a few polygons.'
  },
  algorithms: {
    label: 'Data Structures & Algorithms',
    canonicalKey: 'algorithms',
    focusArea: 'Core Depth',
    question:
      'How do you recognize when to model a problem with a Heap, Sliding Window, Topological Sort, or Dynamic Programming—and analyze space vs time?',
    signals: ['Asymptotic Big-O proof', 'edge cases (empty/cycles/overflow)', 'in-place vs auxiliary memory'],
    quickTip:
      'Always state brute-force complexity first, clarify input constraints, and walk through a small dry-run example before coding.'
  },
  'rest-api': {
    label: 'REST API Design',
    canonicalKey: 'rest-api',
    focusArea: 'Architecture & Trade-offs',
    question:
      'How do you design idempotent PUT/POST endpoints, cursor pagination, and consistent error contracts (HTTP 4xx vs 5xx) in a public REST API?',
    signals: ['HTTP status semantics', 'cursor vs offset pagination', 'idempotency keys', 'API versioning'],
    quickTip:
      'Highlight why cursor pagination scales cleanly on shifting datasets whereas high OFFSET scans slow down.'
  },
  jsp: {
    label: 'JSP / Server Views',
    canonicalKey: 'java',
    focusArea: 'Architecture & Trade-offs',
    question:
      'Why did modern Java backends move from JSP scriptlets toward MVC separation and stateless JSON REST APIs?',
    signals: ['Separation of concerns', 'XSS escaping', 'stateless scaling', 'session memory overhead'],
    quickTip:
      'Point out how stateless REST APIs simplify horizontal scaling and decouple web/mobile clients.'
  },
  servlet: {
    label: 'Java Servlets',
    canonicalKey: 'java',
    focusArea: 'Core Depth',
    question:
      'Explain the Jakarta/Java Servlet lifecycle (init, service, destroy) and how Spring’s DispatcherServlet routes requests through filters and controllers.',
    signals: ['Singleton servlet thread-safety', 'Filter vs Interceptor', 'DispatcherServlet Front Controller'],
    quickTip:
      'Mention why instance fields inside a Servlet aren’t thread-safe without synchronization.'
  },
  marketing: {
    label: 'Growth & Analytics',
    canonicalKey: 'marketing',
    focusArea: 'Production Scenario',
    question:
      'How do you design an A/B funnel experiment with clean attribution and statistical significance before scaling spend?',
    signals: ['Conversion funnel', 'CAC vs LTV', 'sample size & holdout group', 'cohort retention'],
    quickTip:
      'Connect acquisition experiments directly to downstream activation/retention rather than vanity click metrics.'
  }
};

const FOCUS_CYCLE: QuickTipFocusArea[] = [
  'Core Depth',
  'Architecture & Trade-offs',
  'Production Scenario'
];

function formatSkillLabel(token: string): string {
  const clean = token.trim().toLowerCase();
  if (SKILL_TIP_TEMPLATES[clean]) {
    return SKILL_TIP_TEMPLATES[clean].label;
  }
  return clean
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildSynthesizedTipQuestion(
  skillToken: string,
  job: JobItem,
  index: number
): QuickInterviewTipQuestion {
  const label = formatSkillLabel(skillToken);
  const focusArea = FOCUS_CYCLE[index % FOCUS_CYCLE.length];

  if (focusArea === 'Core Depth') {
    return {
      id: `quick-tip-${job.id}-${skillToken}-${index}`,
      skillKey: skillToken,
      skillLabel: label,
      focusArea,
      question: `For ${job.title} at ${job.company}, explain the core internals of ${label} and a common pitfall engineers hit in production.`,
      whatInterviewersLookFor: [`${label} fundamentals`, 'Edge-case handling', 'Performance trade-offs'],
      quickTip: `Start with a concise 2-sentence definition of ${label}, then give a real debugging example.`
    };
  }

  if (focusArea === 'Architecture & Trade-offs') {
    return {
      id: `quick-tip-${job.id}-${skillToken}-${index}`,
      skillKey: skillToken,
      skillLabel: label,
      focusArea,
      question: `How would you integrate ${label} cleanly with the rest of ${job.company}’s stack while keeping latency, testability, and maintainability high?`,
      whatInterviewersLookFor: ['System boundaries', 'Testing strategy', 'Scalability trade-offs'],
      quickTip: `Contrast two design alternatives using ${label} and explain why your choice fits ${job.title}.`
    };
  }

  return {
    id: `quick-tip-${job.id}-${skillToken}-${index}`,
    skillKey: skillToken,
    skillLabel: label,
    focusArea,
    question: `Describe a production incident or bottleneck involving ${label} you diagnosed, what telemetry confirmed the root cause, and how you prevented recurrence.`,
    whatInterviewersLookFor: ['Root-cause diagnostics', 'Metrics/logs', 'Prevention guardrails'],
    quickTip: `Use Situation -> Root Cause -> Fix -> Measurable Impact to keep your ${label} story crisp.`
  };
}

/**
 * Generates exactly 3 high-impact interview questions specifically tailored
 * to the currently selected job's skill stack.
 */
export function generateQuickInterviewTips(job: JobItem): QuickInterviewTipsBundle {
  const rawTokens = (job.skills || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const uniqueTokens = Array.from(new Set(rawTokens));
  const stackLabels =
    uniqueTokens.length > 0 ? uniqueTokens.map(formatSkillLabel) : ['Engineering Fundamentals'];

  const pickedQuestions: QuickInterviewTipQuestion[] = [];
  const usedCanonicalKeys = new Set<string>();

  for (let i = 0; i < uniqueTokens.length && pickedQuestions.length < 3; i++) {
    const token = uniqueTokens[i];
    const template = SKILL_TIP_TEMPLATES[token];

    if (template) {
      if (usedCanonicalKeys.has(template.canonicalKey)) {
        continue;
      }
      usedCanonicalKeys.add(template.canonicalKey);
      pickedQuestions.push({
        id: `quick-tip-${job.id}-${token}-${pickedQuestions.length}`,
        skillKey: token,
        skillLabel: template.label,
        focusArea: template.focusArea,
        question: template.question,
        whatInterviewersLookFor: template.signals,
        quickTip: template.quickTip
      });
    } else {
      if (usedCanonicalKeys.has(token)) {
        continue;
      }
      usedCanonicalKeys.add(token);
      pickedQuestions.push(
        buildSynthesizedTipQuestion(token, job, pickedQuestions.length)
      );
    }
  }

  // Ensure exactly 3 tailored questions even if the job lists only 1 or 2 skills
  const anchorSkillLabel = stackLabels[0] || 'System Design';
  const secondarySkillLabel = stackLabels[1] || anchorSkillLabel;

  const fallbackRoleQuestions: QuickInterviewTipQuestion[] = [
    {
      id: `quick-tip-${job.id}-architecture-fallback`,
      skillKey: 'architecture',
      skillLabel: `${anchorSkillLabel} Architecture`,
      focusArea: 'Architecture & Trade-offs',
      question: `As a ${job.title} at ${job.company}, how would you design a scalable service centered on ${anchorSkillLabel}${
        stackLabels.length > 1 ? ` and ${secondarySkillLabel}` : ''
      } to handle 10× peak traffic?`,
      whatInterviewersLookFor: ['Bottleneck analysis', 'Caching / Indexing', 'Graceful degradation'],
      quickTip: 'Clarify read/write ratios first, then pinpoint the single biggest bottleneck before adding complexity.'
    },
    {
      id: `quick-tip-${job.id}-debugging-fallback`,
      skillKey: 'production',
      skillLabel: `${anchorSkillLabel} Debugging`,
      focusArea: 'Production Scenario',
      question: `If a ${job.title} deployment using ${stackLabels.slice(0, 3).join(', ')} shows elevated p99 latency after release, how do you isolate and roll back safely?`,
      whatInterviewersLookFor: ['Telemetry & logs', 'Canary/rollback plan', 'Post-incident prevention'],
      quickTip: 'Show calm triage: verify blast radius, check recent commits/feature flags, stabilize first, then investigate root cause.'
    },
    {
      id: `quick-tip-${job.id}-impact-fallback`,
      skillKey: 'delivery',
      skillLabel: 'Engineering Impact',
      focusArea: 'Core Depth',
      question: `Which project in your portfolio best proves readiness for ${job.company}’s ${job.title} stack (${stackLabels.slice(0, 3).join(', ')}), and what architectural trade-off would you revisit today?`,
      whatInterviewersLookFor: ['Ownership & trade-offs', 'Quantified outcome', 'Self-reflection'],
      quickTip: 'Pick a concrete metric improvement (latency, query time, test coverage) rather than listing technologies.'
    }
  ];

  let fallbackIndex = 0;
  while (pickedQuestions.length < 3 && fallbackIndex < fallbackRoleQuestions.length) {
    pickedQuestions.push(fallbackRoleQuestions[fallbackIndex]);
    fallbackIndex++;
  }

  const finalQuestions: [
    QuickInterviewTipQuestion,
    QuickInterviewTipQuestion,
    QuickInterviewTipQuestion
  ] = [pickedQuestions[0], pickedQuestions[1], pickedQuestions[2]];

  const previewStack = stackLabels.slice(0, 3).join(', ');

  return {
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    stackLabels,
    summaryTip: `Expect ${job.company} interviewers for ${job.title} to probe depth across ${previewStack} — connect your answers to measurable latency, reliability, and clean architecture trade-offs.`,
    questions: finalQuestions
  };
}
