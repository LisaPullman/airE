# SQL 目录说明

## 文件结构

```
sql/
├── schema.sql      # 数据库表结构设计
├── seed.sql        # 初始种子数据
└── README.md       # 本说明文件
```

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

## 表结构概览

| 表名 | 说明 |
|-----|------|
| users | 用户表 |
| user_badges | 用户徽章关联 |
| user_achievements | 用户成就 |
| modules | 课程模块 |
| vocabularies | 词汇表 |
| sentences | 句型表 |
| questions | 题目表 |
| goals | 学习目标 |
| goal_progress | 目标进度 |
| practice_records | 练习记录 |
| learning_history | 学习历史 |
| pilot_titles | 称号配置 |
| badge_configs | 徽章配置 |
