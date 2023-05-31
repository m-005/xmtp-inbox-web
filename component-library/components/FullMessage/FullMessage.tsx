import React, { ReactElement } from "react";
import { DateDivider } from "../DateDivider/DateDivider";
import { classNames } from "../../../helpers";
import { useTranslation } from "react-i18next";
import { CheckIcon } from "@heroicons/react/solid";
import { ExclamationIcon, ClockIcon } from "@heroicons/react/outline";

interface MessageSender {
  displayAddress: string;
  isSelf?: boolean;
}

interface FullMessageProps {
  /**
   * What is the message text?
   */
  text: ReactElement;
  /**
   * who is the message from?
   */
  from: MessageSender;
  /**
   * What is the datetime of the message?
   */
  datetime: Date;
  /**
   * Should we show the date divider?
   */
  showDateDivider?: boolean;
  type: "sent" | "pending" | "failed";
}

const MessageIcon: React.FC<Pick<FullMessageProps, "type">> = ({ type }) => {
  switch (type) {
    case "failed":
      return <ExclamationIcon width={12} height={12} />;
    case "pending":
      return <ClockIcon width={12} height={12} />;
    case "sent":
      return <CheckIcon width={12} height={12} />;
  }
};

const MessageStatus: React.FC<Pick<FullMessageProps, "type" | "datetime">> = ({
  datetime,
  type,
}) => {
  const { t } = useTranslation();
  switch (type) {
    case "failed":
      return <>Not delivered</>;
    case "pending":
      return <>Sending</>;
    case "sent":
      return <>{t("{{datetime, time}}", { datetime })}</>;
  }
};

export const FullMessage = ({
  text,
  from,
  datetime,
  showDateDivider = false,
  type,
}: FullMessageProps) => {
  const isOutgoingMessage = from.isSelf;

  const incomingMessageBackgroundStyles = "bg-gray-200 rounded-br-lg pl-2";
  const outgoingMessageBackgroundStyles =
    "bg-indigo-600 text-white rounded-bl-lg message-sender";

  return (
    <div
      className={classNames(
        "flex flex-col w-full",
        isOutgoingMessage ? "items-end" : "items-start",
      )}>
      <div
        className={classNames(
          "text-sm",
          "flex",
          "flex-col",
          "max-w-[80%]",
          "md:max-w-[50%]",
          "w-fit",
        )}>
        <div className={classNames("flex", "flex-col", "max-w-full")}>
          <div
            className={`whitespace-pre-wrap p-2 px-3 rounded-tl-xl rounded-tr-xl my-1 max-w-full break-words text-md pl-3 ${
              isOutgoingMessage
                ? outgoingMessageBackgroundStyles
                : incomingMessageBackgroundStyles
            }`}>
            {text}
          </div>
          <div
            className={`text-xs text-gray-500 w-full flex items-center gap-1 mb-4 ${
              isOutgoingMessage ? "justify-end" : "justify-start"
            }`}>
            <MessageIcon type={type} />
            <MessageStatus datetime={datetime} type={type} />
          </div>
        </div>
      </div>
      {showDateDivider && <DateDivider date={datetime} />}
    </div>
  );
};
