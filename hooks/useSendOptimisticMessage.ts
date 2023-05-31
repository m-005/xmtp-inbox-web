import { useCallback, useMemo, useRef, useState } from "react";
import {
  SendOptions,
  useSendMessage as useSendMessageHook,
} from "@xmtp/react-sdk";
import { Conversation } from "@xmtp/react-sdk";

export type PendingMessage = {
  type: "pending";
  id: string;
  content: any;
  options?: SendOptions;
  sent: Date;
  senderAddress: string;
};

export type FailedMessage = Omit<PendingMessage, "type"> & {
  type: "failed";
  retry: () => Promise<void>;
};

export type MessageQueue = (PendingMessage | FailedMessage)[];

type PreparedMessage = Awaited<ReturnType<Conversation["prepareMessage"]>>;

export const useSendOptimisticMessage = (conversation: Conversation) => {
  const [failed, setFailed] = useState<FailedMessage[]>([]);
  const [pending, setPending] = useState<PendingMessage[]>([]);

  const removePending = useCallback((messageId: string) => {
    setPending((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const removeFailed = useCallback((messageId: string) => {
    setFailed((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const sendMessage = useCallback(
    async (message: string | PreparedMessage, options?: SendOptions) => {
      const sent = new Date();
      const senderAddress = conversation.clientAddress;
      let prepared: PreparedMessage;
      let id: string;
      if (typeof message === "string") {
        prepared = await conversation.prepareMessage(message, options);
        id = await prepared.messageID();
      } else {
        prepared = message;
        id = await prepared.messageID();
      }

      setPending((prev) => [
        ...prev,
        {
          type: "pending",
          id,
          content: message,
          options,
          sent,
          senderAddress,
        },
      ]);
      try {
        await prepared.send();
      } catch (e) {
        console.error(e);
        // message failed
        setFailed((prev) => [
          ...prev,
          {
            type: "failed",
            id,
            content: message,
            options,
            sent,
            senderAddress,
            retry: async () => {
              // remove message from failed
              setFailed((prev) => prev.filter((m) => m.id !== id));
              // send prepared message
              return sendMessage(prepared, options);
            },
          },
        ]);
      }
    },
    [conversation],
  );

  // sorted queue of pending / failed messages
  const queue = useMemo(
    () =>
      [...failed, ...pending].sort(
        (a, b) => b.sent.getTime() - a.sent.getTime(),
      ),
    [failed, pending],
  );

  return {
    queue,
    removeFailed,
    removePending,
    sendMessage,
  };
};
