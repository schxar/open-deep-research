
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { createOpenAI } from '@ai-sdk/openai';
import { customMiddleware } from "./custom-middleware";

const openai = createOpenAI({
  // custom settings, e.g.
  compatibility: 'strict', // strict mode, enable when using the OpenAI API
  baseURL: 'https://chatapi.nloli.xyz/v1'
});

export const customModel = (apiIdentifier: string) => {
  // Check which API key is available
  const hasOpenRouterKey =
    process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== "****";

  // Select the appropriate provider
  const provider = hasOpenRouterKey
    ? openrouter(apiIdentifier)
    : openai(apiIdentifier);

  return wrapLanguageModel({
    model: provider,
    middleware: customMiddleware,
  });
};
