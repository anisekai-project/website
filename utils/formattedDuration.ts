
export default (time: number): string => {
  const seconds = Math.floor(time); // Drop decimals fast
  const h = (seconds / 3600) | 0;
  const m = ((seconds % 3600) / 60) | 0;
  const s = seconds % 60;

  const pad = (n: number) => (n < 10 ? '0' : '') + n;

  if (h > 0) {
    return h + ':' + pad(m) + ':' + pad(s);
  }
  return pad(m) + ':' + pad(s);
}
