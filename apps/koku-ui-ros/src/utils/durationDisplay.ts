export const formatDurationLabel = (durationInHours: number | null | undefined): string => {
  if (durationInHours == null) {
    return 'Unknown';
  }
  const days = durationInHours / 24;
  if (Number.isInteger(days) && days >= 1) {
    return days === 1 ? '1 day' : `${days} days`;
  }
  return `${durationInHours} hours`;
};
