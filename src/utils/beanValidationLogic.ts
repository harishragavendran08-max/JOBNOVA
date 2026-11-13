export type BeanConstraintType =
  | '@NotBlank'
  | '@Email'
  | '@Size'
  | '@Pattern'
  | '@AssertTrue';

export interface BeanConstraintViolation {
  field: string;
  constraint: BeanConstraintType;
  message: string;
  rejectedValue: unknown;
}

export interface SpringBootValidationResponse {
  valid: boolean;
  status: 200 | 201 | 400;
  error?: string;
  exception?: 'org.springframework.web.bind.MethodArgumentNotValidException';
  controller: 'JobController' | 'AuthController';
  dtoClass: 'JobPostRequest' | 'LoginRequest' | 'SignUpRequest';
  fieldErrors: Record<string, string>;
  violations: BeanConstraintViolation[];
}

const JAKARTA_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isJakartaValidEmail(value: string): boolean {
  return JAKARTA_EMAIL_REGEX.test(value.trim());
}

function buildValidationResult(params: {
  controller: 'JobController' | 'AuthController';
  dtoClass: 'JobPostRequest' | 'LoginRequest' | 'SignUpRequest';
  successStatus: 200 | 201;
  violations: BeanConstraintViolation[];
}): SpringBootValidationResponse {
  const fieldErrors: Record<string, string> = {};
  for (const v of params.violations) {
    if (!fieldErrors[v.field]) {
      fieldErrors[v.field] = v.message;
    }
  }

  if (params.violations.length > 0) {
    return {
      valid: false,
      status: 400,
      error: params.violations[0].message,
      exception: 'org.springframework.web.bind.MethodArgumentNotValidException',
      controller: params.controller,
      dtoClass: params.dtoClass,
      fieldErrors,
      violations: params.violations
    };
  }

  return {
    valid: true,
    status: params.successStatus,
    controller: params.controller,
    dtoClass: params.dtoClass,
    fieldErrors: {},
    violations: []
  };
}

/**
 * Mirrors Spring Boot @Valid @RequestBody JobPostRequest in JobController.create(...)
 * Enforces @NotBlank, @Size, and optional @Email (for recruiterEmail).
 */
export function validateJobPostBean(input: {
  title?: unknown;
  company?: unknown;
  location?: unknown;
  skills?: unknown;
  description?: unknown;
  ctc?: unknown;
  recruiterEmail?: unknown;
}): SpringBootValidationResponse {
  const violations: BeanConstraintViolation[] = [];

  const title = typeof input?.title === 'string' ? input.title.trim() : '';
  const company = typeof input?.company === 'string' ? input.company.trim() : '';
  const skills = typeof input?.skills === 'string' ? input.skills.trim() : '';
  const locationRaw = input?.location;
  const recruiterEmail =
    typeof input?.recruiterEmail === 'string' ? input.recruiterEmail.trim() : '';

  if (!title) {
    violations.push({
      field: 'title',
      constraint: '@NotBlank',
      message: 'Job title, company, and skills are required.',
      rejectedValue: input?.title ?? ''
    });
  } else if (title.length < 3 || title.length > 120) {
    violations.push({
      field: 'title',
      constraint: '@Size',
      message: 'Job title must be between 3 and 120 characters.',
      rejectedValue: title
    });
  }

  if (!company) {
    violations.push({
      field: 'company',
      constraint: '@NotBlank',
      message: 'Job title, company, and skills are required.',
      rejectedValue: input?.company ?? ''
    });
  } else if (company.length < 2 || company.length > 80) {
    violations.push({
      field: 'company',
      constraint: '@Size',
      message: 'Company name must be between 2 and 80 characters.',
      rejectedValue: company
    });
  }

  if (typeof locationRaw === 'string' && locationRaw.trim() === '') {
    violations.push({
      field: 'location',
      constraint: '@NotBlank',
      message: 'Job location cannot be blank.',
      rejectedValue: locationRaw
    });
  }

  if (!skills) {
    violations.push({
      field: 'skills',
      constraint: '@NotBlank',
      message: 'Job title, company, and skills are required.',
      rejectedValue: input?.skills ?? ''
    });
  } else if (skills.length < 2 || skills.length > 255) {
    violations.push({
      field: 'skills',
      constraint: '@Size',
      message: 'Required skills must be between 2 and 255 characters.',
      rejectedValue: skills
    });
  }

  if (recruiterEmail && !isJakartaValidEmail(recruiterEmail)) {
    violations.push({
      field: 'recruiterEmail',
      constraint: '@Email',
      message: 'Recruiter contact email must be a valid email address.',
      rejectedValue: recruiterEmail
    });
  }

  return buildValidationResult({
    controller: 'JobController',
    dtoClass: 'JobPostRequest',
    successStatus: 201,
    violations
  });
}

/**
 * Mirrors Spring Boot @Valid @RequestBody LoginRequest in AuthController.login(...)
 * Enforces @NotBlank, @Email, and @Size(min = 6).
 */
export function validateLoginBean(input: {
  email?: unknown;
  password?: unknown;
}): SpringBootValidationResponse {
  const violations: BeanConstraintViolation[] = [];
  const email = typeof input?.email === 'string' ? input.email.trim() : '';
  const password = typeof input?.password === 'string' ? input.password : '';

  if (!email) {
    violations.push({
      field: 'email',
      constraint: '@NotBlank',
      message: 'Please enter your email address.',
      rejectedValue: input?.email ?? ''
    });
  } else if (!isJakartaValidEmail(email)) {
    violations.push({
      field: 'email',
      constraint: '@Email',
      message: 'Please enter a valid email address (e.g., name@domain.com).',
      rejectedValue: email
    });
  }

  if (!password || password.trim() === '') {
    violations.push({
      field: 'password',
      constraint: '@NotBlank',
      message: 'Please enter your password.',
      rejectedValue: ''
    });
  } else if (password.length < 6) {
    violations.push({
      field: 'password',
      constraint: '@Size',
      message: 'Password must be at least 6 characters long.',
      rejectedValue: '***'
    });
  }

  return buildValidationResult({
    controller: 'AuthController',
    dtoClass: 'LoginRequest',
    successStatus: 200,
    violations
  });
}

/**
 * Mirrors Spring Boot @Valid @RequestBody SignUpRequest in AuthController.signUp(...)
 * Enforces @NotBlank, @Email, @Size, @Pattern, and @AssertTrue.
 */
export function validateSignUpBean(input: {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
  acceptTerms?: unknown;
}): SpringBootValidationResponse {
  const violations: BeanConstraintViolation[] = [];
  const name = typeof input?.name === 'string' ? input.name.trim() : '';
  const email = typeof input?.email === 'string' ? input.email.trim() : '';
  const password = typeof input?.password === 'string' ? input.password : '';
  const confirmPassword =
    typeof input?.confirmPassword === 'string' ? input.confirmPassword : password;
  const acceptTerms = input?.acceptTerms !== undefined ? Boolean(input.acceptTerms) : true;

  if (!name) {
    violations.push({
      field: 'name',
      constraint: '@NotBlank',
      message: 'Please enter your full name (at least 2 characters).',
      rejectedValue: input?.name ?? ''
    });
  } else if (name.length < 2 || name.length > 80) {
    violations.push({
      field: 'name',
      constraint: '@Size',
      message: 'Please enter your full name (at least 2 characters).',
      rejectedValue: name
    });
  }

  if (!email) {
    violations.push({
      field: 'email',
      constraint: '@NotBlank',
      message: 'Please enter a valid email address.',
      rejectedValue: input?.email ?? ''
    });
  } else if (!isJakartaValidEmail(email)) {
    violations.push({
      field: 'email',
      constraint: '@Email',
      message: 'Please enter a valid email address.',
      rejectedValue: email
    });
  }

  if (!password || password.trim() === '') {
    violations.push({
      field: 'password',
      constraint: '@NotBlank',
      message: 'Password must be at least 8 characters long.',
      rejectedValue: ''
    });
  } else if (password.length < 8) {
    violations.push({
      field: 'password',
      constraint: '@Size',
      message: 'Password must be at least 8 characters long.',
      rejectedValue: '***'
    });
  } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    violations.push({
      field: 'password',
      constraint: '@Pattern',
      message: 'Password must include at least one letter and one number.',
      rejectedValue: '***'
    });
  }

  if (password !== confirmPassword) {
    violations.push({
      field: 'confirmPassword',
      constraint: '@Pattern',
      message: 'Passwords do not match. Please re-enter carefully.',
      rejectedValue: '***'
    });
  }

  if (!acceptTerms) {
    violations.push({
      field: 'acceptTerms',
      constraint: '@AssertTrue',
      message: 'Please accept the JobNova Terms of Service to create your account.',
      rejectedValue: false
    });
  }

  return buildValidationResult({
    controller: 'AuthController',
    dtoClass: 'SignUpRequest',
    successStatus: 201,
    violations
  });
}
