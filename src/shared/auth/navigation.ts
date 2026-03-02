let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export function navigateToLogin(): void {
  if (unauthorizedHandler) {
    unauthorizedHandler();
    return;
  }

  window.location.assign('/login');
}
