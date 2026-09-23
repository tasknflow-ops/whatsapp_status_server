import React, {useRef, useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing, radius, shadow} from '../../utils/theme';

const {width: SCREEN_W, height: SCREEN_H} = Dimensions.get('window');
const AUTO_ADVANCE_MS = 5000;

// ─── Illustrations ────────────────────────────────────────────────────────────

function IllustrationViewStatus() {
  return (
    <View style={ill.root}>
      {/* Phone frame */}
      <View style={ill.phone}>
        {/* Status bar */}
        <View style={ill.phonebar}>
          <View style={[ill.dot, {backgroundColor: '#00C4CC'}]} />
          <View style={[ill.dot, {backgroundColor: '#008BA4', marginHorizontal: 4}]} />
          <View style={[ill.dot, {backgroundColor: '#006E82'}]} />
        </View>
        {/* Status circles row */}
        <View style={ill.statusRow}>
          {['#FF6B6B', '#FFD93D', '#6BCB77', '#00C4CC', '#4D96FF'].map((c, i) => (
            <View key={i} style={[ill.statusRing, {borderColor: c}]}>
              <View style={[ill.statusAvatar, {backgroundColor: c + '40'}]}>
                <Text style={{fontSize: 14}}>{['😊','🌸','🎉','🌈','🎵'][i]}</Text>
              </View>
            </View>
          ))}
        </View>
        {/* Video progress strip */}
        <View style={ill.videoStrip}>
          <View style={ill.videoIcon}>
            <Text style={{color: '#fff', fontSize: 18}}>▶</Text>
          </View>
          <View style={{flex: 1, marginLeft: 10}}>
            <View style={ill.progressBg}>
              <View style={[ill.progressFill, {width: '72%'}]} />
            </View>
            <Text style={ill.videoLabel}>Status video • 0:12</Text>
          </View>
        </View>
        {/* Caption */}
        <View style={ill.captionPill}>
          <Text style={ill.captionText}>👁  Viewed • Ready to save</Text>
        </View>
      </View>
    </View>
  );
}

function IllustrationOpenApp() {
  return (
    <View style={ill.root}>
      <View style={[ill.phone, {paddingTop: 8}]}>
        {/* Tab bar mock */}
        <View style={ill.tabBar}>
          {[{label: 'Images', emoji: '🖼️', active: true}, {label: 'Videos', emoji: '🎬', active: false}, {label: 'Gallery', emoji: '💾', active: false}].map((t, i) => (
            <View key={i} style={[ill.tab, t.active && ill.tabActive]}>
              <Text style={{fontSize: 16}}>{t.emoji}</Text>
              <Text style={[ill.tabLabel, t.active && ill.tabLabelActive]}>{t.label}</Text>
            </View>
          ))}
        </View>
        {/* Media grid */}
        <View style={ill.grid}>
          {['🌅', '🎬', '🌸', '🎵', '🏖️', '🎉'].map((em, i) => (
            <View key={i} style={[ill.cell, {backgroundColor: ['#E6F8F9','#EAF4FF','#FFF4E6','#F4E6FF','#E6FFE9','#FFE6E6'][i]}]}>
              <Text style={{fontSize: 22}}>{em}</Text>
              {i === 1 && <View style={ill.videoOverlay}><Text style={{color:'#fff',fontSize:10}}>▶</Text></View>}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function IllustrationDownload() {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {toValue: -10, duration: 600, useNativeDriver: true}),
        Animated.timing(bounce, {toValue: 0, duration: 600, useNativeDriver: true}),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [bounce]);

  return (
    <View style={ill.root}>
      <View style={[ill.phone, {alignItems: 'center', justifyContent: 'center', paddingVertical: 16}]}>
        {/* Media preview */}
        <View style={ill.previewCard}>
          <LinearGradient colors={['#00C4CC', '#008BA4']} style={ill.previewGrad}>
            <Text style={{fontSize: 40}}>🌅</Text>
          </LinearGradient>
        </View>
        {/* Animated download arrow */}
        <Animated.View style={[ill.downloadCircle, {transform: [{translateY: bounce}]}]}>
          <Text style={{color: '#fff', fontSize: 26}}>↓</Text>
        </Animated.View>
        {/* Save button */}
        <LinearGradient
          colors={['#00C4CC', '#006E82']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={ill.saveBtn}>
          <Text style={ill.saveBtnText}>💾  Save to Gallery</Text>
        </LinearGradient>
        {/* Saved tick */}
        <View style={ill.savedPill}>
          <Text style={ill.savedText}>✅ Saved to gallery!</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Slide data ───────────────────────────────────────────────────────────────

const SLIDES = [
  {
    key: 'view',
    gradStart: '#00C4CC',
    gradEnd: '#008BA4',
    icon: '👁',
    title: 'View Status First',
    description:
      'Open your messaging app and view the status you want to save.\n\nFor video statuses, make sure you watch the complete video so it becomes available in Statusly.',
    step: '1',
    btnLabel: 'Next',
    Illustration: IllustrationViewStatus,
  },
  {
    key: 'open',
    gradStart: '#008BA4',
    gradEnd: '#006E82',
    icon: '📲',
    title: 'Open Statusly',
    description:
      'Open Statusly and find all viewed status images and videos ready to save, neatly organized in one place.',
    step: '2',
    btnLabel: 'Next',
    Illustration: IllustrationOpenApp,
  },
  {
    key: 'save',
    gradStart: '#006E82',
    gradEnd: '#004F5F',
    icon: '💾',
    title: 'Download & Save',
    description:
      'Tap the Save button to download images and videos directly to your gallery — anytime, with one tap.',
    step: '3',
    btnLabel: 'Get Started',
    Illustration: IllustrationDownload,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingScreen({onFinish}) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInteracting, setUserInteracting] = useState(false);
  const timerRef = useRef(null);
  const dotAnims = useRef(SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;

  const goToSlide = useCallback(
    index => {
      if (index >= SLIDES.length) {
        onFinish();
        return;
      }
      scrollRef.current?.scrollTo({x: index * SCREEN_W, animated: true});
      setCurrentIndex(index);
      // Animate dots
      dotAnims.forEach((anim, i) => {
        Animated.spring(anim, {
          toValue: i === index ? 1 : 0,
          useNativeDriver: false,
          tension: 120,
          friction: 8,
        }).start();
      });
    },
    [dotAnims, onFinish],
  );

  // Auto-advance timer
  const startTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrentIndex(prev => {
        if (prev < SLIDES.length - 1) {
          goToSlide(prev + 1);
        }
        return prev;
      });
    }, AUTO_ADVANCE_MS);
  }, [goToSlide]);

  useEffect(() => {
    if (!userInteracting) {
      startTimer();
    }
    return () => clearTimeout(timerRef.current);
  }, [currentIndex, userInteracting, startTimer]);

  const handleScrollEnd = e => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (idx !== currentIndex) {
      setCurrentIndex(idx);
      dotAnims.forEach((anim, i) => {
        Animated.spring(anim, {
          toValue: i === idx ? 1 : 0,
          useNativeDriver: false,
          tension: 120,
          friction: 8,
        }).start();
      });
    }
    setUserInteracting(false);
    startTimer();
  };

  const slide = SLIDES[currentIndex];

  return (
    <View style={[styles.root, {paddingBottom: insets.bottom}]}>
      {/* Skip button */}
      <View style={[styles.skipRow, {paddingTop: insets.top + spacing.sm}]}>
        <View />
        <TouchableOpacity onPress={onFinish} hitSlop={{top: 12, right: 12, bottom: 12, left: 12}}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          setUserInteracting(true);
          clearTimeout(timerRef.current);
        }}
        onMomentumScrollEnd={handleScrollEnd}
        style={{flex: 1}}>
        {SLIDES.map(s => (
          <SlideView key={s.key} slide={s} />
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        {/* Page dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const w = dotAnims[i].interpolate({
              inputRange: [0, 1],
              outputRange: [8, 24],
            });
            const bg = dotAnims[i].interpolate({
              inputRange: [0, 1],
              outputRange: ['#C8E8EC', colors.teal],
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, {width: w, backgroundColor: bg}]}
              />
            );
          })}
        </View>

        {/* Step counter + Next/Get Started button */}
        <View style={styles.btnRow}>
          <Text style={styles.stepText}>Step {slide.step} of {SLIDES.length}</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              clearTimeout(timerRef.current);
              setUserInteracting(false);
              if (currentIndex < SLIDES.length - 1) {
                goToSlide(currentIndex + 1);
              } else {
                onFinish();
              }
            }}>
            <LinearGradient
              colors={['#00C4CC', '#006E82']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.nextBtn}>
              <Text style={styles.nextBtnText}>{slide.btnLabel}</Text>
              <Text style={styles.nextBtnArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Single Slide ─────────────────────────────────────────────────────────────

function SlideView({slide}) {
  const {Illustration} = slide;
  return (
    <View style={styles.slide}>
      {/* Gradient header arc */}
      <LinearGradient
        colors={[slide.gradStart, slide.gradEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.slideHeader}>
        {/* Icon badge */}
        <View style={styles.iconBadge}>
          <Text style={styles.iconBadgeText}>{slide.icon}</Text>
        </View>
      </LinearGradient>

      {/* Illustration card */}
      <View style={styles.illustrationCard}>
        <Illustration />
      </View>

      {/* Title + description */}
      <View style={styles.textBlock}>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideDesc}>{slide.description}</Text>
      </View>
    </View>
  );
}

// ─── Illustration styles ──────────────────────────────────────────────────────

const ill = StyleSheet.create({
  root: {width: '100%', alignItems: 'center', paddingVertical: 8},
  phone: {
    width: 230,
    backgroundColor: '#FAFCFD',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D0E8EC',
    overflow: 'hidden',
    paddingBottom: 10,
    elevation: 4,
    shadowColor: '#008BA4',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  phonebar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E6F8F9',
  },
  dot: {width: 8, height: 8, borderRadius: 4},
  // Screen 1
  statusRow: {flexDirection: 'row', justifyContent: 'center', paddingTop: 10, paddingHorizontal: 8, gap: 6},
  statusRing: {width: 38, height: 38, borderRadius: 19, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center'},
  statusAvatar: {width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center'},
  videoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 12,
    backgroundColor: '#E6F8F9',
    borderRadius: 12,
    padding: 8,
  },
  videoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#008BA4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBg: {height: 5, backgroundColor: '#C8E8EC', borderRadius: 3, overflow: 'hidden'},
  progressFill: {height: 5, backgroundColor: '#00C4CC', borderRadius: 3},
  videoLabel: {fontSize: 10, color: '#4A7A84', marginTop: 4},
  captionPill: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: '#008BA4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
  },
  captionText: {color: '#fff', fontSize: 10, fontWeight: '700'},
  // Screen 2
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0EEF0',
    paddingHorizontal: 4,
  },
  tab: {flex: 1, alignItems: 'center', paddingVertical: 8, gap: 2},
  tabActive: {borderBottomWidth: 2.5, borderBottomColor: '#008BA4'},
  tabLabel: {fontSize: 9, color: '#9CAEAC', fontWeight: '600'},
  tabLabelActive: {color: '#008BA4'},
  grid: {flexDirection: 'row', flexWrap: 'wrap', padding: 6, gap: 5},
  cell: {
    width: (230 - 12 - 10) / 3,
    height: (230 - 12 - 10) / 3,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Screen 3
  previewCard: {
    width: 140,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    elevation: 4,
  },
  previewGrad: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  downloadCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#008BA4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
  },
  saveBtn: {
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  saveBtnText: {color: '#fff', fontWeight: '800', fontSize: 13},
  savedPill: {
    backgroundColor: '#E6FFE6',
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#B2EEB2',
  },
  savedText: {color: '#2D8C2D', fontWeight: '700', fontSize: 11},
});

// ─── Main styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4FBFC',
  },
  skipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  skipText: {
    color: colors.teal,
    fontWeight: '700',
    fontSize: 15,
  },
  slide: {
    width: SCREEN_W,
    flex: 1,
    alignItems: 'center',
  },
  slideHeader: {
    width: SCREEN_W,
    height: SCREEN_H * 0.12,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 44,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -36,
    ...Platform.select({
      android: {elevation: 6},
      ios: {shadowColor: '#006E82', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 10},
    }),
    backgroundColor: '#fff',
  },
  iconBadgeText: {fontSize: 34},
  illustrationCard: {
    marginTop: 50,
    width: SCREEN_W - 48,
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    ...shadow.card,
    borderWidth: 1,
    borderColor: '#E0EEF0',
  },
  textBlock: {
    width: SCREEN_W - 48,
    marginTop: 20,
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.tealDark,
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: spacing.sm,
  },
  slideDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: '#F4FBFC',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textFaint,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: radius.pill,
    gap: 6,
    ...Platform.select({
      android: {elevation: 5},
      ios: {shadowColor: '#008BA4', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.28, shadowRadius: 10},
    }),
  },
  nextBtnText: {color: '#fff', fontWeight: '800', fontSize: 15},
  nextBtnArrow: {color: '#fff', fontSize: 18, fontWeight: '800'},
});
