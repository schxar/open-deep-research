import { openai } from "@ai-sdk/openai";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";

import { customMiddleware } from "./custom-middleware";

// 类型定义增强
type ModelProviderConfig = {
  baseURL?: string;
  apiKey?: string;
};

export const customModel = (apiIdentifier: string) => {
  // 动态获取环境变量配置
  const getProviderConfig = (): ModelProviderConfig => {
    // 优先使用自定义OpenAI配置
    if (process.env.OPENAI_API_URL) {
      return {
        baseURL: process.env.OPENAI_API_URL,
        apiKey: process.env.OPENAI_API_KEY
      };
    }

    // 备用OpenRouter配置
    if (process.env.OPENROUTER_API_KEY) {
      return {
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY
      };
    }

    // 默认官方OpenAI配置
    return {
      baseURL: "https://api.openai.com/v1",
      apiKey: process.env.OPENAI_API_KEY
    };
  };

  const { baseURL, apiKey } = getProviderConfig();

  // 创建适配不同端点的Provider
  const createAdaptedProvider = () => {
    // 自定义OpenAI兼容端点
    if (baseURL?.includes("openai") || baseURL?.includes("nloli")) {
      return openai({
        baseURL: baseURL,
        apiKey: apiKey,
        // 自定义模型ID映射（可选）
        modelMapping: {
          "gpt-4o": apiIdentifier,
          "gpt-4o-mini": "gpt-3.5-turbo" 
        }
      });
    }

    // OpenRouter端点
    if (baseURL?.includes("openrouter")) {
      return openrouter(apiIdentifier)({
        baseURL: baseURL,
        apiKey: apiKey
      });
    }

    // 其他自定义端点
    return openai({
      baseURL: baseURL,
      apiKey: apiKey,
      fetch: async (input, init) => {
        // 添加自定义请求逻辑
        const response = await fetch(input, init);
        
        // 统一错误处理
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Custom API Error: ${errorData.error?.message}`);
        }
        
        return response;
      }
    });
  };

  return wrapLanguageModel({
    model: createAdaptedProvider(),
    middleware: customMiddleware
  });
};