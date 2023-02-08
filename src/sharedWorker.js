const API_KEY = '2ec7c10f4ec8701eac244126c4cd4b095cd71cf20641a7fe194ae881e8e8c3bb'

const socket = new WebSocket("wss://streamer.cryptocompare.com/v2?api_key=2ec7c10f4ec8701eac244126c4cd4b095cd71cf20641a7fe194ae881e8e8c3bb")

const AGGREGATE_INDEX = "5"

// self.onconnect = function (e) {
//     let port = e.ports[0];
//     port.onmessage = function (e) {
//         port.postMessage('6')
//     }
// }

onconnect = function (event) {
    const port = event.ports[0];

    port.onmessage = function (e) {
        const tickersHandlers = e.data[0]

        socket.addEventListener("message", (e) => {
            let {TYPE: type, FROMSYMBOL: token, PRICE: price, PARAMETER: parameter} = JSON.parse(e.data)

            if (type === '500') {
                let InvalidTokenName = parameter.split('~')[2]
                let newPrice = price ?? '–'

                const handlers = tickersHandlers.get(InvalidTokenName) ?? []
                handlers.forEach(fn => fn(newPrice))
            }

            if (type !== AGGREGATE_INDEX || price === undefined) {
                return
            }

            const handlers = tickersHandlers.get(token) ?? []
            handlers.forEach(fn => fn(price))
        })

        port.postMessage(tickersHandlers);
    };
};

function subscribeToWS (tickerName) {
    sendToWS(JSON.stringify({
        action: "SubAdd",
        subs: [`5~CCCAGG~${tickerName}~USD`]
    }))
}

function unsubscribeToWS (tickerName) {
    sendToWS(JSON.stringify({
        action: "SubRemove",
        subs: [`5~CCCAGG~${tickerName}~USD`]
    }))
}

function sendToWS (message) {
    if(socket.readyState === WebSocket.OPEN) {
        socket.send(message)
        return
    }

    socket.addEventListener("open", () => {
        socket.send(message)
    }, { once: true })
}


