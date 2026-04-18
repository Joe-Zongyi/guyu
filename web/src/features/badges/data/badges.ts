import type { Badge, GardenPlant } from "../types";

export const unlockedBadges: Badge[] = [
  {
    name: "晨光守护者",
    title: "连续 7 天晨间照护",
    icon: "sunrise",
    mood: "清晨习惯",
    unlocked: true,
  },
  {
    name: "第一片新叶",
    title: "记录到新叶萌发",
    icon: "leaf",
    mood: "成长陪伴",
    unlocked: true,
  },
  {
    name: "阳台摄影师",
    title: "累计上传 10 张植物照片",
    icon: "camera",
    mood: "记录成瘾",
    unlocked: true,
  },
  {
    name: "听雨守叶人",
    title: "连续 5 天在雨天照顾植物",
    icon: "raincare",
    mood: "雨日陪伴",
    unlocked: true,
  },
  {
    name: "水语者",
    title: "连续 3 次完美浇水",
    icon: "waterdrop",
    mood: "水分管理",
    unlocked: true,
  },
  {
    name: "月度同住者",
    title: "养同一株植物连续 30 天",
    icon: "calendar",
    mood: "长期陪伴",
    unlocked: true,
  },
];

export const inProgressBadges: Badge[] = [
  {
    name: "周末整理师",
    title: "连续 3 个周末完成养护",
    icon: "spark",
    mood: "周末仪式感",
    unlocked: false,
    progress: "2 / 3 周末已完成",
  },
  {
    name: "晴天补光家",
    title: "晴天累计完成 5 次窗边补光",
    icon: "sunflower",
    mood: "日照管理",
    unlocked: false,
    progress: "3 / 5 次补光",
  },
  {
    name: "绿意蔓延",
    title: "成功繁育或分株 1 次",
    icon: "sprout",
    mood: "生命延续",
    unlocked: false,
    progress: "0 / 1 次繁育",
  },
  {
    name: "四季同住者",
    title: "陪伴植物度过完整四季",
    icon: "calendar",
    mood: "长期陪伴",
    unlocked: false,
    progress: "182 / 365 天",
  },
  {
    name: "浇水记录员",
    title: "累计完成 12 次浇水记录",
    icon: "wateringlog",
    mood: "日常记录",
    unlocked: false,
    progress: "7 / 12 次记录",
  },
  {
    name: "安静观察家",
    title: "连续 6 天记录叶片变化",
    icon: "leaf",
    mood: "细致观察",
    unlocked: false,
    progress: "4 / 6 天观察",
  },
];

export const lockedBadges: Badge[] = [
  {
    name: "植物图鉴大师",
    title: "成功识别并养护 10 种不同植物",
    icon: "book",
    mood: "博学多识",
    unlocked: false,
  },
  {
    name: "起死回生",
    title: "成功挽救一株处于濒危状态的植物",
    icon: "heart",
    mood: "奇迹时刻",
    unlocked: false,
  },
  {
    name: "夜晚巡护员",
    title: "连续 14 天完成晚间状态检查",
    icon: "moon",
    mood: "晚间习惯",
    unlocked: false,
  },
  {
    name: "自然共鸣",
    title: "连续打卡 365 天无中断",
    icon: "medal",
    mood: "终极成就",
    unlocked: false,
  },
  {
    name: "窗边策展人",
    title: "打造一个稳定的窗边植物角",
    icon: "sunflower",
    mood: "空间布置",
    unlocked: false,
  },
  {
    name: "记忆采集者",
    title: "累计为植物留下 30 条成长记录",
    icon: "camera",
    mood: "长期记录",
    unlocked: false,
  },
];

export const gardenPlants: GardenPlant[] = [
  {
    name: "龟背竹",
    days: 128,
    mood: "雨后很精神",
    variety: "monstera",
  },
  {
    name: "绿萝",
    days: 94,
    mood: "窗边慢慢垂落",
    variety: "pothos",
  },
  {
    name: "仙人球",
    days: 212,
    mood: "安静晒太阳",
    variety: "cactus",
  },
  {
    name: "琴叶榕",
    days: 63,
    mood: "新叶正在长",
    variety: "ficus",
  },
  {
    name: "波士顿蕨",
    days: 47,
    mood: "叶片很蓬松",
    variety: "fern",
  },
  {
    name: "白掌",
    days: 156,
    mood: "最近开了小花",
    variety: "lily",
  },
];
