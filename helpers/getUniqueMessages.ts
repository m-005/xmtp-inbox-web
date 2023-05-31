import type { DecodedMessage } from "@xmtp/react-sdk";

const getUniqueMessages = (
  existing: Map<string, DecodedMessage>,
  newMessages: DecodedMessage[],
): Map<string, DecodedMessage> => {
  const entries = Array.from(existing);
  const newEntries = newMessages.map<[string, DecodedMessage]>((m) => [
    m.id,
    m,
  ]);

  const uniqueMessages = [...entries, ...newEntries];
  uniqueMessages.sort((a, b) => {
    return (b[1].sent?.getTime() ?? 0) - (a[1].sent?.getTime() ?? 0);
  });

  return new Map(uniqueMessages);
};

export default getUniqueMessages;
