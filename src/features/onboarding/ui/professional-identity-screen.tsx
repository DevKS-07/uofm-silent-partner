import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../../providers/theme-provider';
import { type LinkedInConnectionSummary } from '../../../services/linkedin';
import { useLinkedInConnect } from '../hooks/use-linkedin-connect';
import { AnimatedOption } from './animated-option';

const ITEMS = [
  'Current role and company',
  'Past experience and skills',
  'Education and interests',
  'Public profile information',
];

export const ProfessionalIdentityScreen = () => {
  const router = useRouter();
  const theme = useTheme();
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInConnectionSummary | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectNotice, setConnectNotice] = useState<string | null>(null);
  const linkedIn = useLinkedInConnect();

  const handleLinkedInConnect = async () => {
    setConnectNotice(null);
    setConnectError(null);
    setLinkedInProfile(null);
    const result = await linkedIn.connect();

    if (result.status === 'connected') {
      setLinkedInConnected(true);
      setLinkedInProfile(result.profile ?? null);
      return;
    }

    if (result.status === 'cancelled') {
      setConnectNotice('LinkedIn sign-in was cancelled before completion.');
      return;
    }

    if (result.status === 'error') {
      setLinkedInConnected(false);
      setConnectError(result.message ?? 'Something went wrong. Please try again.');
    }
  };

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.white },
    container: {
      flexGrow: 1,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.white,
      paddingVertical: 24,
    },
    iconWrap: {
      marginBottom: 18,
    },
    appIcon: {
      width: 72,
      height: 72,
      borderRadius: 16,
      backgroundColor: '#17B890',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: theme.colors.black,
      marginTop: 6,
    },
    subtitle: {
      color: theme.colors.mediumGray,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 20,
      paddingHorizontal: 12,
      lineHeight: 20,
    },
    card: {
      width: '90%',
      backgroundColor: theme.colors.white,
      borderRadius: 12,
      padding: 16,
      marginBottom: 22,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    cardHeading: {
      color: theme.colors.darkGray,
      fontWeight: '700',
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    rowText: {
      color: theme.colors.darkGray,
      marginLeft: 10,
    },
    connectButton: {
      width: '90%',
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
    },
    connectInner: { flexDirection: 'row', alignItems: 'center' },
    connectText: { color: theme.colors.white, fontWeight: '700', fontSize: 16 },
    buttonDisabled: {
      opacity: 0.6,
    },
    listeningButton: {
      width: '90%',
      backgroundColor: theme.colors.white,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
    },
    listeningText: {
      color: theme.colors.darkGray,
      fontWeight: '700',
      fontSize: 16,
    },
    privacy: {
      color: '#9A9A9A',
      marginTop: 12,
      fontSize: 12,
    },
    statusCard: {
      width: '90%',
      borderRadius: 12,
      padding: 14,
      marginTop: 14,
      borderWidth: 1,
    },
    successCard: {
      backgroundColor: '#F4FBF8',
      borderColor: '#B9E7D3',
    },
    errorCard: {
      backgroundColor: '#FFF5F5',
      borderColor: '#F3C3C3',
    },
    statusTitle: {
      fontWeight: '700',
      color: theme.colors.black,
      marginBottom: 8,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    profileImage: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 10,
      backgroundColor: '#E8E8E8',
    },
    profileLabel: {
      color: theme.colors.mediumGray,
      fontSize: 12,
    },
    profileValue: {
      color: theme.colors.darkGray,
      fontSize: 14,
      fontWeight: '600',
    },
    continueButton: {
      marginTop: 10,
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    continueText: {
      color: theme.colors.white,
      fontWeight: '700',
    },
    errorText: {
      color: '#A11A1A',
      fontSize: 13,
    },
    noticeCard: {
      width: '90%',
      borderRadius: 12,
      padding: 14,
      marginTop: 10,
      borderWidth: 1,
      backgroundColor: '#F7F8FA',
      borderColor: '#D3D8E0',
    },
    noticeText: {
      color: theme.colors.darkGray,
      fontSize: 13,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.iconWrap}>
          <View style={styles.appIcon}>
            <Ionicons name="person-outline" size={36} color={theme.colors.white} />
          </View>
        </View>

        <Text style={styles.title}>Professional Identity</Text>
        <Text style={styles.subtitle}>
          Import your professional history to let our AI find your perfect matches.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>WHAT WE SYNC</Text>
          {ITEMS.map((item, idx) => (
            <AnimatedOption key={item} index={idx} style={styles.row}>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
              <Text style={styles.rowText}>{item}</Text>
            </AnimatedOption>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.connectButton, linkedIn.isLoading ? styles.buttonDisabled : null]}
          onPress={() => void handleLinkedInConnect()}
          disabled={linkedIn.isLoading}
        >
          <View style={styles.connectInner}>
            {linkedIn.isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Ionicons name="logo-linkedin" size={20} color={theme.colors.white} />
            )}
            <Text style={styles.connectText}>
              {linkedIn.isLoading
                ? '  Connecting...'
                : linkedInConnected
                  ? '  LinkedIn Connected'
                  : '  Connect LinkedIn'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.listeningButton}
          onPress={() => router.push('/ai-listening-engine')}
        >
          <Text style={styles.listeningText}>AI listening engine</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.listeningButton}
          onPress={() => router.replace('/(tabs)/personalize')}
        >
          <Text style={styles.listeningText}>Continue as Guest</Text>
        </TouchableOpacity>

        <Text style={styles.privacy}>Your data is encrypted and never sold.</Text>

        {linkedInConnected && linkedInProfile ? (
          <View style={[styles.statusCard, styles.successCard]}>
            <Text style={styles.statusTitle}>LinkedIn connected successfully</Text>
            <View style={styles.profileRow}>
              {linkedInProfile.picture ? (
                <Image source={{ uri: linkedInProfile.picture }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImage} />
              )}
              <View>
                <Text style={styles.profileLabel}>Name</Text>
                <Text style={styles.profileValue}>{linkedInProfile.name || 'Not available'}</Text>
              </View>
            </View>
            <Text style={styles.profileLabel}>Email</Text>
            <Text style={styles.profileValue}>{linkedInProfile.email || 'Not available'}</Text>
            <Text style={styles.profileLabel}>Headline</Text>
            <Text style={styles.profileValue}>{linkedInProfile.headline || 'Not available'}</Text>
            <Text style={styles.profileLabel}>
              Positions: {linkedInProfile.positionCount} | Education: {linkedInProfile.educationCount}
            </Text>
            <TouchableOpacity style={styles.continueButton} onPress={() => router.replace('/(tabs)/personalize')}>
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {connectError ? (
          <View style={[styles.statusCard, styles.errorCard]}>
            <Text style={styles.statusTitle}>LinkedIn connection failed</Text>
            <Text style={styles.errorText}>{connectError}</Text>
          </View>
        ) : null}

        {connectNotice ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>{connectNotice}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};
