import React from "react";
import {
  IconLoader,
  ShortCopySkeletonLoader,
} from "../Loaders/SkeletonLoaders";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { classNames } from "../../../helpers";
import { AvatarWithHooks } from "../ComponentsWithHooks/AvatarWithHooks";
import { MessagePreviewCardHeader } from "../ComponentsWithHooks/MessagePreviewCardHeader";

interface MessagePreviewCard {
  /**
   * What is the message text?
   */
  text?: string;
  /**
   * What is the display address associated with the message?
   */
  displayAddress?: string;
  /**
   * What is the datetime of the message
   */
  datetime?: Date;
  /**
   * Are we waiting on anything loading?
   */
  isLoading?: boolean;
  /**
   * What happens on message click?
   */
  onClick?: () => void;
  /**
   * Is conversation selected?
   */
  isSelected?: boolean;
  // To-do: Add error views once we have the designs
}

export const MessagePreviewCard = ({
  text,
  displayAddress = "New recipient",
  datetime,
  isLoading = false,
  onClick,
  isSelected,
}: MessagePreviewCard) => {
  if (!text) {
    return null;
  }
  return (
    <div
      className={classNames(
        "flex justify-between items-start border border-t-0 p-4 h-min",
        isSelected ? "bg-gray-200" : "bg-gray-50",
      )}
      onClick={onClick}>
      <div className="mr-3 flex-none">
        <AvatarWithHooks address={displayAddress} />
      </div>
      <div className="flex flex-col items-start w-3/4">
        {isLoading ? (
          <ShortCopySkeletonLoader />
        ) : (
          <MessagePreviewCardHeader address={displayAddress} />
        )}
        {isLoading ? (
          <ShortCopySkeletonLoader />
        ) : (
          <span className="text-md text-gray-500 line-clamp-1 max-w-[90%] break-all">
            {text}
          </span>
        )}
      </div>
      {isLoading ? (
        <IconLoader />
      ) : (
        <div className="text-xs text-gray-400 w-1/4 text-right ml-4">
          {datetime && formatDistanceToNow(datetime)}
        </div>
      )}
    </div>
  );
};
