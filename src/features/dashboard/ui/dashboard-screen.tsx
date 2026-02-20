import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../../providers/auth-provider';
import { useTheme } from '../../../providers/theme-provider';

const SIDEBAR_ITEMS = ['Home', 'Projects', 'Analytics', 'Settings'] as const;

export const DashboardScreen = () => {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 960;
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    navbar: {
      height: 64,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    navLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    menuButton: {
      width: 36,
      height: 36,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    menuBar: {
      width: 16,
      height: 2,
      borderRadius: 2,
      backgroundColor: theme.colors.textPrimary,
    },
    brand: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '700',
    },
    userArea: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    userText: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.caption,
      maxWidth: 220,
    },
    logoutButton: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    logoutText: {
      color: theme.colors.textPrimary,
      fontSize: theme.typography.caption,
      fontWeight: '600',
    },
    shell: {
      flex: 1,
      flexDirection: 'row',
      position: 'relative',
    },
    sidebar: {
      width: 220,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    mobileSidebar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 20,
      shadowColor: '#000000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(2, 6, 23, 0.2)',
      zIndex: 10,
    },
    sidebarItem: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.background,
    },
    sidebarItemActive: {
      backgroundColor: '#E8F1FF',
      borderWidth: 1,
      borderColor: '#C7DBFF',
    },
    sidebarText: {
      color: theme.colors.textPrimary,
      fontSize: theme.typography.body,
      fontWeight: '500',
    },
    main: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    mainTitle: {
      color: theme.colors.textPrimary,
      fontSize: 28,
      fontWeight: '700',
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    mainBody: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.body,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <Pressable onPress={() => setIsSidebarOpen((prev) => !prev)} style={styles.menuButton}>
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
          </Pressable>
          <Text style={styles.brand}>Dashboard</Text>
        </View>
        <View style={styles.userArea}>
          <Text numberOfLines={1} style={styles.userText}>
            {user?.email ?? 'Signed in'}
          </Text>
          <Pressable onPress={() => void signOut()} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sign out</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.shell}>
        {isSidebarOpen ? (
          <View style={[styles.sidebar, isMobile ? styles.mobileSidebar : null]}>
            {SIDEBAR_ITEMS.map((item, index) => (
              <View key={item} style={[styles.sidebarItem, index === 0 ? styles.sidebarItemActive : null]}>
                <Text style={styles.sidebarText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {isMobile && isSidebarOpen ? <Pressable onPress={() => setIsSidebarOpen(false)} style={styles.backdrop} /> : null}

        <View style={styles.main}>
          <Text style={styles.mainTitle}>Empty Dashboard</Text>
          <Text style={styles.mainBody}>Your authenticated app content will render here.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
