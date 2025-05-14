import { User } from 'better-auth/types';

export function createVerificationEmail(
  user: User,
  url: string,
  token: string,
) {
  return `${user.name} ${url} ${token}`;
}

export function createChangeEmailVerification(
  user: User,
  url: string,
  token: string,
) {
  return `${user.name} ${url} ${token}`;
}

export function createDeleteAccountEmail(
  user: User,
  url: string,
  token: string,
) {
  return `${user.name} ${url} ${token}`;
}

export function createPasswordResetEmail(
  user: User,
  url: string,
  token: string,
) {
  return `${user.name} ${url} ${token}`;
}
