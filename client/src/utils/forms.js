export function tagsToArray(value) {
  return String(value || '').split(',').map((tag) => tag.trim()).filter(Boolean);
}

export function tagsToString(tags) {
  return Array.isArray(tags) ? tags.join(', ') : '';
}

export function formatDate(value) {
  if (!value) return 'Not dated';
  return new Date(value).toLocaleDateString();
}

