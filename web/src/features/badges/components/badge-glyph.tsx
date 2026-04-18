export function BadgeGlyph({
  icon,
  unlocked,
}: {
  icon: string;
  unlocked: boolean;
}) {
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
        <div
          className={`absolute left-2 top-7 h-6 w-6 rounded-[18px_18px_18px_6px] ${accent}`}
        />
        <div
          className={`absolute right-2 top-4 h-7 w-7 rounded-[18px_18px_6px_18px] ${tone}`}
        />
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
        <div
          className={`absolute left-3 top-3 h-10 w-10 rounded-full border-[8px] border-solid ${
            unlocked ? "border-[#8ebd67]" : "border-[#d7ddce]"
          }`}
        />
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
