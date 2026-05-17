import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

vi.mock('../../services/api', () => ({
  setAccessTokenGetter: vi.fn(),
}));

function TestConsumer() {
  const { user, accessToken, login, logout, setToken } = useAuth();
  return (
    <div>
      <span data-testid="user">{user?.email ?? 'null'}</span>
      <span data-testid="token">{accessToken ?? 'null'}</span>
      <button onClick={() => login({ id: '1', email: 'a@b.com', name: 'A', createdAt: '' }, 'tok-123')}>
        login
      </button>
      <button onClick={logout}>logout</button>
      <button onClick={() => setToken('new-tok')}>set-token</button>
    </div>
  );
}

describe('AuthContext', () => {
  it('starts with null user and token', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('token').textContent).toBe('null');
  });

  it('login sets user and token', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    act(() => { screen.getByText('login').click(); });

    expect(screen.getByTestId('user').textContent).toBe('a@b.com');
    expect(screen.getByTestId('token').textContent).toBe('tok-123');
  });

  it('logout clears user and token', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    act(() => { screen.getByText('login').click(); });
    act(() => { screen.getByText('logout').click(); });

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('token').textContent).toBe('null');
  });

  it('setToken updates only the token', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    act(() => { screen.getByText('login').click(); });
    act(() => { screen.getByText('set-token').click(); });

    expect(screen.getByTestId('user').textContent).toBe('a@b.com');
    expect(screen.getByTestId('token').textContent).toBe('new-tok');
  });

  it('throws when useAuth is called outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used inside AuthProvider');
    spy.mockRestore();
  });
});
