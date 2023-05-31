import React from "react";
import { useEnsName } from "wagmi";
import { FullMessage } from "../component-library/components/FullMessage/FullMessage";
import { isValidLongWalletAddress, shortAddress } from "../helpers";
import { address } from "../pages/inbox";
import MessageContentWrapper from "./MessageContentWrapper";
import { useClient } from "@xmtp/react-sdk";
import { ms } from "date-fns/locale";

interface FullMessageWrapperProps {
  msg: {
    id: string;
    senderAddress: string;
    content: string;
    sent: Date;
    retry?: () => Promise<void>;
  };
  idx: number;
  status: "sent" | "pending" | "failed";
}

export const FullMessageWrapper = ({
  msg,
  status,
}: FullMessageWrapperProps) => {
  const { client } = useClient();

  // Get ENS if exists from full address
  const { data: ensName } = useEnsName({
    address: msg.senderAddress as address,
    enabled: isValidLongWalletAddress(msg.senderAddress),
  });

  return (
    <FullMessage
      status={status}
      text={<MessageContentWrapper content={msg.content} />}
      key={msg.id}
      from={{
        displayAddress: ensName ?? shortAddress(msg.senderAddress),
        isSelf: client?.address === msg.senderAddress,
      }}
      datetime={msg.sent}
      retry={msg.retry}
    />
  );
};
