import React, { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { DateDivider } from "../component-library/components/DateDivider/DateDivider";
import { FullConversation } from "../component-library/components/FullConversation/FullConversation";
import { useXmtpStore } from "../store/xmtp";
import { FullMessageWrapper } from "./FullMessageWrapper.";
import useGetMessages from "../hooks/useGetMessages";
import { MessageQueue } from "../hooks/useSendOptimisticMessage";

type FullConversationWrapperProps = {
  queue: MessageQueue;
  removePending: (messageId: string) => void;
};

export const FullConversationWrapper: React.FC<
  FullConversationWrapperProps
> = ({ queue, removePending }) => {
  const lastMessageDateRef = useRef<Date>();
  const [initialConversationLoaded, setInitialConversationLoaded] =
    useState(false);

  const conversationId = useXmtpStore((state) => state.conversationId);

  useEffect(() => {
    setInitialConversationLoaded(false);
  }, [conversationId]);

  // XMTP Hooks
  const { messages, hasMore, next, isLoading } = useGetMessages(
    conversationId as string,
  );

  const isOnSameDay = (d1?: Date, d2?: Date): boolean => {
    return d1?.toDateString() === d2?.toDateString();
  };

  const allMessages = React.useMemo(() => {
    const allMessagesLength = messages.size + queue.length;
    return [
      ...queue.map((item, index) => {
        // don't render pending message if it's been processed
        if (messages.get(item.id)) {
          // remove from pending queue
          removePending(item.id);
          return <></>;
        }
        const dateHasChanged = lastMessageDateRef.current
          ? !isOnSameDay(lastMessageDateRef.current, item.sent)
          : false;

        const messageDiv = (
          <div key={item.id}>
            {index === allMessagesLength - 1 ? (
              <DateDivider date={item.sent} />
            ) : null}
            <FullMessageWrapper status={item.status} msg={item} idx={index} />
            {dateHasChanged ? (
              <DateDivider date={lastMessageDateRef.current!} />
            ) : null}
          </div>
        );
        lastMessageDateRef.current = item.sent;
        return messageDiv;
      }),
      ...Array.from(messages.values()).map((msg, index) => {
        const dateHasChanged = lastMessageDateRef.current
          ? !isOnSameDay(lastMessageDateRef.current, msg.sent)
          : false;
        const messageDiv = (
          <div key={msg.id}>
            {index === allMessagesLength - 1 ? (
              <DateDivider date={msg.sent} />
            ) : null}
            <FullMessageWrapper status="sent" msg={msg} idx={index} />
            {dateHasChanged ? (
              <DateDivider date={lastMessageDateRef.current!} />
            ) : null}
          </div>
        );
        lastMessageDateRef.current = msg.sent;
        return messageDiv;
      }),
    ];
  }, [messages, queue, removePending]);

  return (
    <div
      id="scrollableDiv"
      tabIndex={0}
      className="w-full h-full flex flex-col flex-col-reverse overflow-auto">
      <InfiniteScroll
        className="flex flex-col flex-col-reverse"
        dataLength={messages.size}
        next={() => {
          if (!initialConversationLoaded) {
            setInitialConversationLoaded(true);
          }
          next();
        }}
        endMessage={!messages.size}
        hasMore={hasMore}
        inverse
        loader={true}
        scrollableTarget="scrollableDiv">
        <FullConversation
          isLoading={isLoading && !initialConversationLoaded}
          messages={allMessages}
        />
      </InfiniteScroll>
    </div>
  );
};
