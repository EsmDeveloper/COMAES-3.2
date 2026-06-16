import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

/**
 * Unit Tests for AuthContext
 * Validates Requirements 1.5 and 1.6:
 * - 1.5: AuthContext SHALL store role and disciplina_colaborador from JWT
 * - 1.6: AuthContext SHALL expose role and disciplina_colaborador to components
 */

describe('AuthContext - Colaborador Role Support', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should extract and store role from user data during login', () => {
    // Arrange
    const mockUser = {
      id: 5,
      name: 'Professor João',
      email: 'professor@escola.com',
      role: 'colaborador',
      disciplina_colaborador: 'matematica'
    };
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });

    act(() => {
      result.current.login(mockUser, mockToken);
    });

    // Assert
    expect(result.current.user.role).toBe('colaborador');
    expect(result.current.user.disciplina_colaborador).toBe('matematica');
  });

  it('should extract and store disciplina_colaborador from user data', () => {
    // Arrange
    const mockUser = {
      id: 6,
      name: 'Professora Maria',
      email: 'professora@escola.com',
      role: 'colaborador',
      disciplina_colaborador: 'ingles'
    };
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });

    act(() => {
      result.current.login(mockUser, mockToken);
    });

    // Assert
    expect(result.current.user.disciplina_colaborador).toBe('ingles');
    expect(result.current.user.role).toBe('colaborador');
  });

  it('should default role to estudante if not provided', () => {
    // Arrange
    const mockUser = {
      id: 7,
      name: 'Student João',
      email: 'student@escola.com'
      // role not provided
    };
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });

    act(() => {
      result.current.login(mockUser, mockToken);
    });

    // Assert
    expect(result.current.user.role).toBe('estudante');
  });

  it('should handle null disciplina_colaborador for estudantes', () => {
    // Arrange
    const mockUser = {
      id: 8,
      name: 'Student Maria',
      email: 'student@escola.com',
      role: 'estudante',
      disciplina_colaborador: null
    };
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });

    act(() => {
      result.current.login(mockUser, mockToken);
    });

    // Assert
    expect(result.current.user.disciplina_colaborador).toBeNull();
    expect(result.current.user.role).toBe('estudante');
  });

  it('should persist role and disciplina_colaborador to localStorage', () => {
    // Arrange
    const mockUser = {
      id: 9,
      name: 'Professor Pedro',
      email: 'pedro@escola.com',
      role: 'colaborador',
      disciplina_colaborador: 'programacao'
    };
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });

    act(() => {
      result.current.login(mockUser, mockToken);
    });

    // Assert
    const savedUser = JSON.parse(localStorage.getItem('comaes_user'));
    expect(savedUser.role).toBe('colaborador');
    expect(savedUser.disciplina_colaborador).toBe('programacao');
  });

  it('should restore role and disciplina_colaborador from localStorage on mount', () => {
    // Arrange
    const mockUser = {
      id: 10,
      name: 'Professor Carlos',
      email: 'carlos@escola.com',
      role: 'colaborador',
      disciplina_colaborador: 'matematica'
    };
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

    // Pre-populate localStorage
    localStorage.setItem('comaes_user', JSON.stringify(mockUser));
    localStorage.setItem('comaes_token', mockToken);

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });

    // Assert
    expect(result.current.user.role).toBe('colaborador');
    expect(result.current.user.disciplina_colaborador).toBe('matematica');
    expect(result.current.token).toBe(mockToken);
  });

  it('should include role in admin user detection', () => {
    // Arrange
    const mockAdminUser = {
      id: 11,
      name: 'Admin User',
      email: 'admin@escola.com',
      role: 'admin',
      isAdmin: true
    };
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });

    act(() => {
      result.current.login(mockAdminUser, mockToken);
    });

    // Assert
    expect(result.current.user.role).toBe('admin');
    expect(result.current.user.isAdmin).toBe(true);
  });

  it('should expose user object with role and disciplina_colaborador via useAuth hook', () => {
    // Arrange
    const mockUser = {
      id: 12,
      name: 'Hook Test User',
      email: 'hook@escola.com',
      role: 'colaborador',
      disciplina_colaborador: 'ingles'
    };
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });

    act(() => {
      result.current.login(mockUser, mockToken);
    });

    // Assert - Verify the hook exposes all necessary fields
    expect(result.current.user).toBeDefined();
    expect(result.current.user.id).toBe(12);
    expect(result.current.user.role).toBe('colaborador');
    expect(result.current.user.disciplina_colaborador).toBe('ingles');
    expect(result.current.user.email).toBe('hook@escola.com');
    expect(result.current.token).toBe(mockToken);
  });

  it('should clear role and disciplina_colaborador on logout', () => {
    // Arrange
    const mockUser = {
      id: 13,
      name: 'Logout Test',
      email: 'logout@escola.com',
      role: 'colaborador',
      disciplina_colaborador: 'matematica'
    };
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
    });

    act(() => {
      result.current.login(mockUser, mockToken);
    });

    expect(result.current.user.role).toBe('colaborador');

    act(() => {
      result.current.logout();
    });

    // Assert
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('comaes_user')).toBeNull();
    expect(localStorage.getItem('comaes_token')).toBeNull();
  });
});
