export const isWindows = () => {
  if (typeof window === 'undefined') return false;
  return /Windows/.test(navigator.userAgent);
};

export const shouldDisableBackdropFilter = () => {
  return isWindows();
};
