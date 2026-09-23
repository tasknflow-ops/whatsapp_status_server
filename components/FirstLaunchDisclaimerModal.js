import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {colors, spacing, radius, typography, shadow} from '../utils/theme';

const {width} = Dimensions.get('window');

/**
 * First-time user disclaimer dialog for Statusly.
 *
 * Appears only on the first app launch after installation.
 * Users must check "I agree to the Terms & Privacy Policy" to enable the "Continue" button.
 * Once accepted, consent is persisted locally and the popup never shows again.
 */
export default function FirstLaunchDisclaimerModal({visible, onAccept}) {
  const [agreed, setAgreed] = useState(false);

  const handleContinue = () => {
    if (!agreed) return;
    onAccept();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.dialogCard}>
          {/* Top Brand Badge */}
          <View style={styles.badgeWrapper}>
            <View style={styles.badgeCircle}>
              <Text style={styles.badgeEmoji}>🛡️</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Welcome to Statusly</Text>

          {/* Disclaimer Message */}
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>
              Statusly is an independent status and media saving application. It is not affiliated with, sponsored, or endorsed by WhatsApp LLC or Meta Platforms, Inc.
            </Text>
            <Text style={[styles.messageText, styles.messageSpacer]}>
              Please save and share only content that you have permission to use.
            </Text>
          </View>

          {/* Consent Checkbox */}
          <TouchableOpacity
            style={[styles.consentRow, agreed && styles.consentRowActive]}
            activeOpacity={0.75}
            onPress={() => setAgreed(prev => !prev)}>
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={styles.consentLabel}>
              I agree to the Terms & Privacy Policy
            </Text>
          </TouchableOpacity>

          {/* Primary Action Button */}
          {agreed ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.btnTouchable}
              onPress={handleContinue}>
              <LinearGradient
                colors={colors.tealGradient || ['#00C4CC', '#008BA4', '#006E82']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.btnGradient}>
                <Text style={styles.btnTextActive}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={[styles.btnGradient, styles.btnDisabled]}>
              <Text style={styles.btnTextDisabled}>Continue</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 18, 22, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialogCard: {
    width: Math.min(width - 36, 380),
    backgroundColor: colors.surface,
    borderRadius: radius.xl || 26,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 139, 164, 0.12)',
    ...Platform.select({
      android: {elevation: 12},
      ios: {
        shadowColor: '#002C33',
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.25,
        shadowRadius: 22,
      },
    }),
  },
  badgeWrapper: {
    marginBottom: spacing.sm,
  },
  badgeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.tealSoft || '#E6F8F9',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 139, 164, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      android: {elevation: 3},
      ios: {
        shadowColor: '#008BA4',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
    }),
  },
  badgeEmoji: {
    fontSize: 28,
  },
  title: {
    ...typography.title,
    fontSize: 21,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  messageBox: {
    backgroundColor: '#F7FAFA',
    borderRadius: radius.md || 16,
    borderWidth: 1,
    borderColor: '#E6EEEE',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  messageText: {
    ...typography.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: '#435450',
    textAlign: 'left',
  },
  messageSpacer: {
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FCFC',
    borderWidth: 1.5,
    borderColor: '#E2ECEB',
    borderRadius: radius.md || 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.xl,
    width: '100%',
  },
  consentRowActive: {
    backgroundColor: '#F0FAFA',
    borderColor: colors.teal || '#008BA4',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#98ABA8',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm + 2,
  },
  checkboxChecked: {
    backgroundColor: colors.teal || '#008BA4',
    borderColor: colors.teal || '#008BA4',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 16,
  },
  consentLabel: {
    ...typography.body,
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  btnTouchable: {
    width: '100%',
  },
  btnGradient: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: radius.pill || 999,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      android: {elevation: 4},
      ios: {
        shadowColor: '#008BA4',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.28,
        shadowRadius: 10,
      },
    }),
  },
  btnDisabled: {
    backgroundColor: '#E4ECEB',
    borderWidth: 1,
    borderColor: '#D8E2E1',
    elevation: 0,
  },
  btnTextActive: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  btnTextDisabled: {
    color: '#9CAEAC',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
