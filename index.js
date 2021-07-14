/*These are our endpoints for our fetches
https://www.coingecko.com/api/documentations/v3
*/
const baseURL = 'https://api.coingecko.com/api/v3'
const trendingEndpoint = '/search/trending'
const coinsEndpoint = '/coins/'
const listEndpoint = '/coins/list'
const marketsEndpoint = '/coins/markets'
const oldDate = '/coins/bitcoin/history?date='
const marketsQuery = '?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=24h,7d,30d,1y' //is it possible to add more data to this request?
const youtubeURL = 'https://youtube.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&q=cryptocurrency%10for%10beginners&maxResults=10&type=video&videoDefinition=high&key=AIzaSyDLvMF8eSy7fAkAFBdA-KrnXFxbIFTrQ2o'

function oldDateURL (id){
    return `/coins/${id}/history?date=`
}

function marketChartURL(id, days){
    return `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`
}

/* document selectors */
const body = document.querySelector('body')
const trendingList = document.querySelector('#trending-list-ul')

let dataCache;

/*entry point to app*/
getTrending()
getList()
youtubeData()
//addEventHandlers()
//getMarketChart('bitcoin', 1, 'left')
/*fetches*/
function getTrending(){
    fetch(baseURL+trendingEndpoint)
    .then(resp => resp.json())
    .then(json => renderTrending(json))
}

function getList(){
    fetch(baseURL + marketsEndpoint + marketsQuery)
    .then(resp => resp.json())
    .then(json => {
        cacheJSON(json)
        renderList(json)
    })   
}

function getCoinDetails(id){
    fetch(baseURL + coinsEndpoint + id)
    .then(resp => resp.json())
    .then(renderModal)
}

function getMarketChart(id, daysAgo, side){
   fetch(marketChartURL(id, daysAgo))
   .then(resp => resp.json())
   .then(json => {
       renderMarketChart(json, side)
   })
}

function youtubeData() {
    fetch(youtubeURL)
    .then(resp => resp.json())
    .then(json => youtubeRender(json))
}

function cacheJSON(json){
    dataCache = json
}

/*  Render functions */

function renderMarketChart(json, side){
    const priceData = json.prices
    //then we make an x and y array
    const x = []
    const y = []
    //then we go over the prices and make the arrays
    priceData.forEach(datum => {
        let date = new Date(datum[0])
        let zero = date.getMinutes() < 10 ? '0' : ''
        x.push(date.getHours() + ":" + zero + date.getMinutes())
        y.push(datum[1])
    })
    //then we check our work
    
    const labels = x
    const data = {
        labels: labels,
        datasets: [{
          label: 'Price',
          backgroundColor: '#FA250A',
          borderColor: '#FA250A',

          data: y,
        }]
      };

    const config = {
        type: 'line',
        data,
        options: {}
    };

    const chart = Chart.getChart(`${side}Chart`);
    if(chart){
        chart.destroy()
    }
      
    let myChart = new Chart(
    document.getElementById(`${side}Chart`),
    config
    );

}

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

    listLi.addEventListener('click', e => {
        // console.log(e.currentTarget)
        // console.log(coin.id)
        document.getElementById('id01').style.display='block';
        document.querySelector('.bg').style.filter='blur(10px)';
        getCoinDetails(coin.id)
    })
}

function renderList(data) {
    let leftDropdown = document.querySelector('#dropdown-left')
    let rightDropdown = document.querySelector('#dropdown-right')
    let dropdownImgRight = document.querySelector('#dropdown-right')
    let dropdownImgLeft = document.querySelector('#dropdown-left')
    let dropdownCalc = document.querySelector('.choose-coin')
    
    data.forEach(element => {
        let dropdownOptionRight = document.createElement('option')
        let dropdownOptionLeft = document.createElement('option')
        let dropdownOptionCalc = document.createElement('option')
        
        dropdownOptionRight.value = element.id
        dropdownOptionRight.textContent = element.name
        dropdownOptionLeft.value = element.id
        dropdownOptionLeft.textContent = element.name

        dropdownOptionCalc.value = element.id
        dropdownOptionCalc.textContent = element.name

        leftDropdown.appendChild(dropdownOptionLeft)
        rightDropdown.appendChild(dropdownOptionRight)
        dropdownCalc.appendChild(dropdownOptionCalc)
    })

    // Event listener to change image in the dropdown
    leftDropdown.addEventListener('change', event => {            
        const coinID = event.target.value
        let coinFinder = data.find(element => coinID === element.id)
        dropdownImgLeft.style.background = `no-repeat 24px 20px/32px  url(${coinFinder.image})`
        renderCoinDetails(coinFinder, 'left')
        getMarketChart(coinFinder.id, 1, 'left')
        removeSelectedClass()
        document.querySelector('#price_change_24h').classList.add('selected-price-tab')
    })

    rightDropdown.addEventListener('change', event => {            
        const coinID = event.target.value
        let coinFinder = data.find(element => coinID === element.id)
        dropdownImgRight.style.background = `no-repeat 24px 20px/32px  url(${coinFinder.image})`
        renderCoinDetails(coinFinder, 'right')
        getMarketChart(coinFinder.id, 1, 'right')
        removeSelectedClass()
        document.querySelector('#price_change_24h').classList.add('selected-price-tab')
    })

    rightDropdown.selectedIndex = 1;

    let event = new Event('change');
    leftDropdown.dispatchEvent(event);
    rightDropdown.dispatchEvent(event);
    document.querySelector('.fomo-form').dispatchEvent(event);

    // Function that opens the modal and populates info inside
    document.querySelector('#left-btn').addEventListener('click', (event) => {
        document.getElementById('id01').style.display='block';
        document.querySelector('.bg').style.filter='blur(10px)';
        getCoinDetails(event.target.dataset.id)
        // const targetCoin = data.find(element => event.target.dataset.id === element.id)
    })
    document.querySelector('#right-btn').addEventListener('click', (event) => {
        document.getElementById('id01').style.display='block';
        document.querySelector('.bg').style.filter='blur(10px)';
        getCoinDetails(event.target.dataset.id)
        // const targetCoin = data.find(element => event.target.dataset.id === element.id)
    })

    //add historic event listeners 
    document.querySelector('#price_change_24h').addEventListener('click', (e) => {
        removeSelectedClass()
        e.target.classList.add('selected-price-tab')
    })
    document.querySelector('#price_change_7days').addEventListener('click', (e) => {
        removeSelectedClass()
        e.target.classList.add('selected-price-tab')
        let coinFinder = data.find(element => leftDropdown.value === element.id)
        let arrow = document.querySelector(`#left-price-div span:first-child`)
        let changeDiv = document.querySelector(`#left-price-div .trending-price-change`)
        let color = percentChangeDivAndArrow(coinFinder.price_change_percentage_7d_in_currency, changeDiv, arrow)
        document.querySelector(`#left-price-div span:last-child`).textContent = coinFinder.price_change_percentage_7d_in_currency.toFixed(2) + '%'
     
        coinFinder = data.find(element => rightDropdown.value === element.id)
        arrow = document.querySelector(`#right-price-div span:first-child`)
        changeDiv = document.querySelector(`#right-price-div .trending-price-change`)
        color = percentChangeDivAndArrow(coinFinder.price_change_percentage_7d_in_currency, changeDiv, arrow)
        document.querySelector(`#right-price-div span:last-child`).textContent = coinFinder.price_change_percentage_7d_in_currency.toFixed(2) + '%'
    })
    document.querySelector('#price_change_30days').addEventListener('click', (e) => {
        removeSelectedClass()
        e.target.classList.add('selected-price-tab')
    })
    document.querySelector('#price_change_1year').addEventListener('click', (e) => {
        removeSelectedClass()
        e.target.classList.add('selected-price-tab')
    })
}

function removeSelectedClass(){
    document.querySelector('#price_change_24h').classList.remove('selected-price-tab')
    document.querySelector('#price_change_7days').classList.remove('selected-price-tab')
    document.querySelector('#price_change_30days').classList.remove('selected-price-tab')
    document.querySelector('#price_change_1year').classList.remove('selected-price-tab')
}

function renderModal(coinData){
    console.log(coinData)
    document.querySelector('.modal-img').src = coinData.image.small
    document.querySelector('.modal-header-name').textContent = coinData.name
    document.querySelector('.modal-header-ticker').textContent = coinData.symbol.toUpperCase()
    document.querySelector('.w3-container .compare-large-text').textContent = '$' + formatNumber(coinData.market_data.current_price.usd)
    let changeDiv = document.querySelector('.trending-price-change')
    let arrow = document.querySelector('.trending-arrow')
    percentChangeDivAndArrow(coinData.market_data.price_change_24h, changeDiv, arrow)

    document.querySelector('.trending-percent').textContent = coinData.market_data.price_change_percentage_24h.toFixed(2) + '%'
    document.querySelector('.modal-description').innerHTML = coinData.description.en
}       

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

    let id = e.currentTarget.chooseCoin.value
    
    fetch(baseURL+oldDateURL(id)+priceOldDate)
    .then(resp => resp.json())
    .then(json => {
        if(json.market_data){
            let priceOldAmount = json.market_data.current_price.usd
            
            let priceToday = dataCache.find((name) => name.id === id).current_price
            
            // This is the equation
            // (input_amount / price_at_chosen_date) * price_today
        
            document.querySelector('.fomo-output').textContent = '$' + formatNumber(((inputAmount/priceOldAmount * priceToday)).toFixed(2))
        }else{
            document.querySelector('.fomo-output').textContent = 'before coin Gecko has data, or before the markets were open for ' + json.name
        }

    })
})

document.querySelector('.fomo-form').addEventListener('submit', e => {
    e.preventDefault()
})

// Youtube Render Function
function youtubeRender(videoData) {
    
    console.log(videoData)
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
        videoTitle.textContent = element.snippet.title
        videoByline.textContent = element.snippet.channelTitle
        aLink.href = 'https://www.youtube.com/watch?v=' + element.id.videoId
        aLink.target = '_blank'

        videoContainer.append(videoImg, videoTitle, videoByline)
        aLink.append(videoContainer)
        document.querySelector('#youtube-videos-container').append(aLink)
    })
}


//helper functions
function percentChangeDivAndArrow(priceChange, changedDiv, arrow){
    if(priceChange <= 0){
        changedDiv.classList.add('red')
        changedDiv.classList.remove('green')
        arrow.innerHTML = `&#9660`
        return 'red'
    }else{
        changedDiv.classList.add('green')
        changedDiv.classList.remove('red')
        arrow.innerHTML = `&#9650`
        return 'green'
    }
}

// https://blog.abelotech.com/posts/number-currency-formatting-javascript/
function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }

  function currencyFormat(num) {
    return '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }

 // https://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn
  function abbreviateNumber(value) {
    var newValue = value;
    if (value >= 1000) {
        var suffixes = ["", "k", "m", "b","t"];
        var suffixNum = Math.floor( (""+value).length/3 );
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
            if (dotLessShortValue.length <= 2) { break; }
        }
        if (shortValue % 1 != 0)  shortValue = shortValue.toFixed(1);
        newValue = shortValue+suffixes[suffixNum];
    }
    return newValue;
}

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