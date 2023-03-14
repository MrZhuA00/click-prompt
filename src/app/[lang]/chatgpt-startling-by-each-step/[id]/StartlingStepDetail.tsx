"use client";

import React, { useEffect } from "react";

import { HumanBlock } from "@/app/[lang]/chatgpt-samples/components/HumanBlock";
import { Avatar, Box } from "@/components/ChakraUI";
import SimpleMarkdown from "@/components/SimpleMarkdown";
import { AiBlock } from "@/app/[lang]/chatgpt-samples/components/AiBlock";
import { ChatGptIcon } from "@/components/CustomIcon";
import { StartlingStep } from "@/app/[lang]/chatgpt-startling-by-each-step/[id]/startling.type";
import { fillStepWithValued, StepDetail } from "@/app/[lang]/chatgpt-startling-by-each-step/[id]/StepDetail";
import { ResponseSend } from "@/pages/api/chatgpt/chat";
import ExecutePromptButton from "@/components/ClickPrompt/ExecutePromptButton";
import { AskRenderer } from "@/app/[lang]/chatgpt-startling-by-each-step/[id]/AskRenderer";
import CopyComponent from "@/components/CopyComponent";

type StepProps = {
  index: number;
  step: StepDetail;
  content: StartlingStep;
  cachedValue: Record<number, any>;
  onCache?: (step: number, response: string) => void;
  conversationId?: number;
  updateConversationId?: (conversationId: number) => void;
};

function StartlingStepDetail({
  index,
  step,
  content,
  onCache,
  cachedValue,
  conversationId,
  updateConversationId,
}: StepProps) {
  const [response, setResponse] = React.useState<string | undefined>(undefined);

  const handleResponse = (response: ResponseSend) => {
    const assistantMessage = response.filter((message) => message.role === "assistant");
    const assistantResponse = assistantMessage[0].content;
    setResponse(assistantResponse);

    if (!onCache || !step.cachedResponseRegex) {
      return;
    }

    // todo: check why regex not working well?
    const isMatchAll = step.cachedResponseRegex === ".*" || step.cachedResponseRegex === "(.*?)";
    if (isMatchAll) {
      onCache(index, assistantResponse);
    } else {
      const regex = new RegExp(step.cachedResponseRegex);
      const matched = assistantResponse.match(regex);
      if (matched) {
        onCache(index, matched[1]);
      }
    }
  };

  const [ask, setAsk] = React.useState<string>(step.ask);

  useEffect(() => {
    const askTask = fillStepWithValued(step, cachedValue);
    if (askTask.replaced) {
      setAsk(askTask.ask);
    }
  }, [cachedValue]);

  return (
    <>
      <HumanBlock direction='row' justify='space-between'>
        <Avatar bg='teal.500' name={content.author} size='sm' mr={2} />
        <Box w='100%' p={4} h='100%'>
          <AskRenderer step={step} onAskUpdate={setAsk} cachedValue={cachedValue} />
        </Box>
      </HumanBlock>
      <ExecutePromptButton
        text={ask}
        name={content.name}
        handleResponse={handleResponse}
        conversationId={conversationId}
        updateConversationId={updateConversationId}
      />
      <AiBlock direction='row' gap='2'>
        <Box>
          <ChatGptIcon />
        </Box>
        {response && (
          <Box gap='2' ml='2' flex='1'>
            <SimpleMarkdown content={response} />
            <CopyComponent value={response} />
          </Box>
        )}
      </AiBlock>
    </>
  );
}

export default StartlingStepDetail;
