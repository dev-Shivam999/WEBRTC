import { useEffect, useMemo, useRef } from "react";

const Re = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const socket = useMemo(() => new WebSocket("ws://localhost:3000"), []);

    useEffect(() => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
       
       pc.ontrack = (event) => {
            if (videoRef.current) {
                videoRef.current.srcObject = event.streams[0];
            }
        };

        socket.onopen = () => {
            socket.send(JSON.stringify({ message: "Re" }));
        };

        socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            if (data.message === "ice") {
                        await pc.addIceCandidate(new RTCIceCandidate(data.ice));
                
            } else if (data.message === "createOffer") {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

               
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.send(JSON.stringify({ message: "ans", ans: answer }));
            }
        };

        return () => {
            pc.close();
            socket.close();
        };
    }, [socket]);

    return <video ref={videoRef} muted autoPlay width={400} height={400}></video>;
};

export default Re;
