import { AgentType, AgentResult, CoTStep, EmotionData, Message } from './types';

// ==========================================
// Agent 1: 心理侦测 Agent (PsychDetector)
// 功能：去情绪化提取，分析深层心理动机
// ==========================================

const EMOTION_PATTERNS = [
  { regex: /从不|总是|永远|根本|完全/, type: 'absolutism', weight: 0.8 },
  { regex: /不在乎|不关心|不爱|冷漠/, type: 'neglect_fear', weight: 0.9 },
  { regex: /累|烦|压力|受不了/, type: 'burnout', weight: 0.7 },
  { regex: /为什么|怎么|凭什么/, type: 'justice_seek', weight: 0.6 },
  { regex: /你[就才]|如果.*就|要是/, type: 'conditional_love', weight: 0.7 },
];

const NEED_MAP: Record<string, string[]> = {
  absolutism: ['安全感', '确定性'],
  neglect_fear: ['关注', '被爱感', '存在确认'],
  burnout: ['休息空间', '被理解', '支持'],
  justice_seek: ['公平感', '被尊重', '认可'],
  conditional_love: ['无条件接纳', '自我空间'],
};

const EMOTION_VOCAB = [
  '委屈', '焦虑', '失落', '愤怒', '不安', '孤独', '挫败', '疲惫',
  '渴望', '恐惧', '失望', '嫉妒', '无助', '压抑', '紧张', '敏感'
];

export function analyzePsychology(message: string): AgentResult {
  const cotSteps: CoTStep[] = [];
  
  // Step 1: 表层情绪识别
  const detectedEmotions = EMOTION_VOCAB.filter(e => message.includes(e));
  cotSteps.push({
    agent: 'psychDetector',
    step: 1,
    thought: `识别用户输入中的情绪关键词：${detectedEmotions.length > 0 ? detectedEmotions.join('、') : '无明显情绪词，需进一步推断'}`,
    action: 'surface_emotion_scan'
  });

  // Step 2: 语言模式分析（去情绪化）
  const patterns = EMOTION_PATTERNS.filter(p => p.regex.test(message));
  const patternNames = patterns.map(p => p.type);
  cotSteps.push({
    agent: 'psychDetector',
    step: 2,
    thought: `检测到${patterns.length}个认知语言模式：${patternNames.join('、') || '无明显极端表达，用户可能处于压抑或理性状态'}`,
    action: 'cognitive_pattern_analysis'
  });

  // Step 3: 深层需求推导
  const needs = [...new Set(patterns.flatMap(p => NEED_MAP[p.type] || ['被理解']))];
  if (needs.length === 0) needs.push('被倾听', '情感连接');
  cotSteps.push({
    agent: 'psychDetector',
    step: 3,
    thought: `基于语言模式反推心理诉求：${needs.join('、')}`,
    action: 'need_inference'
  });

  // Step 4: 情绪量化
  const valence = Math.max(-1, Math.min(1, -0.3 - patterns.reduce((s, p) => s + p.weight, 0) * 0.4));
  const arousal = Math.min(1, 0.4 + detectedEmotions.length * 0.15 + patterns.length * 0.2);
  const dominantEmotion = detectedEmotions[0] || (valence < -0.5 ? '焦虑' : '压抑');
  
  cotSteps.push({
    agent: 'psychDetector',
    step: 4,
    thought: `情绪量化完成：效价=${valence.toFixed(2)}，唤醒度=${arousal.toFixed(2)}，主导情绪=${dominantEmotion}`,
    action: 'emotion_quantification'
  });

  const emotionData: EmotionData = {
    valence,
    arousal,
    dominantEmotion,
    needs,
    triggers: patterns.map(p => p.type)
  };

  const output = generatePsychDetectorOutput(emotionData, message);

  return {
    agent: 'psychDetector',
    output,
    cotSteps,
    emotionData
  };
}

function generatePsychDetectorOutput(data: EmotionData, rawInput: string): string {
  const needText = data.needs.slice(0, 2).join('和');
  return `【心理侦测完成】我感知到你话语背后的情绪波长。表面上是${data.dominantEmotion}，深层需求其实是${needText}。那些尖锐的措辞，其实是保护内心柔软的方式。`;
}

// ==========================================
// Agent 2: 共情疏解 Agent (EmpathySoother)
// 功能：即时心理按摩与压力释放引导
// ==========================================

const SOOTHING_TEMPLATES = [
  {
    emotion: '委屈',
    response: '你受了委屈，却还要强撑着说没事，这种感受一定很辛苦。我想让你知道，你的感受完全合理，不需要为任何人打折。'
  },
  {
    emotion: '焦虑',
    response: '焦虑像一只紧紧攥住心脏的手。但请记住，焦虑的另一面是你对这段关系的在意。深呼吸，我在这里陪着你。'
  },
  {
    emotion: '愤怒',
    response: '愤怒是内心在喊"这对我很重要"。你的边界被触碰了，这种感觉真实且正当。让我们一起把这份能量转化为被听见的勇气。'
  },
  {
    emotion: '失落',
    response: '期待落空的瞬间，心里会空出一个洞。但那个洞原本就是留给爱的形状，不要责怪自己有期待。'
  },
  {
    emotion: '疲惫',
    response: '你一直很努力在维系，累是应该的。关系不是你一个人的马拉松，你现在需要的是休息，不是自责。'
  },
];

const BREATHING_GUIDES = [
  '试试这样：吸气4秒，感受空气进入鼻腔的凉意；屏息4秒，让氧气安抚你的神经；呼气6秒，把所有紧绷感从肩膀释放出去。',
  '把手放在胸口，感受心跳。它在为你努力工作，哪怕此刻你感到孤独。温柔地对它说："谢谢你，我一直都在。"'
];

export function generateEmpathy(emotionData: EmotionData, userMessage: string): AgentResult {
  const cotSteps: CoTStep[] = [];

  // Step 1: 情绪共鸣定位
  const template = SOOTHING_TEMPLATES.find(t => t.emotion === emotionData.dominantEmotion) ||
    SOOTHING_TEMPLATES.find(t => emotionData.needs.some(n => t.emotion.includes(n))) ||
    SOOTHING_TEMPLATES[0];
  
  cotSteps.push({
    agent: 'empathySoother',
    step: 1,
    thought: `匹配共情模板：${template.emotion} → 核心需求：${emotionData.needs[0]}`,
    action: 'empathy_template_match'
  });

  // Step 2: 压力指数评估
  const stressLevel = Math.round(emotionData.arousal * 10);
  cotSteps.push({
    agent: 'empathySoother',
    step: 2,
    thought: `压力指数评估：${stressLevel}/10，${stressLevel > 7 ? '用户处于高唤醒状态，需要即时降温' : '情绪可控，适合深度疏导'}`,
    action: 'stress_assessment'
  });

  // Step 3: 定制化疏解策略
  const needsBreathing = emotionData.arousal > 0.7;
  const breathingGuide = needsBreathing ? BREATHING_GUIDES[Math.floor(Math.random() * BREATHING_GUIDES.length)] : '';
  
  cotSteps.push({
    agent: 'empathySoother',
    step: 3,
    thought: `选择疏解策略：${needsBreathing ? '呼吸调节 + 情绪命名' : '认知重构 + 需求确认'}`,
    action: 'soothing_strategy_selection'
  });

  const output = `${template.response}\n\n${breathingGuide}`.trim();

  return {
    agent: 'empathySoother',
    output,
    cotSteps,
    emotionData
  };
}

// ==========================================
// Agent 3: 外交官 Agent (Diplomat)
// 功能：非暴力沟通转化 + 破冰建议
// ==========================================

const NVC_FRAMEWORK = {
  observation: '当我看到/听到...',
  feeling: '我感到...',
  need: '因为我需要...',
  request: '你是否愿意...'
};

const ICEBREAKERS = [
  {
    title: '温柔重启',
    desc: '发送一个你们之间的内部梗，或一张共同回忆的照片，不附带任何文字。'
  },
  {
    title: '错位道歉',
    desc: '不必说"对不起"，试着说："我刚才太急了，没有听清你真正想说什么。"'
  },
  {
    title: '需求坦白',
    desc: '直接说出你的脆弱："其实我刚刚那样说，是因为我怕你觉得我不重要。"'
  },
  {
    title: '暂停邀约',
    desc: '提议一个非言语的休战信号："我们抱抱再聊，好吗？"'
  },
  {
    title: '翻译转述',
    desc: '把对方的话用柔软的方式重复一遍："你是说...，对吗？我想确认我理解了。"'
  }
];

export function generateDiplomacy(
  emotionData: EmotionData, 
  rawMessage: string,
  partnerNeeds: string[]
): AgentResult {
  const cotSteps: CoTStep[] = [];

  // Step 1: 攻击性语言剥离
  const strippedMessage = rawMessage
    .replace(/你(就是|总是|从不|根本)([^，。]+)/g, '我注意到$2的情况')
    .replace(/([你TA].{0,3})(没|不)([^，。]{1,6})/g, '我期待$3，但没有感受到');
  
  cotSteps.push({
    agent: 'diplomat',
    step: 1,
    thought: `执行攻击性剥离：将"你"陈述转化为"我"陈述，原始诉求保留但消除指责感`,
    action: 'hostility_stripping'
  });

  // Step 2: NVC框架重构
  const feelingWord = emotionData.dominantEmotion;
  const needWord = emotionData.needs[0] || '被理解';
  
  const nvcMessage = `我注意到${strippedMessage.slice(0, 20)}...，我感到${feelingWord}，因为我需要${needWord}，你是否愿意和我一起找找让我们都舒服的方式？`;
  
  cotSteps.push({
    agent: 'diplomat',
    step: 2,
    thought: `应用NVC四要素重构：观察→感受→需求→请求，生成非暴力沟通表达`,
    action: 'nvc_reconstruction'
  });

  // Step 3: 破冰策略匹配
  const icebreaker = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];
  cotSteps.push({
    agent: 'diplomat',
    step: 3,
    thought: `基于双方情绪状态匹配破冰策略："${icebreaker.title}"，适合当前${emotionData.arousal > 0.6 ? '高张力' : '温和'}氛围`,
    action: 'icebreaker_matching'
  });

  // Step 4: 双视角整合
  const partnerContext = partnerNeeds.length > 0 ? `同时，我感知到对方可能也在渴望${partnerNeeds[0]}。` : '';
  cotSteps.push({
    agent: 'diplomat',
    step: 4,
    thought: `整合双方视角：确保建议不会进一步侵犯对方边界，${partnerContext}`,
    action: 'dual_perspective_integration'
  });

  const output = `【外交官翻译】\n${nvcMessage}\n\n【破冰建议 · ${icebreaker.title}】\n${icebreaker.desc}`;

  return {
    agent: 'diplomat',
    output,
    cotSteps,
    breakthroughSuggestion: `${icebreaker.title}: ${icebreaker.desc}`
  };
}

// ==========================================
// Multi-Agent 编排器
// ==========================================

export function runAgentPipeline(
  message: string,
  partnerContextNeeds: string[] = []
): AgentResult[] {
  const results: AgentResult[] = [];
  
  // Agent 1: 心理侦测
  const psychResult = analyzePsychology(message);
  results.push(psychResult);
  
  // Agent 2: 共情疏解（基于Agent 1的输出）
  if (psychResult.emotionData) {
    const empathyResult = generateEmpathy(psychResult.emotionData, message);
    results.push(empathyResult);
    
    // Agent 3: 外交官（基于Agent 1 + 伴侣上下文）
    const diplomatResult = generateDiplomacy(psychResult.emotionData, message, partnerContextNeeds);
    results.push(diplomatResult);
  }
  
  return results;
}
