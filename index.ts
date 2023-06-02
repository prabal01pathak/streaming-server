import { Server, Data } from "ws";
import express from "express";
import http from "http";
import cors from "cors";
import * as websocket from "ws";
import * as url from "url";

interface Clients {
  [key: string]: {
    [key: string]: websocket[];
  };
}
interface Query {
  streaming_channel?: string | undefined;
  eventId?: string | undefined;
  channel?: string | undefined;
}

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss: Server = new websocket.Server({ server });

const clients: Clients = {};

wss.on("connection", (ws: websocket, req: any) => {
  const endpoint = req.url;
  console.log("endpoint", endpoint);
  const query: Query = url.parse(req.url, true).query;
  const streaming_channel: string | undefined = query.streaming_channel as
    | string
    | undefined;
  const eventId: string | undefined = query.eventId as string | undefined;
  let channel: string | undefined = query.channel as string | undefined;
  console.log("deviceId", eventId);
  if (endpoint.includes("/api/stream")) {
    channel = endpoint.split("/api/stream/")[1].split("?")[0];
    console.log("channel", channel);
  }

  // if streaming channel is not defined, then it is a general connection
  if (eventId && streaming_channel) {
    if (!clients[eventId]) {
      clients[eventId] = {};
    }
    if (!clients[eventId][streaming_channel]) {
      clients[eventId][streaming_channel] = [];
    }
  }

  // if channel is not defined, then it is a general connection
  // this is for ws connection management
  if (eventId && channel) {
    if (!clients[eventId]) {
      clients[eventId] = {};
    }
    if (!clients[eventId][channel]) {
      clients[eventId][channel] = [];
    }
    if (!clients[eventId][channel].includes(ws)) {
      clients[eventId][channel].push(ws);
    }
  }

  console.log(
    "New connection",
    "streaming channel:",
    streaming_channel,
    "channel:",
    channel
  );

  ws.on("error", console.error);
  ws.on("message", (data: Data) => {
    // // log type of data
    // console.log(typeof data);
    // // if data is json then parse it
    // let sendData = true;
    // if (typeof data === "object") {
    //   try {
    //     console.log(JSON.parse(data.toString()))
    //     sendData = false;
    //   } catch (e) {
    //     console.error("eerror while showing the data: ", e);
    //   }
    // }
    if (eventId && streaming_channel) {
      clients[eventId][streaming_channel].forEach((client: websocket) => {
        if (client !== ws && client.readyState === websocket.OPEN) {
          client.send(data);
        }
      });
    }
  });

  ws.send("something");
});

app.get("/dbcameralist", (req: express.Request, res: express.Response) => {
  const eventId: string = req.query.eventId as string;
  const data = [];
  if (clients[eventId]) {
    for (const key in clients[eventId]) {
      data.push({ id: key, name: key });
    }
  }
  res.send(data);
});

app.get("/nvrcameralist", (req: express.Request, res: express.Response) => {
  const eventId: string = req.query.eventId as string;
  const data = [];
  if (clients[eventId]) {
    for (const key in clients[eventId]) {
      data.push({ id: key, name: key });
    }
  }
  res.send(data);
});

server.listen(8080, () => {
  console.log("server is running on the port: ", 8080);
});
