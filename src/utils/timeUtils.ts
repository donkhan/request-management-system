export function timeAgo(dateString: string) {
  const now = new Date().getTime();
  const created = new Date(dateString).getTime();

  const seconds = Math.floor((now - created) / 1000);

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hrs ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  return `${weeks} weeks ago`;
}