export function getWaitingInfo(dateString: string) {
  const now = new Date().getTime();
  const created = new Date(dateString).getTime();

  const seconds = Math.floor((now - created) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // < 1 hour
  if (hours < 1) {
    return { label: `${minutes} min`, level: 0 };
  }

  // < 2 hours
  if (hours < 2) {
    return { label: `${hours} hr`, level: 1 };
  }

  // < 8 hours
  if (hours < 8) {
    return { label: `${hours} hrs`, level: 2 };
  }

  // < 24 hours
  if (hours < 24) {
    return { label: `${hours} hrs`, level: 3 };
  }

  // < 2 days
  if (days < 2) {
    return { label: `${days} day`, level: 4 };
  }

  // < 7 days
  if (days < 7) {
    return { label: `${days} days`, level: 5 };
  }

  // weeks
  const weeks = Math.floor(days / 7);
  return { label: `${weeks} week${weeks > 1 ? "s" : ""}`, level: 6 };
}