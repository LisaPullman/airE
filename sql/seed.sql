-- airE 航空英语学习平台 - 种子数据 (精简版)
-- 版本: v2.0
-- 日期: 2026-02-15

-- ============================================
-- 1. 插入课程模块
-- ============================================

INSERT INTO modules (code, name, description, icon, vocab_count, sentence_count, display_order) VALUES
('M1', '飞机认知', '学习飞机各部件的英文名称', '✈️', 6, 3, 1),
('M2', '机场流程', '掌握机场常用英语表达', '🏢', 5, 3, 2),
('M3', '塔台通信', '学习塔台标准通话用语', '📡', 4, 4, 3),
('M4', '航空天气', '了解天气对飞行的影响', '🌤️', 8, 6, 4)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 2. 插入词汇数据
-- ============================================

-- Module 1: 飞机认知
INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'wing', '机翼', 'The wing helps the plane fly.', 1 FROM modules WHERE code = 'M1'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'cockpit', '驾驶舱', 'The pilot sits in the cockpit.', 2 FROM modules WHERE code = 'M1'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'runway', '跑道', 'The plane is on the runway.', 3 FROM modules WHERE code = 'M1'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'engine', '发动机', 'The engine makes the plane fly.', 4 FROM modules WHERE code = 'M1'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'fuselage', '机身', 'The fuselage is the body of the plane.', 5 FROM modules WHERE code = 'M1'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'tail', '尾翼', 'The tail has the rudder.', 6 FROM modules WHERE code = 'M1'
ON CONFLICT DO NOTHING;

-- Module 2: 机场流程
INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'terminal', '航站楼', 'The terminal is very big.', 1 FROM modules WHERE code = 'M2'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'boarding pass', '登机牌', 'Show me your boarding pass.', 2 FROM modules WHERE code = 'M2'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'security', '安检', 'Go through security please.', 3 FROM modules WHERE code = 'M2'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'gate', '登机口', 'What gate is my flight?', 4 FROM modules WHERE code = 'M2'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'luggage', '行李', 'Where can I pick up my luggage?', 5 FROM modules WHERE code = 'M2'
ON CONFLICT DO NOTHING;

-- Module 3: 塔台通信
INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'takeoff', '起飞', 'We are ready for takeoff.', 1 FROM modules WHERE code = 'M3'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'landing', '降落', 'We are requesting landing.', 2 FROM modules WHERE code = 'M3'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'clearance', '许可', 'We have clearance to land.', 3 FROM modules WHERE code = 'M3'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'taxi', '滑行', 'Taxi to runway 24.', 4 FROM modules WHERE code = 'M3'
ON CONFLICT DO NOTHING;

-- Module 4: 航空天气
INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'visibility', '能见度', 'Low visibility on the runway.', 1 FROM modules WHERE code = 'M4'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'turbulence', '颠簸', 'Expect turbulence at 10,000 feet.', 2 FROM modules WHERE code = 'M4'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'thunderstorm', '雷暴', 'Thunderstorms in the area.', 3 FROM modules WHERE code = 'M4'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'wind shear', '风切变', 'Wind shear warning at runway.', 4 FROM modules WHERE code = 'M4'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'ceiling', '云幕高度', 'Ceiling is 500 feet.', 5 FROM modules WHERE code = 'M4'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'crosswind', '侧风', 'Crosswind on final approach.', 6 FROM modules WHERE code = 'M4'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'headwind', '逆风', 'Headwind of 20 knots.', 7 FROM modules WHERE code = 'M4'
ON CONFLICT DO NOTHING;

INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT id, 'tailwind', '顺风', 'Tailwind component is 5 knots.', 8 FROM modules WHERE code = 'M4'
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. 插入句型数据
-- ============================================

-- Module 1 句型
INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT id, 'Where is the gate?', '登机口在哪里？', 1 FROM modules WHERE code = 'M1'
ON CONFLICT DO NOTHING;

INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT id, 'How do I get to the terminal?', '我该怎么去航站楼？', 2 FROM modules WHERE code = 'M1'
ON CONFLICT DO NOTHING;

INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT id, 'I need to check in first.', '我需要先值机。', 3 FROM modules WHERE code = 'M1'
ON CONFLICT DO NOTHING;

-- Module 2 句型
INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT id, 'Can I have a window seat?', '我可以要一个靠窗的座位吗？', 1 FROM modules WHERE code = 'M2'
ON CONFLICT DO NOTHING;

INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT id, 'Where is the security check?', '安检在哪里？', 2 FROM modules WHERE code = 'M2'
ON CONFLICT DO NOTHING;

INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT id, 'What time does the flight board?', '航班什么时候登机？', 3 FROM modules WHERE code = 'M2'
ON CONFLICT DO NOTHING;

-- Module 3 句型
INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT id, 'Ready for takeoff', '准备起飞', 1 FROM modules WHERE code = 'M3'
ON CONFLICT DO NOTHING;

INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT id, 'Request landing', '请求降落', 2 FROM modules WHERE code = 'M3'
ON CONFLICT DO NOTHING;

INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT id, 'Cleared to land', '准许降落', 3 FROM modules WHERE code = 'M3'
ON CONFLICT DO NOTHING;

INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT id, 'Taxi to runway', '滑行至跑道', 4 FROM modules WHERE code = 'M3'
ON CONFLICT DO NOTHING;

-- Module 4 句型
INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT id, 'What is the visibility?', '能见度是多少？', 1 FROM modules WHERE code = 'M4'
ON CONFLICT DO NOTHING;

INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT id, 'Are there any thunderstorms on the route?', '航线上有雷暴吗？', 2 FROM modules WHERE code = 'M4'
ON CONFLICT DO NOTHING;

INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT id, 'Expect turbulence during descent', '下降过程中预计有颠簸', 3 FROM modules WHERE code = 'M4'
ON CONFLICT DO NOTHING;

INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT id, 'Wind is from the west at 15 knots', '风向西，风速15节', 4 FROM modules WHERE code = 'M4'
ON CONFLICT DO NOTHING;

INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT id, 'Ceiling is 800 feet with broken clouds', '云幕高度800英尺，多云', 5 FROM modules WHERE code = 'M4'
ON CONFLICT DO NOTHING;

INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT id, 'Runway visual range is 1000 meters', '跑道视程1000米', 6 FROM modules WHERE code = 'M4'
ON CONFLICT DO NOTHING;
