import { Server, Data } from "ws";
import * as websocket from "ws";
import * as url from "url";

interface Clients {
  [key: string]: websocket[];
}
interface Query {
    streaming_channel?: string | undefined;
    channel?: string | undefined;
}

const wss: Server = new websocket.Server({ port: 8000 });
const clients: Clients = {};

wss.on("connection", function connection(ws: websocket, req: any) {
  const query: Query = url.parse(req.url, true).query;
  const streaming_channel: string | undefined = query.streaming_channel as string | undefined;
  const channel: string | undefined = query.channel as string | undefined;

  // if streaming channel is not defined, then it is a general connection
  if (streaming_channel !== undefined) {
    if (!clients[streaming_channel]) {
      clients[streaming_channel] = [];
    }
  }

  // if channel is not defined, then it is a general connection
  // this is for ws connection management
  if (channel !== undefined) {
    if (!clients[channel]) {
      clients[channel] = [];
    }
    if (!clients[channel].includes(ws)) {
      clients[channel].push(ws);
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
  ws.on("message", function message(data: Data) {
    if (streaming_channel !== undefined) {
      clients[streaming_channel].forEach((client: websocket) => {
        if (client !== ws && client.readyState === websocket.OPEN) {
          client.send(data);
        }
      });
    }
  });

  ws.send("something");
});
