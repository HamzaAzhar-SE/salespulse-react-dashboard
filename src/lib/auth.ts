import type { User } from '../types';

export interface LoginValues {
  email: string;
  password: string;
}

export type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Demo account for the mock login. Replace with the real API later. */
export const DEMO_USER = {
  name: 'Admin',
  email: 'admin@salespulse.com',
  password: 'Admin@123',
};

export function validateLogin({ email, password }: LoginValues): LoginErrors {
  const errors: LoginErrors = {};

  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
}

export function checkCredentials(email: string, password: string): User | null {
  const emailMatches = email.trim().toLowerCase() === DEMO_USER.email;
  if (emailMatches && password === DEMO_USER.password) {
    return { name: DEMO_USER.name, email: DEMO_USER.email };
  }
  return null;
}
