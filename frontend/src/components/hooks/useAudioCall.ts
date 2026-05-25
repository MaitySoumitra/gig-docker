import { useRef, useState, useEffect } from "react";
import { socket } from "../services/socket";

export const useAudioCall = () => {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerIdRef = useRef<string>("");

  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [incoming, setIncoming] = useState<any>(null);

  const createPeer = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          to: peerIdRef.current,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      const audio = document.createElement("audio");
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
    };

    pcRef.current = pc;
    return pc;
  };

  /* 📞 START CALL */
  const startCall = async (userId: string) => {
    peerIdRef.current = userId;
    const pc = createPeer();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call-user", { to: userId, offer });
    setInCall(true);
  };

  /* 📲 ACCEPT CALL */
  const acceptCall = async () => {
    const { from, offer } = incoming;
    peerIdRef.current = from;

    const pc = createPeer();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    await pc.setRemoteDescription(offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer-call", { to: from, answer });
    setIncoming(null);
    setInCall(true);
  };

  /* 🔇 MUTE */
  const toggleMute = () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getAudioTracks()[0];
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };

  /* ❌ END CALL */
  const endCall = () => {
    socket.emit("end-call", { to: peerIdRef.current });
    pcRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setInCall(false);
    setMuted(false);
  };

  /* SOCKET EVENTS */
  useEffect(() => {
    socket.on("incoming-call", ({ from, offer }) => {
      setIncoming({ from, offer });
    });

    socket.on("call-accepted", async ({ answer }) => {
      await pcRef.current?.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", (candidate) => {
      pcRef.current?.addIceCandidate(candidate);
    });

    socket.on("call-ended", endCall);

    return () => {
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("ice-candidate");
      socket.off("call-ended");
    };
  }, []);

  return {
    startCall,
    acceptCall,
    endCall,
    toggleMute,
    inCall,
    muted,
    incoming,
  };
};
