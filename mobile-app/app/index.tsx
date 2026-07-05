import { router } from "expo-router";
import {
  useEvent,
  useEventListener,
} from "expo";
import {
  useVideoPlayer,
  VideoView,
} from "expo-video";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function IndexScreen() {
  const [showIntro, setShowIntro] = useState(true);
  const [videoReady, setVideoReady] = useState(false);

  // Intro text animation
  const introTextOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const introTextTranslateY = useRef(
    new Animated.Value(25)
  ).current;

  // Whole video screen fade animation
  const videoScreenOpacity = useRef(
    new Animated.Value(1)
  ).current;

  // Main screen animations
  const mainScreenOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const mainContentTranslateY = useRef(
    new Animated.Value(30)
  ).current;

  const player = useVideoPlayer(
    require("../assets/videos/kindred-intro.mp4"),
    (videoPlayer) => {
      videoPlayer.loop = false;
      videoPlayer.muted = true;
      videoPlayer.play();
    }
  );

  // Listen for video playing state
  const { isPlaying } = useEvent(
    player,
    "playingChange",
    {
      isPlaying: player.playing,
    }
  );

  // Listen for video completion
  useEventListener(
    player,
    "playToEnd",
    () => {
      finishIntro();
    }
  );

  useEffect(() => {
    // Small delay before showing title
    const animationTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(introTextOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),

        Animated.timing(
          introTextTranslateY,
          {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }
        ),
      ]).start();
    }, 500);

    // Safety fallback:
    // If video completion event fails,
    // intro will still close.
    const fallbackTimer = setTimeout(() => {
      finishIntro();
    }, 7000);

    return () => {
      clearTimeout(animationTimer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      setVideoReady(true);
    }
  }, [isPlaying]);

  function finishIntro() {
    Animated.timing(videoScreenOpacity, {
      toValue: 0,
      duration: 650,
      useNativeDriver: true,
    }).start(() => {
      setShowIntro(false);

      Animated.parallel([
        Animated.timing(mainScreenOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),

        Animated.timing(
          mainContentTranslateY,
          {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }
        ),
      ]).start();
    });
  }

  function handleSkip() {
    try {
      player.pause();
    } catch (error) {
      console.log(
        "VIDEO PAUSE ERROR:",
        error
      );
    }

    finishIntro();
  }

  // -----------------------------
  // VIDEO INTRO SCREEN
  // -----------------------------
  if (showIntro) {
    return (
      <Animated.View
        style={[
          styles.introContainer,
          {
            opacity: videoScreenOpacity,
          },
        ]}
      >
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />

        {/* Full-screen Hailuo video */}
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />

        {/* Warm cinematic overlay */}
        <View
          pointerEvents="none"
          style={styles.warmOverlay}
        />

        {/* Dark bottom gradient-like overlay */}
        <View
          pointerEvents="none"
          style={styles.bottomOverlay}
        />

        {/* Soft top overlay */}
        <View
          pointerEvents="none"
          style={styles.topOverlay}
        />

        {/* Skip button */}
        <SafeAreaView style={styles.skipArea}>
          <View style={styles.skipRow}>
            <View />

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.8}
            >
              <Text style={styles.skipText}>
                Skip
              </Text>

              <Text style={styles.skipArrow}>
                ›
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Intro branding */}
        <Animated.View
          style={[
            styles.introContent,
            {
              opacity: introTextOpacity,
              transform: [
                {
                  translateY:
                    introTextTranslateY,
                },
              ],
            },
          ]}
        >
          {/* Small brand mark */}
          <View style={styles.brandPill}>
            <View style={styles.brandDot} />

            <Text style={styles.brandPillText}>
              KINDREDYEARS
            </Text>
          </View>

          <Text style={styles.introTitle}>
            Welcome to{"\n"}
            <Text style={styles.introBrand}>
              KindredYears
            </Text>
          </Text>

          <Text style={styles.introSubtitle}>
            Care that feels like family.
          </Text>

          <View style={styles.decorativeLine}>
            <View
              style={styles.decorativeLineActive}
            />
          </View>
        </Animated.View>

        {/* Loading indicator before playback */}
        {!videoReady && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingDot} />
            <Text style={styles.loadingText}>
              Preparing your experience...
            </Text>
          </View>
        )}
      </Animated.View>
    );
  }

  // -----------------------------
  // MAIN WELCOME SCREEN
  // -----------------------------
  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F7FF"
      />

      {/* Decorative background shapes */}
      <View
        pointerEvents="none"
        style={styles.backgroundCircleOne}
      />

      <View
        pointerEvents="none"
        style={styles.backgroundCircleTwo}
      />

      <Animated.View
        style={[
          styles.mainContent,
          {
            opacity: mainScreenOpacity,
            transform: [
              {
                translateY:
                  mainContentTranslateY,
              },
            ],
          },
        ]}
      >
        {/* Logo mark */}
        <View style={styles.logoContainer}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Text style={styles.logoHeart}>
                ♥
              </Text>
            </View>
          </View>
        </View>

        {/* Welcome content */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeSmall}>
            WELCOME TO
          </Text>

          <Text style={styles.mainTitle}>
            KindredYears
          </Text>

          <Text style={styles.mainSubtitle}>
            Care that feels like family.
          </Text>

          <Text style={styles.description}>
            Connecting elderly individuals,
            families, caregivers, and doctors
            through compassionate care.
          </Text>
        </View>

        {/* Feature pills */}
        <View style={styles.featureRow}>
          <View style={styles.featurePill}>
            <Text style={styles.featureIcon}>
              ♡
            </Text>
            <Text style={styles.featureText}>
              Trusted Care
            </Text>
          </View>

          <View style={styles.featurePill}>
            <Text style={styles.featureIcon}>
              ✦
            </Text>
            <Text style={styles.featureText}>
              Always Connected
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.push("/sign-in" as any)
            }
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              Sign In
            </Text>

            <View style={styles.arrowCircle}>
              <Text style={styles.arrowText}>
                →
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              router.push("/sign-up" as any)
            }
            activeOpacity={0.85}
          >
            <Text
              style={styles.secondaryButtonText}
            >
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          Compassion • Connection • Dignity
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // =================================
  // INTRO VIDEO
  // =================================

  introContainer: {
    flex: 1,
    backgroundColor: "#15111F",
  },

  video: {
    position: "absolute",
    width,
    height,
    top: 0,
    left: 0,
  },

  warmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "rgba(255, 184, 92, 0.08)",
  },

  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor:
      "rgba(20, 14, 30, 0.18)",
  },

  bottomOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
    backgroundColor:
      "rgba(20, 14, 30, 0.58)",
  },

  skipArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },

  skipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop:
      Platform.OS === "android" ? 38 : 8,
  },

  skipButton: {
    minWidth: 78,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor:
      "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor:
      "rgba(255, 255, 255, 0.30)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  skipText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  skipArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    marginLeft: 5,
    marginTop: -1,
  },

  introContent: {
    position: "absolute",
    left: 26,
    right: 26,
    bottom: 72,
  },

  brandPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(255, 255, 255, 0.16)",
    borderWidth: 1,
    borderColor:
      "rgba(255, 255, 255, 0.24)",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 18,
  },

  brandDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FFD49A",
    marginRight: 8,
  },

  brandPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
  },

  introTitle: {
    color: "#FFFFFF",
    fontSize: 38,
    lineHeight: 45,
    fontWeight: "500",
    letterSpacing: -0.8,
  },

  introBrand: {
    fontWeight: "900",
    color: "#FFF2D9",
  },

  introSubtitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "500",
    marginTop: 14,
  },

  decorativeLine: {
    width: 95,
    height: 3,
    borderRadius: 2,
    backgroundColor:
      "rgba(255,255,255,0.25)",
    marginTop: 24,
    overflow: "hidden",
  },

  decorativeLineActive: {
    width: 55,
    height: "100%",
    borderRadius: 2,
    backgroundColor: "#FFD49A",
  },

  loadingContainer: {
    position: "absolute",
    alignSelf: "center",
    top: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(20, 14, 30, 0.45)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },

  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD49A",
    marginRight: 9,
  },

  loadingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  // =================================
  // MAIN SCREEN
  // =================================

  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F7FF",
    overflow: "hidden",
  },

  backgroundCircleOne: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#EEEAFE",
    top: -100,
    right: -110,
  },

  backgroundCircleTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#FFF0E8",
    bottom: -100,
    left: -100,
  },

  mainContent: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 40,
    paddingBottom: 24,
  },

  logoContainer: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 32,
  },

  logoOuter: {
    width: 92,
    height: 92,
    borderRadius: 30,
    backgroundColor: "#EAE7FF",
    alignItems: "center",
    justifyContent: "center",
    transform: [
      {
        rotate: "8deg",
      },
    ],
  },

  logoInner: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: "#4A3FB5",
    alignItems: "center",
    justifyContent: "center",
    transform: [
      {
        rotate: "-8deg",
      },
    ],
  },

  logoHeart: {
    color: "#FFFFFF",
    fontSize: 34,
  },

  welcomeSection: {
    alignItems: "center",
  },

  welcomeSmall: {
    color: "#8B84A6",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2.5,
    marginBottom: 10,
  },

  mainTitle: {
    color: "#1E1E2F",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1.2,
    textAlign: "center",
  },

  mainSubtitle: {
    color: "#4A3FB5",
    fontSize: 19,
    fontWeight: "700",
    marginTop: 9,
    textAlign: "center",
  },

  description: {
    maxWidth: 330,
    color: "#777586",
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 15,
  },

  featureRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 26,
  },

  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E7E3F2",
  },

  featureIcon: {
    color: "#4A3FB5",
    fontSize: 15,
    marginRight: 6,
    fontWeight: "800",
  },

  featureText: {
    color: "#4F4C60",
    fontSize: 12,
    fontWeight: "700",
  },

  buttonSection: {
    marginTop: "auto",
  },

  primaryButton: {
    height: 60,
    borderRadius: 18,
    backgroundColor: "#4A3FB5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  arrowCircle: {
    position: "absolute",
    right: 8,
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor:
      "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  arrowText: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "700",
  },

  secondaryButton: {
    height: 58,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#DCD7EE",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  secondaryButtonText: {
    color: "#4A3FB5",
    fontSize: 16,
    fontWeight: "800",
  },

  footerText: {
    color: "#9894A7",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.7,
    textAlign: "center",
    marginTop: 20,
  },
});