import { useState, useRef, useEffect } from "react";
import { BotState } from "@/types";

const VIDEO_PATHS: Record<BotState, string> = {
  idle: "/videos/raccoon-idle.mp4",
  thinking: "/videos/raccoon-thinking.mp4",
  eureka: "/videos/raccoon-eureka.mp4",
};

interface RaccoonStateDisplayProps {
  botState: BotState;
  size?: "large" | "small";
  className?: string;
  fallbackImageSrc?: string;
}

export default function RaccoonStateDisplay({
  botState,
  size = "large",
  className = "",
  fallbackImageSrc = "/raccoon.png",
}: RaccoonStateDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoAvailable, setVideoAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const handleCanPlay = () => setVideoAvailable(true);
    const handleError = () => setVideoAvailable(false);

    video.addEventListener("canplay", handleCanPlay, { once: true });
    video.addEventListener("error", handleError, { once: true });
    video.load();
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [botState]);

  const sizeClasses = size === "large" ? "raccoon-size-large" : "raccoon-size-small";

  return (
    <div className={`raccoon-display ${sizeClasses} ${className}`}>
      <video
        ref={videoRef}
        className="raccoon-video"
        autoPlay
        loop={botState === "idle"}
        muted
        playsInline
        style={{ display: videoAvailable ? "block" : "none" }}
        key={botState}
      >
        <source src={VIDEO_PATHS[botState]} type="video/mp4" />
      </video>

      {videoAvailable !== true && (
        <img
          src={fallbackImageSrc}
          alt="Енот-помощник матфака ЯрГУ"
          className="raccoon-fallback"
          data-state={botState}
        />
      )}
    </div>
  );
}
