import React from "react";
import { useEnsName } from "wagmi";
import { FullMessage } from "../component-library/components/FullMessage/FullMessage";
import { isValidLongWalletAddress, shortAddress } from "../helpers";
import { address } from "../pages/inbox";
import MessageContentWrapper from "./MessageContentWrapper";
import { useClient } from "@xmtp/react-sdk";

interface FullMessageWrapperProps {
  msg: {
    id: string;
    senderAddress: string;
    content: string;
    sent: Date;
  };
  idx: number;
  type: "sent" | "pending" | "failed";
}

export const FullMessageWrapper = ({ msg, type }: FullMessageWrapperProps) => {
  const { client } = useClient();

  // Get ENS if exists from full address
  const { data: ensName } = useEnsName({
    address: msg.senderAddress as address,
    enabled: isValidLongWalletAddress(msg.senderAddress),
  });

  return (
    <FullMessage
      type={type}
      text={<MessageContentWrapper content={msg.content} />}
      key={msg.id}
      from={{
        displayAddress: ensName ?? shortAddress(msg.senderAddress),
        isSelf: client?.address === msg.senderAddress,
      }}
      datetime={msg.sent}
    />
  );
};
