-- airE 航空英语学习平台 - PostgreSQL 数据库设计
-- 版本: v1.0
-- 日期: 2026-02-15

-- ============================================
-- 1. 用户相关表
-- ============================================

-- 用户表
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户徽章关联表
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_icon VARCHAR(255),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- 用户成就表
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_value JSONB,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. 课程相关表
-- ============================================

-- 课程模块表
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,  -- M1, M2, M3, M4
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 词汇表
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

-- 句型表
CREATE TABLE IF NOT EXISTS sentences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    english VARCHAR(255) NOT NULL,
    chinese VARCHAR(255) NOT NULL,
    audio_url VARCHAR(255),
    scenario VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 题目表
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT CHECK (type IN ('choice', 'fill-blank', 'matching', 'scenario', 'listening')),
    question TEXT NOT NULL,
    options JSONB,  -- ['选项1', '选项2', '选项3', '选项4']
    correct_answer JSONB NOT NULL,  -- 字符串或字符串数组
    audio_url VARCHAR(255),
    explanation TEXT,
    difficulty INT DEFAULT 1,  -- 1-5 难度等级
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. 目标相关表
-- ============================================

-- 学习目标表
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    module_id UUID REFERENCES modules(id),
    target_score INT DEFAULT 80,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 目标进度表
CREATE TABLE IF NOT EXISTS goal_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
    vocab_learned INT DEFAULT 0,
    sentences_learned INT DEFAULT 0,
    test_score INT,
    is_passed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. 学习记录表
-- ============================================

-- 练习记录表
CREATE TABLE IF NOT EXISTS practice_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id),
    module_id UUID REFERENCES modules(id),
    score INT,
    user_answer JSONB,
    is_correct BOOLEAN,
    time_spent INT,  -- 答题耗时（秒）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 学习历史表
CREATE TABLE IF NOT EXISTS learning_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id),
    action_type VARCHAR(50) NOT NULL,  -- 'view_vocab', 'view_sentence', 'practice', 'test'
    action_detail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. 成就配置表
-- ============================================

-- 称号配置表
CREATE TABLE IF NOT EXISTS pilot_titles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level INT UNIQUE NOT NULL,
    name VARCHAR(50) UNIQUE NOT NULL,
    required_exp INT NOT NULL,
    icon VARCHAR(100),
    description TEXT
);

-- 徽章配置表
CREATE TABLE IF NOT EXISTS badge_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    condition_type VARCHAR(50) NOT NULL,
    condition_value JSONB NOT NULL,
    points INT DEFAULT 10
);

-- ============================================
-- 6. 索引优化
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);
CREATE INDEX IF NOT EXISTS idx_vocabularies_module ON vocabularies(module_id);
CREATE INDEX IF NOT EXISTS idx_sentences_module ON sentences(module_id);
CREATE INDEX IF NOT EXISTS idx_questions_module ON questions(module_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_records_user ON practice_records(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_history_user ON learning_history(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_history_created ON learning_history(created_at);

-- ============================================
-- 7. 触发器函数
-- ============================================

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 更新时间触发器
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_goal_progress_updated_at
    BEFORE UPDATE ON goal_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

