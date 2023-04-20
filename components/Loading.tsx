import { useEffect, useState } from "react";

export default function Loading() {
  // NYC themed loading emojis
  const loadingEmojis = ["🗽", "🏠", "🏢"];
  const [loadingEmojiIndex, setLoadingEmojiIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingEmojiIndex(
        (loadingEmojiIndex) => (loadingEmojiIndex + 1) % loadingEmojis.length
      );
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[300px]">
      <span className="inline-block text-8xl">
        {loadingEmojis[loadingEmojiIndex]}
      </span>
      <span className="inline-block text-2xl mt-4 text-gray-700">
        Searching...
      </span>
    </div>
  );
}
