export function createVerificationEmail(url: string, token: string) {
  return `${url} ${token}`;
}

export function createChangeEmailVerification(url: string, token: string) {
  return `${url} ${token}`;
}

export function createDeleteAccountEmail(url: string, token: string) {
  return `${url} ${token}`;
}
