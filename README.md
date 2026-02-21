# airE - 航空英语学习目标达成系统

一款面向小学生的航空英语学习应用，通过目标驱动的学习系统，帮助用户掌握航空英语核心句型和词汇。

## 功能特性

- **目标设定** - 创建自定义学习目标，设定达标分数
- **学习内容** - 内置航空英语词汇、句型、情景对话
- **互动练习** - 选择题测验，即时反馈
- **成就系统** - 6级航空称谓进阶 + 徽章收集
- **进度追踪** - 可视化进度条和统计数据
- **PWA支持** - 可离线使用基础功能

## 技术栈

- **前端**: React 18 + TypeScript
- **构建工具**: Vite 5
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **路由**: React Router v6
- **后端**: Node.js + Express (独立服务)
- **数据库**: PostgreSQL

## 依赖版本

### 前端依赖

| 包名 | 版本 | 说明 |
|------|------|------|
| react | ^18.3.1 | React 核心库 |
| react-dom | ^18.3.1 | React DOM 渲染 |
| react-router-dom | ^6.30.3 | 路由管理 |
| zustand | ^4.5.7 | 状态管理 |
| howler | ^2.2.4 | 音频播放 |
| pg | ^8.13.1 | PostgreSQL 客户端 |
| dotenv | ^16.4.5 | 环境变量 |
| bcryptjs | ^2.4.3 | 密码加密 |
| jsonwebtoken | ^9.0.2 | JWT 认证 |

### 前端开发依赖

| 包名 | 版本 | 说明 |
|------|------|------|
| typescript | ^5.7.3 | TypeScript 编译器 |
| vite | ^5.4.21 | 构建工具 |
| @vitejs/plugin-react | ^4.3.4 | Vite React 插件 |
| tailwindcss | ^3.4.19 | CSS 框架 |
| autoprefixer | ^10.4.20 | CSS 前缀 |
| postcss | ^8.4.49 | CSS 处理 |
| vitest | ^1.6.1 | 测试框架 |
| @types/react | ^18.3.12 | React 类型 |
| @types/react-dom | ^18.3.1 | React DOM 类型 |

### 后端依赖

| 包名 | 版本 | 说明 |
|------|------|------|
| express | ^4.21.2 | Web 框架 |
| pg | ^8.13.1 | PostgreSQL 客户端 |
| bcryptjs | ^2.4.3 | 密码加密 |
| jsonwebtoken | ^9.0.2 | JWT 认证 |
| cors | ^2.8.5 | 跨域支持 |
| dotenv | ^16.4.5 | 环境变量 |

### 后端开发依赖

| 包名 | 版本 | 说明 |
|------|------|------|
| typescript | ^5.7.3 | TypeScript 编译器 |
| tsx | ^4.19.2 | TypeScript 执行器 |
| @types/express | ^4.17.21 | Express 类型 |
| @types/node | ^22.10.2 | Node.js 类型 |

## 项目结构

```
airE/
├── src/                    # 前端源码
│   ├── components/         # UI 组件
│   │   ├── common/         # 通用组件 (Button, Card, ProgressBar)
│   │   ├── achievement/    # 成就相关组件
│   │   ├── goal/           # 目标管理组件
│   │   ├── learning/       # 学习内容组件
│   │   ├── practice/       # 练习模块组件
│   │   ├── profile/        # 个人中心组件
│   │   └── layout/         # 布局组件
│   ├── pages/              # 页面组件
│   ├── stores/             # Zustand 状态管理
│   ├── types.ts            # TypeScript 类型定义
│   └── App.tsx             # 应用入口
├── backend/                # 后端服务
│   └── src/
│       ├── lib/            # 数据库连接
│       ├── services/       # 业务逻辑
│       └── server.ts       # API 入口
├── sql/                    # 数据库脚本
│   ├── schema.sql          # 数据库结构
│   └── seed.sql            # 种子数据
├── public/                 # 静态资源
└── dist/                   # 构建输出
```

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 15+ (可选，用于后端服务)

### 安装依赖

```bash
# 前端依赖
npm install

# 后端依赖
cd backend && npm install
```

### 开发模式

```bash
# 启动前端开发服务器
npm run dev

# 启动后端服务 (另一个终端)
cd backend && npm run dev
```

### 构建生产版本

```bash
# 构建前端
npm run build

# 构建后端
cd backend && npm run build
```

### 数据库初始化（Docker）

```bash
# 启动 PostgreSQL 容器（首次会自动执行 schema + seed）
npm run db:up

# 手动重刷表结构
npm run db:init

# 手动重刷种子数据
npm run db:seed

# 一步重刷
npm run db:reset

# 进入 psql
npm run db:psql
```

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动前端开发服务器 |
| `npm run build` | 构建前端生产版本 |
| `npm run preview` | 预览构建结果 |
| `npm run lint` | 代码检查 |
| `npm run test` | 运行测试 |
| `npm run db:up` | 启动本地 PostgreSQL（Docker） |
| `npm run db:down` | 停止本地 PostgreSQL 容器 |
| `npm run db:logs` | 查看 PostgreSQL 日志 |
| `npm run db:psql` | 进入 PostgreSQL 命令行 |
| `npm run db:init` | 初始化数据库 |
| `npm run db:seed` | 填充种子数据 |
| `npm run db:reset` | 重置数据库 |

## 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | HomePage | 首页 |
| `/dashboard` | DashboardPage | 仪表盘 |
| `/modules` | ModulesPage | 课程列表 |
| `/modules/:id` | ModuleDetailPage | 模块详情 |
| `/modules/weather` | WeatherModule | 天气模块 |
| `/practice` | PracticePage | 练习选择 |
| `/practice/quiz` | QuizPage | 测验页面 |
| `/goals` | GoalsPage | 目标管理 |
| `/achievements` | AchievementsPage | 成就页面 |
| `/profile` | ProfilePage | 个人中心 |

## 航空称谓等级

| 等级 | 称谓 | 所需经验 |
|------|------|----------|
| 1 | 飞行学员 | 0 |
| 2 | 初级飞行员 | 500 |
| 3 | 中级飞行员 | 1500 |
| 4 | 高级飞行员 | 3000 |
| 5 | 机长 | 5000 |
| 6 | 资深机长 | 8000 |

---

## 航空英语教学内容

### 课程模块概览

| 模块 | 名称 | 核心内容 |
|------|------|----------|
| Module 1 | 飞机认知 | 飞机部件、机场设施、ICAO字母表 |
| Module 2 | 塔台对话 | ATC通信、标准用语、飞行阶段指令 |
| Module 3 | 飞行天气 | 天气词汇、METAR报文、危险天气 |
| Module 4 | 飞行任务 | 导航术语、无人机指令、飞行计划 |
| Module 5 | 紧急情况 | 遇险信号、紧急通话、疏散指令 |

---

### Module 1：飞机认知（Aircraft English）

#### 飞机部件词汇
| 英文 | 中文 | 发音 |
|------|------|------|
| wing | 机翼 | /wɪŋ/ |
| cockpit | 驾驶舱 | /ˈkɒkpɪt/ |
| runway | 跑道 | /ˈrʌnweɪ/ |
| fuselage | 机身 | /ˈfjuːzəlɑːʒ/ |
| landing gear | 起落架 | /ˈlændɪŋ ɡɪə/ |
| propeller | 螺旋桨 | /prəˈpelə/ |
| engine | 发动机 | /ˈendʒɪn/ |
| rudder | 方向舵 | /ˈrʌdə/ |
| aileron | 副翼 | /ˈeɪlərɒn/ |
| elevator | 升降舵 | /ˈelɪveɪtə/ |
| flap | 襟翼 | /flæp/ |
| spoiler | 扰流板 | /ˈspɔɪlə/ |
| cabin | 客舱 | /ˈkæbɪn/ |
| cargo hold | 货舱 | /ˈkɑːɡəʊ həʊld/ |

#### 机场设施词汇
| 英文 | 中文 | 例句 |
|------|------|------|
| terminal | 航站楼 | Passengers wait at the terminal. |
| gate | 登机口 | Flight 123 is at Gate 5. |
| apron / tarmac | 停机坪 | The plane is parked on the apron. |
| taxiway | 滑行道 | Taxi to runway via taxiway A. |
| control tower | 塔台 | Contact the control tower. |
| hangar | 机库 | The aircraft is in the hangar. |

#### ICAO 字母表（必背）
| 字母 | 读音 | 字母 | 读音 |
|------|------|------|------|
| A | Alpha | N | November |
| B | Bravo | O | Oscar |
| C | Charlie | P | Papa |
| D | Delta | Q | Quebec |
| E | Echo | R | Romeo |
| F | Foxtrot | S | Sierra |
| G | Golf | T | Tango |
| H | Hotel | U | Uniform |
| I | India | V | Victor |
| J | Juliet | W | Whiskey |
| K | Kilo | X | X-ray |
| L | Lima | Y | Yankee |
| M | Mike | Z | Zulu |

---

### Module 2：塔台对话（ATC Communication）

#### ATC 角色与机构
| 英文 | 中文 | 说明 |
|------|------|------|
| ATC | 空中交通管制 | 负责指挥飞机 |
| Ground Control | 地面管制 | 负责滑行阶段 |
| Tower | 塔台 | 负责起飞降落 |
| Approach / Departure | 进近/离场 | 负责爬升下降 |
| Center / Area Control | 区域管制 | 负责航路飞行 |

#### 标准通话用语
| 英文 | 中文 | 使用场景 |
|------|------|----------|
| Roger | 收到 | 确认收到信息 |
| Wilco | 收到并执行 | Will Comply的缩写 |
| Affirm | 是/正确 | 回答yes |
| Negative | 否/不 | 回答no |
| Standby | 稍等 | 请等待 |
| Say again | 请重复 | 没听清时 |
| Cleared | 批准/许可 | 获得许可 |
| Unable | 无法执行 | 不能完成指令 |
| Maintain | 保持 | 保持当前状态 |
| Immediately | 立即 | 紧急情况 |

#### 飞行阶段词汇
| 英文 | 中文 | 例句 |
|------|------|------|
| pushback | 推出 | Pushback approved. |
| start-up | 启动 | Request start-up. |
| taxi | 滑行 | Taxi to runway 27. |
| hold short | 在...外等待 | Hold short of runway. |
| line up and wait | 进入跑道等待 | Line up and wait runway 27. |
| takeoff | 起飞 | Cleared for takeoff. |
| climb | 爬升 | Climb to FL350. |
| descend | 下降 | Descend to 3000 feet. |
| approach | 进近 | Expect ILS approach. |
| landing | 着陆 | Cleared to land. |
| go around | 复飞 | Going around. |
| vacate | 脱离 | Vacate runway left. |

#### 常用句型
**起飞请求：**
- "Tower, [callsign], ready for takeoff runway 27."
- "[Callsign], cleared for takeoff runway 27."

**降落请求：**
- "[Callsign], request landing."
- "[Callsign], cleared to land runway 27."

**滑行指令：**
- "Ground, [callsign], request taxi."
- "[Callsign], taxi to runway 27 via Alpha."

#### 完整起飞对话示例
```
Pilot:   "Ground, CCA1234, request start-up."
Ground:  "CCA1234, start-up approved."
Pilot:   "Start-up approved, CCA1234."

Pilot:   "Ground, CCA1234, request taxi."
Ground:  "CCA1234, taxi to runway 27 via Alpha."
Pilot:   "Runway 27 via Alpha, CCA1234."

Pilot:   "Tower, CCA1234, holding short runway 27, ready for departure."
Tower:   "CCA1234, line up and wait runway 27."
Pilot:   "Line up and wait runway 27, CCA1234."

Tower:   "CCA1234, cleared for takeoff runway 27, wind 250 at 10."
Pilot:   "Cleared for takeoff runway 27, CCA1234."
```

---

### Module 3：飞行天气（Weather Talk）

#### 天气现象词汇
| 英文 | 中文 | 说明 |
|------|------|------|
| wind speed | 风速 | knots 节 |
| headwind | 逆风 | 迎面吹来的风 |
| tailwind | 顺风 | 从后面吹的风 |
| crosswind | 侧风 | 从侧面吹的风 |
| gust | 阵风 | 突然增强的风 |
| visibility | 能见度 | 能看到的距离 |
| fog | 雾 | 能见度低于1公里 |
| ceiling | 云底高 | 云层距地面高度 |

#### 危险天气词汇
| 英文 | 中文 | 说明 |
|------|------|------|
| storm | 暴风雨 | 严重天气 |
| thunderstorm | 雷暴 | 有雷电 |
| turbulence | 颠簸 | 空气不稳定 |
| windshear | 风切变 | 风向/风速突变 |
| icing / ice | 结冰 | 飞机表面结冰 |
| microburst | 微下击暴流 | 危险下沉气流 |

#### METAR 报告术语
| 英文 | 中文 | 说明 |
|------|------|------|
| METAR | 例行天气报告 | 每小时发布 |
| TAF | 航站预报 | 未来24-30小时 |
| CAVOK | 天气良好 | Ceiling And Visibility OK |
| RVR | 跑道视程 | Runway Visual Range |
| QNH | 修正海平面气压 | 高度表设定值 |

#### METAR 读取示例
```
METAR ZBAA 160830Z 27015G25KT 3000 TSRA SCT020 BKN030 25/18 Q1013
```
| 编码 | 含义 |
|------|------|
| ZBAA | 北京首都机场 |
| 160830Z | 16日08:30 UTC |
| 27015G25KT | 风向270度，风速15节，阵风25节 |
| 3000 | 能见度3000米 |
| TSRA | 雷暴伴降水 |
| 25/18 | 温度25°C，露点18°C |
| Q1013 | 气压1013百帕 |

#### 常见天气缩写
| 缩写 | 英文 | 中文 |
|------|------|------|
| RA | Rain | 雨 |
| SN | Snow | 雪 |
| FG | Fog | 雾 |
| HZ | Haze | 霾 |
| TSRA | Thunderstorm with Rain | 雷暴伴雨 |

---

### Module 4：飞行任务（Flight Mission）

#### 导航术语
| 英文 | 中文 | 说明 |
|------|------|------|
| waypoint | 航路点 | 飞行路线上的点 |
| route | 航路 | 飞行路线 |
| heading | 航向 | 飞机指向 |
| altitude | 高度 | 飞行高度 |
| ETA | 预计到达时间 | Estimated Time of Arrival |
| coordinates | 坐标 | 经纬度 |

#### 无人机指令词汇
| 英文 | 中文 | 说明 |
|------|------|------|
| take off | 起飞 | - |
| land | 降落 | - |
| hover | 悬停 | 原地停留 |
| ascend / climb | 上升 | - |
| descend | 下降 | - |
| return to base | 返回基地 | - |
| orbit | 环绕 | 围绕某点旋转 |

#### 任务句型示例
- "Fly to waypoint Alpha." （飞往航路点Alpha。）
- "Climb to 500 feet." （爬升至500英尺。）
- "Hover for 10 seconds." （悬停10秒。）
- "Return to base." （返回基地。）
- "Mission complete." （任务完成。）

#### 无人机操作对话示例
```
Operator: "Drone Alpha, take off to 100 feet."
Drone:    "Taking off, climbing to 100 feet."
Operator: "Fly to waypoint Bravo."
Drone:    "Flying to waypoint Bravo."
Drone:    "Waypoint Bravo reached."
Operator: "Return to base."
Drone:    "Returning to base, ETA 2 minutes."
```

---

### Module 5：紧急情况（Emergency English）

#### 遇险与紧急信号
| 英文 | 中文 | 使用场景 | 优先级 |
|------|------|----------|--------|
| MAYDAY | 遇险 | 生命威胁的紧急情况 | 最高优先 |
| PAN-PAN | 紧急 | 严重但无生命危险 | 次优先 |

#### 紧急情况类型
| 英文 | 中文 | 说明 |
|------|------|------|
| engine failure | 发动机故障 | 单发或双发失效 |
| engine fire | 发动机起火 | - |
| hydraulic failure | 液压系统故障 | 操纵困难 |
| fuel emergency | 燃油紧急 | 燃油不足 |
| depressurization | 失压 | 客舱失压 |
| smoke in cabin | 客舱冒烟 | - |
| landing gear failure | 起落架故障 | - |
| bird strike | 鸟击 | 撞鸟 |
| medical emergency | 医疗紧急情况 | 乘客生病 |

#### 紧急操作词汇
| 英文 | 中文 | 说明 |
|------|------|------|
| abort takeoff | 中止起飞 | 起飞前放弃 |
| go around | 复飞 | 降落中放弃 |
| divert | 备降 | 改降其他机场 |
| emergency landing | 紧急着陆 | - |
| forced landing | 迫降 | 无动力降落 |
| evacuate | 疏散/撤离 | - |

#### MAYDAY 标准呼叫格式
```
MAYDAY, MAYDAY, MAYDAY
[Station called]
[Callsign]
NATURE OF EMERGENCY
INTENTIONS
POSITION, ALTITUDE, HEADING
```

**示例：**
```
Pilot: "MAYDAY, MAYDAY, MAYDAY, Tower, CCA1234, engine failure,
       request immediate landing, runway 27, 2000 feet."
Tower: "CCA1234, roger MAYDAY, cleared to land runway 27,
       emergency services standing by."
```

#### PAN-PAN 示例
```
Pilot: "PAN-PAN, PAN-PAN, PAN-PAN, Tower, CCA1234, low fuel,
       30 minutes remaining, request priority landing."
```

#### 应答机紧急代码
| 代码 | 含义 | 英文 |
|------|------|------|
| 7700 | 紧急情况 | Emergency |
| 7600 | 通信故障 | Communication Failure |
| 7500 | 非法干扰/劫机 | Hijack |

#### 疏散指令
- "Brace for impact!" （做好撞击准备！）
- "Evacuate the aircraft immediately!" （立即撤离飞机！）
- "Leave all luggage behind." （不要携带行李。）
- "Unfasten seatbelt, come this way!" （解开安全带，往这边走！）

---

### 参考资源

- [中国民航局《空中交通无线电通话用语》](https://www.caac.gov.cn/XXGK/XXGK/BZGF/HYBZ/201511/P020170804579259214829.pdf)
- [FAA Radio Communications Phraseology](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_2.html)
- [SKYbrary ATC Vocabulary](https://skybrary.aero/articles/air-traffic-control-atc-vocabulary)
- [ICAO Standard Phraseology Guide](https://skybrary.aero/sites/default/files/bookshelf/115.pdf)
- [Aviation English Vocabulary Guide](https://speakflypass.com/blogs/aviation-english/aviation-english-vocabulary-guide)

---

## 部署

### GitHub Pages

```bash
npm run build
# 将 dist 目录部署到 GitHub Pages
```

### Vercel

1. 连接 GitHub 仓库
2. 自动检测 Vite 项目
3. 一键部署

详细部署方案请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 开发进度

详见 [TODOLIST.md](./TODOLIST.md)

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

- GitHub: https://github.com/LisaPullman/airE
