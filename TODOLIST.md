# airE 项目 TodoList

## 项目信息
- **版本**: v1.0
- **基于**: requirement.md (PRD v2.0)
- **开始日期**: 2026-02-15

---

## Phase 1: 基础架构 ✅ 已完成
- [x] 项目初始化 (Vite + React + TypeScript)
- [x] Tailwind CSS 配置
- [x] 数据模型设计 (5张核心表)
- [x] 基础 UI 组件 (Button, Card, ProgressBar)
- [x] 状态管理 (Zustand)
- [x] 路由配置

---

## Phase 2: PostgreSQL 数据层 ✅ 已完成
- [x] schema.sql (5张核心表)
- [x] seed.sql (4个模块数据)
- [x] db.ts 连接配置
- [x] userService.ts
- [x] courseService.ts
- [x] goalService.ts

---

## Phase 3: 目标设定模块 ⏳ 进行中
- [ ] GoalForm 组件 - 创建目标表单
- [ ] GoalList 组件 - 目标列表
- [ ] GoalCard 组件 - 目标卡片
- [ ] GoalDetail 组件 - 目标详情
- [ ] GoalsPage 页面 - 目标管理页面
- [ ] 目标状态管理 (active/completed/abandoned)

---

## Phase 4: 学习内容模块
- [ ] ModuleCard 组件 - 模块卡片
- [ ] VocabularyCard 组件 - 词汇卡片
- [ ] SentenceCard 组件 - 句型卡片
- [ ] AudioPlayer 组件 - 音频播放
- [ ] LearningPage 页面 - 学习页面
- [ ] 模块详情页 (M1-M4)

---

## Phase 5: 互动练习模块
- [ ] ChoiceQuestion 组件 - 选择题
- [ ] FillBlankQuestion 组件 - 填空题
- [ ] MatchingQuestion 组件 - 配对题
- [ ] ScenarioQuestion 组件 - 情景对话
- [ ] QuizPage 页面 - 测验页面
- [ ] 答题反馈机制

---

## Phase 6: 能力测试模块
- [ ] TestConfig 组件 - 测试配置
- [ ] TestPage 页面 - 测试页面
- [ ] ScoreDisplay 组件 - 分数展示
- [ ] TestResult 组件 - 测试结果
- [ ] 达标判定逻辑

---

## Phase 7: 成就系统
- [ ] TitleProgress 组件 - 称号进度
- [ ] BadgeGrid 组件 - 徽章网格
- [ ] BadgeCard 组件 - 徽章卡片
- [ ] AchievementAnimation 庆祝动画
- [ ] AchievementsPage 页面

---

## Phase 8: 进度追踪
- [ ] ProgressChart 组件 - 进度图表
- [ ] RadarChart 组件 - 雷达图
- [ ] StatsCard 组件 - 统计卡片
- [ ] Dashboard 页面 - 仪表盘

---

## Phase 9: 个人中心
- [ ] ProfileHeader 组件 - 头部信息
- [ ] AvatarSelector 组件 - 头像选择
- [ ] SettingsForm 组件 - 设置表单
- [ ] ProfilePage 页面

---

## Phase 10: PWA 支持
- [ ] manifest.json 配置
- [ ] Service Worker 配置
- [ ] 离线缓存策略
- [ ] PWA 部署配置

---

## Phase 11: 部署上线
- [ ] GitHub Pages 部署
- [ ] Vercel 部署
- [ ] 自动化 CI/CD
- [ ] 域名配置

---

## 验收标准

### 功能验收
- [ ] 用户可创建、编辑、删除学习目标
- [ ] 内置航空英语模板可浏览、可编辑
- [ ] 支持4种题型（选择/填空/配对/情景）
- [ ] 测试功能正常，评分系统准确
- [ ] 6级航空称谓 + 徽章完整
- [ ] 进度条、雷达图正常显示
- [ ] PWA 离线功能正常

### 技术验收
- [ ] 响应式设计，桌面端体验良好
- [ ] 页面加载 < 2秒
- [ ] 音频播放 < 500ms延迟
- [ ] 成功部署到至少2个免费平台
