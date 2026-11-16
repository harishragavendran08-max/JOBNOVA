import React, { useEffect, useState } from 'react';
import {
  Send,
  Sparkles,
  BookOpen,
  Code2,
  CheckCircle2,
  Eye,
  EyeOff,
  Award,
  Layers,
  Terminal,
  GraduationCap,
  UserCheck,
  FileText
} from 'lucide-react';
import { JobItem, InternshipItem } from '../data/seedData';
import {
  matchOfflineCareerAssistant,
  ApplicationStageRecord,
  InterviewConfidenceRating
} from '../utils/jobnovaLogic';

export interface InterviewQuestionItem {
  id: string;
  category:
    | 'Spring Boot & REST'
    | 'Java Core & Concurrency'
    | 'JPA, Hibernate & SQL'
    | 'System Design & Applied Role';
  difficulty: 'Core' | 'Intermediate' | 'Deep Dive';
  targetRole: string;
  question: string;
  modelAnswer: string;
  codeExample: string;
  followUp: string;
}

export interface CheatSheetCardItem {
  id: string;
  badge: string;
  title: string;
  whenToUse: string;
  snippet: string;
  keyPitfall: string;
}

export const SPRING_BOOT_INTERVIEW_QA: InterviewQuestionItem[] = [
  {
    id: 'sb-int-1',
    category: 'Spring Boot & REST',
    difficulty: 'Core',
    targetRole: 'Software Engineer @ TCS · Backend Developer @ Infosys',
    question:
      'How does @SpringBootApplication auto-configuration work under the hood, and why is constructor injection preferred over @Autowired field injection?',
    modelAnswer:
      '@SpringBootApplication combines @Configuration, @EnableAutoConfiguration, and @ComponentScan. At startup, Spring reads META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports and evaluates @ConditionalOnClass and @ConditionalOnMissingBean rules to wire DataSource, DispatcherServlet, and Jackson beans automatically. Constructor injection is preferred because dependencies can be declared final (immutable), circular dependencies fail fast at compile/startup time, and unit tests can instantiate the class with plain JUnit/Mockito without booting the Spring context.',
    codeExample: `@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {
    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = Objects.requireNonNull(jobService);
    }

    @PostMapping
    public ResponseEntity<JobDto> createJob(@Valid @RequestBody CreateJobRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.create(req));
    }
}`,
    followUp:
      'What happens if Method A (@Transactional REQUIRED) calls Method B (@Transactional REQUIRES_NEW) on another bean and B throws a RuntimeException that A catches?'
  },
  {
    id: 'sb-int-2',
    category: 'JPA, Hibernate & SQL',
    difficulty: 'Deep Dive',
    targetRole: 'Backend Engineer @ Stripe India · PayPal · Intuit',
    question:
      'Explain the Hibernate N+1 select problem in Spring Data JPA and why combining JOIN FETCH with Pageable causes an in-memory pagination warning (HHH90003004).',
    modelAnswer:
      'The N+1 problem happens when 1 query fetches N parent rows (e.g., Jobs) and accessing a lazy @OneToMany collection triggers N additional SQL queries. While JOIN FETCH loads child rows in a single SQL JOIN, combining JOIN FETCH on a collection with Pageable forces Hibernate to fetch the entire result set into JVM memory and paginate in-memory (emitting HHH90003004). The production fix is a 2-step query: first fetch paginated parent IDs with LIMIT/OFFSET, then fetch full entities with JOIN FETCH WHERE id IN (:ids), or configure @BatchSize(size = 50).',
    codeExample: `@Query("SELECT j.id FROM Job j WHERE j.active = true ORDER BY j.createdAt DESC")
Page<Long> findActiveJobIds(Pageable pageable);

@Query("SELECT DISTINCT j FROM Job j LEFT JOIN FETCH j.skills WHERE j.id IN :ids")
List<Job> findJobsWithSkillsByIds(@Param("ids") List<Long> ids);`,
    followUp:
      'Why does using random UUIDv4 as a PRIMARY KEY in MySQL InnoDB degrade insert throughput compared to BIGINT AUTO_INCREMENT or UUIDv7?'
  },
  {
    id: 'sb-int-3',
    category: 'Java Core & Concurrency',
    difficulty: 'Intermediate',
    targetRole: 'SDE-1 @ Amazon · Goldman Sachs · Morgan Stanley',
    question:
      'How does ConcurrentHashMap achieve high thread-safe throughput in Java 17 without locking the entire table, and why are null keys/values forbidden?',
    modelAnswer:
      'In Java 8+, ConcurrentHashMap replaces segment locks with lock-free CAS (Compare-And-Swap) operations when inserting into an empty bucket and fine-grained synchronized locks on only the first node (head) of a specific hash bucket during collisions. When a bucket exceeds TREEIFY_THRESHOLD (8) and table capacity is at least 64, linked lists convert into Red-Black Trees (O(log n) lookup). Null keys and values are forbidden to avoid concurrency ambiguity between "key not found" and "key mapped to null" across threads.',
    codeExample: `private final ConcurrentHashMap<String, AtomicLong> rateLimiter = new ConcurrentHashMap<>();

public long recordRequest(String clientId) {
    return rateLimiter
        .computeIfAbsent(clientId, k -> new AtomicLong(0L))
        .incrementAndGet();
}`,
    followUp:
      'When using CompletableFuture.supplyAsync(), why should database or REST I/O calls use a custom ExecutorService instead of the default ForkJoinPool.commonPool()?'
  },
  {
    id: 'sb-int-4',
    category: 'Spring Boot & REST',
    difficulty: 'Core',
    targetRole: 'Full-Stack Engineer @ Zoho · Freshworks · Atlassian',
    question:
      'How do you implement centralized Bean Validation (@Valid, @NotBlank, @Email) error handling using @RestControllerAdvice in Spring Boot 3?',
    modelAnswer:
      'Annotate DTO fields with Jakarta Bean Validation constraints (@NotBlank, @Email, @Size) and controller parameters with @Valid. When validation fails, Spring throws MethodArgumentNotValidException. A @RestControllerAdvice class with @ExceptionHandler(MethodArgumentNotValidException.class) intercepts the exception and maps BindingResult fieldErrors into a clean, deterministic HTTP 400 JSON payload (or RFC 7807 ProblemDetail in Spring Boot 3) so clients can highlight invalid form fields.',
    codeExample: `@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage, (a, b) -> a));
        return ResponseEntity.badRequest().body(Map.of("status", 400, "fieldErrors", fieldErrors));
    }
}`,
    followUp:
      'How do you validate path variables and query parameters (@RequestParam @Min(1)) using @Validated at the controller class level?'
  },
  {
    id: 'sb-int-5',
    category: 'System Design & Applied Role',
    difficulty: 'Deep Dive',
    targetRole: 'Backend & Distributed Systems @ Uber · Swiggy · CRED',
    question:
      'How do you design an idempotent payment or job-application submission endpoint in Spring Boot + MySQL so duplicate retries never create duplicate records?',
    modelAnswer:
      'Require clients to send an Idempotency-Key header (UUID) on POST requests. In MySQL InnoDB, create a UNIQUE composite index on (user_id, idempotency_key). Inside a @Transactional service method, insert the idempotency record first; if a parallel retry arrives, MySQL throws a duplicate key error (caught as DataIntegrityViolationException in Spring), and the endpoint returns the cached response from the original request without double-processing.',
    codeExample: `@Transactional
public ApplicationResponse submitIdempotent(Long userId, String idempotencyKey, ApplyJobDto dto) {
    return idempotencyRepo.findByUserIdAndKey(userId, idempotencyKey)
        .map(IdempotencyRecord::toSavedResponse)
        .orElseGet(() -> processAndPersistApplication(userId, idempotencyKey, dto));
}`,
    followUp:
      'How would you use Redis SET NX EX alongside MySQL to reject duplicate in-flight requests before hitting the relational database?'
  }
];

export const SPRING_BOOT_CHEATSHEET: CheatSheetCardItem[] = [
  {
    id: 'cs-1',
    badge: 'Spring Boot 3 · DI & Lifecycle',
    title: 'Constructor Injection & Immutable Services',
    whenToUse:
      'Use final fields with a single constructor in @Service and @RestController beans for thread safety and effortless unit testing.',
    snippet: `@Service
public class ApplicationService {
    private final JobRepository jobRepo;
    public ApplicationService(JobRepository jobRepo) {
        this.jobRepo = jobRepo;
    }
}`,
    keyPitfall:
      'Avoid @Autowired field injection—it hides dependencies, prevents final fields, and requires reflection in unit tests.'
  },
  {
    id: 'cs-2',
    badge: 'Spring Transaction Management',
    title: '@Transactional Boundaries & Rollback Rules',
    whenToUse:
      'Annotate service methods that mutate multiple tables, and use readOnly = true on query methods to skip Hibernate dirty checking.',
    snippet: `@Transactional(rollbackFor = Exception.class)
public void transferApplication(Long appId, String stage) {
    // Atomic update + audit trail
}`,
    keyPitfall:
      'Calling a @Transactional method from another method inside the same class (this.save()) bypasses the Spring AOP proxy!'
  },
  {
    id: 'cs-3',
    badge: 'JPA & MySQL Performance',
    title: 'Keyset Pagination & Fetch Joins',
    whenToUse:
      'Use projections or 2-step ID queries when paginating entities with @OneToMany relationships.',
    snippet: `@Query("SELECT new com.jobnova.dto.JobSummary(j.id, j.title, j.company) FROM Job j")
Page<JobSummary> findSummaries(Pageable pageable);`,
    keyPitfall:
      'Never leave FetchType.EAGER on @OneToMany associations—default to FetchType.LAZY and fetch explicitly when needed.'
  },
  {
    id: 'cs-4',
    badge: 'Jakarta Bean Validation',
    title: 'Request DTO Validation (@Valid + Records)',
    whenToUse:
      'Use Java 17 record DTOs with @NotBlank, @Email, and @Pattern at the controller boundary.',
    snippet: `public record ProfileUpdateRequest(
    @NotBlank(message = "Name is required") String name,
    @Email @NotBlank String email,
    @Size(max = 280) String headline
) {}`,
    keyPitfall:
      'Forgetting @Valid on the @RequestBody parameter silently skips all @NotBlank/@Email annotations.'
  }
];

export const SUGGESTED_CAREER_PROMPTS: string[] = [
  'How do I explain my Java & Spring Boot projects in a fresher interview?',
  'What is the difference between @Transactional REQUIRED and REQUIRES_NEW?'
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  source?: string;
}

export interface CareerAssistantViewProps {
  jobs?: JobItem[];
  savedJobIds?: number[];
  internships?: InternshipItem[];
  appliedInternshipIds?: number[];
  applicationStageRecords?: Record<number, ApplicationStageRecord>;
  userSkills?: string[];
  enrolledCourseIds?: number[];
  savedCertIds?: number[];
  onAddInterviewFeedback?: (params: {
    jobId: number;
    roundTitle: string;
    interviewerOrFormat: string;
    questionsAsked: string;
    keyTakeaways: string;
    confidenceRating: InterviewConfidenceRating;
    timestamp?: string;
  }) => void;
  pendingPromptRequest?: { id: number; prompt: string } | null;
  onConsumePendingPrompt?: () => void;
  externalPrompt?: string | null;
  onExternalPromptConsumed?: () => void;
}

const PROFILE_AND_CAREER_QUICK_PROMPTS = [
  {
    id: 'about-bio',
    label: 'Write About / Bio Summary',
    prompt: 'Write my professional About summary and headline for a Full-Stack Java & React profile.'
  },
  {
    id: 'education-format',
    label: 'Format Education Section',
    prompt: 'How should I format my Education section, CGPA, and CS coursework on my profile?'
  },
  {
    id: 'profile-creation',
    label: 'Profile Creation Checklist',
    prompt: 'Give me a step-by-step profile creation plan covering About, Education, Work History, and Skills.'
  },
  {
    id: 'resume-bullets',
    label: 'Optimize Resume Bullets',
    prompt: 'Can you give me resume tips and strong engineering bullet points?'
  },
  ...SUGGESTED_CAREER_PROMPTS.map((p: string, idx: number) => ({
    id: `seed-${idx}`,
    label:
      idx === 0
        ? 'Explain Java & Spring Projects'
        : '@Transactional Proxy Rules',
    prompt: p
  }))
];

export const CareerAssistantView: React.FC<CareerAssistantViewProps> = ({
  pendingPromptRequest,
  onConsumePendingPrompt,
  externalPrompt,
  onExternalPromptConsumed
}) => {
  const [activeMode, setActiveMode] = useState<'interview' | 'cheatsheet' | 'chat'>('chat');
  const [selectedCategory, setSelectedCategory] = useState<
    'ALL' | InterviewQuestionItem['category']
  >('ALL');
  const [revealedIds, setRevealedIds] = useState<string[]>([
    'sb-int-1',
    'sb-int-2',
    'sb-int-3',
    'sb-int-5'
  ]);
  const [masteredIds, setMasteredIds] = useState<string[]>(['sb-int-1', 'sb-int-5']);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text:
        'Hi Harish! I am your JobNova AI Career & Profile Assistant. Ask me to write your About / Bio summary, format your Education & CGPA credentials, optimize your ATS Resume bullets, or coach you for Java & Spring Boot interviews.',
      source: 'AI Career Coach'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleMastered = (id: string) => {
    setMasteredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredQuestions =
    selectedCategory === 'ALL'
      ? SPRING_BOOT_INTERVIEW_QA
      : SPRING_BOOT_INTERVIEW_QA.filter(
          (q: InterviewQuestionItem) => q.category === selectedCategory
        );

  const handleSend = async (promptText?: string) => {
    const query = (promptText ?? input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            text: data.response || matchOfflineCareerAssistant(query),
            source: data.source === 'gemini' ? 'Gemini AI' : 'AI Knowledge Base'
          }
        ]);
      } else {
        throw new Error('Fallback to local knowledge base');
      }
    } catch {
      const reply = matchOfflineCareerAssistant(query);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          source: 'AI Knowledge Base'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pendingPromptRequest && pendingPromptRequest.prompt.trim()) {
      setActiveMode('chat');
      handleSend(pendingPromptRequest.prompt.trim());
      if (onConsumePendingPrompt) {
        onConsumePendingPrompt();
      }
    }
  }, [pendingPromptRequest]);

  useEffect(() => {
    if (externalPrompt && externalPrompt.trim()) {
      setActiveMode('chat');
      handleSend(externalPrompt.trim());
      if (onExternalPromptConsumed) {
        onExternalPromptConsumed();
      }
    }
  }, [externalPrompt]);

  const askFollowUpInChat = (question: InterviewQuestionItem) => {
    setActiveMode('chat');
    handleSend(`Give me a deeper follow-up answer for: ${question.followUp}`);
  };

  const categories: ('ALL' | InterviewQuestionItem['category'])[] = [
    'ALL',
    'Spring Boot & REST',
    'Java Core & Concurrency',
    'JPA, Hibernate & SQL',
    'System Design & Applied Role'
  ];

  return (
    <div className="space-y-6 ios-page-enter">
      {/* Top iOS-Styled AI Career & Profile Assistant Header */}
      <div className="ios-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#007AFF] dark:text-[#3898FF]">
              <Sparkles className="w-4 h-4" />
              <span>iOS AI Studio · Profile Creation, Resume &amp; Interview Coach</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              AI Career &amp; Profile Assistant
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
              Generate your recruiter-ready <strong>About / Bio Summary</strong>, format your{' '}
              <strong>Education &amp; CGPA</strong> credentials, craft ATS-optimized{' '}
              <strong>Resume Bullets</strong>, or practice <strong>Java &amp; Spring Boot</strong>{' '}
              mock interviews.
            </p>
          </div>

          {/* Segmented iOS Mode Switcher */}
          <div className="inline-flex items-center gap-1 ios-segmented shrink-0 self-start overflow-x-auto max-w-full">
            <button
              type="button"
              data-testid="mode-tab-chat"
              onClick={() => setActiveMode('chat')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeMode === 'chat'
                  ? 'bg-white dark:bg-slate-900 text-[#007AFF] dark:text-[#3898FF] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Career Chat</span>
            </button>
            <button
              type="button"
              data-testid="mode-tab-interview"
              onClick={() => setActiveMode('interview')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeMode === 'interview'
                  ? 'bg-white dark:bg-slate-900 text-[#007AFF] dark:text-[#3898FF] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Mock Interview ({SPRING_BOOT_INTERVIEW_QA.length} Qs)</span>
            </button>
            <button
              type="button"
              data-testid="mode-tab-cheatsheet"
              onClick={() => setActiveMode('cheatsheet')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeMode === 'cheatsheet'
                  ? 'bg-white dark:bg-slate-900 text-[#007AFF] dark:text-[#3898FF] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Cheat Sheet ({SPRING_BOOT_CHEATSHEET.length})</span>
            </button>
          </div>
        </div>

        {/* Profile Creation & Career Capabilities Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-200/70 dark:border-slate-800">
          <button
            type="button"
            data-testid="ai-card-about-bio"
            onClick={() => {
              setActiveMode('chat');
              handleSend(
                'Write my professional About summary and headline for a Full-Stack Java & React profile.'
              );
            }}
            className="text-left p-3.5 rounded-xl bg-[#F2F2F7]/80 dark:bg-slate-800/60 hover:bg-[#007AFF]/8 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#007AFF] dark:text-[#3898FF]">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span>About &amp; Bio</span>
              </span>
              <span className="text-[11px] font-mono whitespace-nowrap shrink-0">1-Click AI</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Generate a tailored engineering headline &amp; 3-sentence bio summary.
            </p>
          </button>

          <button
            type="button"
            data-testid="ai-card-education-format"
            onClick={() => {
              setActiveMode('chat');
              handleSend(
                'How should I format my Education section, CGPA, and CS coursework on my profile?'
              );
            }}
            className="text-left p-3.5 rounded-xl bg-[#F2F2F7]/80 dark:bg-slate-800/60 hover:bg-[#007AFF]/8 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>Education Formatter</span>
              </span>
              <span className="text-[11px] font-mono whitespace-nowrap shrink-0">B.E. / B.Tech</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Structure degree, university, CGPA (8.9/10), and core CS coursework.
            </p>
          </button>

          <button
            type="button"
            data-testid="ai-card-resume-optimizer"
            onClick={() => {
              setActiveMode('chat');
              handleSend('Can you give me resume tips and strong engineering bullet points?');
            }}
            className="text-left p-3.5 rounded-xl bg-[#F2F2F7]/80 dark:bg-slate-800/60 hover:bg-[#007AFF]/8 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>Resume Optimizer</span>
              </span>
              <span className="text-[11px] font-mono whitespace-nowrap shrink-0">STAR Format</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Convert internship &amp; project tasks into quantified engineering impact bullets.
            </p>
          </button>

          <div className="p-3.5 rounded-xl bg-[#F2F2F7]/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Questions Mastered</span>
              <Award className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div
              className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100"
              data-testid="mastered-counter"
            >
              {masteredIds.length} / {SPRING_BOOT_INTERVIEW_QA.length} Mastered
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#34C759] rounded-full transition-all"
                style={{
                  width: `${Math.round(
                    (masteredIds.length / SPRING_BOOT_INTERVIEW_QA.length) * 100
                  )}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MODE 1: Interactive Mock Interview */}
      {activeMode === 'interview' && (
        <div className="space-y-4" data-testid="interview-prep-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#007AFF] text-white border-[#007AFF]'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat === 'ALL' ? `All Topics (${SPRING_BOOT_INTERVIEW_QA.length})` : cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setRevealedIds(
                    SPRING_BOOT_INTERVIEW_QA.map((q: InterviewQuestionItem) => q.id)
                  )
                }
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Expand All Answers
              </button>
              <button
                type="button"
                onClick={() => setRevealedIds([])}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Hide All (Self-Test)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredQuestions.map((qa: InterviewQuestionItem, index: number) => {
              const isRevealed = revealedIds.includes(qa.id);
              const isMastered = masteredIds.includes(qa.id);

              return (
                <div
                  key={qa.id}
                  data-testid={`interview-card-${qa.id}`}
                  className={`ios-card bg-white dark:bg-slate-900 border rounded-2xl p-5 transition-all space-y-4 ${
                    isMastered
                      ? 'border-emerald-300 dark:border-emerald-800/80'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-blue-50 dark:bg-blue-950/80 text-[#007AFF] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Q{index + 1} · {qa.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded-md ${
                            qa.difficulty === 'Deep Dive'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              : qa.difficulty === 'Intermediate'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {qa.difficulty}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Target:{' '}
                          <strong className="text-slate-700 dark:text-slate-300">
                            {qa.targetRole}
                          </strong>
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {qa.question}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        data-testid={`toggle-answer-${qa.id}`}
                        onClick={() => toggleReveal(qa.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hide Answer</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Reveal Answer</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        data-testid={`toggle-mastered-${qa.id}`}
                        onClick={() => toggleMastered(qa.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                          isMastered
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isMastered ? 'Mastered' : 'Mark Mastered'}</span>
                      </button>
                    </div>
                  </div>

                  {isRevealed && (
                    <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#007AFF] dark:text-[#3898FF]">
                          Model Technical Answer
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {qa.modelAnswer}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-950 text-slate-100 p-4 overflow-x-auto border border-slate-800">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                          <span>Java / Spring Boot Production Pattern</span>
                          <span>JDK 17 · Spring Boot 3.x</span>
                        </div>
                        <pre className="text-xs font-mono leading-relaxed text-emerald-300">
                          <code>{qa.codeExample}</code>
                        </pre>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60">
                        <div className="space-y-0.5">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                            Interviewer Follow-Up Probe
                          </div>
                          <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                            {qa.followUp}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => askFollowUpInChat(qa)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 rounded-xl shrink-0 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Practice Follow-Up in AI Chat</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2: Spring Boot & Java Quick-Reference Cheat Sheet */}
      {activeMode === 'cheatsheet' && (
        <div className="space-y-4" data-testid="cheatsheet-panel">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {SPRING_BOOT_CHEATSHEET.map((card: CheatSheetCardItem) => (
              <div
                key={card.id}
                className="ios-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-md bg-blue-50 dark:bg-blue-950/80 text-[#007AFF] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {card.badge}
                    </span>
                    <Layers className="w-4 h-4 text-slate-400" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {card.title}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {card.whenToUse}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 text-slate-100 p-3.5 overflow-x-auto border border-slate-800">
                  <pre className="text-xs font-mono leading-relaxed text-indigo-300">
                    <code>{card.snippet}</code>
                  </pre>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200">
                  <strong className="font-semibold">Interview Pitfall to Avoid: </strong>
                  {card.keyPitfall}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 3: Interactive AI Career & Profile Assistant Chat */}
      {activeMode === 'chat' && (
        <div
          className="ios-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-5"
          data-testid="career-chat-panel"
        >
          {/* Quick Profile & Career Prompts */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Quick Profile Creation, Education, Resume &amp; Interview Prompts:
            </div>
            <div className="flex flex-wrap gap-2">
              {PROFILE_AND_CAREER_QUICK_PROMPTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`ai-quick-prompt-${item.id}`}
                  onClick={() => handleSend(item.prompt)}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[#F2F2F7] dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#007AFF] hover:text-white dark:hover:bg-[#007AFF] border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Conversation Thread */}
          <div
            data-testid="career-chat-messages"
            className="h-[380px] overflow-y-auto space-y-3 p-4 rounded-2xl bg-[#F2F2F7]/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-[#007AFF] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 shadow-2xs'
                  }`}
                >
                  {msg.sender === 'assistant' && msg.source && (
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#007AFF] dark:text-[#3898FF] mb-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{msg.source}</span>
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  Generating tailored career &amp; profile guidance...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              data-testid="career-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI to write your About bio, format your Education & CGPA, optimize your Resume, or prep for interviews..."
              aria-label="Career question prompt"
              className="flex-1 px-4 py-2.5 text-sm bg-[#F2F2F7]/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            />
            <button
              type="submit"
              data-testid="career-chat-send-btn"
              disabled={isLoading || !input.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#007AFF] hover:bg-[#0062CC] disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Ask AI</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
