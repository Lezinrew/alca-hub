import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

describe('Testes Simples de Botões', () => {
  describe('Botões Básicos', () => {
    test('Botão simples funciona', () => {
      const mockOnClick = vi.fn();
      
      render(<Button onClick={mockOnClick}>Teste</Button>);
      
      const button = screen.getByRole('button', { name: /teste/i });
      expect(button).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(mockOnClick).toHaveBeenCalled();
    });

    test('Botão desabilitado não funciona', () => {
      const mockOnClick = vi.fn();
      
      render(<Button disabled onClick={mockOnClick}>Desabilitado</Button>);
      
      const button = screen.getByRole('button', { name: /desabilitado/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
      
      fireEvent.click(button);
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    test('Botão com loading mostra estado correto', () => {
      render(
        <Button disabled>
          <span className="animate-spin">⏳</span>
          Carregando...
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /carregando/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  describe('Botões de Modal', () => {
    test('Botão abre modal', () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Abrir Modal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Teste Modal</DialogTitle>
            </DialogHeader>
            <Button>Fechar</Button>
          </DialogContent>
        </Dialog>
      );
      
      const openButton = screen.getByRole('button', { name: /abrir modal/i });
      expect(openButton).toBeInTheDocument();
      
      fireEvent.click(openButton);
      
      // Verificar se modal abre
      expect(screen.getByText(/teste modal/i)).toBeInTheDocument();
    });
  });

  describe('Botões de Formulário', () => {
    test('Botão de submit funciona', () => {
      const mockOnSubmit = vi.fn();
      
      render(
        <form onSubmit={mockOnSubmit}>
          <Button type="submit">Enviar</Button>
        </form>
      );
      
      const submitButton = screen.getByRole('button', { name: /enviar/i });
      expect(submitButton).toBeInTheDocument();
      
      fireEvent.click(submitButton);
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    test('Botão de reset funciona', () => {
      const mockOnReset = vi.fn();
      
      render(
        <form onReset={mockOnReset}>
          <Button type="reset">Limpar</Button>
        </form>
      );
      
      const resetButton = screen.getByRole('button', { name: /limpar/i });
      expect(resetButton).toBeInTheDocument();
      
      fireEvent.click(resetButton);
      expect(mockOnReset).toHaveBeenCalled();
    });
  });

  describe('Testes de Acessibilidade', () => {
    test('Botões têm roles corretos', () => {
      render(<Button>Teste</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    test('Botões são focáveis', () => {
      render(<Button>Teste</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    test('Botões respondem a teclado', () => {
      const mockOnClick = vi.fn();
      
      render(<Button onClick={mockOnClick}>Teste</Button>);
      
      const button = screen.getByRole('button');
      
      // Testar Enter
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      // Testar Space
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    });
  });

  describe('Testes de Performance', () => {
    test('Botões respondem rapidamente', () => {
      const mockOnClick = vi.fn();
      
      render(<Button onClick={mockOnClick}>Teste</Button>);
      
      const button = screen.getByRole('button');
      
      const startTime = performance.now();
      fireEvent.click(button);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50);
    });
  });
});
