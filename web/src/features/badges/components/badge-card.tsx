import type { Badge } from "../types";
import { BadgeGlyph } from "./badge-glyph";

export function BadgeCard({
  badge,
  lockedStyle = false,
}: {
  badge: Badge;
  lockedStyle?: boolean;
}) {
  const baseClass = lockedStyle
    ? "border border-dashed border-[#d7ddce] bg-[#f7f7f2]"
    : "border border-[#e4eadb] bg-[#fffdf8]";

  return (
    <article
      className={`rounded-[24px] p-4 shadow-[0_10px_30px_rgba(107,112,92,0.06)] ${baseClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-[#7a856d]">{badge.mood}</p>
          <h3 className="mt-1 text-lg font-semibold text-[#425641]">{badge.name}</h3>
        </div>
        <div className="rounded-full bg-[#edf3e4] px-3 py-1 text-[11px] font-medium text-[#68805b]">
          {badge.unlocked ? "已解锁" : "未解锁"}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#eef4e6]">
          <BadgeGlyph icon={badge.icon} unlocked={badge.unlocked} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#53684c]">{badge.title}</p>
          <p className="mt-2 text-xs leading-5 text-[#6d7a64]">{badge.description}</p>
          {badge.progress ? (
            <div className="mt-3 rounded-full bg-[#e8eedf] px-3 py-1 text-[11px] font-medium text-[#67795e]">
              {badge.progress}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
