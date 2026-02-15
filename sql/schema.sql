-- airE 航空英语学习平台 - PostgreSQL 数据库设计 (精简版)
-- 版本: v2.0
-- 日期: 2026-02-15
-- 核心表: 5张

-- ============================================
-- 1. 用户表 (核心)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(255),
    title VARCHAR(50) DEFAULT '新手飞行员',
    level INT DEFAULT 1,
    exp INT DEFAULT 0,
    streak_days INT DEFAULT 0,
    badges JSONB DEFAULT '[]',  -- 徽章数组
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. 课程模块表 (核心)
-- ============================================

CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,  -- M1, M2, M3, M4
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    vocab_count INT DEFAULT 0,
    sentence_count INT DEFAULT 0,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. 词汇表 (核心)
-- ============================================

CREATE TABLE IF NOT EXISTS vocabularies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    word VARCHAR(100) NOT NULL,
    translation VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    audio_url VARCHAR(255),
    example_sentence TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. 句型表 (核心)
-- ============================================

CREATE TABLE IF NOT EXISTS sentences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    english VARCHAR(255) NOT NULL,
    chinese VARCHAR(255) NOT NULL,
    audio_url VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. 学习目标表 (核心)
-- ============================================

CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    module_id UUID REFERENCES modules(id),
    target_score INT DEFAULT 80,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    vocab_learned INT DEFAULT 0,
    sentences_learned INT DEFAULT 0,
    test_score INT DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);
CREATE INDEX IF NOT EXISTS idx_vocabularies_module ON vocabularies(module_id);
CREATE INDEX IF NOT EXISTS idx_sentences_module ON sentences(module_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);

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

CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
