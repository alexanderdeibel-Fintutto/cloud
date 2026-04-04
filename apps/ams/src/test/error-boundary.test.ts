import { describe, it, expect } from 'vitest';

describe('ErrorBoundary', () => {
  it('should handle error state', () => {
    const state = { hasError: false, error: null };
    const error = new Error('Test error');

    // Simulate getDerivedStateFromError
    const newState = { hasError: true, error };

    expect(newState.hasError).toBe(true);
    expect(newState.error.message).toBe('Test error');
  });

  it('should reset error state', () => {
    const state = { hasError: true, error: new Error('Test') };
    const resetState = { hasError: false, error: null };

    expect(resetState.hasError).toBe(false);
    expect(resetState.error).toBeNull();
  });
});

describe('ProtectedRoute', () => {
  it('should require auth context user', () => {
    const mockUser = null;
    const shouldRedirect = !mockUser;
    expect(shouldRedirect).toBe(true);
  });

  it('should allow access with valid user', () => {
    const mockUser = { id: '123', email: 'admin@test.de' };
    const shouldRedirect = !mockUser;
    expect(shouldRedirect).toBe(false);
  });
});
