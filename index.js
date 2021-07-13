const baseURL = 'https://api.coingecko.com/api/v3'
const trendingEndpoint = '/search/trending'
const coinsEndpoint = '/coins/'

const body = document.querySelector('body')


fetch(baseURL+trendingEndpoint)
.then(resp => resp.json())
.then(json => renderTrending(json))


function renderTrending(trendingJSON){
    console.log(trendingJSON)
    trendingJSON.coins.forEach(coin => renderCoin(coin.item))
}

// function renderCoin(coin){
//     console.log(coin)
//     let div = document.createElement('div')
//     let h1Name = document.createElement('h1')
//     let h2Price = document.createElement('h2')
//     let img = document.createElement('img')
//     h1Name.textContent = coin.name
//     h2Price = coin.price_btc
//     img.src = coin.small

//     div.dataset.id = coin.id
//     div.addEventListener('click', (e)=>{
//        getCoinDetails(e.currentTarget.dataset.id)
//     })
//     div.append(h1Name, h2Price, img)
//     body.append(div)
// }

function getCoinDetails(id){
    fetch(baseURL + coinsEndpoint + id)
    .then(resp => resp.json())
    .then(console.log)
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

document.querySelector('.info-modal-btn').addEventListener('click', () => {
    console.log('hey!!!!!')
    document.getElementById('id01').style.display='block';
    document.querySelector('.bg').style.filter='blur(10px)';
})

document.querySelector('.w3-display-topright').addEventListener('click', () => {
    document.getElementById('id01').style.display='none';
    document.querySelector('.bg').style.filter='none';
})
