export default function BotChatAvatar() {
  return (
    <div className="bot-avatar" aria-hidden="true">
      <img
        src="/favicon.svg"
        alt="raccoon"
        width={28}
        height={28}
        style={{ borderRadius: "50%", display: "block" }}
      />
    </div>
  );
}
