/*These are our endpoints for our fetches
https://www.coingecko.com/api/documentations/v3
*/
const baseURL = 'https://api.coingecko.com/api/v3'
const trendingEndpoint = '/search/trending'
const coinsEndpoint = '/coins/'
const listEndpoint = '/coins/list'
const marketsEndpoint = '/coins/markets'
const oldDate = '/coins/bitcoin/history?date='

const marketsQuery = '?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=24h'

/* document selectors */
const body = document.querySelector('body')
const trendingList = document.querySelector('#trending-list-ul')

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
        renderList(json)
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

function renderTrendingCoin(coin, numRank){
    let listLi = document.createElement('li')
    let numberSpan = document.createElement('span')
    let trendingName = document.createElement('div')
    let coinImg = document.createElement('img')
    let coinName = document.createElement('h4')
    let priceDiv = document.createElement('div')
    let arrowSpan = document.createElement('span')
    let percentSpan = document.createElement('span')

    trendingName.append(coinImg, coinName)
    priceDiv.append(arrowSpan, percentSpan)
    listLi.append(numberSpan, trendingName, priceDiv)
    trendingList.append(listLi)

    listLi.className = 'trending-list-li'
    numberSpan.className= 'trending-num'
    trendingName.className = 'trending-name'
    coinImg.className = 'trending-img'
    coinName.className = 'trending-coin'
    priceDiv.className = 'trending-price-change'
    arrowSpan.className = 'trending-arrow'
    percentSpan.className = 'trending-percent'

    numberSpan.textContent = '0' + (coin.score + 1)
    coinImg.src = coin.small
    coinName.textContent = coin.name
    
    //gotta fetch the details then set percent change
    fetch(baseURL + coinsEndpoint + coin.id)
    .then(resp => resp.json())
    .then((coinDetail) => {
        let percentChange = coinDetail.market_data.price_change_percentage_24h
        percentChange = percentChange.toFixed(2)
        percentSpan.textContent = percentChange + '%'
        if(percentChange <= 0){
            priceDiv.classList.add('red')
            arrowSpan.innerHTML = `&#9660`
        }else{
            priceDiv.classList.add('green')
            arrowSpan.innerHTML = `&#9650`
        }
    })
}

function getCoinDetails(id){
    fetch(baseURL + coinsEndpoint + id)
    .then(resp => resp.json())
    .then((console.log))
}

function renderList(data) {
    let leftDropdown = document.querySelector('#dropdown-left')
    let rightDropdown = document.querySelector('#dropdown-right')
    let dropdownImgRight = document.querySelector('#dropdown-right')
    let dropdownImgLeft = document.querySelector('#dropdown-left')
    
    data.forEach(element => {
        let dropdownOptionRight = document.createElement('option')
        let dropdownOptionLeft = document.createElement('option')
        
        dropdownOptionRight.value = element.id
        dropdownOptionRight.textContent = element.name
        dropdownOptionLeft.value = element.id
        dropdownOptionLeft.textContent = element.name

        leftDropdown.appendChild(dropdownOptionLeft)
        rightDropdown.appendChild(dropdownOptionRight)
    })   

    // Event listener to change image in the dropdown
    leftDropdown.addEventListener('change', event => {            
        const coinID = event.target.value
        let coinFinder = data.find(element => coinID === element.id)
        dropdownImgLeft.style.background = `no-repeat 24px 20px/32px  url(${coinFinder.image})`
        renderCoinDetails(coinFinder, 'left')
    })

    rightDropdown.addEventListener('change', event => {            
        const coinID = event.target.value
        let coinFinder = data.find(element => coinID === element.id)
        dropdownImgRight.style.background = `no-repeat 24px 20px/32px  url(${coinFinder.image})`
        renderCoinDetails(coinFinder, 'right')
    })

    rightDropdown.selectedIndex = 1;

    let event = new Event('change');
    leftDropdown.dispatchEvent(event);
    rightDropdown.dispatchEvent(event);

    // Function that opens the modal and populates info inside
    document.querySelector('.info-modal-btn').addEventListener('click', () => {
        document.getElementById('id01').style.display='block';
        document.querySelector('.bg').style.filter='blur(10px)';
    
        const targetName = data.find(element => event.target.value)
        document.querySelector('.modal-img').src = targetName.image
        console.log(targetName.image)
    })
}

function renderCoinDetails(coin, side){
    document.querySelector(`#${side}-btn`).textContent = `Learn more about ${coin.name}`
    document.querySelector(`#${side}-price-div p`).textContent = `$${formatNumber(coin.current_price.toFixed(2))}`
    let arrow = document.querySelector(`#${side}-price-div span:first-child`)
    let changeDiv = document.querySelector(`#${side}-price-div .trending-price-change`)
    if(coin.price_change_percentage_24h <= 0){
        changeDiv.classList.add('red')
        changeDiv.classList.remove('green')
        arrow.innerHTML = `&#9660`
    }else{
        changeDiv.classList.add('green')
        changeDiv.classList.remove('red')
        arrow.innerHTML = `&#9650`
    }
    document.querySelector(`#${side}-price-div span:last-child`).textContent = coin.price_change_percentage_24h.toFixed(2) + '%'

    document.querySelector(`#${side}-market-cap`).textContent = '$' + formatNumber(coin.market_cap)
    document.querySelector(`#${side}-volume`).textContent = '$' + formatNumber(coin.total_volume)
    document.querySelector(`#${side}-circulating-supply`).textContent = formatNumber(coin.circulating_supply.toFixed(2))
    document.querySelector(`#${side}-24-high`).textContent = '$' + formatNumber(coin.high_24h)
    document.querySelector(`#${side}-24-low`).textContent = '$' + formatNumber(coin.low_24h)
    document.querySelector(`#${side}-ath`).textContent = '$' + formatNumber(coin.ath)
    document.querySelector(`#${side}-atl`).textContent = '$' + formatNumber(coin.atl.toFixed(2))
}

// Animation for timer
function checkTime(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
}
  
function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    // add a zero in front of numbers<10
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('time').innerHTML = h + ":" + m + ":" + s;
    t = setTimeout(function() {
      startTime()
    }, 500);
}
startTime();



document.querySelector('.w3-display-topright').addEventListener('click', () => {
    document.getElementById('id01').style.display='none';
    document.querySelector('.bg').style.filter='none';
})

document.querySelector('.fomo-form').addEventListener('change', e => {
    let inputAmount = e.currentTarget.fomoDollars.value
    let priceOldBefore = e.currentTarget.startDate.value.split('-')
    let priceOldDate = `${priceOldBefore[2]}-${priceOldBefore[1]}-${priceOldBefore[0]}`


    fetch(baseURL+oldDate+priceOldDate)
    .then(resp => resp.json())
    .then(json => {
        // let priceOldAmount = json.market_data.current_price.usd
        console.log(json)
        
        // This is the equation
        // (input_amount / price_at_chosen_date) * price_today
        document.querySelector('.fomo-output').textContent = '$' + (inputAmount/priceOldAmount * 1)

    })
})

document.querySelector('.fomo-form').addEventListener('submit', e => {
    e.preventDefault()

    console.log(e)
})

function renderFullCoin(coin){
    console.log(coin)
}

function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }

  function currencyFormat(num) {
    return '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }