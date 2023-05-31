import { useCallback, useMemo, useRef, useState } from "react";
import {
  SendOptions,
  useSendMessage as useSendMessageHook,
} from "@xmtp/react-sdk";
import { Conversation } from "@xmtp/react-sdk";

export type PendingMessage = {
  status: "pending";
  id: string;
  content: any;
  options?: SendOptions;
  sent: Date;
  senderAddress: string;
};

export type FailedMessage = Omit<PendingMessage, "status"> & {
  status: "failed";
  retry: () => Promise<void>;
};

export type MessageQueue = (PendingMessage | FailedMessage)[];

type PreparedMessage = Awaited<ReturnType<Conversation["prepareMessage"]>>;

type PreparedMessageBundle = {
  originalContent: any;
  prepared: PreparedMessage;
};

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
    async (message: string | PreparedMessageBundle, options?: SendOptions) => {
      const sent = new Date();
      const senderAddress = conversation.clientAddress;
      let prepared: PreparedMessage;
      let id: string;
      let bundle: PreparedMessageBundle;
      if (typeof message === "string") {
        prepared = await conversation.prepareMessage(message, options);
        id = await prepared.messageID();
        bundle = {
          originalContent: message,
          prepared,
        };
      } else {
        prepared = message.prepared;
        id = await prepared.messageID();
        bundle = {
          originalContent: message.originalContent,
          prepared,
        };
      }

      setPending((prev) => [
        ...prev,
        {
          status: "pending",
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
        // remove message from pending
        setPending((prev) => prev.filter((m) => m.id !== id));
        const hasAlreadyFailed = failed.find((f) => f.id === id);
        if (!hasAlreadyFailed) {
          // add message to failed queue
          setFailed((prev) => [
            ...prev,
            {
              status: "failed",
              id,
              content: bundle.originalContent,
              options,
              sent,
              senderAddress,
              retry: async () => {
                // remove message from failed
                setFailed((prev) => prev.filter((m) => m.id !== id));
                // send prepared message
                await sendMessage(bundle, options);
              },
            },
          ]);
        }
      }
    },
    [conversation, failed],
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
