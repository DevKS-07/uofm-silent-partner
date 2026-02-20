import { useState } from 'react';

import { useAuth } from '../../../providers/auth-provider';

type AuthActionState = {
  email: string;
  password: string;
  error: string | null;
  message: string | null;
  isSubmitting: boolean;
};

type AuthActionHandlers = {
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  resetPassword: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthActions = (): AuthActionState & AuthActionHandlers => {
  const { signIn, signOut, signUp, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const runAction = async (action: () => Promise<void>, successMessage?: string): Promise<void> => {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await action();
      if (successMessage) {
        setMessage(successMessage);
      }
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    password,
    error,
    message,
    isSubmitting,
    setEmail,
    setPassword,
    signIn: () => runAction(() => signIn(email, password)),
    signUp: () => runAction(() => signUp(email, password), 'Account created and signed in.'),
    resetPassword: () =>
      runAction(() => resetPassword(email), 'Password reset email sent if the account exists.'),
    logout: () => runAction(signOut, 'Signed out.'),
  };
};
