function ChatMessage({ message }) {
  return (
    <div className={`chat-row ${message.role}`}>

      <div className="avatar">
        {message.role === "ai" ? "AI" : "You"}
      </div>

      <div className={`chat-bubble ${message.role}`}>
        {message.content}
      </div>

    </div>
  );
}

export default ChatMessage;
