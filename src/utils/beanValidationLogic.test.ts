import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isJakartaValidEmail,
  validateJobPostBean,
  validateLoginBean,
  validateSignUpBean
} from './beanValidationLogic.ts';

test('isJakartaValidEmail validates well-formed email strings', () => {
  assert.equal(isJakartaValidEmail('harish@jobnova.in'), true);
  assert.equal(isJakartaValidEmail('invalid-email'), false);
  assert.equal(isJakartaValidEmail('missing@domain'), false);
  assert.equal(isJakartaValidEmail(''), false);
});

test('validateJobPostBean passes valid job posting and reports @NotBlank/@Size/@Email violations', () => {
  const validRes = validateJobPostBean({
    title: 'Java Spring Boot Developer',
    company: 'Infosys',
    location: 'Bengaluru',
    skills: 'java,springboot,mysql',
    recruiterEmail: 'careers@infosys.com'
  });
  assert.equal(validRes.valid, true);
  assert.equal(validRes.status, 201);
  assert.equal(validRes.violations.length, 0);

  const blankRes = validateJobPostBean({
    title: '',
    company: '',
    skills: ''
  });
  assert.equal(blankRes.valid, false);
  assert.equal(blankRes.status, 400);
  assert.equal(
    blankRes.exception,
    'org.springframework.web.bind.MethodArgumentNotValidException'
  );
  assert.equal(blankRes.controller, 'JobController');
  assert.equal(blankRes.dtoClass, 'JobPostRequest');
  assert.ok(blankRes.violations.some((v) => v.field === 'title' && v.constraint === '@NotBlank'));
  assert.ok(blankRes.violations.some((v) => v.field === 'company' && v.constraint === '@NotBlank'));
  assert.ok(blankRes.violations.some((v) => v.field === 'skills' && v.constraint === '@NotBlank'));

  const sizeAndEmailRes = validateJobPostBean({
    title: 'J',
    company: 'Z',
    location: '   ',
    skills: 'a',
    recruiterEmail: 'not-an-email'
  });
  assert.equal(sizeAndEmailRes.valid, false);
  assert.ok(
    sizeAndEmailRes.violations.some((v) => v.field === 'title' && v.constraint === '@Size')
  );
  assert.ok(
    sizeAndEmailRes.violations.some((v) => v.field === 'company' && v.constraint === '@Size')
  );
  assert.ok(
    sizeAndEmailRes.violations.some((v) => v.field === 'location' && v.constraint === '@NotBlank')
  );
  assert.ok(
    sizeAndEmailRes.violations.some(
      (v) => v.field === 'recruiterEmail' && v.constraint === '@Email'
    )
  );
});

test('validateLoginBean enforces @NotBlank, @Email, and @Size on AuthController LoginRequest', () => {
  const ok = validateLoginBean({
    email: 'harishragavendran56@gmail.com',
    password: 'JobNova@2026'
  });
  assert.equal(ok.valid, true);
  assert.equal(ok.status, 200);

  const emptyEmail = validateLoginBean({ email: '  ', password: '' });
  assert.equal(emptyEmail.valid, false);
  assert.equal(emptyEmail.controller, 'AuthController');
  assert.equal(emptyEmail.dtoClass, 'LoginRequest');
  assert.ok(emptyEmail.violations.some((v) => v.field === 'email' && v.constraint === '@NotBlank'));
  assert.ok(
    emptyEmail.violations.some((v) => v.field === 'password' && v.constraint === '@NotBlank')
  );

  const badEmailShortPass = validateLoginBean({ email: 'bad-email-format', password: '123' });
  assert.equal(badEmailShortPass.valid, false);
  assert.ok(
    badEmailShortPass.violations.some((v) => v.field === 'email' && v.constraint === '@Email')
  );
  assert.ok(
    badEmailShortPass.violations.some((v) => v.field === 'password' && v.constraint === '@Size')
  );
});

test('validateSignUpBean enforces @NotBlank, @Email, @Size, @Pattern, and @AssertTrue on SignUpRequest', () => {
  const ok = validateSignUpBean({
    name: 'Ananya Sharma',
    email: 'ananya@jobnova.in',
    password: 'Password123',
    confirmPassword: 'Password123',
    acceptTerms: true
  });
  assert.equal(ok.valid, true);
  assert.equal(ok.status, 201);

  const invalid = validateSignUpBean({
    name: 'A',
    email: 'ananya-at-jobnova',
    password: 'short',
    confirmPassword: 'different',
    acceptTerms: false
  });
  assert.equal(invalid.valid, false);
  assert.equal(invalid.controller, 'AuthController');
  assert.equal(invalid.dtoClass, 'SignUpRequest');
  assert.ok(invalid.violations.some((v) => v.field === 'name' && v.constraint === '@Size'));
  assert.ok(invalid.violations.some((v) => v.field === 'email' && v.constraint === '@Email'));
  assert.ok(invalid.violations.some((v) => v.field === 'password' && v.constraint === '@Size'));
  assert.ok(
    invalid.violations.some((v) => v.field === 'confirmPassword' && v.constraint === '@Pattern')
  );
  assert.ok(
    invalid.violations.some((v) => v.field === 'acceptTerms' && v.constraint === '@AssertTrue')
  );
});
