import { create } from 'zustand'
import type { Module, Vocabulary, Sentence } from '../types'

interface CourseState {
  modules: Module[]
  currentModule: Module | null
  
  setModules: (modules: Module[]) => void
  setCurrentModule: (module: Module | null) => void
  getModuleById: (id: string) => Module | undefined
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
      { id: 'V4', moduleId: 'M1', word: 'engine', translation: '发动机', exampleSentence: 'The engine makes the plane fly.' }
    ],
    sentences: [
      { id: 'S1', moduleId: 'M1', english: 'Where is the gate?', chinese: '登机口在哪里？' },
     S2', module { id: 'Id: 'M1', english: 'How do I get to the terminal?', chinese: '我该怎么去航站楼？' }
    ]
  },
  {
    id: 'M2',
    name: '机场流程',
    description: '掌握机场常用英语表达',
    order: 2,
    icon: '🏢',
    vocabularies: [
      { id: 'V5', moduleId: 'M2', word: 'terminal', translation: '航站楼', exampleSentence: 'The terminal is very big.' },
      { id: 'V6', moduleId: 'M2', word: 'boarding pass', translation: '登机牌', exampleSentence: 'Show me your boarding pass.' },
      { id: 'V7', moduleId: 'M2', word: 'security', translation: '安检', exampleSentence: 'Go through security please.' }
    ],
    sentences: [
      { id: 'S3', moduleId: 'M2', english: 'Can I have a window seat?', chinese: '我可以要一个靠窗的座位吗？' },
      { id: 'S4', moduleId: 'M2', english: 'What time does the flight board?', chinese: '航班什么时候登机？' }
    ]
  },
  {
    id: 'M3',
    name: '塔台通信',
    description: '学习塔台标准通话用语',
    order: 3,
    icon: '📡',
    vocabularies: [
      { id: 'V8', moduleId: 'M3', word: 'takeoff', translation: '起飞', exampleSentence: 'We are ready for takeoff.' },
      { id: 'V9', moduleId: 'M3', word: 'landing', translation: '降落', exampleSentence: 'We are requesting landing.' }
    ],
    sentences: [
      { id: 'S5', moduleId: 'M3', english: 'Ready for takeoff', chinese: '准备起飞' },
      { id: 'S6', moduleId: 'M3', english: 'Request landing', chinese: '请求降落' }
    ]
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
      { id: 'VW8', moduleId: 'M4', word: 'tailwind', translation: '顺风', exampleSentence: 'Tailwind component is 5 knots.' }
    ],
    sentences: [
      { id: 'SW1', moduleId: 'M4', english: 'What is the visibility?', chinese: '能见度是多少？' },
      { id: 'SW2', moduleId: 'M4', english: 'Are there any thunderstorms on the route?', chinese: '航线上有雷暴吗？' },
      { id: 'SW3', moduleId: 'M4', english: 'Expect turbulence during descent', chinese: '下降过程中预计有颠簸' },
      { id: 'SW4', moduleId: 'M4', english: 'Wind is from the west at 15 knots', chinese: '风向西，风速15节' },
      { id: 'SW5', moduleId: 'M4', english: 'Ceiling is 800 feet with broken clouds', chinese: '云幕高度800英尺，多云' },
      { id: 'SW6', moduleId: 'M4', english: 'Runway visual range is 1000 meters', chinese: '跑道视程1000米' }
    ]
  }
]

export const useCourseStore = create<CourseState>()((set, get) => ({
  modules: mockModules,
  currentModule: null,
  
  setModules: (modules) => set({ modules }),
  setCurrentModule: (module) => set({ currentModule: module }),
  getModuleById: (id) => get().modules.find(m => m.id === id)
}))
