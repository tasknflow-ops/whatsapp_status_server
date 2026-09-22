// Central place for paths, extensions and app-wide constants.

// SAF content-URI hints. When the user opens the folder picker we try to
// pre-navigate to these WhatsApp .Statuses locations. Modern WhatsApp
// (2021+) keeps statuses under Android/media; older builds used the root path.
export const WHATSAPP_PACKAGES = {
  WA: 'com.whatsapp',
  WA_BUSINESS: 'com.whatsapp.w4b',
};

// Candidate relative paths to the .Statuses folder, newest layout first.
// These are shown to the user as guidance and used to build initial-URI hints.
export const STATUS_PATHS = [
  'Android/media/com.whatsapp/WhatsApp/Media/.Statuses',
  'Android/media/com.whatsapp.w4b/WhatsApp Business/Media/.Statuses',
  'WhatsApp/Media/.Statuses', // legacy (pre-Android 11)
];

export const IMAGE_EXTS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'bmp',
  'heic',
  'heif',
  'dng',
];
export const VIDEO_EXTS = ['mp4', 'mkv', '3gp', 'mov', 'webm', 'ts', 'm4v'];

// Folder inside public storage where we copy saved statuses.
export const SAVED_FOLDER_NAME = 'StatusSaver';

// Key used to persist the granted SAF folder URI (via zustand + storage).
export const PERSISTED_URI_KEY = 'saf_statuses_uri';

export const MEDIA_TYPE = {
  IMAGE: 'image',
  VIDEO: 'video',
  UNKNOWN: 'unknown',
};

export function extFromName(name = '') {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
}

export function mediaTypeFromName(name = '', mime = '') {
  const cleanName = (name || '').toLowerCase().trim();
  if (cleanName === '.nomedia' || cleanName.endsWith('.nomedia')) {
    return MEDIA_TYPE.UNKNOWN;
  }

  if (mime && typeof mime === 'string') {
    const lowerMime = mime.toLowerCase();
    if (lowerMime.startsWith('image/')) return MEDIA_TYPE.IMAGE;
    if (lowerMime.startsWith('video/')) return MEDIA_TYPE.VIDEO;
  }

  const ext = extFromName(cleanName);
  if (VIDEO_EXTS.includes(ext)) return MEDIA_TYPE.VIDEO;
  if (IMAGE_EXTS.includes(ext)) return MEDIA_TYPE.IMAGE;

  // In WhatsApp .Statuses, any non-video file that isn't .nomedia is an image
  if (cleanName.length > 0 && cleanName !== '.nomedia') {
    return MEDIA_TYPE.IMAGE;
  }

  return MEDIA_TYPE.UNKNOWN;
}