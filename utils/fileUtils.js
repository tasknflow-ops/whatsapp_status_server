import { MEDIA_TYPE, mediaTypeFromName } from './constants';

// Normalises a raw SAF file entry into the shape the UI expects.
// react-native-saf-x listFiles returns objects like:
// { name, uri, type: 'file'|'directory', lastModified, size, mime }
export function normaliseEntry(entry) {
  return {
    name: entry.name,
    uri: entry.uri,
    size: entry.size ?? 0,
    lastModified: entry.lastModified ?? 0,
    mime: entry.mime ?? '',
    mediaType: mediaTypeFromName(entry.name),
    isDir: entry.type === 'directory',
  };
}

// Keep only real media files, drop the ".nomedia" marker and directories.
export function onlyMedia(entries) {
  return entries
    .map(normaliseEntry)
    .filter(e => !e.isDir && e.mediaType !== MEDIA_TYPE.UNKNOWN);
}

// Newest first.
export function sortByNewest(items) {
  return [...items].sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
}

// WhatsApp can duplicate the same status across WA + WA Business, or across
// re-scans. Dedupe by name + size, which is stable for identical media.
export function dedupe(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = `${it.name}::${it.size}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

export function splitByType(items) {
  const images = [];
  const videos = [];
  for (const it of items) {
    if (it.mediaType === MEDIA_TYPE.IMAGE) images.push(it);
    else if (it.mediaType === MEDIA_TYPE.VIDEO) videos.push(it);
  }
  return { images, videos };
}

// Full pipeline used by the listing hook.
export function processStatusEntries(rawEntries) {
  const media = onlyMedia(rawEntries);
  const unique = dedupe(media);
  const sorted = sortByNewest(unique);
  return { all: sorted, ...splitByType(sorted) };
}