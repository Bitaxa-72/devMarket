import assert from 'node:assert/strict';
import test from 'node:test';
import {
  generatePassword,
  getPasswordRequirements,
  getPasswordStrength,
} from '../src/utils/password.js';

test('generated password is long and contains every required character group', () => {
  const password = generatePassword(20);

  assert.equal(password.length, 20);
  assert.match(password, /[a-z]/);
  assert.match(password, /[A-Z]/);
  assert.match(password, /\d/);
  assert.match(password, /[^A-Za-z0-9]/);
});

test('password requirements and strength explain what is missing', () => {
  assert.deepEqual(getPasswordRequirements('short'), {
    length: false,
    lower: true,
    upper: false,
    number: false,
    symbol: false,
  });
  assert.equal(getPasswordStrength('short').level, 1);
  assert.equal(getPasswordStrength('A reliable password 7!').level, 4);
});
