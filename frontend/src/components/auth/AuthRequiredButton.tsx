import React from 'react';
import { useAuthAction } from '../../hooks/useAuthAction';

interface AuthRequiredButtonProps {
  onClick: () => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  message?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const AuthRequiredButton: React.FC<AuthRequiredButtonProps> = ({
  onClick,
  children,
  className = '',
  disabled = false,
  message = 'Please sign in to continue',
  type = 'button',
}) => {
  const { requireAuth } = useAuthAction();

  const handleClick = () => {
    requireAuth(onClick, message);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
};