# airE 部署方案分析

## 当前架构

```
前端 (React) → PostgreSQL 数据库
```

**问题**: GitHub Pages/Vercel 是静态托管，不能运行数据库服务。

---

## 免费部署方案

### 方案一：纯前端 + LocalStorage (推荐当前使用)

**适用场景**: 开发测试、小规模使用

**部署平台**:
- ✅ GitHub Pages (完全免费)
- ✅ Vercel (免费层足够)

**数据存储**:
- 用户数据 → localStorage (浏览器本地)
- 无需数据库服务器
- 数据随浏览器清除

**优点**:
- 完全免费
- 部署简单
- 无需后端服务

**缺点**:
- 数据不跨设备同步
- 浏览器清除后数据丢失

**当前状态**: ✅ 已经在用

---

### 方案二：Vercel + Vercel Postgres

**适用场景**: 需要持久化数据

**成本**:
- Vercel 前端: 免费
- Vercel Postgres: 有限免费额度

**配置**:
```bash
# 1. 安装 Vercel Postgres
npm i @vercel/postgres

# 2. 环境变量
DATABASE_URL=postgresql://...
```

**优点**:
- 官方集成
- 自动扩展
- 免费额度足够小项目

**缺点**:
- 免费额度有限 (存储 256MB)
- 需要信用卡验证

---

### 方案三：Supabase (推荐)

**适用场景**: 需要完整数据库 + 前端托管

**成本**:
- 免费层: 500MB 数据库 + 无限 API 请求
- 前端托管: 免费

**配置**:
```bash
# Supabase 提供:
# 1. PostgreSQL 数据库
# 2. RESTful API 自动生成
# 3. 实时订阅
# 4. 认证系统

DATABASE_URL=postgresql://user:password@host:5432/db
```

**优点**:
- 免费额度充足
- 完整后端即服务
- 自动生成 API

**缺点**:
- 需要配置 API 层
- 学习成本略高

---

### 方案四：Railway / Render

**适用场景**: 需要完整 VPS

**成本**:
- Railway: $5/月起 (有免费试用)
- Render: 免费层有限

**优点**:
- 完整 Linux 环境
- 可部署 Node.js 后端

**缺点**:
- 复杂
- 免费层不稳定

---

## 推荐方案 (按阶段)

### 开发测试阶段
**使用**: LocalStorage (当前方案)
- 零成本
- 快速迭代
- 演示足够

### 小规模使用
**使用**: Supabase 免费层
- 500MB 数据库
- 足够 100+ 用户

### 正式上线
**使用**: Vercel + Vercel Postgres
- 自动扩展
- 官方支持

---

## Supabase 快速开始

### 1. 注册 Supabase
https://supabase.com

### 2. 创建项目
- 获取 DATABASE_URL
- 获取 ANON_KEY

### 3. 配置环境变量
```env
DATABASE_URL=postgresql://user:password@host:5432/db
```

### 4. 修改代码
```typescript
// 使用 Supabase 客户端
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
)
```

---

## 本地开发数据库

### 使用 Docker (推荐)
```bash
# 启动 PostgreSQL
docker run --name aire-db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15

# 连接
psql -h localhost -U postgres
```

### 使用 Supabase 本地 CLI
```bash
# 安装 CLI
npm i -g supabase

# 启动本地
supabase start
```

---

## 总结

| 方案 | 成本 | 数据持久化 | 推荐度 |
|-----|------|-----------|-------|
| GitHub Pages + LocalStorage | 免费 | ❌ | ⭐⭐⭐⭐⭐ 当前使用 |
| Vercel + Vercel Postgres | 免费层 | ✅ | ⭐⭐⭐⭐ |
| Supabase | 免费层 500MB | ✅ | ⭐⭐⭐⭐⭐ 推荐 |
| Railway | $5/月 | ✅ | ⭐⭐⭐ |

**当前建议**: 继续使用 LocalStorage 方案，直到需要跨设备同步数据。
