interface NoWidowTextProps {
  text: string;
  lockWords?: number;
}

export function NoWidowText({ text, lockWords = 2 }: NoWidowTextProps) {
  const words = text.trim().split(/\s+/).filter(Boolean);

  if (!words.length) {
    return null;
  }

  const lockedWords = words.splice(Math.max(0, words.length - lockWords));
  const prefix = words.join(" ");

  return (
    <>
      {prefix ? `${prefix} ` : null}
      <span className="no-widow-lock">{lockedWords.join("\u00a0")}</span>
    </>
  );
}

interface NoWidowAccentProps {
  text: string;
  accent: string;
  lockWords?: number;
}

export function NoWidowAccent({ text, accent, lockWords = 1 }: NoWidowAccentProps) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lockedWords = words.splice(Math.max(0, words.length - lockWords));
  const prefix = words.join(" ");

  return (
    <>
      {prefix ? `${prefix} ` : null}
      <span className="no-widow-lock">
        {lockedWords.join("\u00a0")}&nbsp;<em>{accent}</em>
      </span>
    </>
  );
}
