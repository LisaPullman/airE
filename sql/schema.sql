-- airE 航空英语学习平台 - PostgreSQL 数据库设计
-- 版本: v3.0
-- 日期: 2026-02-21
-- 目标: 支持后端现有服务 + 可重复初始化 + 查询性能优化

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- 1. 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(255),
    title VARCHAR(50) NOT NULL DEFAULT '新手飞行员',
    level INT NOT NULL DEFAULT 1 CHECK (level > 0),
    exp INT NOT NULL DEFAULT 0 CHECK (exp >= 0),
    streak_days INT NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
    badges JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. 课程模块表
-- ============================================
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    vocab_count INT NOT NULL DEFAULT 0 CHECK (vocab_count >= 0),
    sentence_count INT NOT NULL DEFAULT 0 CHECK (sentence_count >= 0),
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. 词汇表
-- ============================================
CREATE TABLE IF NOT EXISTS vocabularies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    word VARCHAR(100) NOT NULL,
    translation VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    audio_url VARCHAR(255),
    example_sentence TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_vocab_module_word UNIQUE (module_id, word)
);

-- ============================================
-- 4. 句型表
-- ============================================
CREATE TABLE IF NOT EXISTS sentences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    english VARCHAR(255) NOT NULL,
    chinese VARCHAR(255) NOT NULL,
    audio_url VARCHAR(255),
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sentence_module_english UNIQUE (module_id, english)
);

-- ============================================
-- 5. 学习目标表
-- ============================================
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    module_id UUID REFERENCES modules(id),
    target_score INT NOT NULL DEFAULT 80 CHECK (target_score BETWEEN 0 AND 100),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    vocab_learned INT NOT NULL DEFAULT 0 CHECK (vocab_learned >= 0),
    sentences_learned INT NOT NULL DEFAULT 0 CHECK (sentences_learned >= 0),
    test_score INT NOT NULL DEFAULT 0 CHECK (test_score BETWEEN 0 AND 100),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 6. 题库表
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    source_tag VARCHAR(50) NOT NULL DEFAULT 'LOCAL_CURRICULUM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_question_module_text UNIQUE (module_id, question_text)
);

ALTER TABLE questions
ADD COLUMN IF NOT EXISTS source_tag VARCHAR(50) NOT NULL DEFAULT 'LOCAL_CURRICULUM';

UPDATE questions
SET source_tag = 'LOCAL_CURRICULUM'
WHERE source_tag IS NULL OR source_tag = '';

-- ============================================
-- 7. 练习记录表
-- ============================================
CREATE TABLE IF NOT EXISTS practice_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id VARCHAR(64) NOT NULL,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    score INT NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    user_answer JSONB NOT NULL DEFAULT 'null'::jsonb,
    is_correct BOOLEAN NOT NULL,
    time_spent INT NOT NULL DEFAULT 0 CHECK (time_spent >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 8. 学习历史表
-- ============================================
CREATE TABLE IF NOT EXISTS learning_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL,
    action_detail JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 索引优化
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);
CREATE INDEX IF NOT EXISTS idx_modules_active_order ON modules(is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_vocabularies_module_order ON vocabularies(module_id, display_order);
CREATE INDEX IF NOT EXISTS idx_sentences_module_order ON sentences(module_id, display_order);
CREATE INDEX IF NOT EXISTS idx_questions_module_active ON questions(module_id, is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_questions_source_tag ON questions(source_tag);

CREATE INDEX IF NOT EXISTS idx_goals_user_status_created ON goals(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_module ON goals(module_id);

CREATE INDEX IF NOT EXISTS idx_practice_user_created ON practice_records(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_practice_user_module_created ON practice_records(user_id, module_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_practice_user_correct ON practice_records(user_id, is_correct);

CREATE INDEX IF NOT EXISTS idx_history_user_created ON learning_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_module_created ON learning_history(module_id, created_at DESC);

-- ============================================
-- 触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

COMMIT;
