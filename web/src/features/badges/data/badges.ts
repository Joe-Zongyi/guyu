import type { Badge } from "../types";

export const unlockedBadges: Badge[] = [
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

export const inProgressBadges: Badge[] = [
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

export const lockedBadges: Badge[] = [
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
