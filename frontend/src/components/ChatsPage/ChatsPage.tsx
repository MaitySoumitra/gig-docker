import ChatsSidebar from "./ChatsSidebar";
import ChatsWindow from "./ChatsWindow";

export default function ChatsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <ChatsSidebar />
      <ChatsWindow />
    </div>
  );
}
