import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/providers/auth-provider";
import { docRef } from "../../src/services/firebase/firestore";
import { colors as COLORS } from "../../src/theme/tokens";

type ProfileData = {
  displayName?: string;
  linkedin?: {
    name?: string;
    headline?: string;
    picture?: string;
    email?: string;
    positionCount?: number;
    educationCount?: number;
  };
  primaryGoal?: string;
  conversationStyle?: string[];
  networkingGoal?: string;
  registeredEvents?: any[];
  createdAt?: any;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, resetPassword } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({});
  useEffect(() => {
    if (!user) return;
    docRef<ProfileData>(`users/${user.uid}`)
      .get()
      .then((snap) => {
        if (!snap.exists) return;
        setProfile(snap.data() ?? {});
      });
  }, [user]);

  const name =
    profile.linkedin?.name ||
    profile.displayName ||
    user?.email?.split("@")[0] ||
    "Your Name";

  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const headline = profile.linkedin?.headline ?? null;
  const picture = profile.linkedin?.picture ?? null;
  const linkedInConnected = !!profile.linkedin?.name;
  const registeredCount = profile.registeredEvents?.length ?? 0;
  const positionCount = profile.linkedin?.positionCount ?? 0;
  const educationCount = profile.linkedin?.educationCount ?? 0;
  const interests = profile.conversationStyle ?? [];
  const primaryGoal = profile.primaryGoal ?? null;
  const networkingGoal = profile.networkingGoal ?? null;

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut().then(() => router.replace("/")),
      },
    ]);
  };

  const handleChangePassword = () => {
    const email = user?.email;
    if (!email) return;
    resetPassword(email)
      .then(() =>
        Alert.alert(
          "Email Sent",
          `A password reset link has been sent to ${email}.`,
        ),
      )
      .catch((e: any) => Alert.alert("Error", e.message));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push("/personality-traits")}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ──────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          {picture ? (
            <Image source={{ uri: picture }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || "?"}</Text>
            </View>
          )}

          <Text style={styles.profileName}>{name}</Text>

          {headline ? (
            <Text style={styles.profileHeadline}>{headline}</Text>
          ) : null}

          <Text style={styles.profileEmail}>{user?.email ?? ""}</Text>

          {linkedInConnected ? (
            <View style={styles.linkedinBadge}>
              <Ionicons name="logo-linkedin" size={14} color="#0A66C2" />
              <Text style={styles.linkedinBadgeText}>LinkedIn Connected</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.linkedinConnect}
              onPress={() => router.push("/(tabs)/index")}
            >
              <Ionicons name="logo-linkedin" size={14} color={COLORS.mediumGray} />
              <Text style={styles.linkedinConnectText}>Connect LinkedIn</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Stats row ─────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{registeredCount}</Text>
            <Text style={styles.statLabel}>Registered</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{positionCount}</Text>
            <Text style={styles.statLabel}>Positions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{educationCount}</Text>
            <Text style={styles.statLabel}>Education</Text>
          </View>
        </View>

        {/* ── Professional Info ─────────────────────────────── */}
        {linkedInConnected ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PROFESSIONAL INFO</Text>
            <View style={styles.infoCard}>
              {headline ? (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconWrap}>
                    <Ionicons
                      name="briefcase-outline"
                      size={18}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Headline</Text>
                    <Text style={styles.infoValue}>{headline}</Text>
                  </View>
                </View>
              ) : null}

              {profile.linkedin?.email ? (
                <>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconWrap}>
                      <Ionicons
                        name="mail-outline"
                        size={18}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.infoText}>
                      <Text style={styles.infoLabel}>LinkedIn Email</Text>
                      <Text style={styles.infoValue}>{profile.linkedin.email}</Text>
                    </View>
                  </View>
                </>
              ) : null}

              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Ionicons
                    name="layers-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Experience & Education</Text>
                  <Text style={styles.infoValue}>
                    {positionCount} position{positionCount !== 1 ? "s" : ""} ·{" "}
                    {educationCount} education entr{educationCount !== 1 ? "ies" : "y"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* ── Networking Preferences ────────────────────────── */}
        {(primaryGoal || networkingGoal || interests.length > 0) ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NETWORKING PREFERENCES</Text>
            <View style={styles.infoCard}>
              {primaryGoal ? (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconWrap}>
                    <Ionicons
                      name="flag-outline"
                      size={18}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Primary Goal</Text>
                    <Text style={styles.infoValue}>{primaryGoal}</Text>
                  </View>
                </View>
              ) : null}

              {networkingGoal ? (
                <>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconWrap}>
                      <Ionicons
                        name="people-outline"
                        size={18}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.infoText}>
                      <Text style={styles.infoLabel}>Networking Style</Text>
                      <Text style={styles.infoValue}>{networkingGoal}</Text>
                    </View>
                  </View>
                </>
              ) : null}

              {interests.length > 0 ? (
                <>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconWrap}>
                      <Ionicons
                        name="heart-outline"
                        size={18}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={[styles.infoText, { gap: 0 }]}>
                      <Text style={styles.infoLabel}>Interests</Text>
                      <View style={styles.chipsWrap}>
                        {interests.map((interest) => (
                          <View key={interest} style={styles.chip}>
                            <Text style={styles.chipText}>{interest}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* ── Account Settings ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.8}
              onPress={() => router.push("/personality-traits")}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name="create-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuLabel}>Edit Onboarding Answers</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.mediumGray} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.8}
              onPress={handleChangePassword}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.menuLabel}>Change Password</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.mediumGray} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/index")}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons
                  name="logo-linkedin"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.menuLabel}>
                {linkedInConnected ? "Reconnect LinkedIn" : "Connect LinkedIn"}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.mediumGray} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Sign Out ──────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.signOutBtn}
          activeOpacity={0.8}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>SilentPartner · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: COLORS.black },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F8F3",
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  // ── Hero
  heroSection: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  avatarImg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.borderColor,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: { fontSize: 30, fontWeight: "700", color: COLORS.white },
  profileName: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 4,
    textAlign: "center",
  },
  profileHeadline: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.mediumGray,
    marginBottom: 12,
  },
  linkedinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EBF4FF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#C5DCFB",
  },
  linkedinBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0A66C2",
  },
  linkedinConnect: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.gray,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  linkedinConnectText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.mediumGray,
  },

  // ── Stats
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.gray,
    marginBottom: 28,
    overflow: "hidden",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 18,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.mediumGray,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.borderColor,
    marginVertical: 14,
  },

  // ── Section
  section: { marginHorizontal: 20, marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.mediumGray,
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  // ── Info card
  infoCard: {
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E8F8F3",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  infoText: { flex: 1, gap: 3 },
  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.mediumGray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.borderColor,
    marginLeft: 64,
  },

  // ── Chips
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  chip: {
    backgroundColor: "#E8F8F3",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#C0E8DC",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.primary,
  },

  // ── Menu card
  menuCard: {
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E8F8F3",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500", color: COLORS.black },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.borderColor,
    marginLeft: 64,
  },

  // ── Sign out
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FDD",
    backgroundColor: "#FFF5F5",
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.error,
  },

  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.mediumGray,
    marginBottom: 8,
  },
});
