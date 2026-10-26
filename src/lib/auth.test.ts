import { DEMO_USER, checkCredentials, validateLogin } from './auth';

describe('validateLogin', () => {
  it('requires email and password', () => {
    const errors = validateLogin({ email: '', password: '' });
    expect(errors.email).toBe('Email is required');
    expect(errors.password).toBe('Password is required');
  });

  it('rejects an invalid email format', () => {
    const errors = validateLogin({ email: 'not-an-email', password: 'secret123' });
    expect(errors.email).toBe('Enter a valid email address');
    expect(errors.password).toBeUndefined();
  });

  it('rejects a short password', () => {
    const errors = validateLogin({ email: 'a@b.com', password: '123' });
    expect(errors.password).toBe('Password must be at least 6 characters');
  });

  it('returns no errors for valid input', () => {
    expect(validateLogin({ email: 'a@b.com', password: 'secret123' })).toEqual({});
  });
});

describe('checkCredentials', () => {
  it('accepts the demo account, ignoring email case', () => {
    const user = checkCredentials(DEMO_USER.email.toUpperCase(), DEMO_USER.password);
    expect(user?.email).toBe(DEMO_USER.email);
  });

  it('rejects a wrong password', () => {
    expect(checkCredentials(DEMO_USER.email, 'wrong-password')).toBeNull();
  });
});
