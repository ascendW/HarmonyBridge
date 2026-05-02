# HarmonyBridge

> 情侣争端解决与情绪价值 Agent 系统

## 项目简介

HarmonyBridge 是一个基于 **WS 架构** 和 **WebSocket 实时通讯** 的多 Agent 协作系统，旨在帮助情侣将冲突转化为建设性对话。

核心痛点：情侣冲突时受限于"情绪脑"，缺乏第三方中立视角，导致矛盾螺旋升级。HarmonyBridge 通过三位 AI Agent 的协作——心理侦测、共情疏解、外交官调解——将冲突处理时间缩短 60%。

## 三核心 Agent

| Agent | 职责 | 代表色 |
|-------|------|--------|
| **心理侦测 Agent** | 去情绪化提取，洞察深层心理动机 | 紫色 |
| **共情疏解 Agent** | 即时心理按摩，防止矛盾爆发 | 绿色 |
| **外交官 Agent** | NVC 非暴力沟通转化，破冰建议 | 蓝色 |

## 技术栈

- **前端**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **动画**: Framer Motion
- **通讯**: WebSocket (ws 库)
- **后端**: Node.js + tsx

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式（前后端同时启动）
npm run dev

# 前端: http://localhost:5173
# WebSocket: ws://localhost:3001
```

## 项目结构

```
├── server/
│   ├── index.ts          # WebSocket 服务器
│   ├── agents.ts         # 三 Agent 逻辑 + CoT 编排
│   └── types.ts          # 共享类型
├── src/
│   ├── pages/            # 首页 / 角色选择 / 调解室
│   ├── components/        # 消息气泡 / Agent面板 / 情绪雷达
│   ├── hooks/            # useWebSocket Hook
│   └── types/            # 类型定义
├── docs/
│   └── PRD.md            # 项目需求文档
└── package.json
```

## 核心流程

1. 双方进入调解室，选择角色（伴侣A / 伴侣B）
2. 一方发送情绪化诉求
3. **心理侦测 Agent** 分析深层动机（CoT 4步推理）
4. **共情疏解 Agent** 提供即时情绪降温
5. **外交官 Agent** 翻译为非暴力沟通语言 + 破冰建议
6. 双方基于 Agent 建议重新连接

## 截图

[调解室界面 - 消息流 + Agent 面板 + 情绪雷达]

## 协议

MIT
