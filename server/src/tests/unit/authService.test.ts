import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../services/authService.js';
import { userRepo } from '../../repositories/userRepo.js';
import { AuthError, ValidationError } from '../../middleware/errorHandler.js';

// Mock the userRepo so unit tests don't hit the DB
vi.mock('../../repositories/userRepo.js', () => ({
  userRepo: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    toDTO: vi.fn((u) => ({ id: u.id, email: u.email, name: u.name, createdAt: u.createdAt?.toISOString() })),
  },
}));

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: '',
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authService.register', () => {
  it('throws ValidationError if email already exists', async () => {
    vi.mocked(userRepo.findByEmail).mockResolvedValue(mockUser);
    await expect(authService.register('test@example.com', 'Test', 'pass123')).rejects.toThrow(ValidationError);
  });

  it('creates user and returns accessToken when email is new', async () => {
    vi.mocked(userRepo.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepo.create).mockResolvedValue({ id: 'user-123', email: 'new@example.com', name: 'New', createdAt: new Date().toISOString() });

    const result = await authService.register('new@example.com', 'New', 'password123');
    expect(result.accessToken).toBeTruthy();
    expect(result.user.email).toBe('new@example.com');
  });
});

describe('authService.login', () => {
  it('throws AuthError if user not found', async () => {
    vi.mocked(userRepo.findByEmail).mockResolvedValue(null);
    await expect(authService.login('nobody@example.com', 'pass')).rejects.toThrow(AuthError);
  });

  it('throws AuthError if password is wrong', async () => {
    // Store a hash for "correctpassword"
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.hash('correctpassword', 10);
    vi.mocked(userRepo.findByEmail).mockResolvedValue({ ...mockUser, passwordHash: hash });
    vi.mocked(userRepo.toDTO).mockReturnValue({ id: mockUser.id, email: mockUser.email, name: mockUser.name, createdAt: mockUser.createdAt.toISOString() });

    await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow(AuthError);
  });

  it('returns accessToken and refreshToken on valid credentials', async () => {
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.hash('correctpassword', 10);
    vi.mocked(userRepo.findByEmail).mockResolvedValue({ ...mockUser, passwordHash: hash });
    vi.mocked(userRepo.toDTO).mockReturnValue({ id: mockUser.id, email: mockUser.email, name: mockUser.name, createdAt: mockUser.createdAt.toISOString() });

    const result = await authService.login('test@example.com', 'correctpassword');
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.user.email).toBe('test@example.com');
  });
});

describe('authService.verifyRefreshToken', () => {
  it('throws AuthError for invalid token', () => {
    expect(() => authService.verifyRefreshToken('invalid.token.here')).toThrow(AuthError);
  });
});
