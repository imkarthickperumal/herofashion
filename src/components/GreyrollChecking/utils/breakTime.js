import { BREAK_TIMES } from "./breakConfig";

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const getActiveBreak = () => {
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  for (const b of BREAK_TIMES) {
    const start = toMinutes(b.start);
    const end = toMinutes(b.end);

    if (currentMin >= start && currentMin < end) {
      return { ...b, endMinutes: end };
    }
  }
  return null;
};

export const getRemainingSeconds = (breakInfo) => {
  if (!breakInfo) return 0;

  const now = new Date();
  const currentSeconds =
    now.getHours() * 3600 +
    now.getMinutes() * 60 +
    now.getSeconds();

  return Math.max(breakInfo.endMinutes * 60 - currentSeconds, 0);
};
