type Badge = {
  name: string;
  title: string;
  description: string;
  icon: string;
  mood: string;
  unlocked: boolean;
  progress?: string;
};

const unlockedBadges: Badge[] = [
  {
    name: "晨光守护者",
    title: "连续 7 天晨间照护",
    description: "你已经习惯在早晨看看植物，生活和养护节奏开始同步。",
    icon: "sunrise",
    mood: "清晨习惯",
    unlocked: true,
  },
  {
    name: "第一片新叶",
    title: "记录到新叶萌发",
    description: "你第一次见证植物的新变化，也完成了从浇水到陪伴的转变。",
    icon: "leaf",
    mood: "成长陪伴",
    unlocked: true,
  },
  {
    name: "阳台摄影师",
    title: "累计上传 10 张植物照片",
    description: "你开始认真记录植物的样子，每次拍照都成了陪伴的证据。",
    icon: "camera",
    mood: "记录成瘾",
    unlocked: true,
  },
];

const inProgressBadges: Badge[] = [
  {
    name: "周末整理师",
    title: "连续 3 个周末完成养护",
    description: "再坚持一次周末照护，就能解锁这枚慢生活徽章。",
    icon: "spark",
    mood: "周末仪式感",
    unlocked: false,
    progress: "2 / 3 周末已完成",
  },
  {
    name: "晴天补光家",
    title: "晴天累计完成 5 次窗边补光",
    description: "你已经开始掌握家里最适合植物晒太阳的时段。",
    icon: "halo",
    mood: "日照管理",
    unlocked: false,
    progress: "3 / 5 次补光",
  },
];

const lockedBadges: Badge[] = [
  {
    name: "四季同住者",
    title: "陪伴植物度过完整四季",
    description: "当你和植物一起经历春夏秋冬，这枚徽章会被点亮。",
    icon: "season",
    mood: "长期陪伴",
    unlocked: false,
  },
  {
    name: "夜晚巡护员",
    title: "连续 5 天完成晚间状态检查",
    description: "晚上回家后，顺手看看植物，能解锁更贴近日常的习惯类成就。",
    icon: "moon",
    mood: "晚间习惯",
    unlocked: false,
  },
  {
    name: "安静治愈屋",
    title: "同时养护 3 株植物并保持稳定一周",
    description: "当家里形成一个小型绿色角落时，这枚徽章会作为阶段奖励出现。",
    icon: "home",
    mood: "空间经营",
    unlocked: false,
  },
];

function BadgeGlyph({ icon, unlocked }: { icon: string; unlocked: boolean }) {
  const tone = unlocked ? "bg-[#8ebd67]" : "bg-[#d7ddce]";
  const accent = unlocked ? "bg-[#c7ec8d]" : "bg-[#edf0e8]";

  if (icon === "sunrise") {
    return (
      <div className="relative h-16 w-16">
        <div className={`absolute inset-x-3 top-6 h-7 rounded-full ${tone}`} />
        <div className={`absolute inset-x-6 top-1 h-7 rounded-full ${accent}`} />
        <div className={`absolute left-5 top-11 h-1.5 w-6 rounded-full ${accent}`} />
      </div>
    );
  }

  if (icon === "leaf") {
    return (
      <div className="relative h-16 w-16">
        <div className={`absolute left-6 top-3 h-10 w-4 rounded-full ${tone}`} />
        <div className={`absolute left-2 top-7 h-6 w-6 rounded-[18px_18px_18px_6px] ${accent}`} />
        <div className={`absolute right-2 top-4 h-7 w-7 rounded-[18px_18px_6px_18px] ${tone}`} />
      </div>
    );
  }

  if (icon === "camera") {
    return (
      <div className="relative h-16 w-16">
        <div className={`absolute left-5 top-5 h-8 w-8 rounded-2xl ${tone}`} />
        <div className={`absolute left-8 top-8 h-3 w-3 rounded-full ${accent}`} />
        <div className={`absolute left-7 top-2 h-4 w-6 rounded-t-xl ${accent}`} />
      </div>
    );
  }

  if (icon === "spark") {
    return (
      <div className="relative h-16 w-16">
        <div className={`absolute left-7 top-1 h-14 w-2 rounded-full ${tone}`} />
        <div className={`absolute left-1 top-7 h-2 w-14 rounded-full ${tone}`} />
        <div className={`absolute left-5 top-5 h-6 w-6 rotate-45 rounded-lg ${accent}`} />
      </div>
    );
  }

  if (icon === "halo") {
    return (
      <div className="relative h-16 w-16">
        <div className={`absolute left-3 top-3 h-10 w-10 rounded-full border-[8px] border-solid ${unlocked ? "border-[#8ebd67]" : "border-[#d7ddce]"}`} />
        <div className={`absolute right-1 top-1 h-3 w-3 rounded-full ${accent}`} />
      </div>
    );
  }

  if (icon === "season") {
    return (
      <div className="relative h-16 w-16">
        <div className={`absolute left-4 top-4 h-8 w-8 rounded-full ${tone}`} />
        <div className={`absolute left-0 top-5 h-5 w-5 rounded-full ${accent}`} />
        <div className={`absolute right-0 top-5 h-5 w-5 rounded-full ${accent}`} />
      </div>
    );
  }

  if (icon === "moon") {
    return (
      <div className="relative h-16 w-16">
        <div className={`absolute left-4 top-3 h-10 w-10 rounded-full ${tone}`} />
        <div className="absolute left-8 top-3 h-10 w-10 rounded-full bg-[#f8f6ef]" />
        <div className={`absolute right-3 top-3 h-2 w-2 rounded-full ${accent}`} />
      </div>
    );
  }

  return (
    <div className="relative h-16 w-16">
      <div className={`absolute inset-2 rounded-[22px] ${tone}`} />
      <div className={`absolute left-7 top-1 h-14 w-2 rounded-full ${accent}`} />
      <div className={`absolute left-1 top-7 h-2 w-14 rounded-full ${accent}`} />
    </div>
  );
}

function BadgeCard({
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
    <article className={`rounded-[24px] p-4 shadow-[0_10px_30px_rgba(107,112,92,0.06)] ${baseClass}`}>
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

export default function BadgesPage() {
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
            <div className="rounded-[20px] bg-white/75 p-3">
              <p className="text-[11px] text-[#748067]">已解锁</p>
              <p className="mt-1 text-2xl font-semibold text-[#486042]">03</p>
            </div>
            <div className="rounded-[20px] bg-white/75 p-3">
              <p className="text-[11px] text-[#748067]">养成中</p>
              <p className="mt-1 text-2xl font-semibold text-[#486042]">02</p>
            </div>
            <div className="rounded-[20px] bg-white/75 p-3">
              <p className="text-[11px] text-[#748067]">待解锁</p>
              <p className="mt-1 text-2xl font-semibold text-[#486042]">03</p>
            </div>
          </div>
        </section>

        <section className="rounded-[26px] bg-[#fffdf8] p-4 shadow-[0_10px_30px_rgba(107,112,92,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6f7d61]">Unlocked</p>
              <h2 className="mt-1 text-xl font-semibold text-[#415440]">已解锁徽章</h2>
            </div>
            <div className="rounded-full bg-[#edf3e4] px-3 py-1 text-xs font-medium text-[#68805b]">
              正在陪伴中
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {unlockedBadges.map((badge) => (
              <BadgeCard key={badge.name} badge={badge} />
            ))}
          </div>
        </section>

        <section className="rounded-[26px] bg-[#fffdf8] p-4 shadow-[0_10px_30px_rgba(107,112,92,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6f7d61]">In Progress</p>
              <h2 className="mt-1 text-xl font-semibold text-[#415440]">养成中的徽章</h2>
            </div>
            <div className="rounded-full bg-[#f3f1e5] px-3 py-1 text-xs font-medium text-[#8d7a49]">
              再坚持一下
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {inProgressBadges.map((badge) => (
              <BadgeCard key={badge.name} badge={badge} />
            ))}
          </div>
        </section>

        <section className="rounded-[26px] bg-[#fffdf8] p-4 shadow-[0_10px_30px_rgba(107,112,92,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6f7d61]">Locked</p>
              <h2 className="mt-1 text-xl font-semibold text-[#415440]">未解锁徽章</h2>
            </div>
            <div className="rounded-full bg-[#efefea] px-3 py-1 text-xs font-medium text-[#7b8272]">
              未来目标
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {lockedBadges.map((badge) => (
              <BadgeCard key={badge.name} badge={badge} lockedStyle />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
