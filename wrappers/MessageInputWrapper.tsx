import React from "react";
import { MessageInput } from "../component-library/components/MessageInput/MessageInput";
import { RecipientInputMode } from "../helpers";
import useGetRecipientInputMode from "../hooks/useGetRecipientInputMode";
import { Conversation, SendOptions } from "@xmtp/react-sdk";

type MessageInputWrapperProps = {
  conversation?: Conversation;
  sendMessage: (
    message: string,
    options?: SendOptions | undefined,
  ) => Promise<void>;
};

export const MessageInputWrapper: React.FC<MessageInputWrapperProps> = ({
  conversation,
  sendMessage,
}) => {
  // XMTP Hooks
  const { recipientInputMode } = useGetRecipientInputMode();

  return (
    <MessageInput
      isDisabled={recipientInputMode !== RecipientInputMode.OnNetwork}
      onSubmit={sendMessage}
      conversation={conversation}
    />
  );
};
