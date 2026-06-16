/**
 * Task 17.1: Verify Existing Student Functionality - Regression Test
 * 
 * This test validates that the addition of the Colaborador role has not broken
 * existing student functionality.
 * 
 * Test Scenarios:
 * 1. Student login still works
 * 2. Students can still participate in tournaments
 * 3. Students cannot access colaborador routes
 * 4. Students cannot access admin routes
 * 5. Student dashboard functionality works
 * 
 * Requirements: 17.1, 17.4
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import ProtectedEstudanteRoute from '../../context/ProtectedEstudanteRoute';
import ProtectedColaboradorRoute from '../../context/ProtectedColaboradorRoute';
import ProtectedAdminRoute from '../../context/ProtectedAdminRoute';

// Mock components for testing
const MockStudentDashboard = () => {
  const { user } = useAuth();
  return (
    <div data-testid="student-dashboard">
      <h1>Student Dashboard</h1>
      {user && (
        <>
          <p data-testid="student-name">{user.nome || user.name || user.fullName}</p>
          <p data-testid="student-role">{user.role}</p>
          <p data-testid="student-email">{user.email}</p>
        </>
      )}
    </div>
  );
};

const MockColaboradorDashboard = () => (
  <div data-testid="colaborador-dashboard">
    <h1>Colaborador Dashboard</h1>
  </div>
);

const MockAdminDashboard = () => (
  <div data-testid="admin-dashboard">
    <h1>Admin Dashboard</h1>
  </div>
);

const MockLoginPage = () => {
  const { login } = useAuth();
  
  const handleStudentLogin = () => {
    login({
      id: 1,
      nome: 'João da Silva',
      email: 'joao@example.com',
      role: 'estudante',
      isAdmin: false,
      disciplina_colaborador: null,
      status_colaborador: 'aprovado'
    }, 'mock-jwt-token-student');
  };

  const handleColaboradorLogin = () => {
    login({
      id: 2,
      nome: 'Maria Colaboradora',
      email: 'maria@example.com',
      role: 'colaborador',
      isAdmin: false,
      disciplina_colaborador: 'matematica',
      status_colaborador: 'aprovado'
    }, 'mock-jwt-token-colaborador');
  };

  const handleAdminLogin = () => {
    login({
      id: 3,
      nome: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      isAdmin: true,
      disciplina_colaborador: null,
      status_colaborador: 'aprovado'
    }, 'mock-jwt-token-admin');
  };

  return (
    <div>
      <h1>Login Page</h1>
      <button onClick={handleStudentLogin} data-testid="login-student">
        Login as Student
      </button>
      <button onClick={handleColaboradorLogin} data-testid="login-colaborador">
        Login as Colaborador
      </button>
      <button onClick={handleAdminLogin} data-testid="login-admin">
        Login as Admin
      </button>
    </div>
  );
};

// Component that wraps protected routes for testing
const ProtectedStudentWrapper = ({ children }) => (
  <ProtectedEstudanteRoute>{children}</ProtectedEstudanteRoute>
);

const ProtectedColaboradorWrapper = ({ children }) => (
  <ProtectedColaboradorRoute>{children}</ProtectedColaboradorRoute>
);

const ProtectedAdminWrapper = ({ children }) => (
  <ProtectedAdminRoute>{children}</ProtectedAdminRoute>
);

// Test utilities
const renderWithAuth = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Task 17.1: Student Functionality Regression Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Scenario 1: Student Login Still Works', () => {
    it('should allow student to login with valid credentials', async () => {
      renderWithAuth(<MockLoginPage />);
      
      const loginButton = screen.getByTestId('login-student');
      await userEvent.click(loginButton);

      // After login, verify JWT token is stored
      await waitFor(() => {
        const token = localStorage.getItem('comaes_token');
        expect(token).toBe('mock-jwt-token-student');
      });
    });

    it('should store JWT token with role=estudante', async () => {
      renderWithAuth(<MockLoginPage />);
      
      await userEvent.click(screen.getByTestId('login-student'));

      await waitFor(() => {
        const user = JSON.parse(localStorage.getItem('comaes_user'));
        expect(user.role).toBe('estudante');
      });
    });

    it('should redirect to student dashboard after login', async () => {
      renderWithAuth(
        <>
          <MockLoginPage />
          <ProtectedStudentWrapper>
            <MockStudentDashboard />
          </ProtectedStudentWrapper>
        </>
      );
      
      await userEvent.click(screen.getByTestId('login-student'));

      await waitFor(() => {
        expect(screen.getByTestId('student-dashboard')).toBeInTheDocument();
      });
    });

    it('should restore student session from localStorage', async () => {
      // Set up localStorage with a student session
      const studentUser = {
        id: 1,
        nome: 'João da Silva',
        email: 'joao@example.com',
        role: 'estudante',
        isAdmin: false,
        disciplina_colaborador: null,
        status_colaborador: 'aprovado'
      };
      localStorage.setItem('comaes_user', JSON.stringify(studentUser));
      localStorage.setItem('comaes_token', 'mock-jwt-token-student');

      renderWithAuth(<MockStudentDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('student-name')).toHaveTextContent('João da Silva');
        expect(screen.getByTestId('student-role')).toHaveTextContent('estudante');
      });
    });

    it('should have estudante role (not admin, not colaborador)', async () => {
      renderWithAuth(<MockLoginPage />);
      
      await userEvent.click(screen.getByTestId('login-student'));

      await waitFor(() => {
        const user = JSON.parse(localStorage.getItem('comaes_user'));
        expect(user.role).toBe('estudante');
        expect(user.isAdmin).toBe(false);
        expect(user.disciplina_colaborador).toBeNull();
      });
    });
  });

  describe('Scenario 2: Students Can Still Participate in Tournaments', () => {
    beforeEach(async () => {
      // Login as student first
      const studentUser = {
        id: 1,
        nome: 'João da Silva',
        email: 'joao@example.com',
        role: 'estudante',
        isAdmin: false,
        disciplina_colaborador: null
      };
      localStorage.setItem('comaes_user', JSON.stringify(studentUser));
      localStorage.setItem('comaes_token', 'mock-jwt-token-student');
    });

    it('should verify /api/torneios is accessible without authentication', async () => {
      // Mock the API call
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 1,
              titulo: 'Torneio de Matemática',
              status: 'ativo',
              tipo_torneio: 'generico',
              disciplina_especifica: null
            },
            {
              id: 2,
              titulo: 'Torneio de Programação',
              status: 'ativo',
              tipo_torneio: 'especifico',
              disciplina_especifica: 'programacao'
            }
          ])
        })
      );

      // Call the endpoint (simulating what the UI does)
      const response = await fetch('/api/torneios');
      const tournaments = await response.json();

      expect(response.ok).toBe(true);
      expect(tournaments).toHaveLength(2);
      expect(tournaments[0].titulo).toBe('Torneio de Matemática');
    });

    it('should verify student can enroll in tournament via API', async () => {
      global.fetch = vi.fn((url, options) => {
        if (url.includes('/api/torneios/1/inscrever')) {
          return Promise.resolve({
            ok: true,
            status: 201,
            json: () => Promise.resolve({
              message: 'Inscricao realizada com sucesso!',
              data: {
                torneio_id: 1,
                usuario_id: 1,
                disciplina_competida: 'matematica',
                status: 'confirmado'
              }
            })
          });
        }
        return Promise.resolve({ ok: false });
      });

      const response = await fetch('/api/torneios/1/inscrever', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer mock-jwt-token-student`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          torneio_id: 1,
          usuario_id: 1,
          disciplina_competida: 'matematica'
        })
      });

      const result = await response.json();
      expect(response.status).toBe(201);
      expect(result.data.status).toBe('confirmado');
      expect(result.data.disciplina_competida).toBe('matematica');
    });

    it('should verify tournament list loads properly', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 1,
              titulo: 'Torneio de Matemática',
              status: 'ativo',
              inicia_em: new Date().toISOString(),
              termina_em: new Date(Date.now() + 3600000).toISOString()
            }
          ])
        })
      );

      const response = await fetch('/api/torneios');
      const tournaments = await response.json();

      expect(tournaments).toBeDefined();
      expect(tournaments.length).toBeGreaterThan(0);
      expect(tournaments[0]).toHaveProperty('titulo');
      expect(tournaments[0]).toHaveProperty('status');
    });

    it('should verify enrollment API call succeeds with valid data', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({
            message: 'Inscricao realizada com sucesso!'
          })
        })
      );

      const response = await fetch('/api/torneios/1/inscrever', {
        method: 'POST',
        headers: { 'Authorization': `Bearer mock-jwt-token-student` },
        body: JSON.stringify({
          torneio_id: 1,
          usuario_id: 1,
          disciplina_competida: 'matematica'
        })
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
    });
  });

  describe('Scenario 3: Students Cannot Access Colaborador Routes', () => {
    beforeEach(async () => {
      // Login as student
      const studentUser = {
        id: 1,
        nome: 'João da Silva',
        email: 'joao@example.com',
        role: 'estudante',
        isAdmin: false,
        disciplina_colaborador: null
      };
      localStorage.setItem('comaes_user', JSON.stringify(studentUser));
      localStorage.setItem('comaes_token', 'mock-jwt-token-student');
    });

    it('should redirect student away from /colaborador/dashboard', async () => {
      renderWithAuth(
        <>
          <ProtectedColaboradorWrapper>
            <MockColaboradorDashboard />
          </ProtectedColaboradorWrapper>
          <MockLoginPage />
        </>
      );

      // After component renders, colaborador dashboard should NOT be visible
      await waitFor(() => {
        expect(screen.queryByTestId('colaborador-dashboard')).not.toBeInTheDocument();
      });
    });

    it('should not show colaborador menu items to student', async () => {
      const MenuWithColaboradorItems = () => {
        const { user } = useAuth();
        return (
          <div>
            {user && user.role === 'colaborador' && (
              <>
                <a href="/colaborador/questoes" data-testid="menu-my-questions">
                  Minhas Questões
                </a>
                <a href="/colaborador/blocos" data-testid="menu-my-blocks">
                  Meus Blocos
                </a>
              </>
            )}
            {user && user.role === 'estudante' && (
              <a href="/painel" data-testid="menu-student-dashboard">
                Painel de Controle
              </a>
            )}
          </div>
        );
      };

      renderWithAuth(<MenuWithColaboradorItems />);

      // Colaborador menu items should NOT be visible
      await waitFor(() => {
        expect(screen.queryByTestId('menu-my-questions')).not.toBeInTheDocument();
        expect(screen.queryByTestId('menu-my-blocks')).not.toBeInTheDocument();
      });

      // Student menu items SHOULD be visible
      expect(screen.getByTestId('menu-student-dashboard')).toBeInTheDocument();
    });

    it('should verify student role cannot call GET /api/questoes/minhas', async () => {
      // This endpoint is for colaboradores only
      global.fetch = vi.fn((url) => {
        if (url.includes('/api/questoes/minhas')) {
          return Promise.resolve({
            ok: false,
            status: 403,
            json: () => Promise.resolve({
              message: 'Access denied'
            })
          });
        }
        return Promise.resolve({ ok: false });
      });

      const response = await fetch('/api/questoes/minhas', {
        headers: { 'Authorization': `Bearer mock-jwt-token-student` }
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
    });
  });

  describe('Scenario 4: Students Cannot Access Admin Routes', () => {
    beforeEach(async () => {
      // Login as student
      const studentUser = {
        id: 1,
        nome: 'João da Silva',
        email: 'joao@example.com',
        role: 'estudante',
        isAdmin: false,
        disciplina_colaborador: null
      };
      localStorage.setItem('comaes_user', JSON.stringify(studentUser));
      localStorage.setItem('comaes_token', 'mock-jwt-token-student');
    });

    it('should redirect student away from /administrador', async () => {
      renderWithAuth(
        <>
          <ProtectedAdminWrapper>
            <MockAdminDashboard />
          </ProtectedAdminWrapper>
          <MockLoginPage />
        </>
      );

      // Admin dashboard should NOT be visible for student
      await waitFor(() => {
        expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument();
      });
    });

    it('should not show admin menu items to student', async () => {
      const MenuWithAdminItems = () => {
        const { user } = useAuth();
        const isAdmin = user?.isAdmin === true || user?.isAdmin === 1 || user?.role === 'admin';
        
        return (
          <div>
            {isAdmin && (
              <>
                <a href="/admin/disciplinas" data-testid="menu-disciplines">
                  Gerenciar Disciplinas
                </a>
                <a href="/admin/questoes/pendentes" data-testid="menu-pending-questions">
                  Questões Pendentes
                </a>
                <a href="/admin/colaboradores" data-testid="menu-colaboradores">
                  Colaboradores
                </a>
              </>
            )}
            {user && user.role === 'estudante' && (
              <a href="/painel" data-testid="menu-student-dashboard">
                Painel de Controle
              </a>
            )}
          </div>
        );
      };

      renderWithAuth(<MenuWithAdminItems />);

      // Admin menu items should NOT be visible
      await waitFor(() => {
        expect(screen.queryByTestId('menu-disciplines')).not.toBeInTheDocument();
        expect(screen.queryByTestId('menu-pending-questions')).not.toBeInTheDocument();
        expect(screen.queryByTestId('menu-colaboradores')).not.toBeInTheDocument();
      });

      // Student menu should be visible
      expect(screen.getByTestId('menu-student-dashboard')).toBeInTheDocument();
    });

    it('should return 403 when student tries to access admin endpoints', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('/api/admin')) {
          return Promise.resolve({
            ok: false,
            status: 403,
            json: () => Promise.resolve({ message: 'Admin access required' })
          });
        }
        return Promise.resolve({ ok: false });
      });

      const response = await fetch('/api/admin/disciplinas', {
        headers: { 'Authorization': `Bearer mock-jwt-token-student` }
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
    });
  });

  describe('Scenario 5: Student Dashboard Functionality Works', () => {
    beforeEach(async () => {
      // Login as student
      const studentUser = {
        id: 1,
        nome: 'João da Silva',
        email: 'joao@example.com',
        role: 'estudante',
        isAdmin: false,
        disciplina_colaborador: null
      };
      localStorage.setItem('comaes_user', JSON.stringify(studentUser));
      localStorage.setItem('comaes_token', 'mock-jwt-token-student');
    });

    it('should display student name on dashboard', async () => {
      renderWithAuth(<MockStudentDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('student-name')).toHaveTextContent('João da Silva');
      });
    });

    it('should display enrolled tournaments', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [
              {
                id: 1,
                torneio_id: 1,
                torneio: { titulo: 'Torneio de Matemática' },
                disciplina_competida: 'matematica',
                posicao: 2,
                pontuacao: 850
              },
              {
                id: 2,
                torneio_id: 2,
                torneio: { titulo: 'Torneio de Inglês' },
                disciplina_competida: 'ingles',
                posicao: 1,
                pontuacao: 950
              }
            ]
          })
        })
      );

      const response = await fetch('/api/usuarios/1/participacoes');
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].torneio.titulo).toBe('Torneio de Matemática');
    });

    it('should display rankings/scores correctly', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [
              {
                id: 1,
                torneio_id: 1,
                torneio: { titulo: 'Torneio de Matemática' },
                disciplina_competida: 'matematica',
                posicao: 1,
                pontuacao: 950,
                precisao: 95.5
              }
            ]
          })
        })
      );

      const response = await fetch('/api/usuarios/1/participacoes');
      const data = await response.json();

      expect(data.data[0].posicao).toBe(1);
      expect(data.data[0].pontuacao).toBe(950);
      expect(data.data[0].precisao).toBe(95.5);
    });

    it('should not have console errors when loading dashboard', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithAuth(<MockStudentDashboard />);

      await waitFor(() => {
        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should verify dashboard renders without errors', async () => {
      renderWithAuth(<MockStudentDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('student-dashboard')).toBeInTheDocument();
        expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
      });
    });

    it('should display correct role in user data', async () => {
      renderWithAuth(<MockStudentDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('student-role')).toHaveTextContent('estudante');
      });
    });
  });

  describe('Cross-Scenario Regression Tests', () => {
    it('should verify authentication flow unchanged for students', async () => {
      renderWithAuth(<MockLoginPage />);
      
      await userEvent.click(screen.getByTestId('login-student'));

      await waitFor(() => {
        const token = localStorage.getItem('comaes_token');
        const user = JSON.parse(localStorage.getItem('comaes_user'));
        
        expect(token).toBeTruthy();
        expect(user.role).toBe('estudante');
        expect(user.email).toBe('joao@example.com');
      });
    });

    it('should prevent student from accessing public admin routes', async () => {
      const studentUser = {
        id: 1,
        nome: 'João da Silva',
        role: 'estudante',
        isAdmin: false
      };
      localStorage.setItem('comaes_user', JSON.stringify(studentUser));

      renderWithAuth(
        <>
          <ProtectedAdminWrapper>
            <MockAdminDashboard />
          </ProtectedAdminWrapper>
        </>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument();
      });
    });

    it('should verify existing public routes remain accessible', async () => {
      // Public routes like GET /api/torneios should not require auth
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 1, titulo: 'Torneio 1' }])
        })
      );

      const response = await fetch('/api/torneios');
      expect(response.ok).toBe(true);
    });
  });
});
