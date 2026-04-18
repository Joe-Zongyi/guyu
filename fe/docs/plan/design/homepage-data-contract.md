# 首页接口数据契约（Data Contract）

> 目标：根据 `design/homepage_sunny.pen` 与 `design/homepage_rainy.pen` 两张移动端首页设计稿，整理出后端需要为前端提供的数据结构。所有字段均按"屏幕模块 → 字段 → 含义 / 类型 / 示例"的顺序给出，便于直接对接 Next.js 15 + React 19 + TypeScript 的前端实现。

- 基础信息
  - 页面定位：绿植养成网页 H5 首页（移动端竖版，宽 430px）
  - 鉴权：需要登录，所有接口按当前用户上下文返回数据
  - 建议聚合接口：`GET /api/home` 一次性返回本文所列全部字段，避免首屏多次请求
  - 单位约定：所有时间为 ISO 8601（`YYYY-MM-DDTHH:mm:ssZ`），所有枚举使用小写蛇形

---

## 1. 顶部状态栏（Top Bar）

对应节点：`Top Bar` / `Top Bar Left` / `Top Bar Right`

| 字段 | 类型 | 含义 | 示例 |
| --- | --- | --- | --- |
| `date.display` | `string` | 前端展示用的日期文案（后端已本地化） | `"4月18日 Saturday"` |
| `date.iso` | `string (ISO date)` | 原始日期，供前端做二次格式化 | `"2026-04-18"` |
| `weather.code` | `enum` | 天气大类，决定整页主题色与背景 | `"sunny"` \| `"rainy"` \| `"cloudy"` |
| `weather.label` | `string` | 天气英文标签，显示在右上角 | `"Sunny"` / `"Rainy"` |
| `weather.temperatureC` | `number?` | 可选，保留字段 | `22` |

> 前端会根据 `weather.code` 切换整页底色、主视觉背景图以及部分卡片的配色（晴 → `homepage_sunny.pen` 风格；雨/阴 → `homepage_rainy.pen` 风格）。

---

## 2. 植物主卡（Plant Hero Card）

对应节点：`Plant Hero Card` / `Hero Title` / `Hero Subtitle` / `Pixel Plant Art` / `Hero Primary Button`

```ts
interface HeroCard {
  plantId: string;           // 植物唯一 ID，打卡接口需要
  name: string;              // "龟背竹 Monstera"
  subtitle: string;          // "春季养护进行中"
  artwork: {
    type: "pixel" | "image";
    url?: string;            // type=image 时必填
    palette?: string[];      // 可选，用于前端过渡色
  };
  checkIn: {
    enabled: boolean;        // 今日是否允许打卡
    done: boolean;           // 今日是否已打卡
    buttonText: string;      // "立即打卡" / "今日已打卡"
    actionUrl: string;       // 打卡跳转或接口路径
  };
}
```

字段来源说明：
- `name`、`subtitle` 直接填充 Hero Title / Hero Subtitle
- `checkIn.buttonText` 作为 `Hero Primary Button` 文本；`done=true` 时前端会切换为次级样式

---

## 3. 植物状态卡（Plant Status Card）

对应节点：`Plant Status Card` 内部结构
- `Status Label`：静态文案 `"Plant Status"`，由前端硬编码
- `Status Main Label`：静态 `"总体状态"`
- `Status Main Value`：主状态词
- `Status Semantic Row` 下的三段子模块：`Growth Stage Block`、`Leaf State Block`、`Env Status Strip`

```ts
interface PlantStatusCard {
  overall: {
    value: string;           // 一个词，如 "舒展" / "平稳" / "疲倦"
    code: "thriving" | "stable" | "tired" | "alert";
  };
  growthStage: {
    label: string;           // 静态 "生长阶段"（可由后端返回以支持国际化）
    value: string;           // 一个词：如 "萌发" / "缓慢" / "旺盛"
    intensity: number;       // 0~1，用于前端彩色小条的宽度/明度
  };
  leafState: {
    label: string;           // "叶片状态"
    value: string;           // 一个词："稳定" / "泛黄" / "新发"
    intensity: number;       // 0~1
  };
  environment: {
    label: string;           // "环境感受"
    value: string;           // 一个词："舒适" / "湿冷" / "干燥"
    intensity: number;       // 0~1
  };
}
```

约束：
- 每个 `value` 严格保持"一个词+两个字符"（与视觉一致：大标题 + 一个词总结）
- `intensity` 用于前端把当前的小色条渲染成不同的饱和度或长度；不需要后端给出具体像素

---

## 4. 今日养护卡（Today Care Card）

对应节点：`Today Care Card` 内部结构
- `Care Label`：静态 `"Today Care"`
- `Primary Care Block` / `Primary Care Key` / `Primary Care Main`
- `Care Reminder 1` / `Care Reminder 2` 以及对应的 `Reminder Text 1/2`

```ts
interface TodayCareCard {
  primary: {
    key: string;             // 例如 "补光" / "浇水" / "修剪"
    main: string;            // 时间或场景词，例如 "上午" / "靠窗" / "傍晚"
    iconCode?: "sun" | "water" | "scissor" | "fan";
    actionUrl?: string;      // 点击时跳转路径（可选）
  };
  reminders: [
    {
      key: string;           // "补水"
      value: string;         // "两天后"
      accentColor: "green" | "yellow" | "orange" | "red";
    },
    {
      key: string;           // "暴晒"
      value: string;         // "避免"
      accentColor: "green" | "yellow" | "orange" | "red";
    }
  ]; // 固定长度 2
}
```

约束：
- `primary.main` 建议不超过 4 个汉字；`reminders[i].value` 不超过 6 个汉字
- `accentColor` 控制提醒前的小色条颜色（与雨天/晴天主题共用同一配色表）

---

## 5. 生活节律卡（Life Rhythm Card）

对应节点：`Life Rhythm Card`，是一个比较"软"的数据可视化模块，包含 4 个子结构：

1. `Rhythm Top Row` — `Rhythm Label`(静态 "Life Rhythm") + `Rhythm Summary Chip`(`Rhythm Chip Text`)
2. `Rhythm Main Row` — `Rhythm Ring Panel`（环形指示 + 文案）+ `Rhythm Curve Panel`（柔和曲线 + 信息 chip）
3. `Rhythm Bar Wrap` — `Bar Label` + 一排节律条 `Bar Row`
4. `Rhythm Summary` — 一句话生活化总结

```ts
interface LifeRhythmCard {
  chip: {
    text: string;            // "本周很稳" / "节奏放缓" 等气质化标签
    tone: "calm" | "steady" | "drifting" | "bright";
  };
  ring: {
    percent: number;         // 0~100，用于环形 sweep 角度
    centerText: string;      // "稳定"（一个词）
    hint: string;            // "陪伴节奏保持"（副文案，一句短话）
  };
  curve: {
    // 用于 Rhythm Curve，最近 N 天的照顾强度
    points: number[];        // 长度 5~7，每个值 0~1；不带坐标轴
  };
  chips: {
    companionDays: number;   // 陪伴 128 天 → 128
    lastWater: string;       // "前天" / "今天" / "3 天前"
  };
  bar: {
    label: string;           // "今天顺手通风：偏早晨"
    // 一天分成若干时段（早/午/傍/夜），0~1 表示适合照顾的强度
    segments: Array<{
      period: "morning" | "noon" | "evening" | "night";
      intensity: number;     // 0~1
    }>;
  };
  summary: string;           // "这几天的生活和养护节奏在同步。"
}
```

说明：
- 整个模块不展示任何明确的百分比/数值刻度，只用形状和气质化短句传达
- `curve.points` 和 `bar.segments` 的数值区间统一到 `0~1`，方便前端归一化绘制
- 文案以"不像报表"为原则，后端可根据近 7 天行为数据自动生成

---

## 6. 视频推荐卡（Video Recommendation Card）

对应节点：`Video Recommendation Card` / `Video Title` / `Video Meta` / `Video Watch Button`

```ts
interface VideoRecommendationCard {
  videos: Array<{
    id: string;
    title: string;           // "龟背竹浇水要诀"
    meta: string;            // "6 min · 氛围友好" （时长 · 氛围标签）
    durationMin: number;     // 6
    moodTag: string;         // "氛围友好"
    coverUrl?: string;
    watchUrl: string;        // 跳转或站内播放页
    buttonText: string;      // "观看"
  }>; // 当前视觉只放 1 条，但接口预留数组，便于未来扩展
}
```

---

## 7. 类似博主推荐卡（Similar Blogger Card）

对应节点：`Similar Blogger Card` → `Creator Row 1/2`，每行包含 `Creator Name`、`Creator Meta`、`Creator Button`

```ts
interface SimilarBloggerCard {
  creators: Array<{
    id: string;
    name: string;            // "自然阳台日记"
    meta: string;            // "阳台绿植 · 生活系"
    avatarUrl?: string;
    tags?: string[];         // ["阳台绿植", "生活系"]，可选
    actionUrl: string;       // "查看"按钮跳转
    buttonText: string;      // "查看"
  }>; // 当前视觉固定 2 条
}
```

---

## 8. 聚合响应（推荐结构）

```ts
// GET /api/home?userId=xxx
interface HomePageResponse {
  topBar: {
    date: { display: string; iso: string };
    weather: {
      code: "sunny" | "rainy" | "cloudy";
      label: string;
      temperatureC?: number;
    };
  };
  hero: HeroCard;
  plantStatus: PlantStatusCard;
  todayCare: TodayCareCard;
  lifeRhythm: LifeRhythmCard;
  videoRecommendation: VideoRecommendationCard;
  similarBloggers: SimilarBloggerCard;
}
```

示例响应：

```json
{
  "topBar": {
    "date": { "display": "4月18日 Saturday", "iso": "2026-04-18" },
    "weather": { "code": "sunny", "label": "Sunny", "temperatureC": 23 }
  },
  "hero": {
    "plantId": "plant_8821",
    "name": "龟背竹 Monstera",
    "subtitle": "春季养护进行中",
    "artwork": { "type": "pixel" },
    "checkIn": {
      "enabled": true,
      "done": false,
      "buttonText": "立即打卡",
      "actionUrl": "/api/plants/plant_8821/check-in"
    }
  },
  "plantStatus": {
    "overall": { "value": "舒展", "code": "thriving" },
    "growthStage": { "label": "生长阶段", "value": "萌发", "intensity": 0.6 },
    "leafState":   { "label": "叶片状态", "value": "稳定", "intensity": 0.7 },
    "environment": { "label": "环境感受", "value": "舒适", "intensity": 0.8 }
  },
  "todayCare": {
    "primary": { "key": "补光", "main": "上午", "iconCode": "sun" },
    "reminders": [
      { "key": "补水", "value": "两天后", "accentColor": "green" },
      { "key": "暴晒", "value": "避免",   "accentColor": "yellow" }
    ]
  },
  "lifeRhythm": {
    "chip": { "text": "本周很稳", "tone": "steady" },
    "ring": { "percent": 78, "centerText": "稳定", "hint": "陪伴节奏保持" },
    "curve": { "points": [0.3, 0.5, 0.6, 0.4, 0.7, 0.8, 0.6] },
    "chips": { "companionDays": 128, "lastWater": "前天" },
    "bar": {
      "label": "今天顺手通风：偏早晨",
      "segments": [
        { "period": "morning", "intensity": 0.9 },
        { "period": "noon",    "intensity": 0.4 },
        { "period": "evening", "intensity": 0.7 },
        { "period": "night",   "intensity": 0.2 }
      ]
    },
    "summary": "这几天的生活和养护节奏在同步。"
  },
  "videoRecommendation": {
    "videos": [
      {
        "id": "video_31",
        "title": "龟背竹浇水要诀",
        "meta": "6 min · 氛围友好",
        "durationMin": 6,
        "moodTag": "氛围友好",
        "watchUrl": "/videos/video_31",
        "buttonText": "观看"
      }
    ]
  },
  "similarBloggers": {
    "creators": [
      {
        "id": "u_101",
        "name": "自然阳台日记",
        "meta": "阳台绿植 · 生活系",
        "tags": ["阳台绿植", "生活系"],
        "actionUrl": "/users/u_101",
        "buttonText": "查看"
      },
      {
        "id": "u_102",
        "name": "植物散步时刻",
        "meta": "龟背竹日常 · 节日观察",
        "tags": ["龟背竹日常", "节日观察"],
        "actionUrl": "/users/u_102",
        "buttonText": "查看"
      }
    ]
  }
}
```

---

## 9. 交互类接口（同步列出，方便后端一并评估）

| 接口 | 方法 | 触发位置 | 入参 | 返回 |
| --- | --- | --- | --- | --- |
| `/api/home` | GET | 首屏加载 | `userId`（Header/Cookie） | `HomePageResponse` |
| `/api/plants/{plantId}/check-in` | POST | 主卡"立即打卡"按钮 | `plantId` | 新的 `hero.checkIn` 状态 |
| `/api/videos/{videoId}/visit` | POST | 视频卡"观看"点击 | `videoId` | 200 OK（埋点） |
| `/api/users/{userId}/follow` | POST | 博主卡"查看"若带关注时 | `userId` | 关注状态 |

---

## 10. 对字段的整体约束

- 文案长度
  - 所有"一个词总结"类字段 ≤ 4 汉字
  - `TodayCare.reminders[*].value` ≤ 6 汉字
  - `lifeRhythm.summary` 控制在 1 句（≤ 24 汉字）
- 枚举字段统一走后端字典，前端不做拼接翻译
- 当某个模块数据缺失时，后端返回 `null` 并在顶层附带 `missingModules: string[]`；前端按缺失模块做占位而不是崩溃
- 所有 URL 字段支持相对路径（站内）或绝对 URL（站外），前端自动判断

---

## 11. 与设计稿节点的字段映射速查表

| 模块 | 设计稿节点 | 对应字段 |
| --- | --- | --- |
| Top Bar | `Top Bar Left` | `topBar.date.display` |
| Top Bar | `Top Bar Right` | `topBar.weather.label` |
| Hero | `Hero Title` | `hero.name` |
| Hero | `Hero Subtitle` | `hero.subtitle` |
| Hero | `Hero Button Text` | `hero.checkIn.buttonText` |
| Plant Status | `Status Main Value` | `plantStatus.overall.value` |
| Plant Status | `Growth Stage Main` | `plantStatus.growthStage.value` |
| Plant Status | `Leaf State Main` | `plantStatus.leafState.value` |
| Plant Status | `Env Status Text` | `plantStatus.environment.value` |
| Today Care | `Primary Care Key` | `todayCare.primary.key` |
| Today Care | `Primary Care Main` | `todayCare.primary.main` |
| Today Care | `Reminder Text 1` | `todayCare.reminders[0].key` + `.value` |
| Today Care | `Reminder Text 2` | `todayCare.reminders[1].key` + `.value` |
| Life Rhythm | `Rhythm Chip Text` | `lifeRhythm.chip.text` |
| Life Rhythm | `Ring Text` | `lifeRhythm.ring.centerText` |
| Life Rhythm | `Ring Hint` | `lifeRhythm.ring.hint` |
| Life Rhythm | `Rhythm Curve` | `lifeRhythm.curve.points` |
| Life Rhythm | `Day Chip Text` | `lifeRhythm.chips.companionDays` |
| Life Rhythm | `Water Chip Text` | `lifeRhythm.chips.lastWater` |
| Life Rhythm | `Bar Label` | `lifeRhythm.bar.label` |
| Life Rhythm | `Bar Row` | `lifeRhythm.bar.segments` |
| Life Rhythm | `Rhythm Summary` | `lifeRhythm.summary` |
| Video | `Video Title` | `videoRecommendation.videos[0].title` |
| Video | `Video Meta` | `videoRecommendation.videos[0].meta` |
| Video | `Video Button Text` | `videoRecommendation.videos[0].buttonText` |
| Blogger | `Creator Name 1/2` | `similarBloggers.creators[i].name` |
| Blogger | `Creator Meta 1/2` | `similarBloggers.creators[i].meta` |
| Blogger | `Creator Button Text 1/2` | `similarBloggers.creators[i].buttonText` |

---

如对字段粒度、枚举取值或接口拆分有不同意见，可在此文档上直接增删改，前端会基于最终版本生成 TypeScript 类型定义。
