import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { useAuthStore } from '../store/authStore';

// Mock useAuthStore
vi.mock('../store/authStore', () => {
  const store = vi.fn();
  return {
    useAuthStore: store,
  };
});

describe('PrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve redirecionar para /login se o token nao estiver presente', () => {
    // Retorna undefined para token
    vi.mocked(useAuthStore).mockImplementation((selector: any) => selector({ token: null }));

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/private" element={<div>Conteudo Privado</div>} />
          </Route>
          <Route path="/login" element={<div>Tela de Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Deve exibir a tela de login
    expect(screen.getByText('Tela de Login')).toBeInTheDocument();
    expect(screen.queryByText('Conteudo Privado')).not.toBeInTheDocument();
  });

  it('deve renderizar o conteudo privado se o token estiver presente', () => {
    // Retorna token valido
    vi.mocked(useAuthStore).mockImplementation((selector: any) => selector({ token: 'mock-token' }));

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/private" element={<div>Conteudo Privado</div>} />
          </Route>
          <Route path="/login" element={<div>Tela de Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Deve exibir o conteudo privado
    expect(screen.getByText('Conteudo Privado')).toBeInTheDocument();
    expect(screen.queryByText('Tela de Login')).not.toBeInTheDocument();
  });
});
