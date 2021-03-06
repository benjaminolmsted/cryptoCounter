// These are our endpoints for our fetches https://www.coingecko.com/api/documentations/v3
const baseURL = 'https://api.coingecko.com/api/v3'
const trendingEndpoint = '/search/trending'
const coinsEndpoint = '/coins/'
const listEndpoint = '/coins/list'
const marketsEndpoint = '/coins/markets'
const oldDate = '/coins/bitcoin/history?date='
const marketsQuery = '?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=24h,7d,30d,1y' //is it possible to add more data to this request?
const youtubeURL = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&q=cryptocurrency%10for%10beginners&maxResults=10&type=video&videoDefinition=high&key=${youtubeAPI}`

// Global Variables & Selectors
let dataCache
const body = document.querySelector('body')
const trendingList = document.querySelector('#trending-list-ul')
const tickerDiv = document.querySelector('#ticker-scroller')

// Entry Point to App
startTime()
getTrending()
getList()
youtubeData()

function oldDateURL (id){
    return `/coins/${id}/history?date=`
}

function marketChartURL(id, days){
    return `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`
}

//Chart Styling
Chart.defaults.elements.point = 1
Chart.defaults.elements.line.borderWidth = 1
Chart.defaults.plugins.legend.display = false

// FETCHES

// Get trending is out entry point to rendering the 7 coins that are trending on coinGecko search
function getTrending(){
    fetch(baseURL+trendingEndpoint)
    .then(resp => resp.json())
    .then(json => renderTrending(json))
}

// getList fetches the 25 top coins, as specified in the marketsQuery variable
function getList(){
    fetch(baseURL + marketsEndpoint + marketsQuery)
    .then(resp => resp.json())
    .then(json => {
        cacheJSON(json)
        renderList(json)
    })   
}

// Sometimes we want more detail about a coin. This gets it for us and renders the details in a modal view.
function getCoinDetails(id){
    fetch(baseURL + coinsEndpoint + id)
    .then(resp => resp.json())
    .then(renderModal)
}

// When we want to get market data, we use this function.
// id of the coin we want
// daysAgo integer number of days
// right or left
// percentChange shows us if the market is up or down
function getMarketChart(id, daysAgo, side, percentChange){
   fetch(marketChartURL(id, daysAgo))
   .then(resp => resp.json())
   .then(json => {
       renderMarketChart(json, daysAgo, side, percentChange)
   })
}

// Fetch the Youtube API
function youtubeData() {
    fetch(youtubeURL)
    .then(resp => resp.json())
    .then(json => youtubeRender(json))
}

function cacheJSON(json){
    dataCache = json
}

//  RENDER FUNCTIONS

// Renders our market chart data using https://www.chartjs.org/docs/latest/
function renderMarketChart(json, daysAgo, side, percentChange){
    const priceData = json.prices
    // Then we make an x and y array
    const x = []
    const y = []
    
    // Then we go over the prices and make the arrays
    priceData.forEach(datum => {
        let date = new Date(datum[0])
        if(daysAgo === 1){
            let zero = date.getMinutes() < 10 ? '0' : ''
            x.push(date.getHours() + ":" + zero + date.getMinutes())
        }else{
             x.push((date.getMonth() + 1) + '-' + date.getDate())
        }
        y.push(datum[1])
    })
    let chartColor = (percentChange < 0) ?  '#FA250A' : '#0AFB83'
    const labels = x
    const data = {
        labels: labels,
        datasets: [{
          label: 'Price',
          backgroundColor: chartColor,
          borderColor: chartColor,
          data: y,
        }]
      };
    const config = {
        type: 'line',
        data,
        options: {
            animation: {
                duration: 300
            }
        }
    }
    
    const chart = Chart.getChart(`${side}Chart`);
    if(chart){
        chart.destroy()
    }
    let myChart = new Chart(
        document.getElementById(`${side}Chart`),
        config
    );
}

// Wrapper to interate over our trending coins
function renderTrending(trendingJSON){
    trendingJSON.coins.forEach(coin => renderTrendingCoin(coin.item))
}

// Main function for rendering our trending coins on the side of the page
function renderTrendingCoin(coin, numRank){
    let listLi = document.createElement('li')
    let numberSpan = document.createElement('span')
    let trendingName = document.createElement('div')
    let coinImg = document.createElement('img')
    let coinName = document.createElement('h4')
    let priceDiv = document.createElement('div')
    let arrowSpan = document.createElement('span')
    let percentSpan = document.createElement('span')

    listLi.className = 'trending-list-li'
    numberSpan.className= 'trending-num'
    trendingName.className ='trending-name'
    coinImg.className = 'trending-img'
    coinName.className = 'trending-coin'
    priceDiv.className = 'trending-price-change'
    arrowSpan.className = 'trending-arrow'
    percentSpan.className = 'trending-percent'
    numberSpan.textContent = '0' + (coin.score + 1)
    coinImg.src = coin.small
    coinName.textContent = coin.name
    trendingName.append(coinImg, coinName)
    priceDiv.append(arrowSpan, percentSpan)
    listLi.append(numberSpan, trendingName, priceDiv)
    trendingList.append(listLi)
    
    // Gotta fetch the details then set percent change
    fetch(baseURL + coinsEndpoint + coin.id)
    .then(resp => resp.json())
    .then((coinDetail) => {
        let percentChange = coinDetail.market_data.price_change_percentage_24h
        percentChange = percentChange.toFixed(2)
        percentSpan.textContent = percentChange + '%'
        percentChangeDivAndArrow(percentChange, priceDiv, arrowSpan)
    })
    // Fetches coin details then renders them in our modal view
    listLi.addEventListener('click', e => {
        document.getElementById('id01').style.display='block';
        document.querySelector('.bg').style.filter='blur(10px)';
        getCoinDetails(coin.id)
    })
}

// Renders and populates the dropdown lists for our main compare crypto view
// Adds a bunch of listeners that rely on the fetched data
// We could refactor to use the cached data
function renderList(data) {
    let leftDropdown = document.querySelector('#dropdown-left')
    let rightDropdown = document.querySelector('#dropdown-right')
    let dropdownCalc = document.querySelector('.choose-coin')
    
    data.forEach(element => {
        addOptionToDropdown(leftDropdown, element)
        addOptionToDropdown(rightDropdown, element)
        addOptionToDropdown(dropdownCalc, element)
        addToTicker(element)
    })
    data.forEach(element => {
        addToTicker(element)
    })

    // Event listener to change image in the dropdown
    leftDropdown.addEventListener('change', event => {            
        addEventListenerToDropdown(leftDropdown, data, event, 'left')
    })

    rightDropdown.addEventListener('change', event => {            
        addEventListenerToDropdown(rightDropdown, data, event, 'right')
    })

    //set right drop down and fire off an event that causes the display to update
    rightDropdown.selectedIndex = 1;
    const event = new Event('change');
    leftDropdown.dispatchEvent(event);
    rightDropdown.dispatchEvent(event);
    document.querySelector('.fomo-form').dispatchEvent(event);

    // Function that opens the modal and populates info inside
    document.querySelector('#left-btn').addEventListener('click', (event) => {
        document.getElementById('id01').style.display='block';
        document.querySelector('.bg').style.filter='blur(10px)';
        getCoinDetails(event.target.dataset.id)
    })
    document.querySelector('#right-btn').addEventListener('click', (event) => {
        document.getElementById('id01').style.display='block';
        document.querySelector('.bg').style.filter='blur(10px)';
        getCoinDetails(event.target.dataset.id)
    })

    //add historic time event listeners 
    document.querySelector('#price_change_24h').addEventListener('click', (e) => {
        addEventListenerToHistoricButtons(leftDropdown, rightDropdown, data, e, 'price_change_percentage_24h', 1)
    })
    document.querySelector('#price_change_7days').addEventListener('click', (e) => {
        addEventListenerToHistoricButtons(leftDropdown, rightDropdown, data, e, 'price_change_percentage_7d_in_currency', 7)
    })
    document.querySelector('#price_change_30days').addEventListener('click', (e) => {
        addEventListenerToHistoricButtons(leftDropdown, rightDropdown, data, e, 'price_change_percentage_30d_in_currency', 30)
    })
    document.querySelector('#price_change_1year').addEventListener('click', (e) => {
        addEventListenerToHistoricButtons(leftDropdown, rightDropdown, data, e, 'price_change_percentage_1y_in_currency', 365)
    })
}

// Helpers for renderList()
function addOptionToDropdown(menu, element){
    let dropdownOption = document.createElement('option')
    dropdownOption.value = element.id
    dropdownOption.textContent = element.name
    menu.appendChild(dropdownOption)
}

// Event Listener for Dropdown in Compare Section
function addEventListenerToDropdown(menu, data, event, side){
    const coinID = event.target.value
    let coinFinder = data.find(element => coinID === element.id)
    menu.style.background = `no-repeat 24px 12px / 32px  url(${coinFinder.image})`
    menu.style.backgroundColor = '#222'
    renderCoinDetails(coinFinder, side)
    getMarketChart(coinFinder.id, 1, side, coinFinder.price_change_percentage_24h)
    removeSelectedClass()
    document.querySelector('#price_change_24h').classList.add('selected-price-tab')

    // Styling for dropdown for light mode toggle
    let lightModeToggle = document.querySelector('.slider')
    if (lightModeToggle.dataset.checked === 'dark mode on') {
        menu.style.backgroundColor = 'white';
    }else{
        menu.style.backgroundColor = '#222';
    }
}

// Event listener for toggling dates in the Price Change section
function addEventListenerToHistoricButtons(leftDropdown, rightDropdown, data, event, qString, days){
    removeSelectedClass()
    event.target.classList.add('selected-price-tab')
    let coinFinder = data.find(element => leftDropdown.value === element.id)
    timeScaleChanged('left', coinFinder[qString], leftDropdown.value, days)
    coinFinder = data.find(element => rightDropdown.value === element.id)
    timeScaleChanged('right', coinFinder[qString], rightDropdown.value, days)
}

// Function to update the Price Change section
function timeScaleChanged(side, percentChange, id, daysAgo){
    let arrow = document.querySelector(`#${side}-price-div span:first-child`)
    let changeDiv = document.querySelector(`#${side}-price-div .trending-price-change`)
    document.querySelector(`#${side}-price-div span:last-child`).textContent = percentChange.toFixed(2) + '%'
    percentChangeDivAndArrow(percentChange, changeDiv, arrow)
    getMarketChart(id, daysAgo, side, percentChange)
}

// Resets historic buttons to all be unselected
function removeSelectedClass(){
    document.querySelector('#price_change_24h').classList.remove('selected-price-tab')
    document.querySelector('#price_change_7days').classList.remove('selected-price-tab')
    document.querySelector('#price_change_30days').classList.remove('selected-price-tab')
    document.querySelector('#price_change_1year').classList.remove('selected-price-tab')
}

// Function for rendering detailed coin in a modal popup
function renderModal(coinData){
    document.querySelector('.modal-img').src = coinData.image.small
    document.querySelector('.modal-header-name').textContent = coinData.name
    document.querySelector('.modal-header-ticker').textContent = coinData.symbol.toUpperCase()
    document.querySelector('.w3-container .compare-large-text').textContent = '$' + formatNumber(coinData.market_data.current_price.usd.toFixed(3))
    let changeDiv = document.querySelector('.trending-price-change')
    let arrow = document.querySelector('.trending-arrow')
    percentChangeDivAndArrow(coinData.market_data.price_change_24h, changeDiv, arrow)
    document.querySelector('.trending-percent').textContent = coinData.market_data.price_change_percentage_24h.toFixed(2) + '%'
    document.querySelector('.modal-description-opener').innerHTML = coinData.description.en.slice(0,200)
    document.querySelector('.modal-description-hidden').innerHTML = coinData.description.en.slice(201,-1)
    document.querySelector('#modal-market-cap').textContent = '$' + abbreviate_number(coinData.market_data.market_cap.usd)
    document.querySelector('#modal-volume').textContent = '$' + abbreviate_number(coinData.market_data.total_volume.usd)
    document.querySelector('#modal-supply').textContent = abbreviate_number(coinData.market_data.circulating_supply)
    document.querySelector('#modal-24high').textContent = '$' + coinData.market_data.high_24h.usd.toFixed(2)
    document.querySelector('#modal-24low').textContent = '$' + coinData.market_data.low_24h.usd.toFixed(2)
    document.querySelector('#modal-ath').textContent = '$' + coinData.market_data.ath.usd.toFixed(2)
    document.querySelector('#modal-atl').textContent = '$' + coinData.market_data.atl.usd.toFixed(2)
}       


// Function to connect all compare data points to the crypto API
function renderCoinDetails(coin, side){
    document.querySelector(`#${side}-btn`).textContent = `Learn more about ${coin.name}`
    document.querySelector(`#${side}-btn`).dataset.id = coin.id
    document.querySelector(`#${side}-price-div p`).textContent = `$${formatNumber(coin.current_price.toFixed(2))}`
    let arrow = document.querySelector(`#${side}-price-div span:first-child`)
    let changeDiv = document.querySelector(`#${side}-price-div .trending-price-change`)
    percentChangeDivAndArrow(coin.price_change_percentage_24h, changeDiv, arrow)
    document.querySelector(`#${side}-price-div span:last-child`).textContent = coin.price_change_percentage_24h.toFixed(2) + '%'
    document.querySelector(`#${side}-market-cap`).textContent = '$' + abbreviate_number(coin.market_cap)
    document.querySelector(`#${side}-volume`).textContent = '$' + abbreviate_number(coin.total_volume)
    document.querySelector(`#${side}-circulating-supply`).textContent = abbreviate_number(coin.circulating_supply)
    document.querySelector(`#${side}-24-high`).textContent = '$' + formatNumber(coin.high_24h.toFixed(2))
    document.querySelector(`#${side}-24-low`).textContent = '$' + formatNumber(coin.low_24h.toFixed(2))
    document.querySelector(`#${side}-ath`).textContent = '$' + formatNumber(coin.ath.toFixed(2))
    document.querySelector(`#${side}-atl`).textContent = '$' + formatNumber(coin.atl.toFixed(2))
}

// Event listeners to update the FOMO form as new values are put into the input fields
document.querySelector('.fomo-form').addEventListener('change', e => {
    let inputAmount = e.currentTarget.fomoDollars.value
    let priceOldBefore = e.currentTarget.startDate.value.split('-')
    let priceOldDate = `${priceOldBefore[2]}-${priceOldBefore[1]}-${priceOldBefore[0]}`
    let date = new Date()
    let dateObj = new Date(`${priceOldBefore[0]}-${priceOldBefore[1]}-${priceOldBefore[2]}`)
    let fomoImg = document.querySelector('.fomo-form-img')

    let id = e.currentTarget.chooseCoin.value
    fetch(baseURL+oldDateURL(id)+priceOldDate)
    .then(resp => resp.json())
    .then(json => {
        if (json.market_data){
            let priceOldAmount = json.market_data.current_price.usd
            let priceToday = dataCache.find((name) => name.id === id).current_price
            // This is the equation
            // (input_amount / price_at_chosen_date) * price_today
            document.querySelector('.fomo-output').textContent = '$' + formatNumber(((inputAmount/priceOldAmount * priceToday)).toFixed(2)) + ' today.'
            fomoImg.src = `${json.image.small}`
            fomoImg.sec = `${json.name} image`
        } else if (!json.market_data && dateObj > date){
            document.querySelector('.fomo-output').textContent = "in the future. We're not fortunetellers!"
        } else {
            document.querySelector('.fomo-output').textContent = 'before coin Gecko has data, or before the markets were open for ' + json.name
        }
    })
})

document.querySelector('.fomo-form').addEventListener('submit', e => {
    e.preventDefault()
})

// X Button to close modal
document.querySelector('.w3-display-topright').addEventListener('click', () => {
    document.getElementById('id01').style.display='none';
    document.querySelector('.bg').style.filter='none';
})

// Youtube Render Function
function youtubeRender(videoData) {
  videoData.items.forEach(element => {
    let aLink = document.createElement('a')
    let videoContainer = document.createElement('div')
    let videoImg = document.createElement('img')
    let videoTitle = document.createElement('h4')
    let videoByline = document.createElement('p')

    videoContainer.className = 'video-container'
    videoImg.className = 'video-img'
    videoTitle.className = 'video-title'
    videoByline.className = 'video-byline'

    videoImg.src = element.snippet.thumbnails.medium.url
    videoTitle.innerHTML = element.snippet.title
    videoByline.textContent = element.snippet.channelTitle
    aLink.href = 'https://www.youtube.com/watch?v=' + element.id.videoId
    aLink.target = '_blank'

    videoContainer.append(videoImg, videoTitle, videoByline)
    aLink.append(videoContainer)
    document.querySelector('#youtube-videos-container').append(aLink)
  })
}

// Helper function to determine color depending on whether % change is -/+
function percentChangeDivAndArrow(priceChange, changedDiv, arrow){
  if(priceChange <= 0){
    changedDiv.classList.add('red')
    changedDiv.classList.remove('green')
    arrow.innerHTML = `&#9660`
  }else{
    changedDiv.classList.add('green')
    changedDiv.classList.remove('red')
    arrow.innerHTML = `&#9650`
  }
}

// Function for Read More functionality in the modal
document.querySelector('.modal-read-more').addEventListener('click', e => readMoreDescription())

function readMoreDescription() {
  var dots = document.querySelector(".modal-description-dots");
  var moreText = document.querySelector(".modal-description-hidden");
  var btnText = document.querySelector(".modal-read-more");

  if (dots.style.display === "none") {
    dots.style.display = "inline";
    btnText.innerHTML = "Read more";
    moreText.style.display = "none";
  } else {
    dots.style.display = "none";
    btnText.innerHTML = "Read less";
    moreText.style.display = "inline";
  }
}

// Function for light mode toggle
let lightModeToggle = document.querySelector('.slider')
let lightModeInput = document.querySelector('.lightModeInput')

lightModeToggle.addEventListener('click', e => {    
  if (lightModeToggle.dataset.checked === 'dark mode on') {
      lightModeToggle.dataset.checked = 'light mode on';
      document.querySelector('body').style.color = 'white';
      document.querySelector('body').style.background = '#222';
      document.querySelector('.light-mode-label').textContent = 'Dark Mode: On';
      document.querySelector('.compare-dropdown').style.color = 'white';
      document.querySelector('.compare-dropdown').style.backgroundColor = '#222';
      document.querySelector('#dropdown-right').style.color = 'white';
      document.querySelector('#dropdown-right').style.backgroundColor = '#222';
      document.querySelector('#trending-container').style.background = '#333';
      document.querySelector('#price_change_1year').style.color = 'white';
      document.querySelector('#price_change_30days').style.color = 'white';
      document.querySelector('#price_change_7days').style.color = 'white';
      document.querySelector('#price_change_24h').style.color = 'white';
      document.querySelector('.w3-modal-content').style.backgroundColor = '#333';
      document.querySelector('.w3-modal').style.backgroundColor = '#333';
  } else {
      lightModeToggle.dataset.checked = 'dark mode on';
      document.querySelector('body').style.color = '#222';
      document.querySelector('body').style.background = 'white';
      document.querySelector('.light-mode-label').textContent = 'Light Mode: On';
      document.querySelector('.compare-dropdown').style.color = '#222';
      document.querySelector('.compare-dropdown').style.backgroundColor = 'white';
      document.querySelector('#dropdown-right').style.color = '#222';
      document.querySelector('#dropdown-right').style.backgroundColor = 'white';
      document.querySelector('#trending-container').style.background = '#efefef';
      document.querySelector('#price_change_1year').style.color = '#222';
      document.querySelector('#price_change_30days').style.color = '#222';
      document.querySelector('#price_change_7days').style.color = '#222';
      document.querySelector('#price_change_24h').style.color = '#222';
      document.querySelector('.w3-modal-content').style.backgroundColor = '#f5f5f5';
      document.querySelector('.w3-modal').style.backgroundColor = '#f5f5f5';
  }
})

//Ticker
function addToTicker(coin){
    let divTickerUnit = document.createElement('div')
    let tickerSymbol = document.createElement('span')
    let tickerArrow = document.createElement('span')
    let tickerPercent = document.createElement('span')
    divTickerUnit.className = "ticker-unit"
    tickerSymbol.className = "ticker-symbol"
    tickerArrow.className = "ticker-arrow"
    tickerPercent.className = "ticker-percent"
    let percentChanged = coin.price_change_percentage_24h
    tickerSymbol.textContent = coin.symbol.toUpperCase()
    percentChangeDivAndArrow(percentChanged, divTickerUnit, tickerArrow)
    tickerPercent.textContent = percentChanged.toFixed(4) + '%'

    divTickerUnit.append(tickerSymbol, tickerArrow, tickerPercent)
    tickerDiv.append(divTickerUnit)                
}
// ANIMATION JS
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

// Function to format numbers https://blog.abelotech.com/posts/number-currency-formatting-javascript/
function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function currencyFormat(num) {
    return '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

// Function to format numbers https://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn
 abbreviate_number = function(num, fixed) {
    if (num === null) { return null; } // terminate early
    if (num === 0) { return '0'; } // terminate early
    fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
    var b = (num).toPrecision(2).split("e"), // get power
      k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
      c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3) ).toFixed(1 + fixed), // divide by power
      d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
      e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
    return e;
}