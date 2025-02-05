// @/lib/ai/models.ts

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;  // 现在直接使用OpenAI官方模型ID
  description: string;
  provider: 'openai';     // 新增provider字段明确指定
}

export const models: Array<Model> = [
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    apiIdentifier: 'gpt-4o', 
    description: '最适合复杂多步骤任务',
    provider: 'openai'
  },
  {
    id: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    apiIdentifier: 'gpt-4o-mini',
    description: '轻量级快速响应',
    provider: 'openai'
  },
] as const;

export const DEFAULT_MODEL_NAME = 'gpt-4o';

// 类型辅助函数
export const getModelConfig = (modelId: string) => {
  const model = models.find(m => m.id === modelId) || models[0];
  
  return {
    baseURL: process.env.OPENAI_API_URL,
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    model: model.apiIdentifier
  };
};