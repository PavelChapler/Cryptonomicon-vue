const API_KEY = '2ec7c10f4ec8701eac244126c4cd4b095cd71cf20641a7fe194ae881e8e8c3bb'

const tickersHandlers = new Map()

async function loadTokensFromApi (tickersNames) {
    if ([...tickersHandlers.values()].length === 0) return

    await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickersNames.join(',')}&tsyms=USD&api_key=${API_KEY}`, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
            // 'X-CoinAPI-Key': '37E874AF-3F5C-4DD7-A60E-1D7A0B3A93FD'
        },
    }).then(value => value.json())
      .then(value => {
          const updatedPrices = Object.fromEntries(Object.entries(value).map(([key, content]) => [key, content.USD]))

          Object.entries(updatedPrices).forEach(([currency, price]) => {

              const handlers = tickersHandlers.get(currency) ?? []

              handlers.forEach(fn => fn(price))

          })
      })
}


export function subscribeToUpdateTicker (ticker, cb) {
    const subscribesFunctions = tickersHandlers.get(ticker) || []
    tickersHandlers.set(ticker, [...subscribesFunctions, cb])
}

export function unsubscribeToUpdate (tickerName) {
    tickersHandlers.delete(tickerName)
}


setInterval(() => {
    loadTokensFromApi([...tickersHandlers.keys()])
}, 5000)

window.tickersHandlers = tickersHandlers
//https://rest.coinapi.io/v1/exchangerate/${ticketName.toUpperCase()}/USD`