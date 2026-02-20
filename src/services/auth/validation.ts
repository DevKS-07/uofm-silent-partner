import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .email('Please enter a valid email address.');

const signUpPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password is too long.');

export const validateEmail = (email: string): string => emailSchema.parse(email);

export const validateSignUpPassword = (password: string): string => signUpPasswordSchema.parse(password);

export const validateSignInPassword = (password: string): string =>
  z.string().min(1, 'Password is required.').parse(password);
