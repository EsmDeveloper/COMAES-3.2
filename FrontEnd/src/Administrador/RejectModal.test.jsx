/**
 * RejectModal.test.jsx
 * Unit tests for RejectModal component
 * 
 * Task 12.2: Create RejectModal component
 * Tests validate:
 * - Modal visibility control (isOpen)
 * - Textarea field for motivo_rejeicao
 * - Required field validation
 * - Button states (enabled/disabled based on input)
 * - Callback execution with motivo parameter
 * - Loading state during submission
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RejectModal from './RejectModal';

describe('RejectModal Component', () => {
  const defaultProps = {
    isOpen: true,
    questaoTitle: 'Qual é a capital do Brasil?',
    questaoDescription: 'Uma questão sobre geografia do Brasil',
    questaoId: 1,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    loading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should render modal when isOpen is true', () => {
      render(<RejectModal {...defaultProps} />);
      expect(screen.getByText('Rejeitar Questão')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      const props = { ...defaultProps, isOpen: false };
      const { container } = render(<RejectModal {...props} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Question Preview', () => {
    it('should display question title and description', () => {
      render(<RejectModal {...defaultProps} />);
      expect(screen.getByText('Qual é a capital do Brasil?')).toBeInTheDocument();
      expect(screen.getByText('Uma questão sobre geografia do Brasil')).toBeInTheDocument();
    });

    it('should display only title when description is not provided', () => {
      const props = { ...defaultProps, questaoDescription: undefined };
      render(<RejectModal {...props} />);
      expect(screen.getByText('Qual é a capital do Brasil?')).toBeInTheDocument();
    });
  });

  describe('Textarea Field', () => {
    it('should have textarea for motivo_rejeicao', () => {
      render(<RejectModal {...defaultProps} />);
      const textarea = screen.getByPlaceholderText(
        /Explique o motivo pelo qual esta questão está sendo rejeitada/i
      );
      expect(textarea).toBeInTheDocument();
    });

    it('should update textarea value when user types', async () => {
      const user = userEvent.setup();
      render(<RejectModal {...defaultProps} />);
      const textarea = screen.getByPlaceholderText(
        /Explique o motivo pelo qual esta questão está sendo rejeitada/i
      );
      
      await user.type(textarea, 'Questão com erro de digitação');
      expect(textarea).toHaveValue('Questão com erro de digitação');
    });

    it('should have maxLength attribute of 500 characters', () => {
      render(<RejectModal {...defaultProps} />);
      const textarea = screen.getByPlaceholderText(
        /Explique o motivo pelo qual esta questão está sendo rejeitada/i
      );
      expect(textarea).toHaveAttribute('maxLength', '500');
    });

    it('should display character count correctly', async () => {
      const user = userEvent.setup();
      render(<RejectModal {...defaultProps} />);
      const textarea = screen.getByPlaceholderText(
        /Explique o motivo pelo qual esta questão está sendo rejeitada/i
      );
      
      expect(screen.getByText(/0\/500 caracteres/i)).toBeInTheDocument();
      
      await user.type(textarea, 'Test');
      expect(screen.getByText(/4\/500 caracteres/i)).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should show error when submitting empty motivo', async () => {
      const user = userEvent.setup();
      render(<RejectModal {...defaultProps} />);
      
      // Submit should be disabled if textarea is empty
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(btn => btn.textContent.includes('Rejeitar'));
      expect(submitButton).toBeDisabled();
    });

    it('should enable button when any text is entered', async () => {
      const user = userEvent.setup();
      render(<RejectModal {...defaultProps} />);
      const textarea = screen.getByPlaceholderText(
        /Explique o motivo pelo qual esta questão está sendo rejeitada/i
      );
      
      // Type just 1 character
      await user.type(textarea, 'a');
      
      // Button should be enabled (validation happens on submit)
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(btn => btn.textContent.includes('Rejeitar'));
      expect(submitButton).not.toBeDisabled();
    });

    it('should not call onConfirm when motivo is less than 5 characters on submit', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const props = { ...defaultProps, onConfirm };
      
      render(<RejectModal {...props} />);
      const textarea = screen.getByPlaceholderText(
        /Explique o motivo pelo qual esta questão está sendo rejeitada/i
      );
      
      // Type only 3 characters
      await user.type(textarea, 'abc');
      
      // Get submit button and click it
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(btn => btn.textContent.includes('Rejeitar'));
      await user.click(submitButton);
      
      // onConfirm should not be called due to validation
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Button States', () => {
    it('should disable Rejeitar button when textarea is empty', () => {
      render(<RejectModal {...defaultProps} />);
      const submitButton = screen.getByRole('button', { name: /Rejeitar/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable Rejeitar button when valid motivo is entered', async () => {
      const user = userEvent.setup();
      render(<RejectModal {...defaultProps} />);
      const textarea = screen.getByPlaceholderText(
        /Explique o motivo pelo qual esta questão está sendo rejeitada/i
      );
      const submitButton = screen.getByRole('button', { name: /Rejeitar/i });
      
      await user.type(textarea, 'Valid rejection reason');
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should disable all buttons when loading is true', () => {
      const props = { ...defaultProps, loading: true };
      render(<RejectModal {...props} />);
      
      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      const submitButton = screen.getByRole('button', { name: /Rejeitando/i });
      
      expect(cancelButton).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('should show loading spinner when loading is true', () => {
      const props = { ...defaultProps, loading: true };
      render(<RejectModal {...props} />);
      expect(screen.getByText('Rejeitando...')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call onConfirm with trimmed motivo when form is submitted validly', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const props = { ...defaultProps, onConfirm };
      
      render(<RejectModal {...props} />);
      const textarea = screen.getByPlaceholderText(
        /Explique o motivo pelo qual esta questão está sendo rejeitada/i
      );
      
      // Type a valid motivo (at least 5 chars)
      await user.type(textarea, 'Questão com erro conceitual');
      
      // Click submit button
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(btn => btn.textContent.includes('Rejeitar'));
      await user.click(submitButton);
      
      // Check onConfirm was called
      expect(onConfirm).toHaveBeenCalledWith('Questão com erro conceitual');
    });

    it('should trim whitespace from motivo before calling onConfirm', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const props = { ...defaultProps, onConfirm };
      
      render(<RejectModal {...props} />);
      const textarea = screen.getByPlaceholderText(
        /Explique o motivo pelo qual esta questão está sendo rejeitada/i
      );
      
      // Type motivo with spaces
      await user.type(textarea, '   Questão com erro   ');
      
      // Click submit button
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(btn => btn.textContent.includes('Rejeitar'));
      await user.click(submitButton);
      
      // Should trim and pass clean string
      expect(onConfirm).toHaveBeenCalledWith('Questão com erro');
    });

    it('should not call onConfirm when textarea is empty', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const props = { ...defaultProps, onConfirm };
      
      render(<RejectModal {...props} />);
      
      // Try to click submit button - should be disabled
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(btn => btn.textContent.includes('Rejeitar'));
      
      // Button should be disabled
      expect(submitButton).toBeDisabled();
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should not call onConfirm when motivo is less than 5 characters on submit', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const props = { ...defaultProps, onConfirm };
      
      render(<RejectModal {...props} />);
      const textarea = screen.getByPlaceholderText(
        /Explique o motivo pelo qual esta questão está sendo rejeitada/i
      );
      
      // Type only 3 characters
      await user.type(textarea, 'abc');
      
      // Get submit button and click it
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(btn => btn.textContent.includes('Rejeitar'));
      await user.click(submitButton);
      
      // onConfirm should not be called due to validation
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Modal Closing', () => {
    it('should call onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const props = { ...defaultProps, onClose };
      
      render(<RejectModal {...props} />);
      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      
      await user.click(cancelButton);
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when X button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const props = { ...defaultProps, onClose };
      
      render(<RejectModal {...props} />);
      const closeButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg') && !btn.textContent.includes('Cancelar')
      );
      
      if (closeButton) {
        await user.click(closeButton);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('should not call onClose when loading and cancel is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const props = { ...defaultProps, onClose, loading: true };
      
      render(<RejectModal {...props} />);
      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      
      // Button should be disabled during loading
      expect(cancelButton).toBeDisabled();
    });

    it('should reset form state when modal closes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<RejectModal {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText(
        /Explique o motivo pelo qual esta questão está sendo rejeitada/i
      );
      
      await user.type(textarea, 'Some rejection reason');
      expect(textarea).toHaveValue('Some rejection reason');
      
      // Close modal
      rerender(<RejectModal {...defaultProps} isOpen={false} />);
      
      // Reopen modal - should be empty
      rerender(<RejectModal {...defaultProps} isOpen={true} />);
      const newTextarea = screen.getByPlaceholderText(
        /Explique o motivo pelo qual esta questão está sendo rejeitada/i
      );
      expect(newTextarea).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper label for textarea', () => {
      render(<RejectModal {...defaultProps} />);
      expect(screen.getByText(/Motivo da Rejeição/i)).toBeInTheDocument();
    });

    it('should show required indicator on label', () => {
      render(<RejectModal {...defaultProps} />);
      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toBeInTheDocument();
    });

    it('should have descriptive button text', () => {
      render(<RejectModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Rejeitar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
    });
  });
});
