import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SIGNUP_TRACK_PRESETS,
  buildUserProfileFromSignUp,
  computePasswordStrength,
  getPathnameForTab,
  resolveTabFromPathname,
  validateLoginInput,
  validateSignUpInput
} from './authLogic.ts';

test('validateLoginInput validates email and password cleanly', () => {
  assert.equal(validateLoginInput({ email: '', password: 'secret' }).valid, false);
  assert.equal(validateLoginInput({ email: 'not-an-email', password: 'secret' }).valid, false);
  assert.equal(validateLoginInput({ email: 'user@jobnova.in', password: '' }).valid, false);
  assert.equal(validateLoginInput({ email: 'user@jobnova.in', password: '123' }).valid, false);
  assert.deepEqual(
    validateLoginInput({ email: 'harishragavendran56@gmail.com', password: 'JobNova@2026' }),
    { valid: true }
  );
});

test('validateSignUpInput enforces name, email, alphanumeric 8+ password, confirmation, and terms', () => {
  assert.equal(
    validateSignUpInput({
      name: 'A',
      email: 'a@b.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      acceptTerms: true
    }).valid,
    false
  );

  assert.equal(
    validateSignUpInput({
      name: 'Ananya Sharma',
      email: 'ananya@example.com',
      password: 'onlyletters',
      confirmPassword: 'onlyletters',
      acceptTerms: true
    }).valid,
    false
  );

  assert.equal(
    validateSignUpInput({
      name: 'Ananya Sharma',
      email: 'ananya@example.com',
      password: 'Password12',
      confirmPassword: 'Mismatch12',
      acceptTerms: true
    }).valid,
    false
  );

  assert.equal(
    validateSignUpInput({
      name: 'Ananya Sharma',
      email: 'ananya@example.com',
      password: 'Password12',
      confirmPassword: 'Password12',
      acceptTerms: false
    }).valid,
    false
  );

  assert.deepEqual(
    validateSignUpInput({
      name: 'Ananya Sharma',
      email: 'ananya@example.com',
      password: 'Password12!',
      confirmPassword: 'Password12!',
      acceptTerms: true
    }),
    { valid: true }
  );
});

test('computePasswordStrength scores empty, weak, fair, good, and strong passwords', () => {
  assert.equal(computePasswordStrength('').score, 0);
  assert.equal(computePasswordStrength('abc').label, 'Weak');
  assert.equal(computePasswordStrength('abcdefgh').label, 'Weak');
  assert.equal(computePasswordStrength('abcdef12').label, 'Fair');
  assert.equal(computePasswordStrength('Abcdef12').label, 'Good');
  assert.equal(computePasswordStrength('JobNova@2026').label, 'Strong');
});

test('buildUserProfileFromSignUp uses selected track preset and normalizes email', () => {
  const profile = buildUserProfileFromSignUp({
    id: 42,
    name: '  Ananya Sharma  ',
    email: 'ANANYA@JOBNOVA.IN',
    trackId: 'genai-python',
    location: 'Hyderabad, India'
  });

  assert.equal(profile.id, 42);
  assert.equal(profile.name, 'Ananya Sharma');
  assert.equal(profile.email, 'ananya@jobnova.in');
  assert.equal(profile.provider, 'Email');
  assert.equal(profile.location, 'Hyderabad, India');
  assert.deepEqual(profile.skills, SIGNUP_TRACK_PRESETS[1].skills);
  assert.equal(profile.headline, SIGNUP_TRACK_PRESETS[1].headline);
});

test('resolveTabFromPathname and getPathnameForTab handle separate /login and /signup routes', () => {
  assert.equal(resolveTabFromPathname('/login'), 'login');
  assert.equal(resolveTabFromPathname('/login/'), 'login');
  assert.equal(resolveTabFromPathname('/signup'), 'signup');
  assert.equal(resolveTabFromPathname('/'), 'home');
  assert.equal(resolveTabFromPathname('/jobs'), 'home');

  assert.equal(getPathnameForTab('login'), '/login');
  assert.equal(getPathnameForTab('signup'), '/signup');
  assert.equal(getPathnameForTab('jobs'), '/');
});
