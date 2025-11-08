import { Session } from "../../Types";

export function filterByRange(sessions: Session[], r: string) {
  const now = new Date();
  let start;

  switch (r) {
    case "1m":
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      break;
    case "6m":
      start = new Date(now);
      start.setMonth(now.getMonth() - 6);
      break;
    case "1y":
      start = new Date(now);
      start.setFullYear(now.getFullYear() - 1);
      break;
    case "5y":
      start = new Date(now);
      start.setFullYear(now.getFullYear() - 5);
      break;
    default:
      return sessions;
  }

  return sessions.filter((s) => new Date(s.userDay) >= start);
}
