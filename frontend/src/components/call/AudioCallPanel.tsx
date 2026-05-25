import { useAudioCall } from "../hooks/useAudioCall";

const AudioCallPanel = ({ userId }: { userId: string }) => {
  const {
    startCall,
    acceptCall,
    endCall,
    toggleMute,
    inCall,
    muted,
    incoming,
  } = useAudioCall();

  if (incoming && !inCall) {
    return (
      <div className="fixed bottom-4 right-4 bg-white shadow-lg p-4 rounded-xl">
        <p className="mb-2 font-medium">Incoming Audio Call</p>
        <div className="flex gap-2">
          <button
            onClick={acceptCall}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Accept
          </button>
          <button
            onClick={endCall}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Reject
          </button>
        </div>
      </div>
    );
  }

  if (!inCall) {
    return (
      <button
        onClick={() => startCall(userId)}
        className="bg-black text-white px-3 py-1 rounded"
      >
        📞 Call
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg p-4 rounded-xl flex gap-3">
      <button onClick={toggleMute}>
        {muted ? "🔈 Unmute" : "🔇 Mute"}
      </button>
      <button onClick={endCall} className="text-red-600">
        ❌ End
      </button>
    </div>
  );
};

export default AudioCallPanel;
