import { useEffect, useMemo, useRef, useState } from "react";


const Sender = () => {
    const socket = useMemo(() => { return new WebSocket("ws://localhost:3000") }, [])
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const [pc, setPC] = useState<RTCPeerConnection | null>(null)
    useEffect(() => {

        socket.onopen = () => {

            socket.send(JSON.stringify({ type: "sender" }))
        }



        return () => {
            socket.close()
            pc?.close()
        }
    }, [socket])

    const con = () => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
            ],
        })
        setPC(pc)
        pc.onicecandidate = (ice) => {
            if (ice.candidate) {
                socket.send(JSON.stringify({ type: "ice", ice: ice.candidate }))

            }
        }
        socket.onmessage = (message) => {
            const data = JSON.parse(message.data)
            if (data.type == "ans") {


                pc.setRemoteDescription({sdp:data.ans.sdp,type:"answer"})
            }
        }

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            socket.send(JSON.stringify({ type: "offer", offer: pc.localDescription }))
        }

        getAccess(pc)

    }
    const getAccess = async (pc: RTCPeerConnection) => {
        window.navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(p => {
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = p
                localVideoRef.current.play()
            }
            p.getTracks().forEach(track => {
                pc.addTrack(track, p)
            })
        })
    }
    return (
        <div>
            <button onClick={con}>make</button>
            <video width={400} height={400} ref={localVideoRef} muted></video>
            <video width={400} height={400} ref={remoteVideoRef}></video>

        </div>
    );
};

export default Sender;