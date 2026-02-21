# SQL 目录说明

本目录包含 airE 项目的 PostgreSQL 全量本地方案（Docker + Schema + Seed）。

## 文件结构

```text
sql/
├── docker-compose.yml  # 本地 PostgreSQL 容器编排
├── schema.sql          # 表结构、约束、索引、触发器
├── seed.sql            # 种子数据（可重复执行）
├── .env.example        # 数据库环境变量示例
└── README.md
```

## 当前数据模型

### 核心业务表

- `users` 用户
- `modules` 课程模块
- `vocabularies` 词汇
- `sentences` 句型
- `questions` 题库
- `goals` 学习目标

### 练习与行为表

- `practice_records` 练习记录
- `learning_history` 学习历史

## 快速开始（Docker）

### 1. 启动数据库

```bash
docker compose -f sql/docker-compose.yml up -d
```

首次启动会自动执行：

- `/docker-entrypoint-initdb.d/01-schema.sql`
- `/docker-entrypoint-initdb.d/02-seed.sql`

### 2. 查看状态与日志

```bash
docker compose -f sql/docker-compose.yml ps
docker compose -f sql/docker-compose.yml logs -f postgres
```

### 3. 进入 psql

```bash
docker compose -f sql/docker-compose.yml exec postgres psql -U postgres -d aire_learning
```

### 4. 手动重刷结构和数据

```bash
docker compose -f sql/docker-compose.yml exec -T postgres psql -U postgres -d aire_learning -f /docker-entrypoint-initdb.d/01-schema.sql
docker compose -f sql/docker-compose.yml exec -T postgres psql -U postgres -d aire_learning -f /docker-entrypoint-initdb.d/02-seed.sql
```

### 5. 停止容器

```bash
docker compose -f sql/docker-compose.yml down
```

如果需要连同数据卷一起删除（危险操作）：

```bash
docker compose -f sql/docker-compose.yml down -v
```

## 后端连接配置

后端默认连接串：

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aire_learning
```

可参考 `sql/.env.example`。

## 验证 SQL

启动后可执行：

```sql
\dt
SELECT code, name FROM modules ORDER BY display_order;
SELECT COUNT(*) FROM vocabularies;
SELECT COUNT(*) FROM sentences;
SELECT COUNT(*) FROM questions;
SELECT COUNT(*) FROM practice_records;
```
