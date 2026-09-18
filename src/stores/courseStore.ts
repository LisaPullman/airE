import { create } from 'zustand'
import type { Module } from '../types'
import { fetchFullModules } from '../lib/api'

interface CourseState {
  modules: Module[]
  currentModule: Module | null
  /** 是否已成功从后端加载课程数据(失败时静默使用下方内置数据) */
  loadedFromServer: boolean
  setModules: (modules: Module[]) => void
  setCurrentModule: (module: Module | null) => void
  loadFromServer: () => Promise<void>
  getModuleById: (id: string) => Module | undefined
  getFullModule: (id: string) => Module | undefined
}

const mockModules: Module[] = [
  {
    id: 'M1',
    name: '飞机认知',
    description: '学习飞机各部件的英文名称',
    order: 1,
    icon: '✈️',
    vocabularies: [
      { id: 'V1', moduleId: 'M1', word: 'wing', translation: '机翼', exampleSentence: 'The wing helps the plane fly.' },
      { id: 'V2', moduleId: 'M1', word: 'cockpit', translation: '驾驶舱', exampleSentence: 'The pilot sits in the cockpit.' },
      { id: 'V3', moduleId: 'M1', word: 'runway', translation: '跑道', exampleSentence: 'The plane is on the runway.' },
      { id: 'V4', moduleId: 'M1', word: 'engine', translation: '发动机', exampleSentence: 'The engine powers the aircraft.' },
      { id: 'V11', moduleId: 'M1', word: 'propeller', translation: '螺旋桨', exampleSentence: 'The propeller spins very fast.' },
      { id: 'V12', moduleId: 'M1', word: 'fuselage', translation: '机身', exampleSentence: 'The fuselage is the body of the plane.' },
      { id: 'V13', moduleId: 'M1', word: 'tail', translation: '尾翼', exampleSentence: 'The tail has the rudder.' },
    ],
    sentences: [
      { id: 'S1', moduleId: 'M1', english: 'Where is the gate?', chinese: '登机口在哪里？' },
      { id: 'S2', moduleId: 'M1', english: 'How do I get to the terminal?', chinese: '我该怎么去航站楼？' },
      { id: 'S3', moduleId: 'M1', english: 'Please fasten your seatbelt.', chinese: '请系好安全带。' },
      { id: 'S10', moduleId: 'M1', english: 'I need to check in first.', chinese: '我需要先值机。' },
      { id: 'S11', moduleId: 'M1', english: 'The plane is taking off now.', chinese: '飞机正在起飞。' },
      { id: 'S12', moduleId: 'M1', english: 'I want to be a pilot.', chinese: '我想成为一名飞行员。' },
    ],
  },
  {
    id: 'M2',
    name: '机场流程',
    description: '掌握机场常用英语表达',
    order: 2,
    icon: '🏢',
    vocabularies: [
      { id: 'V5', moduleId: 'M2', word: 'terminal', translation: '航站楼', exampleSentence: 'The terminal is very busy.' },
      { id: 'V6', moduleId: 'M2', word: 'boarding pass', translation: '登机牌', exampleSentence: 'Please show your boarding pass.' },
      { id: 'V7', moduleId: 'M2', word: 'security', translation: '安检', exampleSentence: 'Go through security please.' },
      { id: 'V14', moduleId: 'M2', word: 'passport', translation: '护照', exampleSentence: 'Show your passport at the counter.' },
      { id: 'V15', moduleId: 'M2', word: 'gate', translation: '登机口', exampleSentence: 'What gate is my flight?' },
      { id: 'V16', moduleId: 'M2', word: 'luggage', translation: '行李', exampleSentence: 'Where can I pick up my luggage?' },
    ],
    sentences: [
      { id: 'S4', moduleId: 'M2', english: 'Can I have a window seat?', chinese: '我可以要一个靠窗的座位吗？' },
      { id: 'S5', moduleId: 'M2', english: 'What time does boarding start?', chinese: '什么时候开始登机？' },
      { id: 'S6', moduleId: 'M2', english: 'Where is baggage claim?', chinese: '行李提取处在哪里？' },
      { id: 'S13', moduleId: 'M2', english: 'Where is the security check?', chinese: '安检在哪里？' },
      { id: 'S14', moduleId: 'M2', english: 'Here is my passport.', chinese: '这是我的护照。' },
      { id: 'S15', moduleId: 'M2', english: 'Where is the check-in counter?', chinese: '值机柜台在哪里？' },
    ],
  },
  {
    id: 'M3',
    name: '塔台通信',
    description: '学习塔台标准通话用语',
    order: 3,
    icon: '📡',
    vocabularies: [
      { id: 'V8', moduleId: 'M3', word: 'takeoff', translation: '起飞', exampleSentence: 'Ready for takeoff.' },
      { id: 'V9', moduleId: 'M3', word: 'landing', translation: '降落', exampleSentence: 'Request landing clearance.' },
      { id: 'V10', moduleId: 'M3', word: 'clearance', translation: '许可', exampleSentence: 'Clearance granted.' },
      { id: 'V17', moduleId: 'M3', word: 'roger', translation: '收到', exampleSentence: 'Roger, turning right.' },
      { id: 'V18', moduleId: 'M3', word: 'altitude', translation: '高度', exampleSentence: 'Maintain altitude 5,000 feet.' },
      { id: 'V19', moduleId: 'M3', word: 'taxi', translation: '滑行', exampleSentence: 'Taxi to runway two four.' },
    ],
    sentences: [
      { id: 'S7', moduleId: 'M3', english: 'Ready for takeoff.', chinese: '准备起飞。' },
      { id: 'S8', moduleId: 'M3', english: 'Request landing clearance.', chinese: '请求降落许可。' },
      { id: 'S9', moduleId: 'M3', english: 'Maintain heading 090.', chinese: '保持航向090。' },
      { id: 'S16', moduleId: 'M3', english: 'Cleared to land.', chinese: '准许降落。' },
      { id: 'S17', moduleId: 'M3', english: 'Roger that, tower.', chinese: '收到，塔台。' },
      { id: 'S18', moduleId: 'M3', english: 'Climb and maintain 5,000 feet.', chinese: '上升到5000英尺并保持。' },
    ],
  },
  {
    id: 'M4',
    name: '航空天气',
    description: '了解天气对飞行的影响',
    order: 4,
    icon: '🌤️',
    vocabularies: [
      { id: 'VW1', moduleId: 'M4', word: 'visibility', translation: '能见度', exampleSentence: 'Low visibility on the runway.' },
      { id: 'VW2', moduleId: 'M4', word: 'turbulence', translation: '颠簸', exampleSentence: 'Expect turbulence at 10,000 feet.' },
      { id: 'VW3', moduleId: 'M4', word: 'thunderstorm', translation: '雷暴', exampleSentence: 'Thunderstorms in the area.' },
      { id: 'VW4', moduleId: 'M4', word: 'wind shear', translation: '风切变', exampleSentence: 'Wind shear warning at runway.' },
      { id: 'VW5', moduleId: 'M4', word: 'ceiling', translation: '云幕高度', exampleSentence: 'Ceiling is 500 feet.' },
      { id: 'VW6', moduleId: 'M4', word: 'crosswind', translation: '侧风', exampleSentence: 'Crosswind on final approach.' },
      { id: 'VW7', moduleId: 'M4', word: 'headwind', translation: '逆风', exampleSentence: 'Headwind of 20 knots.' },
      { id: 'VW8', moduleId: 'M4', word: 'tailwind', translation: '顺风', exampleSentence: 'Tailwind component is 5 knots.' },
      { id: 'VW9', moduleId: 'M4', word: 'fog', translation: '大雾', exampleSentence: 'There is heavy fog this morning.' },
      { id: 'VW10', moduleId: 'M4', word: 'icing', translation: '结冰', exampleSentence: 'Watch out for icing on the wings.' },
    ],
    sentences: [
      { id: 'SW1', moduleId: 'M4', english: 'What is the visibility?', chinese: '能见度是多少？' },
      { id: 'SW2', moduleId: 'M4', english: 'Are there thunderstorms on the route?', chinese: '航线上有雷暴吗？' },
      { id: 'SW3', moduleId: 'M4', english: 'Expect turbulence during descent.', chinese: '下降过程中预计有颠簸。' },
      { id: 'SW4', moduleId: 'M4', english: 'Wind is from the west at 15 knots.', chinese: '风向西，风速15节。' },
      { id: 'SW5', moduleId: 'M4', english: 'Ceiling is 800 feet.', chinese: '云幕高度800英尺。' },
      { id: 'SW6', moduleId: 'M4', english: 'Runway visual range is 1000 meters.', chinese: '跑道视程1000米。' },
      { id: 'SW7', moduleId: 'M4', english: 'Is the weather good for flying today?', chinese: '今天天气适合飞行吗？' },
      { id: 'SW8', moduleId: 'M4', english: 'Fog is clearing on the runway.', chinese: '跑道上的雾正在消散。' },
    ],
  },
  {
    id: 'M5',
    name: '紧急情况',
    description: '学习紧急通话与应急处置英语',
    order: 5,
    icon: '🚨',
    vocabularies: [
      { id: 'VE1', moduleId: 'M5', word: 'MAYDAY', translation: '遇险呼叫', exampleSentence: 'MAYDAY, MAYDAY, MAYDAY.' },
      { id: 'VE2', moduleId: 'M5', word: 'PAN-PAN', translation: '紧急呼叫', exampleSentence: 'PAN-PAN, low fuel, request priority.' },
      { id: 'VE3', moduleId: 'M5', word: 'engine failure', translation: '发动机故障', exampleSentence: 'We have an engine failure.' },
      { id: 'VE4', moduleId: 'M5', word: 'evacuate', translation: '紧急撤离', exampleSentence: 'Evacuate the aircraft immediately.' },
      { id: 'VE5', moduleId: 'M5', word: 'divert', translation: '备降', exampleSentence: 'We need to divert to an alternate airport.' },
      { id: 'VE6', moduleId: 'M5', word: 'go around', translation: '复飞', exampleSentence: 'Unable to land, going around.' },
      { id: 'VE7', moduleId: 'M5', word: 'oxygen mask', translation: '氧气面罩', exampleSentence: 'Put on your oxygen mask first.' },
      { id: 'VE8', moduleId: 'M5', word: 'life vest', translation: '救生衣', exampleSentence: 'Inflate your life vest after leaving the plane.' },
    ],
    sentences: [
      { id: 'SE1', moduleId: 'M5', english: 'Request immediate landing.', chinese: '请求立即降落。' },
      { id: 'SE2', moduleId: 'M5', english: 'Emergency services standing by.', chinese: '应急救援已待命。' },
      { id: 'SE3', moduleId: 'M5', english: 'Leave all luggage behind.', chinese: '请不要携带行李。' },
      { id: 'SE4', moduleId: 'M5', english: 'Squawk seven seven zero zero.', chinese: '应答机设为7700。' },
      { id: 'SE5', moduleId: 'M5', english: 'Put on your oxygen mask.', chinese: '戴上你的氧气面罩。' },
      { id: 'SE6', moduleId: 'M5', english: 'Remain calm and follow the crew.', chinese: '保持冷静，听从机组指挥。' },
      { id: 'SE7', moduleId: 'M5', english: 'We are making an emergency landing.', chinese: '我们正在紧急降落。' },
    ],
  },
]

export const useCourseStore = create<CourseState>()((set, get) => ({
  modules: mockModules,
  currentModule: null,
  loadedFromServer: false,
  setModules: (modules) => set({ modules }),
  setCurrentModule: (module) => set({ currentModule: module }),
  loadFromServer: async () => {
    if (get().loadedFromServer) return
    try {
      // 后端可用时以数据库为准;不可用时保持内置数据(纯静态部署仍可学习)
      const modules = await fetchFullModules()
      if (modules.length > 0) {
        set({ modules, loadedFromServer: true })
      }
    } catch {
      // 静默失败,继续使用内置数据
    }
  },
  getModuleById: (id) => get().modules.find((m) => m.id === id),
  getFullModule: (id) => get().modules.find((m) => m.id === id),
}))
