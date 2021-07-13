/*These are our endpoints for our fetches
https://www.coingecko.com/api/documentations/v3
*/
const baseURL = 'https://api.coingecko.com/api/v3'
const trendingEndpoint = '/search/trending'
const coinsEndpoint = '/coins/'
const listEndpoint = '/coins/list'
const marketsEndpoint = '/coins/markets'

const marketsQuery = '?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=24h'

/* document selectors */
const body = document.querySelector('body')

/*this is a hack*/
const coinArray = [];

/*entry point to app*/
getTrending()
GetList()

/*fetches*/

function getTrending(){
    fetch(baseURL+trendingEndpoint)
    .then(resp => resp.json())
    .then(json => renderTrending(json))
}

function GetList(){
    fetch(baseURL + marketsEndpoint + marketsQuery)
    .then(resp => resp.json())
    .then(json => {
        console.log(json)
    })
    
}

function getCoinDetails(id){
    fetch(baseURL + coinsEndpoint + id)
    .then(resp => resp.json())
    .then(renderFullCoin)
}

/*  Render functions */

function renderTrending(trendingJSON){
    console.log(trendingJSON)
    trendingJSON.coins.forEach(coin => renderTrendingCoin(coin.item))
}

function renderFullCoin(coin){
    console.log(coin)
}

function renderTrendingCoin(coin){
    let div = document.createElement('div')
    let h1Name = document.createElement('h1')
    let h2Price = document.createElement('h2')
    let img = document.createElement('img')
    h1Name.textContent = coin.name
    //h2Price = coin.price_btc
    img.src = coin.small

    div.dataset.id = coin.id
    div.addEventListener('click', (e)=>{
       getCoinDetails(e.currentTarget.dataset.id)
    })
    div.append(h1Name, h2Price, img)
    body.append(div)
    
    //we need to grab a little more data to do the price change thing
    fetch(baseURL + coinsEndpoint + coin.id)
    .then(resp => resp.json())
    .then((json) => {
        console.log(json.market_data.price_change_percentage_24h)
        h2Price.textContent = json.market_data.price_change_percentage_24h

    })
}



