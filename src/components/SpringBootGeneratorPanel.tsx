import React, { useMemo, useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Database,
  Download,
  Play,
  Server,
  Terminal
} from 'lucide-react';
import {
  generateSpringBootFullStackBundle,
  SPRING_BOOT_ANNOTATION_GUIDE,
  SPRING_BOOT_ENTITY_TEMPLATES,
  SpringBootEntitySpec,
  validateApiRequestBodyJson
} from '../utils/fullStackCodeLabLogic';

interface SpringBootGeneratorPanelProps {
  onJobsUpdated?: () => void;
}

type CodeLayerTab = 'entity' | 'repository' | 'service' | 'controller' | 'mysql' | 'frontend' | 'react';

interface ApiTestPreset {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  label: string;
  hibernateSql: string;
  body?: Record<string, unknown>;
}

const API_TEST_PRESETS: ApiTestPreset[] = [
  {
    id: 'get-jobs',
    method: 'GET',
    path: '/api/jobs',
    label: 'List All Jobs',
    hibernateSql:
      'Hibernate: select j1_0.id, j1_0.title, j1_0.company, j1_0.location, j1_0.skills, j1_0.ctc from jobs j1_0 order by j1_0.id asc'
  },
  {
    id: 'get-job-by-id',
    method: 'GET',
    path: '/api/jobs/1',
    label: 'Get Job by ID',
    hibernateSql:
      'Hibernate: select j1_0.id, j1_0.title, j1_0.company, j1_0.ctc from jobs j1_0 where j1_0.id=?'
  },
  {
    id: 'search-java',
    method: 'GET',
    path: '/api/jobs/search?skill=java',
    label: 'Filter Jobs by Java Skill',
    hibernateSql:
      "Hibernate: select j1_0.id, j1_0.title, j1_0.company, j1_0.skills from jobs j1_0 where lower(j1_0.skills) like '%java%'"
  },
  {
    id: 'get-health',
    method: 'GET',
    path: '/api/health',
    label: 'Backend Health Check',
    hibernateSql:
      'Spring Boot Actuator / Health: status=UP · database pool & repositories active'
  },
  {
    id: 'get-alerts',
    method: 'GET',
    path: '/api/user-alerts',
    label: 'Fetch UserAlerts Store',
    hibernateSql:
      'Hibernate: select ua1_0.id, ua1_0.user_email, ua1_0.source_job_id, ua1_0.watched_skills from user_alerts ua1_0'
  },
  {
    id: 'get-diagnostics',
    method: 'GET',
    path: '/api/diagnostics',
    label: 'Spring Boot Startup Diagnostics',
    hibernateSql:
      'Spring Actuator / Diagnostics: verified ContextLoader, JpaRepository scan & DataSource pool'
  },
  {
    id: 'post-job',
    method: 'POST',
    path: '/api/jobs',
    label: 'Create Java + MySQL Job (POST)',
    hibernateSql:
      'Hibernate: insert into jobs (company, ctc, description, location, skills, title, type) values (?, ?, ?, ?, ?, ?, ?)',
    body: {
      title: 'Java Spring Boot & MySQL Engineer',
      company: 'Zoho',
      location: 'Chennai',
      description: 'Build high-throughput REST microservices backed by MySQL 8.0 and Spring Boot 3.5.',
      skills: 'java,springboot,mysql,javascript',
      type: 'Full-Time',
      ctc: '11.5 LPA'
    }
  }
];

export const SpringBootGeneratorPanel: React.FC<SpringBootGeneratorPanelProps> = ({
  onJobsUpdated
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    SPRING_BOOT_ENTITY_TEMPLATES[0].id
  );
  const [customEntityName, setCustomEntityName] = useState<string>(
    SPRING_BOOT_ENTITY_TEMPLATES[0].entityName
  );
  const [activeLayer, setActiveLayer] = useState<CodeLayerTab>('controller');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Interactive API Runner state
  const [selectedPresetId, setSelectedPresetId] = useState<string>(API_TEST_PRESETS[0].id);
  const [customPostBody, setCustomPostBody] = useState<string>(() =>
    JSON.stringify(API_TEST_PRESETS.find((p) => p.id === 'post-job')?.body || {}, null, 2)
  );
  const [bodyValidationError, setBodyValidationError] = useState<string | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiResponse, setApiResponse] = useState<{
    status: number;
    durationMs: number;
    hibernateSql: string;
    payloadText: string;
  } | null>(null);

  const activeTemplate: SpringBootEntitySpec = useMemo(() => {
    const base =
      SPRING_BOOT_ENTITY_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
      SPRING_BOOT_ENTITY_TEMPLATES[0];
    return {
      ...base,
      entityName: customEntityName.trim() || base.entityName
    };
  }, [selectedTemplateId, customEntityName]);

  const bundle = useMemo(() => generateSpringBootFullStackBundle(activeTemplate), [activeTemplate]);

  const activeCodeContent = useMemo(() => {
    switch (activeLayer) {
      case 'entity':
        return {
          filename: `${activeTemplate.entityName}.java`,
          code: bundle.entityJava
        };
      case 'repository':
        return {
          filename: `${activeTemplate.entityName}Repository.java`,
          code: bundle.repositoryJava
        };
      case 'service':
        return {
          filename: `${activeTemplate.entityName}Service.java`,
          code: bundle.serviceJava
        };
      case 'controller':
        return {
          filename: `${activeTemplate.entityName}Controller.java`,
          code: bundle.controllerJava
        };
      case 'mysql':
        return {
          filename: `schema_${activeTemplate.tableName}.sql`,
          code: bundle.mysqlDdl
        };
      case 'frontend':
        return {
          filename: `${activeTemplate.entityName.toLowerCase()}Client.js`,
          code: bundle.frontendJs
        };
      case 'react':
        return {
          filename: `${activeTemplate.entityName}Directory.jsx`,
          code: bundle.reactComponentJsx
        };
    }
  }, [activeLayer, activeTemplate, bundle]);

  const handleCopy = (key: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSelectTemplate = (spec: SpringBootEntitySpec) => {
    setSelectedTemplateId(spec.id);
    setCustomEntityName(spec.entityName);
  };

  const selectedPreset = useMemo(
    () => API_TEST_PRESETS.find((p) => p.id === selectedPresetId) || API_TEST_PRESETS[0],
    [selectedPresetId]
  );

  const handleRunEndpointTest = async () => {
    const preset = selectedPreset;
    let bodyPayload: Record<string, unknown> | undefined = preset.body;

    if (preset.method === 'POST') {
      const validation = validateApiRequestBodyJson(customPostBody);
      if (!validation.valid) {
        setBodyValidationError(validation.error);
        return;
      }
      setBodyValidationError(null);
      bodyPayload = validation.parsed;
    } else {
      setBodyValidationError(null);
    }

    setIsTestingApi(true);
    const start = performance.now();
    try {
      const res = await fetch(preset.path, {
        method: preset.method,
        headers: preset.method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body: preset.method === 'POST' ? JSON.stringify(bodyPayload) : undefined
      });
      const json = await res.json();
      const durationMs = Math.max(1, Math.round(performance.now() - start));
      if (preset.method === 'POST' && res.ok && onJobsUpdated) {
        onJobsUpdated();
      }
      setApiResponse({
        status: res.status,
        durationMs,
        hibernateSql: preset.hibernateSql,
        payloadText: JSON.stringify(json, null, 2).slice(0, 3200)
      });
    } catch (err) {
      setApiResponse({
        status: 500,
        durationMs: Math.max(1, Math.round(performance.now() - start)),
        hibernateSql: preset.hibernateSql,
        payloadText: JSON.stringify(
          { error: err instanceof Error ? err.message : 'Request failed' },
          null,
          2
        )
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="spring-boot-generator-panel">
      {/* 1. Interactive Java 17 + Spring Boot 3.5 + MySQL Full-Stack Code Generator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Server className="w-4 h-4" />
              <span>Java 17 · Spring Boot 3.5 · MySQL 8.0 · JS Client Generator</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Full-Stack Entity-to-REST-to-MySQL Code Generator
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Pick a domain model or customize the Java class name to generate synchronized JPA Entity, Spring Data Repository, REST Controller, MySQL DDL, and JavaScript Fetch client.
            </p>
          </div>

          <a
            href="/JOBNOVA-Fixed-SpringBoot.zip"
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 self-start"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Spring Boot Project (.zip)</span>
          </a>
        </div>

        {/* Entity Template Selector + Custom Class Name */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Select domain entity template">
            {SPRING_BOOT_ENTITY_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                data-testid={`sb-template-${tpl.id}`}
                onClick={() => handleSelectTemplate(tpl)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  selectedTemplateId === tpl.id
                    ? 'bg-[#2557A7] text-white border-[#2557A7] dark:bg-blue-600 dark:border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                {tpl.entityName} ({tpl.tableName})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="custom-java-entity-input" className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
              Java Class:
            </label>
            <input
              id="custom-java-entity-input"
              data-testid="sb-custom-entity-input"
              type="text"
              value={customEntityName}
              onChange={(e) => setCustomEntityName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              placeholder="e.g. Job"
              className="w-40 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
        </div>

        {/* Layer Switcher Tabs */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Generated full-stack source files">
              {(
                [
                  { id: 'entity', label: '1. Entity.java' },
                  { id: 'repository', label: '2. Repository.java' },
                  { id: 'service', label: '3. Service.java' },
                  { id: 'controller', label: '4. Controller.java' },
                  { id: 'mysql', label: '5. schema.sql' },
                  { id: 'frontend', label: '6. fetchClient.js' },
                  { id: 'react', label: '7. ReactWidget.jsx' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeLayer === tab.id}
                  data-testid={`sb-layer-tab-${tab.id}`}
                  onClick={() => setActiveLayer(tab.id)}
                  className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    activeLayer === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {activeCodeContent.filename}
              </span>
              <button
                type="button"
                onClick={() => handleCopy('generated-code', activeCodeContent.code)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {copiedKey === 'generated-code' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <pre
            data-testid="sb-generated-code-block"
            className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed max-h-80"
          >
            <code>{activeCodeContent.code}</code>
          </pre>

          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 overflow-x-auto">
            <Database className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">{bundle.hibernateSqlTrace}</span>
          </div>
        </div>
      </div>

      {/* 2. Live Spring Boot / Express REST Endpoint Simulator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Terminal className="w-4 h-4" />
              <span>Interactive REST API &amp; SQL Trace Simulator</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              Test Live Backend Endpoints
            </h3>
          </div>

          <button
            type="button"
            data-testid="sb-run-api-test-btn"
            onClick={handleRunEndpointTest}
            disabled={isTestingApi}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer shrink-0 self-start"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isTestingApi ? 'Executing...' : 'Send API Request'}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {API_TEST_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              data-testid={`sb-api-preset-${preset.id}`}
              onClick={() => setSelectedPresetId(preset.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                selectedPresetId === preset.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200 font-semibold'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span
                className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  preset.method === 'POST'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                }`}
              >
                {preset.method}
              </span>
              <span>{preset.label}</span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {preset.path}
              </span>
            </button>
          ))}
        </div>

        {selectedPreset.method === 'POST' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="sb-api-body-textarea"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Editable JSON Request Body (validates title, company &amp; skills)
              </label>
              <button
                type="button"
                onClick={() => {
                  setCustomPostBody(JSON.stringify(selectedPreset.body || {}, null, 2));
                  setBodyValidationError(null);
                }}
                className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Reset sample JSON
              </button>
            </div>
            <textarea
              id="sb-api-body-textarea"
              data-testid="sb-api-body-textarea"
              rows={6}
              value={customPostBody}
              onChange={(e) => {
                setCustomPostBody(e.target.value);
                if (bodyValidationError) setBodyValidationError(null);
              }}
              spellCheck={false}
              className="w-full p-3 text-xs font-mono bg-slate-950 text-emerald-400 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed resize-y"
            />
            {bodyValidationError && (
              <p
                data-testid="sb-api-body-error"
                className="text-xs font-medium text-rose-600 dark:text-rose-400"
              >
                {bodyValidationError}
              </p>
            )}
          </div>
        )}

        {apiResponse && (
          <div
            data-testid="sb-api-response-box"
            className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span
                  className={`font-bold ${
                    apiResponse.status >= 200 && apiResponse.status < 300
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  HTTP {apiResponse.status}
                </span>
                <span className="text-slate-500 tabular-nums">{apiResponse.durationMs}ms</span>
              </div>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 truncate max-w-xl">
                {apiResponse.hibernateSql}
              </span>
            </div>
            <pre className="p-4 bg-slate-950 text-cyan-300 font-mono text-xs overflow-auto max-h-64 leading-relaxed">
              <code>{apiResponse.payloadText}</code>
            </pre>
          </div>
        )}
      </div>

      {/* 2.5 Full-Stack Project Readiness Matrix */}
      <div
        data-testid="sb-project-readiness-panel"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Project Readiness Summary
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Live React + TypeScript + REST platform is ready now; external standalone Java/MySQL setup applies only if self-hosting separately.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
            Ready in Preview
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-1">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Frontend (React + HTML/CSS/JS)
            </div>
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              Ready
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Jobs explorer, auth views, resume builder, light/dark themes, and live HTML/CSS/JS sandbox.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-1">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              REST API &amp; Java Business Logic
            </div>
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              Ready
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Live /api/jobs, /api/user-alerts, /api/health, plus generated Entity, Service, and Controller layers.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-1">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              MySQL Workbench &amp; Schemas
            </div>
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              Ready (In-Session)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Stateful SQL queries and DDL schema export run in-browser; point JDBC URL to MySQL 8.0 for disk persistence.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-1">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Standalone Java Deployment
            </div>
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              Optional Local Step
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Unzip the Spring Boot archive, set MySQL credentials in application.properties, and run mvn spring-boot:run.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Spring Boot 3.5 & Java 17 Architectural Contract Reference */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 px-1">
          <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Core Spring Boot &amp; JPA Annotations Reference</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SPRING_BOOT_ANNOTATION_GUIDE.map((item) => (
            <div
              key={item.name}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {item.name}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {item.layer}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>

                <div className="relative pt-2">
                  <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
                    {item.codeSnippet}
                  </pre>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 leading-tight">
                  <strong>Rule:</strong> {item.keyRule}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(item.name, item.codeSnippet)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0 ml-2"
                >
                  {copiedKey === item.name ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedKey === item.name ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
