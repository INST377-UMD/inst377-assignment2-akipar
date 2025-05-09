if (annyang) {
    const commands = {
        'hello': () => {alert('Hello world!')},
        'change (the background) color to *color': function(color) {
            document.body.style.backgroundColor = color;
        },
        'navigate to *page': function(page) {
            window.location.replace(`${page}.html`)
        },
        'look up *stock': (stock) => {
          const fixcase = stock.toUpperCase();
          fetchStockData(fixcase, 30);
        },
        'load dog breed *breed': (breed) => {
          loadBreed(breed);
        }
    };

    annyang.addCommands(commands);

    annyang.start();
}

function micOn() {
    annyang.start();
}

function micOff() {
    annyang.abort();
}


async function getapi(url) {
    const response = await fetch(url);
    var data= await response.json();
    console.log(data);
    return data;
}

async function getQuote() {
  const quoteAPI = "https://zenquotes.io/api/random";
  const data = await getapi(quoteAPI);
  const quoteData = data[0];
  document.getElementById("quote").innerHTML = `"${quoteData.q}" - ${quoteData.a}`;
}

let myChart = null;

async function stockLookup(event) {
  event.preventDefault();
  const stock = document.getElementById('stock').value.toUpperCase();
  const days = document.getElementById('days').value;
  await fetchStockData(stock, days);
}

async function fetchStockData(stock, days = 30) {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  const startDate = new Date(today.setDate(today.getDate() - parseInt(days)))
  .toISOString()
  .split('T')[0];

  const stockAPI = `https://api.polygon.io/v2/aggs/ticker/${stock}/range/1/day/${startDate}/${endDate}?adjusted=true&sort=asc&limit=120&apiKey=anYAnTMT7N1ppzRwu984rnXnhiAp8Hjy`;
  const data=await getapi(stockAPI);

  const dates = data.results.map(item => new Date(item.t).toLocaleDateString());
  const prices = data.results.map(item => item.c);

  const ctx = document.getElementById('myChart');

  if (myChart) {
    myChart.data.labels = dates;
    myChart.data.datasets[0].label = `${stock} closing price`;
    myChart.data.datasets[0].data = prices;
    myChart.update();
  } else {
    myChart = new Chart(ctx, {
      type: 'line', 
      data: {
          labels: dates, 
          datasets: [{
              label: `${stock} closing price`,
              data: prices, 
          }]
      },
      options: {
          responsive: true, 
      }
});
  }


}

async function reddit() {
  const redditLink = "https://tradestie.com/api/v1/apps/reddit?date=2022-04-03";
  const data = await getapi(redditLink);

  const top5 = data.slice(0, 5);
  const tableBody = document.getElementById("reddit-table");
  tableBody.innerHTML = "";

  top5.forEach(stock => {
    const row = document.createElement("tr");
    const stockLink = document.createElement("td");
    const link = document.createElement("a");

    link.href = `https://finance.yahoo.com/quote/${stock.ticker}`;
    link.target = "_blank";
    link.textContent = stock.ticker;
    stockLink.appendChild(link);
    row.appendChild(stockLink);

    const comments = document.createElement("td");
    comments.textContent = stock.no_of_comments;
    row.appendChild(comments);

    const sentimentpic = document.createElement("td");
    const img = document.createElement("img");
    if (stock.sentiment === "Bullish") {
      img.src = "bullish.jpg";
      img.alt = "Bullish";
      img.width = 100;
    } else {
      img.src = "bearish.jpg";
      img.alt = "Bearish";
      img.width = 100;
    }
    sentimentpic.appendChild(img);
    row.appendChild(sentimentpic);
    tableBody.appendChild(row);
    
  });
}

async function getDogpic() {
  const carousel = document.getElementById('carousel');
  const dogpicAPI = 'https://dog.ceo/api/breeds/image/random/10';
  
  carousel.innerHTML = "";
  
  const data = await getapi(dogpicAPI);

  const imageElements = data.message.map((imageurl) => {
    const img = document.createElement('img');
    img.src = imageurl;
    img.alt = 'dog picture';
    return img;
  });
  imageElements.forEach(img => carousel.appendChild(img));

  setTimeout(() => {
    simpleslider.getSlider({
    container: document.getElementById('carousel'),
    transitionTime:1,
    delay:3.5
  });
  });

}

async function loadBreed() {
  const breedAPI = 'https://dogapi.dog/api/v2/breeds';
  const breedData = await getapi(breedAPI);
  console.log(breedData);
  const breeds = breedData.data.slice(0, 10);
  const breedsContainer = document.getElementById('breedNames');

  breedsContainer.innerHTML = "";

  breeds.forEach(breed => {
    const button = document.createElement('button');
    button.textContent = breed.attributes.name;
    button.setAttribute('breed-data', breed.attributes.name);

    button.addEventListener('click', () => showBreedInfo(breed));
    breedsContainer.appendChild(button);
  })
}

function showBreedInfo(breed) {
  const breedInfoDiv = document.getElementById("breed-info");
  const breedName = document.getElementById("breedName");
  const breedDesc = document.getElementById("breedDescription");
  const breedMin = document.getElementById("minLife");
  const breedMax = document.getElementById("maxLife");

  breedName.textContent = `Name:${breed.attributes.name}`;
  breedDesc.textContent = `Description:${breed.attributes.description}`;
  breedMin.textContent = `Min Life: ${breed.attributes.min_life_expectancy}`;
  breedMax.textContent = `Max Life: ${breed.attributes.max_life_expectancy}`;

  breedInfoDiv.style.display = "block";
}

if (document.getElementById("quote")) {
  fetchQuote();
}
if (document.getElementById("reddit-stocks-table")) {
  reddit();
  document.getElementById("lookup-button").addEventListener("click", () => {
      const stock = document.getElementById("stock").value;
      const range = parseInt(document.getElementById("range").value);
      fetchStockData(stock, range);
  });
}