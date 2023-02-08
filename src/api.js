const API_KEY =
  "2ec7c10f4ec8701eac244126c4cd4b095cd71cf20641a7fe194ae881e8e8c3bb";

const tickersHandlers = new Map();

const socket = new WebSocket(
  "wss://streamer.cryptocompare.com/v2?api_key=2ec7c10f4ec8701eac244126c4cd4b095cd71cf20641a7fe194ae881e8e8c3bb"
);

const AGGREGATE_INDEX = "5";

socket.addEventListener("message", (e) => {
  let {
    TYPE: type,
    FROMSYMBOL: token,
    PRICE: price,
    PARAMETER: parameter,
    MESSAGE: message,
  } = JSON.parse(e.data);

  if (type === "500" && message !== "SUBSCRIPTION_ALREADY_ACTIVE") {
    const invalidTokenName = parameter.split("~")[2];

    const newPrice = price ?? "–";

    const handlers = tickersHandlers.get(invalidTokenName) ?? [];
    handlers.forEach((fn) => fn(newPrice));
  }

  if (type !== AGGREGATE_INDEX || price === undefined) {
    return;
  }

  const handlers = tickersHandlers.get(token) ?? [];
  handlers.forEach((fn) => fn(price));
});

function subscribeToWS(tickerName) {
  sendToWS(
    JSON.stringify({
      action: "SubAdd",
      subs: [`5~CCCAGG~${tickerName}~USD`],
    })
  );
}

function unsubscribeToWS(tickerName) {
  sendToWS(
    JSON.stringify({
      action: "SubRemove",
      subs: [`5~CCCAGG~${tickerName}~USD`],
    })
  );
}

function sendToWS(message) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(message);
    },
    { once: true }
  );
}

export function subscribeToUpdateTicker(ticker, cb) {
  const subscribesFunctions = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribesFunctions, cb]);
  subscribeToWS(ticker);
}

export function unsubscribeToUpdate(tickerName) {
  tickersHandlers.delete(tickerName);
  unsubscribeToWS(tickerName);
}

window.tickersHandlers = tickersHandlers;
//https://rest.coinapi.io/v1/exchangerate/${ticketName.toUpperCase()}/USD`
