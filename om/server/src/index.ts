import express, { Request, Response } from 'express'
import http from 'http'
import WebSocket, { WebSocketServer } from 'ws';
const app = express();
const port = 3000;

app.use(express.json())
const httpServer = http.createServer(app)


const wss = new WebSocketServer({ server: httpServer })

let sender: WebSocket | null = null
let receiver: WebSocket | null = null

wss.on('connection', (ws) => {
  ws.on('error', (err) => console.log(err))
  ws.onmessage = (msg) => {

    const data = JSON.parse(msg.data.toLocaleString())

    switch (data.type) {
      case 'user': {
        sender ? receiver = ws : sender = ws


        if (receiver && sender) {
          console.log("send");
          sender.send(JSON.stringify({ type: "create-offer" }))
        }

        break;

      }
      case "send-Offer": {
        const send = ws == sender ?  receiver:sender
        send?.send(JSON.stringify({type:"create-answer",offer:data.offer}))

        break;

      }
      case "send-ans": {
        const send = ws == sender ? receiver : sender 
        send?.send(JSON.stringify({type:"answer",ans:data.ans}))
        break;

      }
      case "ice": {
        const send = ws == sender ? receiver : sender
        send?.send(JSON.stringify({type:"send-ice",ice:data.ice}))

        break;
      }


    }
  }

})



app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:port`);
});




