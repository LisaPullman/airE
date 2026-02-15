# SQL 目录说明

## 文件结构

```
sql/
├── schema.sql      # 数据库表结构设计 (精简版 5张核心表)
├── seed.sql        # 初始种子数据
└── README.md       # 本说明文件
```

## 核心表 (5张)

| 表名 | 说明 | 核心字段 |
|-----|------|---------|
| **users** | 用户表 | username, nickname, level, exp, badges(jsonb) |
| **modules** | 课程模块 | code, name, description, vocab_count, sentence_count |
| **vocabularies** | 词汇表 | word, translation, example_sentence |
| **sentences** | 句型表 | english, chinese |
| **goals** | 学习目标 | user_id, name, target_score, status, progress |

## 后续可添加的表

| 表名 | 用途 | 添加时机 |
|-----|------|---------|
| questions | 测验题目库 | 练习功能扩展 |
| practice_records | 练习记录 | 用户数据分析 |
| learning_history | 学习历史 | 详细进度追踪 |
| pilot_titles | 称号配置 | 前端配置即可 |
| badge_configs | 徽章配置 | 前端配置即可 |

## 使用方法

### 1. 创建数据库

```sql
-- 连接到 PostgreSQL
psql -U postgres

-- 创建数据库
CREATE DATABASE aire_learning;
\c aire_learning
```

### 2. 执行 Schema

```bash
psql -U postgres -d aire_learning -f schema.sql
```

### 3. 导入种子数据

```bash
psql -U postgres -d aire_learning -f seed.sql
```

### 4. 使用 psql 命令行

```bash
# 查看所有表
\dt

# 查看表结构
\d users

# 查看数据
SELECT * FROM modules;
```

## 数据库配置

在 `.env` 文件中配置数据库连接：

```env
DATABASE_URL=postgresql://username:password@localhost:5432/aire_learning
```

## 设计原则

- **核心优先**: 只保留当前必要的表
- **灵活扩展**: JSONB 字段支持灵活存储
- **避免过度**: 后续按需添加，不提前设计
