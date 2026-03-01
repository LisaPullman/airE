-- 起飞航空 航空英语学习平台 - 种子数据
-- 版本: v3.0
-- 日期: 2026-02-21
-- 特性: 可重复执行 (idempotent upsert)

BEGIN;

-- ============================================
-- 1) 模块数据 (M1-M5)
-- ============================================
INSERT INTO modules (code, name, description, icon, vocab_count, sentence_count, display_order, is_active)
VALUES
('M1', '飞机认知', '学习飞机各部件的英文名称', '✈️', 6, 3, 1, TRUE),
('M2', '机场流程', '掌握机场常用英语表达', '🏢', 5, 3, 2, TRUE),
('M3', '塔台通信', '学习塔台标准通话用语', '📡', 4, 4, 3, TRUE),
('M4', '航空天气', '了解天气对飞行的影响', '🌤️', 8, 6, 4, TRUE),
('M5', '紧急情况', '学习紧急通话与应急处置英语', '🚨', 6, 4, 5, TRUE)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  vocab_count = EXCLUDED.vocab_count,
  sentence_count = EXCLUDED.sentence_count,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- ============================================
-- 2) 词汇数据
-- ============================================
WITH vocab_seed AS (
  SELECT * FROM (VALUES
    ('M1', 'wing', '机翼', 'The wing helps the plane fly.', 1),
    ('M1', 'cockpit', '驾驶舱', 'The pilot sits in the cockpit.', 2),
    ('M1', 'runway', '跑道', 'The plane is on the runway.', 3),
    ('M1', 'engine', '发动机', 'The engine powers the aircraft.', 4),
    ('M1', 'fuselage', '机身', 'The fuselage is the body of the plane.', 5),
    ('M1', 'tail', '尾翼', 'The tail has the rudder.', 6),

    ('M2', 'terminal', '航站楼', 'The terminal is very big.', 1),
    ('M2', 'boarding pass', '登机牌', 'Show me your boarding pass.', 2),
    ('M2', 'security', '安检', 'Go through security please.', 3),
    ('M2', 'gate', '登机口', 'What gate is my flight?', 4),
    ('M2', 'luggage', '行李', 'Where can I pick up my luggage?', 5),

    ('M3', 'takeoff', '起飞', 'We are ready for takeoff.', 1),
    ('M3', 'landing', '降落', 'We are requesting landing.', 2),
    ('M3', 'clearance', '许可', 'We have clearance to land.', 3),
    ('M3', 'taxi', '滑行', 'Taxi to runway 24.', 4),

    ('M4', 'visibility', '能见度', 'Low visibility on the runway.', 1),
    ('M4', 'turbulence', '颠簸', 'Expect turbulence at 10,000 feet.', 2),
    ('M4', 'thunderstorm', '雷暴', 'Thunderstorms in the area.', 3),
    ('M4', 'wind shear', '风切变', 'Wind shear warning at runway.', 4),
    ('M4', 'ceiling', '云幕高度', 'Ceiling is 500 feet.', 5),
    ('M4', 'crosswind', '侧风', 'Crosswind on final approach.', 6),
    ('M4', 'headwind', '逆风', 'Headwind of 20 knots.', 7),
    ('M4', 'tailwind', '顺风', 'Tailwind component is 5 knots.', 8),

    ('M5', 'MAYDAY', '遇险呼叫', 'MAYDAY, MAYDAY, MAYDAY.', 1),
    ('M5', 'PAN-PAN', '紧急呼叫', 'PAN-PAN, PAN-PAN, PAN-PAN.', 2),
    ('M5', 'engine failure', '发动机故障', 'We have an engine failure.', 3),
    ('M5', 'evacuate', '紧急撤离', 'Evacuate the aircraft immediately.', 4),
    ('M5', 'divert', '备降', 'We need to divert to an alternate airport.', 5),
    ('M5', 'go around', '复飞', 'Unable to land, going around.', 6)
  ) AS t(module_code, word, translation, example_sentence, display_order)
)
INSERT INTO vocabularies (module_id, word, translation, example_sentence, display_order)
SELECT m.id, v.word, v.translation, v.example_sentence, v.display_order
FROM vocab_seed v
JOIN modules m ON m.code = v.module_code
ON CONFLICT (module_id, word) DO UPDATE SET
  translation = EXCLUDED.translation,
  example_sentence = EXCLUDED.example_sentence,
  display_order = EXCLUDED.display_order;

-- ============================================
-- 3) 句型数据
-- ============================================
WITH sentence_seed AS (
  SELECT * FROM (VALUES
    ('M1', 'Where is the gate?', '登机口在哪里？', 1),
    ('M1', 'How do I get to the terminal?', '我该怎么去航站楼？', 2),
    ('M1', 'I need to check in first.', '我需要先值机。', 3),

    ('M2', 'Can I have a window seat?', '我可以要一个靠窗的座位吗？', 1),
    ('M2', 'Where is the security check?', '安检在哪里？', 2),
    ('M2', 'What time does the flight board?', '航班什么时候登机？', 3),

    ('M3', 'Ready for takeoff.', '准备起飞。', 1),
    ('M3', 'Request landing clearance.', '请求降落许可。', 2),
    ('M3', 'Cleared to land.', '准许降落。', 3),
    ('M3', 'Taxi to runway.', '滑行至跑道。', 4),

    ('M4', 'What is the visibility?', '能见度是多少？', 1),
    ('M4', 'Are there any thunderstorms on the route?', '航线上有雷暴吗？', 2),
    ('M4', 'Expect turbulence during descent.', '下降过程中预计有颠簸。', 3),
    ('M4', 'Wind is from the west at 15 knots.', '风向西，风速15节。', 4),
    ('M4', 'Ceiling is 800 feet with broken clouds.', '云幕高度800英尺，多云。', 5),
    ('M4', 'Runway visual range is 1000 meters.', '跑道视程1000米。', 6),

    ('M5', 'MAYDAY, MAYDAY, MAYDAY, request immediate landing.', '遇险呼叫，请求立即降落。', 1),
    ('M5', 'PAN-PAN, low fuel, request priority landing.', '紧急呼叫，低油量，请求优先降落。', 2),
    ('M5', 'Emergency services standing by.', '应急救援已待命。', 3),
    ('M5', 'Leave all luggage behind and evacuate immediately.', '请不要携带行李并立即撤离。', 4)
  ) AS t(module_code, english, chinese, display_order)
)
INSERT INTO sentences (module_id, english, chinese, display_order)
SELECT m.id, s.english, s.chinese, s.display_order
FROM sentence_seed s
JOIN modules m ON m.code = s.module_code
ON CONFLICT (module_id, english) DO UPDATE SET
  chinese = EXCLUDED.chinese,
  display_order = EXCLUDED.display_order;

-- ============================================
-- 4) 题库数据
-- ============================================
WITH question_seed AS (
  SELECT * FROM (VALUES
    ('M1', 'What does "runway" mean?', '["跑道","机翼","驾驶舱","螺旋桨"]'::jsonb, '跑道', 'Runway 是飞机起飞和降落的跑道。', 'easy', 'LOCAL_CURRICULUM', 1),
    ('M1', 'Where does the pilot sit?', '["机库","驾驶舱","客舱","货舱"]'::jsonb, '驾驶舱', 'Pilot works in the cockpit.', 'easy', 'LOCAL_CURRICULUM', 2),
    ('M1', 'The engine powers the _____.', '["aircraft","runway","terminal","gate"]'::jsonb, 'aircraft', '发动机为 aircraft 提供动力。', 'easy', 'LOCAL_CURRICULUM', 3),
    ('M1', 'What is the ICAO phonetic word for the letter Q?', '["Quebec","Quick","Quarter","Queen"]'::jsonb, 'Quebec', 'ICAO 字母表中 Q 对应 Quebec。', 'easy', 'ICAO_DOC', 4),
    ('M1', 'What does "fuselage" mean?', '["机翼","机身","尾翼","起落架"]'::jsonb, '机身', 'fuselage 指飞机主体机身。', 'easy', 'LOCAL_CURRICULUM', 5),
    ('M1', 'Which aircraft part is used to steer left or right around the vertical axis?', '["Rudder","Aileron","Flap","Spoiler"]'::jsonb, 'Rudder', 'rudder（方向舵）主要控制偏航。', 'medium', 'LOCAL_CURRICULUM', 6),

    ('M2', 'What is "boarding pass" in Chinese?', '["安检","登机牌","航站楼","值机柜台"]'::jsonb, '登机牌', 'Boarding pass 指登机牌。', 'easy', 'LOCAL_CURRICULUM', 1),
    ('M2', 'Passengers wait at the ____ before boarding.', '["runway","hangar","gate","tower"]'::jsonb, 'gate', '登机前通常在 gate 等候。', 'easy', 'LOCAL_CURRICULUM', 2),
    ('M2', '“Where is baggage claim?” means:', '["登机口在哪里？","行李提取处在哪里？","安检在哪里？","塔台在哪里？"]'::jsonb, '行李提取处在哪里？', 'baggage claim 即行李提取处。', 'easy', 'LOCAL_CURRICULUM', 3),
    ('M2', 'Where do passengers usually go right before boarding?', '["Runway","Gate","Control tower","Hangar"]'::jsonb, 'Gate', '登机前旅客在登机口等待。', 'easy', 'LOCAL_CURRICULUM', 4),
    ('M2', 'Which phrase is used when you need ATC to repeat a transmission?', '["Say again","Standby","Affirm","Maintain"]'::jsonb, 'Say again', '“Say again”用于请求重复上一条信息。', 'easy', 'LOCAL_CURRICULUM', 5),

    ('M3', 'Request landing _____.', '["gate","clearance","weather","fuel"]'::jsonb, 'clearance', '标准说法是 request landing clearance。', 'easy', 'LOCAL_CURRICULUM', 1),
    ('M3', '“Maintain heading 090.” means:', '["保持高度 9000","保持速度 90","保持航向 090","向右转 90 度"]'::jsonb, '保持航向 090', 'heading 是航向。', 'medium', 'LOCAL_CURRICULUM', 2),
    ('M3', 'What does "takeoff" mean?', '["滑行","复飞","起飞","着陆"]'::jsonb, '起飞', 'takeoff 即起飞。', 'easy', 'LOCAL_CURRICULUM', 3),
    ('M3', 'In standard ATC phraseology, "Roger" means:', '["Yes","No","I have received all of your last transmission","I will comply with your instruction"]'::jsonb, 'I have received all of your last transmission', 'FAA PCG: Roger 仅表示“收到”，不用于回答是/否。', 'medium', 'FAA_PCG', 4),
    ('M3', 'In standard ATC phraseology, "Wilco" means:', '["Wait for my call","I have received your message, understand it, and will comply","Repeat your message","Unable to comply"]'::jsonb, 'I have received your message, understand it, and will comply', 'FAA PCG: Wilco = will comply。', 'medium', 'FAA_PCG', 5),
    ('M3', 'In FAA glossary, "Affirmative" means:', '["Stand by","Maybe","Yes","Message received"]'::jsonb, 'Yes', 'FAA PCG: Affirmative = Yes。', 'easy', 'FAA_PCG', 6),
    ('M3', 'ATC says "line up and wait runway 27". What should the pilot do?', '["Taxi back to gate","Enter runway 27 and wait for takeoff clearance","Take off immediately","Hold short of runway 27"]'::jsonb, 'Enter runway 27 and wait for takeoff clearance', '进入跑道等待，不等同于起飞许可。', 'medium', 'FAA_PCG', 7),
    ('M3', 'Which phrase asks ATC to repeat because communication is difficult?', '["Negative","Words twice","Maintain","Expedite"]'::jsonb, 'Words twice', 'FAA PCG: “Words twice”用于请求每句话说两遍。', 'hard', 'FAA_PCG', 8),
    ('M3', 'In standard phraseology, what does "Stand by" mean?', '["I cannot hear you","Wait and I will call you back","Cleared to proceed","Say again all after"]'::jsonb, 'Wait and I will call you back', 'Stand by 用于要求对方等待，稍后回复。', 'medium', 'FAA_PCG', 9),
    ('M3', 'Which phrase is used to request repetition of all after a specific word?', '["Read back","All before","Say again all after","Wilco"]'::jsonb, 'Say again all after', '用于请求从某一词之后全部重说。', 'hard', 'FAA_PCG', 10),

    ('M4', 'What is "visibility" in aviation?', '["能见度","高度","速度","温度"]'::jsonb, '能见度', 'Visibility 指能看多远。', 'easy', 'LOCAL_CURRICULUM', 1),
    ('M4', 'Which one is dangerous weather?', '["headwind","thunderstorm","clear sky","tailwind"]'::jsonb, 'thunderstorm', '雷暴是典型危险天气。', 'medium', 'LOCAL_CURRICULUM', 2),
    ('M4', '“Runway visual range” refers to:', '["发动机推力","跑道视程","塔台高度","风切变强度"]'::jsonb, '跑道视程', 'Runway visual range 即 RVR。', 'medium', 'LOCAL_CURRICULUM', 3),
    ('M4', 'What should pilots avoid during thunderstorms?', '["Cloud flying","Direct flight path","Turbulence zones","Night flying"]'::jsonb, 'Turbulence zones', '雷暴常伴随强颠簸，应避免进入颠簸区域。', 'medium', 'LOCAL_CURRICULUM', 4),
    ('M4', '"Ceiling" in aviation weather refers to:', '["Cloud height","Building height","Mountain height","Runway length"]'::jsonb, 'Cloud height', 'Ceiling 指最低云层高度。', 'easy', 'LOCAL_CURRICULUM', 5),
    ('M4', 'What is "crosswind"?', '["Wind from behind","Wind from side","Wind from front","No wind"]'::jsonb, 'Wind from side', 'crosswind 指来自侧面的风。', 'easy', 'LOCAL_CURRICULUM', 6),
    ('M4', 'If you hear "expect turbulence", you should:', '["Turn off seatbelt sign","Fasten your seatbelt","Open cabin door","Stand up"]'::jsonb, 'Fasten your seatbelt', '预计颠簸时应系紧安全带。', 'easy', 'LOCAL_CURRICULUM', 7),
    ('M4', 'In METAR, what does TEMPO indicate?', '["Permanent change","Temporary change","No change","Forecast canceled"]'::jsonb, 'Temporary change', 'TEMPO 表示短时变化。', 'medium', 'AVWX_DATA', 8),
    ('M4', 'What does CAVOK stand for?', '["Cloud And Visibility Overcast","Ceiling And Visibility OK","Calm Air Visibility OK","Cloud Above Visual OK"]'::jsonb, 'Ceiling And Visibility OK', 'CAVOK 表示云底高和能见度满足良好条件。', 'medium', 'AVWX_DATA', 9),
    ('M4', 'In METAR code 27015G25KT, what does G25 mean?', '["Wind 25 degrees","Gusting to 25 knots","Ground speed 25 knots","Temperature 25C"]'::jsonb, 'Gusting to 25 knots', 'G 后数字表示阵风峰值速度。', 'medium', 'AVWX_DATA', 10),
    ('M4', 'Which statement best describes METAR?', '["Airport forecast for tomorrow","Observed weather report for an aerodrome","Upper-air turbulence warning","Runway maintenance notice"]'::jsonb, 'Observed weather report for an aerodrome', 'METAR 是机场例行实况天气报告。', 'medium', 'AVWX_DATA', 11),
    ('M4', 'Scheduled TAF issuance times are typically:', '["Every 3 hours at 0300/0900/1500/2100Z","Every 6 hours at 0000/0600/1200/1800Z","Only once daily at 1200Z","Every hour on the hour"]'::jsonb, 'Every 6 hours at 0000/0600/1200/1800Z', '常规 TAF 一般每 6 小时发布一次。', 'hard', 'AVWX_DATA', 12),
    ('M4', 'In METAR, what does BKN030 indicate?', '["Broken cloud base at 3000 feet","Visibility 3000 meters","Wind 030 at 30 knots","Temperature 30C"]'::jsonb, 'Broken cloud base at 3000 feet', 'BKN030 表示 3000 英尺多云（broken）。', 'medium', 'AVWX_DATA', 13),
    ('M4', 'Which METAR weather code means fog?', '["BR","FG","HZ","RA"]'::jsonb, 'FG', 'FG 表示雾（fog）。', 'easy', 'AVWX_DATA', 14),

    ('M5', 'Which call has highest emergency priority?', '["Standby","PAN-PAN","MAYDAY","Wilco"]'::jsonb, 'MAYDAY', 'MAYDAY 用于生命危险场景。', 'easy', 'SKYBRARY_EMG', 1),
    ('M5', 'What does "evacuate" mean?', '["紧急撤离","继续滑行","等待许可","保持高度"]'::jsonb, '紧急撤离', 'evacuate 表示紧急疏散/撤离。', 'easy', 'LOCAL_CURRICULUM', 2),
    ('M5', 'Emergency transponder code is:', '["7500","7600","7700","7000"]'::jsonb, '7700', '7700 是通用紧急代码。', 'medium', 'ICAO_DOC', 3),
    ('M5', 'What does MAYDAY indicate?', '["Routine request","Urgency without immediate danger","Distress requiring immediate assistance","Weather report request"]'::jsonb, 'Distress requiring immediate assistance', 'MAYDAY 表示严重且迫切危险，需要立即援助。', 'medium', 'SKYBRARY_EMG', 4),
    ('M5', 'What does PAN-PAN indicate?', '["Distress requiring immediate assistance","Urgency message not requiring immediate assistance","Communication test","Runway inspection request"]'::jsonb, 'Urgency message not requiring immediate assistance', 'PAN-PAN 是紧急但非立即危及生命的情况。', 'medium', 'SKYBRARY_EMG', 5),
    ('M5', 'Which transponder code indicates communication failure?', '["7500","7600","7700","7000"]'::jsonb, '7600', '7600 表示通信故障。', 'easy', 'ICAO_DOC', 6),
    ('M5', 'Which transponder code is associated with unlawful interference/hijack?', '["7500","7600","7700","1200"]'::jsonb, '7500', '7500 用于非法干扰/劫机。', 'easy', 'ICAO_DOC', 7),
    ('M5', 'Which call should be used for a serious medical issue without immediate aircraft control loss?', '["MAYDAY","PAN-PAN","ROGER","STANDBY"]'::jsonb, 'PAN-PAN', '医疗紧急通常使用 PAN-PAN。', 'medium', 'ICAO_DOC', 8),
    ('M5', 'Which transponder code should be selected for unlawful interference?', '["7000","7600","7700","7500"]'::jsonb, '7500', '非法干扰/劫机代码为 7500。', 'easy', 'ICAO_DOC', 9)
  ) AS t(module_code, question_text, options, correct_answer, explanation, difficulty, source_tag, display_order)
)
INSERT INTO questions (module_id, question_text, options, correct_answer, explanation, difficulty, source_tag, display_order)
SELECT m.id, q.question_text, q.options, q.correct_answer, q.explanation, q.difficulty, q.source_tag, q.display_order
FROM question_seed q
JOIN modules m ON m.code = q.module_code
ON CONFLICT (module_id, question_text) DO UPDATE SET
  options = EXCLUDED.options,
  correct_answer = EXCLUDED.correct_answer,
  explanation = EXCLUDED.explanation,
  difficulty = EXCLUDED.difficulty,
  source_tag = EXCLUDED.source_tag,
  display_order = EXCLUDED.display_order;

-- ============================================
-- 5) 演示用户 (便于本地联调)
-- 密码 hash 仅用于占位，不用于生产
-- ============================================
INSERT INTO users (username, password_hash, nickname, level, exp, streak_days)
VALUES
('demo_student', '$2a$10$Qx0j.8xJ2D7m9W8bq8x9UuM0xk8Z9kcvxA2A8xQ.8yN8uCwQ3Q9k2', '演示学员', 1, 120, 2)
ON CONFLICT (username) DO UPDATE SET
  nickname = EXCLUDED.nickname,
  level = EXCLUDED.level,
  exp = EXCLUDED.exp,
  streak_days = EXCLUDED.streak_days;

COMMIT;
