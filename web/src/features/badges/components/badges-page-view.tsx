import { inProgressBadges, lockedBadges, unlockedBadges } from "../data/badges";
import { BadgeCard } from "./badge-card";

export function BadgesPageView() {
  return (
    <main className="min-h-screen px-4 py-6 text-slate-800">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-[32px] border border-[#d8e2cf] bg-[#fbfaf5] p-4 shadow-[0_20px_60px_rgba(86,104,66,0.12)]">
        <section className="rounded-[28px] bg-[linear-gradient(180deg,#f6fbf0_0%,#e9f3dd_100%)] p-5">
          <p className="text-sm text-[#6f7d61]">Badge Library</p>
          <h1 className="mt-2 text-[30px] font-semibold tracking-tight text-[#324234]">
            养成徽章库
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#66735b]">
            这里收集你和植物一起解锁的生活成就。每一次浇水、记录、晒太阳和陪伴，都能成为一个有趣的徽章。
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <StatCard label="已解锁" value="03" />
            <StatCard label="养成中" value="02" />
            <StatCard label="待解锁" value="03" />
          </div>
        </section>

        <BadgeSection
          label="Unlocked"
          title="已解锁徽章"
          chip="正在陪伴中"
          chipClassName="bg-[#edf3e4] text-[#68805b]"
          badges={unlockedBadges}
        />
        <BadgeSection
          label="In Progress"
          title="养成中的徽章"
          chip="再坚持一下"
          chipClassName="bg-[#f3f1e5] text-[#8d7a49]"
          badges={inProgressBadges}
        />
        <BadgeSection
          label="Locked"
          title="未解锁徽章"
          chip="未来目标"
          chipClassName="bg-[#efefea] text-[#7b8272]"
          badges={lockedBadges}
          lockedStyle
        />
      </div>
    </main>
  );
}

function BadgeSection({
  label,
  title,
  chip,
  chipClassName,
  badges,
  lockedStyle = false,
}: {
  label: string;
  title: string;
  chip: string;
  chipClassName: string;
  badges: { name: string }[];
  lockedStyle?: boolean;
}) {
  const list = badges as Parameters<typeof BadgeCard>[0]["badge"][];

  return (
    <section className="rounded-[26px] bg-[#fffdf8] p-4 shadow-[0_10px_30px_rgba(107,112,92,0.08)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#6f7d61]">{label}</p>
          <h2 className="mt-1 text-xl font-semibold text-[#415440]">{title}</h2>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-medium ${chipClassName}`}>{chip}</div>
      </div>
      <div className="mt-4 grid gap-3">
        {list.map((badge) => (
          <BadgeCard key={badge.name} badge={badge} lockedStyle={lockedStyle} />
        ))}
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-white/75 p-3">
      <p className="text-[11px] text-[#748067]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#486042]">{value}</p>
    </div>
  );
}
