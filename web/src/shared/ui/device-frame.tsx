import type { ReactNode } from "react";

export function DeviceFrame({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-[520px]">
      <div className="relative mx-auto mb-[-7vh] w-full max-w-[437px]">
        <div className="absolute inset-x-10 bottom-[4vh] h-12 rounded-full bg-[#1f2e21]/25 blur-2xl" />

        <div className="origin-top relative scale-y-90 rounded-[52px] bg-[linear-gradient(180deg,#191c1a_0%,#232724_52%,#171917_100%)] p-[10px] shadow-[0_42px_120px_rgba(18,28,20,0.35)]">
          <div className="absolute inset-[1px] rounded-[51px] border border-white/6" />

          <div className="relative overflow-hidden rounded-[44px] border border-black/40 bg-[#0d120f]">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0))]" />

            <div className="guyu-no-scrollbar relative h-[860px] overflow-y-auto overscroll-contain rounded-[44px]">
              <div className="flex min-h-full flex-col gap-4 pb-4 pt-3">{children}</div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center">
              <div className="h-1.5 w-28 rounded-full bg-white/70" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
