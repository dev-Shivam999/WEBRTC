import { useEffect, useMemo, useRef, useState } from "react";

const Receiver = () => {
    const socket = useMemo(() => new WebSocket("ws://localhost:3000"), []);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [peer, setPeer] = useState<RTCPeerConnection | null>(null);

    const server = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    useEffect(() => {
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "receiver" }));
        };

        const pc = new RTCPeerConnection(server);
        setPeer(pc);

        pc.ontrack = (event) => {
            if (event.track.kind === "video" && remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.send(JSON.stringify({ type: "ice", ice: event.candidate }));
            }
        };

        socket.onmessage = async (message) => {
            const data = JSON.parse(message.data);

            if (data.type === "ice") {
                pc.addIceCandidate(new RTCIceCandidate(data.sdp));
            } else if (data.type === "offer") {
                await pc.setRemoteDescription({ sdp: data.offer.sdp, type: "offer" });
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.send(JSON.stringify({ type: "ans", answer: pc.localDescription }));
            }
        };

        mediaAccess(pc);

        return () => {
            socket.close();
            pc.close();
        };
    }, [socket]);

    const mediaAccess = async (pc: RTCPeerConnection) => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play();
        }
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    };

    return (
        <div>
            <video ref={remoteVideoRef} autoPlay style={{ width: "400px", height: "300px" }} />
            <video ref={localVideoRef} autoPlay muted style={{ width: "400px", height: "300px" }} />
        </div>
    );
};

export default Receiver;
