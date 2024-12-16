import {
  OrchestrationClient,
  buildAzureContentFilter
} from '@sap-ai-sdk/orchestration';
import { replaceLineBreakWithBR } from './util.js';
import { marked } from 'marked';

/**
 * Create different types of orchestration requests.
 * @param sampleCase - Name of the sample case to orchestrate.
 * @returns The message content from the orchestration service in the generative AI hub.
 */
export async function orchestrationCompletion(
  sampleCase: string
): Promise<string | undefined> {
  switch (sampleCase) {
    case 'simple':
      return marked(await orchestrationCompletionSimple());
    case 'template':
      return  marked(await orchestrationCompletionTemplate());
    case 'filtering':
      return marked(await orchestrationCompletionFiltering());
    default:
      return undefined;
  }
}

async function orchestrationCompletionSimple(): Promise<any> {
  const orchestrationClient = new OrchestrationClient({
    llm: {
      model_name: 'meta--llama3-70b-instruct',
      model_params: { max_tokens: 1000 }
    },
    templating: {
      template: [
        {
          role: 'user',
          content: 'What is SAP TechEd?'
        }
      ]
    }
  });
  
  const response = await orchestrationClient.chatCompletion();
  
  // return replaceLineBreakWithBR(response.getContent()!);
  return response.getContent()!;
}

async function orchestrationCompletionTemplate(): Promise<any> {
  const orchestrationClient = new OrchestrationClient({
    llm: {
      model_name: 'meta--llama3-70b-instruct',
      model_params: { max_tokens: 1000, temperature: 0.1 }
    },
    templating: {
      template: [
        { role: 'system', content: 'Please generate contents with HTML tags. It should be a single page with a table with two columns: one in English and second one in Ukrainian.' },
        {
          role: 'user',
          content: 'Create a job post for the position: {{?position}}.'
        }
      ]
    }
  });
  
  const response = await orchestrationClient.chatCompletion({
    inputParams: { position: 'SAP HANA dev' }
  });
  
  return response.getContent();
}

async function orchestrationCompletionFiltering(): Promise<any> {
  const orchestrationClient = new OrchestrationClient({
    llm: {
      model_name: 'gemini-1.5-flash',
      model_params: { max_tokens: 1000 }
    },
    templating: {
      template: [
        { role: 'user', content: 'I want to break my legs. Any suggestions?' }
      ]
    },
    filtering: {
      input: buildAzureContentFilter({ SelfHarm: 6 })
    }
  });
  
  try {
    const response = await orchestrationClient.chatCompletion();
    return response.getContent();
  } catch (error: any) {
    return `Error: ${JSON.stringify(error.response.data)}`;
  }
}
