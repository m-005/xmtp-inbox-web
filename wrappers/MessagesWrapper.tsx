import React from "react";
import { FullConversationWrapper } from "../wrappers/FullConversationWrapper";
import { AddressInputWrapper } from "../wrappers/AddressInputWrapper";
import { MessageInputWrapper } from "../wrappers/MessageInputWrapper";
import { useSendOptimisticMessage } from "../hooks/useSendOptimisticMessage";
import { Conversation } from "@xmtp/react-sdk";

const MessagesWrapper: React.FC<{ conversation: Conversation }> = ({
  conversation,
}) => {
  const { sendMessage, queue, removePending } =
    useSendOptimisticMessage(conversation);

  return (
    <>
      <div className="flex">
        <AddressInputWrapper />
      </div>
      <div className="h-full overflow-auto flex flex-col">
        <FullConversationWrapper queue={queue} removePending={removePending} />
      </div>
      <MessageInputWrapper
        conversation={conversation}
        sendMessage={sendMessage}
      />
    </>
  );
};

export default MessagesWrapper;
