import type { Badge } from "../types";
import { BadgeGlyph } from "./badge-glyph";

export function BadgeCard({
  badge,
  lockedStyle = false,
}: {
  badge: Badge;
  lockedStyle?: boolean;
}) {
  const statusLabel = badge.unlocked ? "已解锁" : badge.progress ? "养成中" : "未解锁";
  const baseClass = lockedStyle
    ? "border border-dashed border-[#d8ddd0] bg-[linear-gradient(180deg,#fafaf6_0%,#f4f5ef_100%)]"
    : "border border-[#dde7d5] bg-[linear-gradient(180deg,#fffef9_0%,#f7fbf2_100%)]";

  return (
    <article
      className={`group rounded-[20px] p-2 shadow-[0_10px_24px_rgba(86,104,66,0.07)] transition-transform duration-200 hover:-translate-y-0.5 ${baseClass}`}
    >
      <div className="flex items-start justify-between gap-1.5">
        <p className="min-w-0 rounded-full bg-white/80 px-1.5 py-1 text-[8px] font-semibold tracking-[0.08em] text-[#708066]">
          {badge.mood}
        </p>
        <div className="shrink-0 rounded-full bg-[#edf3e4] px-1.5 py-1 text-[8px] font-semibold text-[#68805b]">
          {statusLabel}
        </div>
      </div>

      <div className="mt-2 flex flex-col items-center text-center">
        <div className="flex h-[62px] w-[62px] items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#eef6e5_0%,#e5f0d9_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
          <BadgeGlyph icon={badge.icon} unlocked={badge.unlocked} />
        </div>

        <h3 className="mt-2 line-clamp-2 min-h-[2rem] font-serif text-[13px] leading-4 text-[#294033]">
          {badge.name}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-[1.75rem] text-[9px] leading-4 text-[#5a6c55]">
          {badge.title}
        </p>

        {badge.progress ? (
          <div className="mt-2 w-full rounded-[12px] bg-white/80 p-1.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
            <div className="h-1 w-full rounded-full bg-[#e4eadb]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#87b26f_0%,#e3d77d_100%)]"
                style={{ width: getProgressWidth(badge.progress) }}
              />
            </div>
            <p className="mt-1 text-[8px] font-semibold text-[#6b7b61]">{badge.progress}</p>
          </div>
        ) : (
          <div className="mt-2 rounded-full bg-[#edf3e4] px-2 py-1 text-[8px] font-semibold text-[#6b7b61]">
            收藏徽章
          </div>
        )}
      </div>
    </article>
  );
}

function getProgressWidth(progress: string) {
  const matched = progress.match(/(\d+)\s*\/\s*(\d+)/);

  if (!matched) {
    return "36%";
  }

  const current = Number(matched[1]);
  const total = Number(matched[2]);

  if (!total) {
    return "36%";
  }

  const percent = Math.max(8, Math.min(100, Math.round((current / total) * 100)));
  return `${percent}%`;
}
