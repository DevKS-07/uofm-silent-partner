import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../../providers/theme-provider';
import { useAuthActions } from '../hooks/use-auth-actions';

type AuthMode = 'sign-in' | 'sign-up' | 'forgot-password';

const AUTH_MODE_LABEL: Record<AuthMode, string> = {
  'sign-in': 'Sign in',
  'sign-up': 'Create account',
  'forgot-password': 'Forgot password',
};

export const AuthScreen = () => {
  const theme = useTheme();
  const authActions = useAuthActions();

  const modeButtons: AuthMode[] = ['sign-in', 'sign-up', 'forgot-password'];
  const [mode, setMode] = useState<AuthMode>('sign-in');

  const isForgotMode = mode === 'forgot-password';
  const submitLabel = AUTH_MODE_LABEL[mode];

  const handleSubmit = () => {
    if (mode === 'sign-in') {
      void authActions.signIn();
      return;
    }

    if (mode === 'sign-up') {
      void authActions.signUp();
      return;
    }

    void authActions.resetPassword();
  };

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 440,
      alignSelf: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    heading: {
      color: theme.colors.textPrimary,
      fontSize: 30,
      fontWeight: '700',
    },
    subheading: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.body,
    },
    modeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    modeButton: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    modeButtonActive: {
      borderColor: theme.colors.accent,
      backgroundColor: '#EAF3FF',
    },
    modeButtonText: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.caption,
      fontWeight: '600',
    },
    modeButtonTextActive: {
      color: theme.colors.textPrimary,
    },
    form: {
      gap: theme.spacing.md,
    },
    inputLabel: {
      color: theme.colors.textPrimary,
      fontSize: theme.typography.caption,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.surface,
      color: theme.colors.textPrimary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      fontSize: theme.typography.body,
    },
    primaryButton: {
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.accent,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonDisabled: {
      opacity: 0.7,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: theme.typography.body,
      fontWeight: '600',
    },
    helperText: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.caption,
    },
    error: {
      color: '#B42318',
      fontSize: theme.typography.caption,
    },
    success: {
      color: '#067647',
      fontSize: theme.typography.caption,
    },
  });

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.card}>
        <View>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Use your account to access the dashboard.</Text>
        </View>

        <View style={styles.modeRow}>
          {modeButtons.map((item) => {
            const isActive = item === mode;
            return (
              <Pressable
                key={item}
                onPress={() => setMode(item)}
                style={[styles.modeButton, isActive ? styles.modeButtonActive : null]}
              >
                <Text style={[styles.modeButtonText, isActive ? styles.modeButtonTextActive : null]}>
                  {AUTH_MODE_LABEL[item]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.form}>
          <View>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={authActions.setEmail}
              placeholder="you@company.com"
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
              value={authActions.email}
            />
          </View>

          {!isForgotMode ? (
            <View>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={authActions.setPassword}
                placeholder={mode === 'sign-up' ? 'At least 8 characters' : 'Enter your password'}
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
                style={styles.input}
                value={authActions.password}
              />
            </View>
          ) : null}

          <Pressable
            disabled={authActions.isSubmitting}
            onPress={handleSubmit}
            style={[styles.primaryButton, authActions.isSubmitting ? styles.primaryButtonDisabled : null]}
          >
            {authActions.isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>{submitLabel}</Text>
            )}
          </Pressable>

          <Text style={styles.helperText}>
            {isForgotMode
              ? 'Enter your email and we will send you a reset link.'
              : mode === 'sign-up'
                ? 'Create a new account to continue.'
                : 'Use the account credentials you registered with.'}
          </Text>

          {authActions.error ? <Text style={styles.error}>{authActions.error}</Text> : null}
          {authActions.message ? <Text style={styles.success}>{authActions.message}</Text> : null}
        </View>
      </View>
    </SafeAreaView>
  );
};
