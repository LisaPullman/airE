# Database Overview

PostgreSQL 16 Database: aire_learning

## Tables Summary

- Total Tables: 8

| Table Name | Fields | Rows |
|------------|--------|------|
| users | 12 | 0 |
| modules | 10 | 5 |
| vocabularies | 9 | 29 |
| sentences | 7 | 20 |
| goals | 11 | 0 |
| questions | 11 | 0 |
| practice_records | 9 | 0 |
| learning_history | 6 | 0 |

## Detailed Table Information

### users
用户表：存储注册用户的个人信息，包括用户名、密码、昵称、头像、等级、经验值等。用于用户认证和管理个人资料。
- 当前数据：0行（无种子数据）

#### Fields:
| column_name | data_type | is_nullable |
|-------------|-----------|-------------|
| id | uuid | NO |
| username | character varying | NO |
| password_hash | character varying | NO |
| nickname | character varying | NO |
| avatar_url | character varying | YES |
| title | character varying | NO |
| level | integer | NO |
| exp | integer | NO |
| streak_days | integer | NO |
| badges | jsonb | NO |
| created_at | timestamp with time zone | NO |
| updated_at | timestamp with time zone | NO |

### modules
课程模块表：定义航空英语学习的各个模块，如基础词汇、气象、通讯等。包含模块名称、描述、词汇和句型数量等信息。
- 当前数据：5行（包含M1-M5五个模块：基础词汇、气象、通讯、紧急情况、导航）

#### Fields:
| column_name | data_type | is_nullable |
|-------------|-----------|-------------|
| id | uuid | NO |
| code | character varying | NO |
| name | character varying | NO |
| description | text | YES |
| icon | character varying | YES |
| vocab_count | integer | NO |
| sentence_count | integer | NO |
| display_order | integer | NO |
| is_active | boolean | NO |
| created_at | timestamp with time zone | NO |

### vocabularies
词汇表：存储各模块的专业航空英语词汇，包括单词、翻译、例句、音频等。支持按模块分组学习。
- 当前数据：29行（分布在5个模块中：M1-6个、M2-5个、M3-4个、M4-8个、M5-6个）

#### Fields:
| column_name | data_type | is_nullable |
|-------------|-----------|-------------|
| id | uuid | NO |
| module_id | uuid | NO |
| word | character varying | NO |
| translation | character varying | NO |
| image_url | character varying | YES |
| audio_url | character varying | YES |
| example_sentence | text | YES |
| display_order | integer | NO |
| created_at | timestamp with time zone | NO |

### sentences
句型表：存储各模块的航空英语句型和表达，包括英文句子、中文翻译、音频等。用于句型学习和练习。
- 当前数据：20行（分布在5个模块中：M1-3个、M2-3个、M3-4个、M4-6个、M5-4个）

#### Fields:
| column_name | data_type | is_nullable |
|-------------|-----------|-------------|
| id | uuid | NO |
| module_id | uuid | NO |
| english | character varying | NO |
| chinese | character varying | NO |
| audio_url | character varying | YES |
| display_order | integer | NO |
| created_at | timestamp with time zone | NO |

### goals
学习目标表：记录用户的学习目标，包括目标名称、所属模块、目标分数、完成状态等。用于跟踪学习进度和成就。
- 当前数据：0行（无种子数据）

#### Fields:
| column_name | data_type | is_nullable |
|-------------|-----------|-------------|
| id | uuid | NO |
| user_id | uuid | NO |
| name | character varying | NO |
| module_id | uuid | YES |
| target_score | integer | NO |
| status | character varying | NO |
| vocab_learned | integer | NO |
| sentences_learned | integer | NO |
| test_score | integer | NO |
| completed_at | timestamp with time zone | YES |
| created_at | timestamp with time zone | NO |

### questions
题库表：存储各模块的练习题目，包括选择题、难度等级、正确答案等。用于在线测试和练习。
- 当前数据：0行（无种子数据）

#### Fields:
| column_name | data_type | is_nullable |
|-------------|-----------|-------------|
| id | uuid | NO |
| module_id | uuid | NO |
| question_text | text | NO |
| options | jsonb | NO |
| correct_answer | text | NO |
| explanation | text | YES |
| difficulty | character varying | NO |
| source_tag | character varying | NO |
| is_active | boolean | NO |
| display_order | integer | NO |
| created_at | timestamp with time zone | NO |

### practice_records
练习记录表：记录用户的练习历史，包括题目ID、用户答案、得分、用时等。用于分析学习效果和生成统计报告。
- 当前数据：0行（无种子数据）

#### Fields:
| column_name | data_type | is_nullable |
|-------------|-----------|-------------|
| id | uuid | NO |
| user_id | uuid | NO |
| question_id | character varying | NO |
| module_id | uuid | NO |
| score | integer | NO |
| user_answer | jsonb | NO |
| is_correct | boolean | NO |
| time_spent | integer | NO |
| created_at | timestamp with time zone | NO |

### learning_history
学习历史表：记录用户的学习活动历史，如学习词汇、完成模块等。用于数据分析和学习轨迹追踪。
- 当前数据：0行（无种子数据）

#### Fields:
| column_name | data_type | is_nullable |
|-------------|-----------|-------------|
| id | uuid | NO |
| user_id | uuid | NO |
| module_id | uuid | YES |
| action_type | character varying | NO |
| action_detail | jsonb | YES |
| created_at | timestamp with time zone | NO |