# airE 项目开发日志

## 开发阶段一：基础架构 ✅ 完成

### 日期：2026-02-15

#### 完成的任务

1. **项目初始化** ✅
   - 初始化 Vite + React + TypeScript 项目
   - 配置文件 (package.json, vite.config.ts, tsconfig.json)
   - Tailwind CSS 航空主题配置

2. **数据模型设计** ✅
   - 用户表结构 (User, PilotTitle)
   - 课程模块表 (Module, Vocabulary, Sentence)
   - 题目表 (Question, QuestionType)
   - 目标表 (Goal)
   - 成就表 (Badge)

3. **状态管理** ✅
   - 用户状态 (useUserStore) - 持久化登录、目标、成就
   - 课程状态 (useCourseStore) - 模块、词汇、句型

4. **基础UI组件** ✅
   - Button 组件 (5种变体 + 3种尺寸)
   - Card 组件 (支持hover效果)
   - ProgressBar 组件 (进度条)

5. **页面组件** ✅
   - Layout 组件 (响应式导航)
   - HomePage (首页欢迎 + 快速入口)
   - ModulesPage (课程模块展示)
   - PracticePage (练习类型选择)
   - AchievementsPage (称号进阶 + 徽章展示)
   - ProfilePage (个人中心)

---

## 开发阶段二：航空天气模块 ✅ 完成

### 日期：2026-02-15

#### 新增模块：航空天气 (Module 4)

**核心词汇** (8个):
| 英文 | 中文 | 例句 |
|-----|------|------|
| visibility | 能见度 | Low visibility on the runway. |
| turbulence | 颠簸 | Expect turbulence at 10,000 feet. |
| thunderstorm | 雷暴 | Thunderstorms in the area. |
| wind shear | 风切变 | Wind shear warning at runway. |
| ceiling | 云幕高度 | Ceiling is 500 feet. |
| crosswind | 侧风 | Crosswind on final approach. |
| headwind | 逆风 | Headwind of 20 knots. |
| tailwind | 顺风 | Tailwind component is 5 knots. |

**核心句型** (6个):
1. What is the visibility? (能见度是多少？)
2. Are there any thunderstorms on the route? (航线上有雷暴吗？)
3. Expect turbulence during descent (下降过程中预计有颠簸)
4. Wind is from the west at 15 knots (风向西，风速15节)
5. Ceiling is 800 feet with broken clouds (云幕高度800英尺，多云)
6. Runway visual range is 1000 meters (跑道视程1000米)

#### 新增组件

1. **WeatherModule 页面** (`/src/pages/learning/WeatherModule.tsx`)
   - 词汇和句型标签切换展示
   - 发音/跟读按钮
   - 天气知识卡片
   - 开始练习入口

2. **WeatherQuiz 组件** (`/src/components/practice/WeatherQuiz.tsx`)
   - 5道选择题测验
   - 实时反馈和解释
   - 得分统计
   - 重新测试功能

---

## 开发阶段三：PostgreSQL 数据持久化 ✅ 完成

### 日期：2026-02-15

#### 新增 SQL 文件

```
sql/
├── schema.sql      # 数据库表结构 (16张表)
├── seed.sql        # 种子数据
└── README.md       # 使用说明
```

#### 数据库表结构

| 分类 | 表名 | 说明 |
|-----|------|------|
| 用户 | users | 用户表 |
| | user_badges | 用户徽章关联 |
| | user_achievements | 用户成就 |
| 课程 | modules | 课程模块 |
| | vocabularies | 词汇表 |
| | sentences | 句型表 |
| | questions | 题目表 |
| 目标 | goals | 学习目标 |
| | goal_progress | 目标进度 |
| 记录 | practice_records | 练习记录 |
| | learning_history | 学习历史 |
| 配置 | pilot_titles | 称号配置 |
| | badge_configs | 徽章配置 |

#### 新增服务层

```
src/services/
├── index.ts              # 服务导出
├── userService.ts        # 用户服务
├── courseService.ts      # 课程服务
├── goalService.ts        # 目标服务
├── practiceService.ts    # 练习服务
└── achievementService.ts  # 成就服务
```

#### 新增配置

- `src/lib/db.ts` - PostgreSQL 连接池配置
- `.env.example` - 环境变量示例
- `.env` - 开发环境配置

#### npm 脚本

```bash
npm run db:init    # 初始化数据库
npm run db:seed    # 导入种子数据
npm run db:reset  # 重置数据库
```

---

## 课程模块列表 (4个)

| 模块 | 名称 | 词汇数 | 句型数 | 状态 |
|-----|------|-------|-------|------|
| M1 | 飞机认知 | 6 | 3 | ✅ |
| M2 | 机场流程 | 5 | 3 | ✅ |
| M3 | 塔台通信 | 4 | 4 | ✅ |
| M4 | 航空天气 | 8 | 6 | ✅ 新增 |

---

## 核心经验应用

### 1. Token 优化
- ✅ TypeScript 类型系统减少运行时错误
- ✅ 服务层按功能拆分，按需加载

### 2. 内存持久化
- ✅ PostgreSQL 持久化存储
- ✅ Zustand + persist 本地缓存
- ✅ 双重持久化保障

### 3. 持续学习
- ✅ 服务层模式提取
- ✅ 文档完善 (SQL/README.md)

### 4. 验证循环
- ✅ 数据库约束确保数据完整性
- ✅ 服务层业务逻辑验证

---

## 下一步计划

### Phase 4: 用户认证系统
- [ ] 注册/登录 API
- [ ] JWT 认证中间件
- [ ] 用户注册页面
- [ ] 用户登录页面

### Phase 5: 后端 API
- [ ] Express.js 服务器
- [ ] RESTful API 路由
- [ ] 认证中间件
- [ ] API 文档

### Phase 6: PWA支持
- [ ] Service Worker 配置
- [ ] 离线缓存
- [ ] 部署到 GitHub Pages
