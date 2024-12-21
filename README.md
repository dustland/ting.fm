# Ting.fm

一个基于 AI 的播客生成器，可以将任何文本内容转换成对话形式的播客。

## 特性

- 支持多种内容来源：URL、文本、文件
- 基于 GPT-4 的智能对话生成
- 使用 OpenAI TTS 生成自然的语音
- 实时编辑和预览对话内容
- 本地存储，随时保存进度
- 美观的用户界面，支持深色模式

## 技术栈

- Next.js 15 (App Router)
- TailwindCSS + Shadcn/UI
- Zustand 状态管理
- TypeScript
- Railway.app 部署

## 开发

### 环境要求

- Node.js >= 18
- PNPM
- OpenAI API Key

### 安装

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 OpenAI API Key

# 启动开发服务器
pnpm dev
```

### 项目结构

```
src/
  ├── app/              # Next.js 页面和路由
  ├── components/       # React 组件
  ├── hooks/           # 自定义 Hooks
  ├── lib/             # 工具函数
  ├── store/           # Zustand 状态管理
  └── types/           # TypeScript 类型定义
```

### 开发规范

1. 使用 PNPM 作为包管理器
2. 使用 Next.js 15 App Router，路由默认为异步
3. 使用 Shadcn UI 组件（通过 `npx shadcn@latest add` 安装）
4. 使用 Zustand 进行状态管理
5. 使用 Lucide Icons 作为图标库
6. 代码和注释使用英文，UI 文本使用中文

## 许可证

MIT
