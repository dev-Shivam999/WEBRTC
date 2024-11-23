import express, {  Request, Response } from 'express'
import http from 'http'
import { WebSocket, WebSocketServer } from 'ws';
const app = express();
const port = 3000;
app.use(express.json())
const server = http.createServer(app)

let sender: WebSocket | null = null
let receiver: WebSocket | null = null
const wss = new WebSocketServer({ server: server })
wss.on('connection', (ws) => {
    console.log("user");

    ws.on('error', (error) => {
        console.log("error" + error);

    })

    ws.on("message", (message) => {
        const data = JSON.parse(message.toString())


        if (data.type == "sender") {

            sender = ws
        }

        else if (data.type == "receiver") {


            receiver = ws
        }

        else if (data.type == "ice") {

            receiver?.send(JSON.stringify({ type: "ice", sdp: data.ice }))

        }


        else if (data.type == "offer") {
            receiver?.send(JSON.stringify({ type: "offer", offer: data.offer }))


        }
        else if (data.type == "ans") {
          
            sender?.send(JSON.stringify({ type: "ans", ans: data.answer }))

        }

    })


})


app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:port`);
});