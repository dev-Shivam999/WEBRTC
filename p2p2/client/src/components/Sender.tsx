import { useEffect, useMemo, useRef } from "react";

const Sender = () => {
    const socket = useMemo(() => new WebSocket(`${import.meta.env.VITE_SOME_KEY}`), []);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null); 
    const server = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    useEffect(() => {
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "sender" }));
        };

        const pc = new RTCPeerConnection(server);


        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.send(JSON.stringify({ type: "ice", ice: event.candidate }));
            }
        };

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.send(JSON.stringify({ type: "offer", offer: pc.localDescription }));
        };

        pc.ontrack = (event) => {
            if (event.track.kind === "video" && remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                remoteVideoRef.current.play();
            }
        };

        socket.onmessage = async (message) => {
            const data = JSON.parse(message.data);

            if (data.type === "ans") {
                await pc.setRemoteDescription({ sdp: data.ans.sdp, type: "answer" });
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
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play();
        }
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    };


    return (
        <div>
            <video ref={localVideoRef} autoPlay muted style={{ width: "400px", height: "300px" }} />
            <video ref={remoteVideoRef} autoPlay style={{ width: "400px", height: "300px" }} />
        </div>
    );
};

export default Sender;
