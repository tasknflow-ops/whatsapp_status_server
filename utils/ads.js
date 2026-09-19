/**
 * AdMob ad unit IDs.
 *
 * SET __DEV_ADS__ = true  → Google's official test IDs (always serve a test ad,
 *                           safe to click, zero risk to your account).
 * SET __DEV_ADS__ = false → Your real production ad unit IDs.
 *
 * Switch to false and rebuild when your AdMob units are approved and live.
 */

const USE_TEST_IDS = true; // ← change to false when going live

// ── Google's permanent test ad unit IDs (Android) ────────────────────────────
const TEST_BANNER_ID  = 'ca-app-pub-3940256099942544/6300978111';
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

// ── Your real production ad unit IDs ─────────────────────────────────────────
const PROD_BANNER_ID  = 'ca-app-pub-9290713243324092/8450353502';
const PROD_REWARDED_ID = 'ca-app-pub-9290713243324092/4920328721';

export const ADMOB_APP_ID     = 'ca-app-pub-9290713243324092~2233174375';
export const BANNER_AD_UNIT_ID  = USE_TEST_IDS ? TEST_BANNER_ID  : PROD_BANNER_ID;
export const REWARDED_AD_UNIT_ID = USE_TEST_IDS ? TEST_REWARDED_ID : PROD_REWARDED_ID;
