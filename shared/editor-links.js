export function validEditorLink(value) {
  if (
    typeof value !== "string" ||
    value.length > 2048 ||
    /[\s\u0000-\u001f\u007f\\]/u.test(value)
  )
    return false;
  if (/^mailto:[^@?]+@[^@?]+$/i.test(value)) return true;
  if (/^\/(?!\/)[A-Za-z0-9/_-]*(?:[?#][A-Za-z0-9_?&=%./-]+)?$/.test(value)) return true;
  if (!/^https?:\/\//i.test(value)) return false;
  try {
    const url = new URL(value);
    return Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}
