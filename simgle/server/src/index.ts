import express, { Request, Response } from "express";
import WebSocket, { WebSocketServer } from "ws";
import http from "http";

const app = express();
const port = 3000;

app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let send: WebSocket | null = null;
let Re: WebSocket | null = null;

wss.on("connection", (ws) => {
    ws.on("close", () => {
        if (ws === send) send = null;
        if (ws === Re) Re = null;
    });

    ws.on("message", (message) => {
        const data = JSON.parse(message.toString());
        switch (data.message) {
            case "sender":
                send = ws;
                break;
            case "Re":
                Re = ws;
                break;
            case "ice":
                Re?.send(JSON.stringify({ message: "ice", ice: data.ice }));
                break;
            case "createOffer":
                Re?.send(JSON.stringify({ message: "createOffer", offer: data.offer }));
                break;
            case "ans":
                send?.send(JSON.stringify({ message: "ans", ans: data.ans }));
                break;
        }
    });
});

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World");
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
