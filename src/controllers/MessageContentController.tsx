import { ContentTypeRemoteAttachment } from "@xmtp/content-type-remote-attachment";
import {
  ContentTypeId,
  ContentTypeText,
  getReadReceipt,
  useConversation,
  useSendMessage,
} from "@xmtp/react-sdk";
import type { CachedConversation, CachedMessage } from "@xmtp/react-sdk";
import { useEffect } from "react";
import isAfter from "date-fns/isAfter";
import { ContentTypeReadReceipt } from "@xmtp/content-type-read-receipt";
import debounce from "lodash/debounce";
import RemoteAttachmentMessageTile from "../component-library/components/RemoteAttachmentMessageTile/RemoteAttachmentMessageTile";
import { TextMessageTile } from "../component-library/components/TextMessageTile/TextMessageTile";

interface MessageContentControllerProps {
  conversation: CachedConversation;
  message: CachedMessage;
  isSelf: boolean;
}

// send a read receipt message
const sendReadReceipt = debounce(
  async (
    conversation: CachedConversation,
    sendMessage: ReturnType<typeof useSendMessage>["sendMessage"],
  ) => {
    console.log("actually sending read receipt...");
    await sendMessage(conversation, {}, ContentTypeReadReceipt);
  },
  1000,
);

const MessageContentController = ({
  conversation,
  message,
  isSelf,
}: MessageContentControllerProps) => {
  const { sendMessage } = useSendMessage();
  const { getCachedByTopic } = useConversation();
  const contentType = ContentTypeId.fromString(message.contentType);

  // when message content is rendered, update the conversation's read receipt
  useEffect(() => {
    const maybeSendReadReceipt = async () => {
      // ensure latest conversation metadata
      const updatedConversation = await getCachedByTopic(conversation.topic);
      if (updatedConversation) {
        const readReceipt = getReadReceipt(updatedConversation);
        console.log("isSelf", isSelf);
        console.log("readReceipt", readReceipt);
        console.log("message.sentAt", message.sentAt);
        if (readReceipt) {
          console.log(
            "incoming message sent after read receipt",
            isAfter(message.sentAt, readReceipt),
          );
        }

        // if the message was sent by someone else, and
        // there's no read receipt for this conversation, or
        // there's a read receipt and the message comes after it
        if (
          !isSelf &&
          (!readReceipt ||
            (readReceipt && isAfter(message.sentAt, readReceipt)))
        ) {
          console.log("attempting to send read receipt...");
          // send a read receipt message
          void sendReadReceipt(conversation, sendMessage);
        }
      }
    };
    void maybeSendReadReceipt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (contentType.sameAs(ContentTypeText)) {
    return <TextMessageTile message={message} />;
  }

  if (contentType.sameAs(ContentTypeRemoteAttachment)) {
    return <RemoteAttachmentMessageTile message={message} isSelf={isSelf} />;
  }

  // message content type not supported, display fallback
  return <span>{message.contentFallback}</span>;
};

export default MessageContentController;
