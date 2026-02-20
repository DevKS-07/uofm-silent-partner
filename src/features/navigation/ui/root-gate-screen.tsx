import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useAuth } from '../../../providers/auth-provider';
import { useTheme } from '../../../providers/theme-provider';
import { createCommonStyles } from '../../../theme';

export const RootGateScreen = () => {
  const theme = useTheme();
  const commonStyles = createCommonStyles(theme);
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return (
      <View style={commonStyles.screen}>
        <View style={[commonStyles.centerContent, { flex: 1 }]}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)" />;
};
