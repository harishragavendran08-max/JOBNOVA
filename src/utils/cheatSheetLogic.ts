import { InternshipItem, JobItem } from '../data/seedData';
import { ApplicationStageRecord } from './jobnovaLogic';

export type CheatSheetTopic =
  | 'Spring Boot'
  | 'Core Java'
  | 'JPA, Hibernate & SQL'
  | 'Architecture, REST & Concurrency';

export type CheatSheetDifficulty = 'Foundational' | 'Intermediate' | 'Senior';

export interface CheatSheetQuestion {
  id: string;
  topic: CheatSheetTopic;
  difficulty: CheatSheetDifficulty;
  question: string;
  conciseAnswer: string;
  deepDiveNotes: string[];
  codeSnippet?: string;
  interviewerFollowUp: string;
  skillTags: string[];
}

export interface PipelineRoleSummary {
  key: string;
  kind: 'Job' | 'Internship';
  id: number;
  title: string;
  company: string;
  stage: string;
  extractedTokens: string[];
}

export interface PipelineMatchDetail {
  roleKey: string;
  kind: 'Job' | 'Internship';
  title: string;
  company: string;
  stage: string;
  matchedTokens: string[];
}

export interface EnrichedCheatSheetItem {
  question: CheatSheetQuestion;
  matchedRoles: PipelineMatchDetail[];
  matchedTokens: string[];
  relevanceScore: number;
  isPipelineRequired: boolean;
}

export interface PipelineCheatSheetResult {
  items: EnrichedCheatSheetItem[];
  pipelineRoles: PipelineRoleSummary[];
  topRequiredTokens: string[];
  isPipelineEmpty: boolean;
  hasJavaSpringPipelineMatch: boolean;
}

export const CHEAT_SHEET_MASTERED_STORAGE_KEY = 'jobnova_cheatsheet_mastered_v1';

export const CHEAT_SHEET_TOPICS: readonly CheatSheetTopic[] = [
  'Spring Boot',
  'Core Java',
  'JPA, Hibernate & SQL',
  'Architecture, REST & Concurrency'
];

export const SPRING_JAVA_CHEAT_SHEET: CheatSheetQuestion[] = [
  {
    id: 'sb-autoconfig',
    topic: 'Spring Boot',
    difficulty: 'Foundational',
    question: 'How does @SpringBootApplication work under the hood, and how does Spring Boot Auto-Configuration decide which beans to create?',
    conciseAnswer:
      '@SpringBootApplication is a meta-annotation combining @SpringBootConfiguration, @EnableAutoConfiguration, and @ComponentScan. Auto-configuration inspects META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports and activates configuration classes only when @Conditional annotations (such as @ConditionalOnClass and @ConditionalOnMissingBean) match the classpath and existing context.',
    deepDiveNotes: [
      'Explain the 3 composed annotations clearly and mention that Spring Boot 3 moved from spring.factories to AutoConfiguration.imports.',
      'Highlight @ConditionalOnMissingBean: if you define your own DataSource or ObjectMapper bean, Spring Boot backs off gracefully.',
      'Mention spring-boot-starter-* BOMs and how starters bundle transitive dependencies without version conflicts.'
    ],
    codeSnippet: `@SpringBootApplication // = @SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan
public class JobNovaApplication {
    public static void main(String[] args) {
        SpringApplication.run(JobNovaApplication.class, args);
    }
}`,
    interviewerFollowUp: 'How would you exclude a specific auto-configuration class if a library brings an unwanted bean onto the classpath?',
    skillTags: ['springboot', 'spring', 'java']
  },
  {
    id: 'sb-transactional',
    topic: 'Spring Boot',
    difficulty: 'Intermediate',
    question: 'Explain @Transactional propagation, rollback rules, and the self-invocation proxy pitfall.',
    conciseAnswer:
      'Spring implements @Transactional using AOP dynamic proxies around the bean. By default (Propagation.REQUIRED), a method joins an active transaction or starts a new one, and rolls back only on unchecked RuntimeExceptions/Errors unless rollbackFor is specified. Calling another @Transactional method on `this` bypasses the proxy completely.',
    deepDiveNotes: [
      'Default rollback behavior: unchecked exceptions roll back; checked exceptions commit unless `rollbackFor = Exception.class` is configured.',
      'Self-invocation pitfall: `this.innerMethod()` calls the target object directly instead of the Spring AOP proxy, so @Transactional (and @Async/@Cacheable) annotations on the inner method are ignored.',
      'Contrast REQUIRED vs REQUIRES_NEW (suspends outer tx for audit logging) and mention `@Transactional(readOnly = true)` for Hibernate dirty-checking optimization.'
    ],
    codeSnippet: `@Service
public class ApplicationService {
    @Transactional(rollbackFor = Exception.class)
    public ApplicationRecord submitApplication(Long userId, Long jobId) {
        // Executed via Spring AOP proxy; checked & runtime exceptions roll back
        return repository.save(new ApplicationRecord(userId, jobId));
    }
}`,
    interviewerFollowUp: 'If Method A (REQUIRED) calls Method B (REQUIRES_NEW) on another bean and Method B throws a RuntimeException that Method A catches, does Method A still commit?',
    skillTags: ['springboot', 'spring', 'sql', 'mysql', 'hibernate', 'database']
  },
  {
    id: 'sb-ioc-scopes',
    topic: 'Spring Boot',
    difficulty: 'Foundational',
    question: 'Why is Constructor Injection preferred over Field Injection (@Autowired on fields), and what are the core Spring Bean Scopes?',
    conciseAnswer:
      'Constructor injection enforces immutability via `final` fields, fails fast on circular or missing dependencies at startup, and enables plain JUnit unit testing without booting a Spring container. Core scopes are `singleton` (one per ApplicationContext, default), `prototype` (new instance per request), and web scopes (`request`, `session`, `application`).',
    deepDiveNotes: [
      'Single-constructor beans in Spring Boot do not require an explicit @Autowired annotation.',
      'Singleton beans must be stateless to remain thread-safe across concurrent HTTP servlet threads.',
      'If a singleton bean injects a prototype bean directly, only one prototype instance is injected unless you use ObjectProvider<T> or ScopedProxyMode.'
    ],
    codeSnippet: `@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private final JobService jobService;

    public JobController(JobService jobService) { // Immutable & easily testable
        this.jobService = jobService;
    }
}`,
    interviewerFollowUp: 'What happens at startup if Bean A constructor-injects Bean B and Bean B constructor-injects Bean A?',
    skillTags: ['springboot', 'spring', 'java', 'testing']
  },
  {
    id: 'sb-exception-rest',
    topic: 'Spring Boot',
    difficulty: 'Intermediate',
    question: 'How do you centralize error responses and input validation in a Spring Boot REST API?',
    conciseAnswer:
      'Combine Jakarta Bean Validation annotations (`@Valid`, `@NotBlank`, `@Email`) on DTO records with a `@RestControllerAdvice` class containing `@ExceptionHandler` methods that return consistent HTTP status codes and RFC 7807 `ProblemDetail` payloads.',
    deepDiveNotes: [
      'Avoid leaking stack traces or entity class names in production API responses.',
      'Use `@Valid` on `@RequestBody` parameters so invalid requests fail with `MethodArgumentNotValidException` (400 Bad Request) before touching service logic.',
      'Always map domain objects to Response DTOs or Java `record` types instead of returning JPA `@Entity` objects directly from controllers.'
    ],
    codeSnippet: `@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        detail.setTitle("Resource Not Found");
        return detail;
    }
}`,
    interviewerFollowUp: 'Difference between @ControllerAdvice and @RestControllerAdvice, and how does Spring pick between multiple matching exception handlers?',
    skillTags: ['springboot', 'rest-api', 'java', 'spring', 'jsp', 'servlet']
  },
  {
    id: 'sb-security-jwt',
    topic: 'Spring Boot',
    difficulty: 'Senior',
    question: 'Walk through the Spring Security 6 filter chain and how stateless JWT / OAuth2 authentication is configured.',
    conciseAnswer:
      'Incoming HTTP requests pass through `DelegatingFilterProxy` into `SecurityFilterChain`. For stateless REST APIs, disable CSRF/session creation (`SessionCreationPolicy.STATELESS`), validate Bearer JWT tokens in a custom `OncePerRequestFilter` registered before `UsernamePasswordAuthenticationFilter`, and populate `SecurityContextHolder`.',
    deepDiveNotes: [
      'Always verify JWT signature, `exp` expiration, `iss`, and `aud` claims; never trust unverified claims.',
      'Use `SecurityFilterChain` bean configuration (WebSecurityConfigurerAdapter was removed in Spring Security 6).',
      'Distinguish 401 Unauthorized (AuthenticationEntryPoint: missing/invalid credentials) vs 403 Forbidden (AccessDeniedHandler: insufficient role/authority).'
    ],
    codeSnippet: `@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtFilter) throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable)
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**", "/actuator/health").permitAll()
            .anyRequest().authenticated())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
}`,
    interviewerFollowUp: 'When using OAuth2 cookies in a browser SPA, why must CSRF protection remain enabled or mitigated differently than Bearer headers?',
    skillTags: ['springboot', 'spring', 'rest-api', 'java']
  },
  {
    id: 'java-hashmap',
    topic: 'Core Java',
    difficulty: 'Foundational',
    question: 'How does HashMap work internally in Java 8+, and why must hashCode() and equals() always be overridden together?',
    conciseAnswer:
      'HashMap stores entries in a bucket array (`Node<K,V>[]`), spreading bits of `key.hashCode()` to compute the bucket index. Collisions form a linked list, and once a bucket reaches `TREEIFY_THRESHOLD` (8) with capacity >= 64, it converts into a balanced Red-Black Tree for O(log n) worst-case lookup. If `equals()` returns true, `hashCode()` must be identical so lookups land in the same bucket.',
    deepDiveNotes: [
      'Default initial capacity is 16 with load factor 0.75 (resizes at 12 entries by doubling capacity and rehashing).',
      'Always use immutable keys (like String or Integer) so the hash code never changes after insertion.',
      'HashMap is NOT thread-safe (concurrent resizing can corrupt links or lose writes); use `ConcurrentHashMap` for multi-threaded access.'
    ],
    codeSnippet: `// Contract: a.equals(b) == true  ==>  a.hashCode() == b.hashCode()
public record StudentKey(long id, String email) {} // Java 17 record auto-generates immutable equals & hashCode`,
    interviewerFollowUp: 'Why does ConcurrentHashMap disallow null keys and values whereas HashMap allows one null key?',
    skillTags: ['java', 'algorithms']
  },
  {
    id: 'java-jvm-gc',
    topic: 'Core Java',
    difficulty: 'Intermediate',
    question: 'Explain the JVM Memory Architecture (Heap vs Stack vs Metaspace) and how Garbage Collection works.',
    conciseAnswer:
      'Each thread owns a private JVM Stack holding primitive locals and object references per method frame, while all threads share the Heap (Young Generation: Eden + S0/S1 Survivor spaces, and Old/Tenured Generation) and native-memory Metaspace (class metadata). Minor GC collects short-lived objects in Young Gen via copying; Major/Mixed GC reclaims long-lived objects in Old Gen.',
    deepDiveNotes: [
      'Most objects die young (Weak Generational Hypothesis), so Young Gen uses fast bump-the-pointer allocation and evacuation.',
      'Java 8 replaced PermGen (fixed heap space) with Metaspace (native OS memory), reducing PermGen OutOfMemoryError.',
      'G1GC (default since Java 9) divides the heap into equal-sized regions to balance throughput and predictable pause-time goals (`-XX:MaxGCPauseMillis`).'
    ],
    interviewerFollowUp: 'What causes a memory leak in Java even though the Garbage Collector runs automatically?',
    skillTags: ['java', 'springboot']
  },
  {
    id: 'java-concurrency',
    topic: 'Core Java',
    difficulty: 'Senior',
    question: 'Contrast `volatile`, `synchronized`, `AtomicInteger`, and `CompletableFuture` when building high-throughput Java services.',
    conciseAnswer:
      '`volatile` guarantees visibility across CPU caches and prevents instruction reordering, but does NOT make compound actions (`count++`) atomic. `AtomicInteger` uses lock-free CAS (Compare-And-Swap) for atomic updates, `synchronized` provides mutual exclusion + visibility, and `CompletableFuture` composes non-blocking asynchronous pipelines on an `ExecutorService`.',
    deepDiveNotes: [
      'Never use `CompletableFuture.supplyAsync(task)` without a bounded custom `Executor` in production microservices (the default `ForkJoinPool.commonPool()` can starve).',
      'In Java 21+, Virtual Threads (`Executors.newVirtualThreadPerTaskExecutor()`) allow high-concurrency blocking I/O without thread-pool exhaustion.',
      'Prevent deadlocks by acquiring locks in a consistent global order or using `ReentrantLock.tryLock(timeout)`.'
    ],
    codeSnippet: `CompletableFuture<UserDto> userFut = CompletableFuture.supplyAsync(() -> userClient.fetch(id), ioExecutor);
CompletableFuture<List<JobDto>> jobsFut = CompletableFuture.supplyAsync(() -> jobClient.recommended(id), ioExecutor);
DashboardDto dto = userFut.thenCombine(jobsFut, DashboardDto::new).join();`,
    interviewerFollowUp: 'How does ThreadLocal cause memory leaks inside Tomcat or Executor thread pools if `.remove()` is not called?',
    skillTags: ['java', 'springboot', 'algorithms']
  },
  {
    id: 'java-streams-modern',
    topic: 'Core Java',
    difficulty: 'Foundational',
    question: 'How do Java Streams execute lazily, and what are the advantages of Java 17 `record` and `Optional` in service layers?',
    conciseAnswer:
      'Stream intermediate operations (`filter`, `map`, `sorted`) are lazy and build a pipeline that executes in a single fused pass only when a terminal operation (`toList`, `collect`, `findFirst`) runs. Java 17 `record` types provide concise, immutable data carriers with automatic `equals`/`hashCode`/`toString`, while `Optional<T>` makes absent return values explicit in APIs.',
    deepDiveNotes: [
      'Do not use `Optional` for class fields or method parameters—use it specifically as a return type for repository/service queries.',
      'Be careful with `Optional.orElse(expensiveCall())` vs `Optional.orElseGet(() -> expensiveCall())`: `orElse` eagerly evaluates its argument even when present.',
      'Remember a Stream can only be consumed once; calling a second terminal operation throws `IllegalStateException`.'
    ],
    codeSnippet: `List<String> topCompanies = jobs.stream()
    .filter(j -> j.skills().contains("springboot"))
    .map(Job::company)
    .distinct()
    .toList(); // Java 16+ unmodifiable list`,
    interviewerFollowUp: 'Why should `parallelStream()` generally be avoided inside blocking Spring MVC controllers?',
    skillTags: ['java']
  },
  {
    id: 'jpa-nplus1',
    topic: 'JPA, Hibernate & SQL',
    difficulty: 'Intermediate',
    question: 'What is the Hibernate / JPA N+1 query problem and how do you fix it cleanly in Spring Data JPA?',
    conciseAnswer:
      'An N+1 problem happens when 1 query fetches N parent entities (e.g., 20 Jobs) and Hibernate issues N extra SQL queries to lazily load an associated child collection (e.g., `job.getApplications()`). Fix it using JPQL `JOIN FETCH`, `@EntityGraph(attributePaths = ...)`, DTO projections, or `@BatchSize`.',
    deepDiveNotes: [
      'Always default `@OneToMany` and `@ManyToOne` associations carefully: `@ManyToOne` defaults to `EAGER` in JPA, which can trigger hidden extra joins or queries unless set to `FetchType.LAZY`.',
      'Pagination caveat: combining `JOIN FETCH` on a collection with `Pageable` forces Hibernate to paginate in memory (`HHH90003004`). Solve by fetching paginated IDs first, then fetching entities by `IN (:ids)`.',
      'Enable `spring.jpa.show-sql` / `datasource-proxy` in local tests to catch N+1 regressions early.'
    ],
    codeSnippet: `@EntityGraph(attributePaths = {"companyProfile"})
@Query("SELECT j FROM Job j WHERE LOWER(j.skills) LIKE %:skill%")
List<Job> findWithCompanyBySkill(@Param("skill") String skill);`,
    interviewerFollowUp: 'Why does `JOIN FETCH` with a `Pageable` parameter trigger Hibernate warning HHH90003004, and how do you solve it?',
    skillTags: ['hibernate', 'springboot', 'sql', 'mysql', 'database', 'java']
  },
  {
    id: 'mysql-indexing-explain',
    topic: 'JPA, Hibernate & SQL',
    difficulty: 'Intermediate',
    question: 'How do MySQL InnoDB B+Tree indexes work, what is the Leftmost Prefix Rule, and what do you inspect in `EXPLAIN`?',
    conciseAnswer:
      'InnoDB stores table rows inside a Clustered B+Tree ordered by the Primary Key. Secondary indexes store the indexed column(s) plus the Primary Key pointer (requiring a second lookup unless it is a Covering Index). For a composite index `(company_id, status, created_at)`, queries can use `(company_id)` or `(company_id, status)` cleanly via the Leftmost Prefix Rule, but skipping `company_id` prevents index usage.',
    deepDiveNotes: [
      'In `EXPLAIN`, check `type` (aim for `const`, `eq_ref`, `ref`, `range`; avoid `ALL` full table scan), `key` (chosen index), `rows`, and `Extra` (`Using index` = covering index; avoid `Using filesort` / `Using temporary`).',
      'Place high-selectivity equality columns before range (`>`, `<`, `BETWEEN`) columns in composite indexes.',
      'Avoid wrapping indexed columns in SQL functions like `WHERE LOWER(email) = ...` unless using a MySQL 8 functional index or generated column.'
    ],
    codeSnippet: `-- Composite index respects Leftmost Prefix Rule:
CREATE INDEX idx_app_pipeline ON job_applications (user_id, stage, updated_at DESC);

EXPLAIN SELECT id, job_id FROM job_applications
WHERE user_id = 101 AND stage = 'Interviewing'; -- Extra: Using index (Covering Index!)`,
    interviewerFollowUp: 'Why are UUIDv4 primary keys slower for InnoDB inserts than sequential BIGINT or UUIDv7 keys?',
    skillTags: ['mysql', 'sql', 'database', 'hibernate']
  },
  {
    id: 'jpa-locking-isolation',
    topic: 'JPA, Hibernate & SQL',
    difficulty: 'Senior',
    question: 'Compare Optimistic Locking (`@Version`) vs Pessimistic Locking (`PESSIMISTIC_WRITE`) and MySQL Transaction Isolation Levels.',
    conciseAnswer:
      'Optimistic locking uses a `@Version` column checked in the `UPDATE ... WHERE id=? AND version=?` statement, throwing `OptimisticLockingFailureException` on conflict without holding DB row locks—ideal for low-contention reads. Pessimistic locking executes `SELECT ... FOR UPDATE` to block concurrent writers—ideal for high-contention inventory or balance updates.',
    deepDiveNotes: [
      'MySQL InnoDB defaults to `REPEATABLE READ`, using MVCC (Multi-Version Concurrency Control) snapshots for consistent reads and Next-Key Locks (record + gap locks) to prevent phantom reads.',
      'Spring/Hibernate default is typically the database default isolation; specify `@Transactional(isolation = Isolation.READ_COMMITTED)` when you want to reduce gap-lock contention.',
      'Remember Hibernate L1 Cache (Persistence Context) is scoped to a single transaction/EntityManager, while L2 Cache (e.g. Ehcache/Redis) spans across sessions.'
    ],
    codeSnippet: `@Entity
public class InterviewSlot {
    @Id private Long id;
    @Version private Long version; // Optimistic lock guard against lost updates
    private boolean booked;
}`,
    interviewerFollowUp: 'What happens if two concurrent threads read the same row, modify different fields, and commit under Optimistic Locking?',
    skillTags: ['hibernate', 'mysql', 'sql', 'springboot', 'database']
  },
  {
    id: 'arch-rest-idempotency',
    topic: 'Architecture, REST & Concurrency',
    difficulty: 'Intermediate',
    question: 'How do you design idempotent REST APIs, cursor pagination, and tune HikariCP connection pools in Spring Boot?',
    conciseAnswer:
      'GET, PUT, and DELETE are naturally idempotent; for POST creation/payment endpoints, accept an `Idempotency-Key` header stored with a unique DB constraint so retries return the original response instead of duplicating records. Use keyset/cursor pagination (`WHERE id > :lastId LIMIT 20`) instead of deep `OFFSET` for large tables, and size HikariCP pools concisely based on DB CPU cores.',
    deepDiveNotes: [
      'HikariCP rule of thumb: `connections = ((core_count * 2) + effective_spindle_count)` — an oversized pool (e.g. 200 connections) hurts DB throughput via context switching.',
      'Deep SQL `OFFSET 100000` still scans and discards 100,000 rows; cursor pagination maintains O(log n) constant speed.',
      'Always expose `/actuator/health` liveness/readiness probes when containerizing Spring Boot apps with Docker/Kubernetes.'
    ],
    codeSnippet: `# application.properties — Clean HikariCP & Graceful Shutdown tuning
spring.datasource.hikari.maximum-pool-size=15
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=3000
server.shutdown=graceful`,
    interviewerFollowUp: 'If a client sends the same `Idempotency-Key` simultaneously in two parallel requests before the first finishes, how do you prevent a race condition?',
    skillTags: ['rest-api', 'springboot', 'mysql', 'sql', 'docker', 'database']
  },
  {
    id: 'arch-kafka-micro',
    topic: 'Architecture, REST & Concurrency',
    difficulty: 'Senior',
    question: 'When should Spring Boot microservices communicate asynchronously via Kafka vs synchronously via REST/OpenFeign, and how do you handle failure?',
    conciseAnswer:
      'Use synchronous REST/gRPC when the caller immediately needs the response (auth check, pricing lookup), backed by Resilience4j timeouts, retries, and circuit breakers. Use Apache Kafka when decoupling domains (sending interview notification emails, updating search indexes, audit trails) with at-least-once delivery, consumer idempotency, and Dead Letter Topics (DLT).',
    deepDiveNotes: [
      'Explain the Transactional Outbox Pattern: write the domain row and an `outbox_events` row in the same MySQL `@Transactional` commit, then relay events reliably to Kafka to prevent dual-write inconsistency.',
      'Always pair retries with exponential backoff + jitter and distinguish transient errors (503/network timeout) from non-retryable 400 validation errors.',
      'Kafka partition key (e.g., `userId` or `applicationId`) guarantees strict message ordering per entity while enabling horizontal consumer group scaling.'
    ],
    codeSnippet: `@RetryableTopic(attempts = "3", backoff = @Backoff(delay = 1000, multiplier = 2.0))
@KafkaListener(topics = "application-stage-events", groupId = "notification-service")
public void onStageChanged(ApplicationStageEvent event) {
    // Idempotent consumer checks processed_event_ids before sending notification
}`,
    interviewerFollowUp: 'Why is publishing to Kafka inside a `@Transactional` DB method without an Outbox table unsafe?',
    skillTags: ['kafka', 'springboot', 'docker', 'java', 'rest-api']
  }
];

const KEYWORD_EXTRACTORS: Array<{ token: string; pattern: RegExp }> = [
  { token: 'springboot', pattern: /\bspring\s*boot\b|\bspringboot\b/i },
  { token: 'spring', pattern: /\bspring\b/i },
  { token: 'java', pattern: /\bjava\b/i },
  { token: 'hibernate', pattern: /\bhibernate\b|\bjpa\b/i },
  { token: 'mysql', pattern: /\bmysql\b/i },
  { token: 'sql', pattern: /\bsql\b|\bdatabase\b|\bstored procedure\b|\bschema indexing\b/i },
  { token: 'rest-api', pattern: /\brest\s*api\b|\brestful\b|\brest\b|\bapi endpoints\b/i },
  { token: 'docker', pattern: /\bdocker\b|\bcontainer\b/i },
  { token: 'kafka', pattern: /\bkafka\b/i },
  { token: 'testing', pattern: /\bjunit\b|\btesting\b|\bselenium\b/i },
  { token: 'algorithms', pattern: /\balgorithms?\b|\bdata structures?\b/i },
  { token: 'jsp', pattern: /\bjsp\b/i },
  { token: 'servlet', pattern: /\bservlet\b/i }
];

export function extractRoleSkillTokens(role: {
  skills?: string;
  title?: string;
  description?: string;
}): string[] {
  const tokenSet = new Set<string>();

  if (role.skills) {
    for (const raw of role.skills.split(',')) {
      const cleaned = raw.trim().toLowerCase();
      if (cleaned) {
        tokenSet.add(cleaned);
        if (cleaned === 'springboot') {
          tokenSet.add('spring');
        }
        if (cleaned === 'mysql') {
          tokenSet.add('sql');
          tokenSet.add('database');
        }
      }
    }
  }

  const combinedText = `${role.title || ''} ${role.description || ''}`;
  for (const extractor of KEYWORD_EXTRACTORS) {
    if (extractor.pattern.test(combinedText)) {
      tokenSet.add(extractor.token);
    }
  }

  return Array.from(tokenSet);
}

export function buildPipelineCheatSheet(params: {
  pipelineJobs: JobItem[];
  pipelineInternships?: InternshipItem[];
  stageRecords?: Record<number, ApplicationStageRecord>;
  userSkills?: string[];
}): PipelineCheatSheetResult {
  const {
    pipelineJobs,
    pipelineInternships = [],
    stageRecords = {},
    userSkills = []
  } = params;

  const normalizedUserSkills = new Set(
    userSkills.map((s) => s.trim().toLowerCase()).filter(Boolean)
  );

  const pipelineRoles: PipelineRoleSummary[] = [
    ...pipelineJobs.map((job) => ({
      key: `job-${job.id}`,
      kind: 'Job' as const,
      id: job.id,
      title: job.title,
      company: job.company,
      stage: stageRecords[job.id]?.currentStage || 'Applied',
      extractedTokens: extractRoleSkillTokens(job)
    })),
    ...pipelineInternships.map((intern) => ({
      key: `intern-${intern.id}`,
      kind: 'Internship' as const,
      id: intern.id,
      title: intern.title,
      company: intern.company,
      stage: 'Applied',
      extractedTokens: extractRoleSkillTokens(intern)
    }))
  ];

  const isPipelineEmpty = pipelineRoles.length === 0;

  // Count token frequency across pipeline roles for summary display
  const tokenFreq = new Map<string, number>();
  for (const role of pipelineRoles) {
    for (const token of role.extractedTokens) {
      tokenFreq.set(token, (tokenFreq.get(token) || 0) + 1);
    }
  }

  const topRequiredTokens = Array.from(tokenFreq.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([token]) => token);

  const enrichedItems: EnrichedCheatSheetItem[] = SPRING_JAVA_CHEAT_SHEET.map((question) => {
    const matchedRoles: PipelineMatchDetail[] = [];
    const matchedTokenSet = new Set<string>();

    for (const role of pipelineRoles) {
      const overlap = question.skillTags.filter((tag) =>
        role.extractedTokens.includes(tag)
      );
      if (overlap.length > 0) {
        matchedRoles.push({
          roleKey: role.key,
          kind: role.kind,
          title: role.title,
          company: role.company,
          stage: role.stage,
          matchedTokens: overlap
        });
        for (const t of overlap) {
          matchedTokenSet.add(t);
        }
      }
    }

    const interviewingBonus = matchedRoles.some((r) => r.stage === 'Interviewing') ? 10 : 0;
    const userSkillOverlap = question.skillTags.filter((tag) =>
      normalizedUserSkills.has(tag)
    ).length;

    const relevanceScore =
      matchedRoles.length * 16 +
      matchedTokenSet.size * 6 +
      interviewingBonus +
      userSkillOverlap * 2;

    return {
      question,
      matchedRoles,
      matchedTokens: Array.from(matchedTokenSet),
      relevanceScore,
      isPipelineRequired: matchedRoles.length > 0
    };
  });

  enrichedItems.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return 0;
  });

  const hasJavaSpringPipelineMatch = enrichedItems.some((item) => item.isPipelineRequired);

  return {
    items: enrichedItems,
    pipelineRoles,
    topRequiredTokens,
    isPipelineEmpty,
    hasJavaSpringPipelineMatch
  };
}

export function filterCheatSheetItems(params: {
  items: EnrichedCheatSheetItem[];
  topic: 'ALL' | CheatSheetTopic;
  searchQuery: string;
  pipelineOnly: boolean;
  masteryFilter?: 'ALL' | 'UNREVIEWED' | 'MASTERED';
  reviewedIds?: string[];
}): EnrichedCheatSheetItem[] {
  const {
    items,
    topic,
    searchQuery,
    pipelineOnly,
    masteryFilter = 'ALL',
    reviewedIds = []
  } = params;

  const q = searchQuery.trim().toLowerCase();
  const reviewedSet = new Set(reviewedIds);

  return items.filter((item) => {
    if (topic !== 'ALL' && item.question.topic !== topic) {
      return false;
    }
    if (pipelineOnly && !item.isPipelineRequired) {
      return false;
    }
    if (masteryFilter === 'MASTERED' && !reviewedSet.has(item.question.id)) {
      return false;
    }
    if (masteryFilter === 'UNREVIEWED' && reviewedSet.has(item.question.id)) {
      return false;
    }
    if (!q) return true;

    const inQuestion = item.question.question.toLowerCase().includes(q);
    const inAnswer = item.question.conciseAnswer.toLowerCase().includes(q);
    const inNotes = item.question.deepDiveNotes.some((n) => n.toLowerCase().includes(q));
    const inTags = item.question.skillTags.some((t) => t.toLowerCase().includes(q));
    const inRoles = item.matchedRoles.some(
      (r) =>
        r.company.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q)
    );

    return inQuestion || inAnswer || inNotes || inTags || inRoles;
  });
}

export function computeCheatSheetProgress(params: {
  items: EnrichedCheatSheetItem[];
  reviewedIds: string[];
}): {
  total: number;
  reviewedCount: number;
  pipelineTotal: number;
  pipelineReviewedCount: number;
  readinessPercent: number;
} {
  const reviewedSet = new Set(params.reviewedIds);
  const total = params.items.length;
  const reviewedCount = params.items.filter((i) => reviewedSet.has(i.question.id)).length;
  const pipelineItems = params.items.filter((i) => i.isPipelineRequired);
  const pipelineTotal = pipelineItems.length;
  const pipelineReviewedCount = pipelineItems.filter((i) =>
    reviewedSet.has(i.question.id)
  ).length;

  const denominator = pipelineTotal > 0 ? pipelineTotal : total;
  const numerator = pipelineTotal > 0 ? pipelineReviewedCount : reviewedCount;
  const readinessPercent =
    denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);

  return {
    total,
    reviewedCount,
    pipelineTotal,
    pipelineReviewedCount,
    readinessPercent
  };
}
