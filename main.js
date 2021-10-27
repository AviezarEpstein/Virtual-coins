let basicCoinDetailsMap = new Map();
let reportList = new Map();

getBasicCoinDetails();

function getBasicCoinDetails() {
  $.get(`https://api.coingecko.com/api/v3/coins`)
    .then((coinsData, status) => {
      initBasicCoinsDetails(coinsData);
      loadSavedData();
      showBasicCoinsDataOnUI(basicCoinDetailsMap, "container", isModal);
      updateToggle(isModal);
      console.log(status);
    })
    .catch(() => console.log("Failed!"));
}

function initBasicCoinsDetails(coinsData) {
  for (let i = 0; i < coinsData.length; i++) {
    let basicCoinDetails = {
      id: coinsData[i].id,
      symbol: coinsData[i].symbol,
      image: coinsData[i].image.small,
      usd: coinsData[i].market_data.current_price.usd,
    };
    basicCoinDetailsMap.set(basicCoinDetails.id, basicCoinDetails);
  }
}

let tempReportList = new Map();
let currenciesToDisplayOnMoreInfoClicked = new Map();
let isModal = false;
function showBasicCoinsDataOnUI(basicCoinDetailsMap, divContainer, isModal) {
  createContainer();
  for (let [id, value] of basicCoinDetailsMap) {
    let containerDiv = $(`#${divContainer}`);
    let sliderDiv = $(`<div></div>`);
    let sliderLabel = $(`<label class="switch"></label>`);
    let sliderCheckbox = $(`<input type="checkbox" id="reportRequest">`);
    let sliderSpan = $(`<span class="slider"></span>`);

    let sliderId;
    if (!isModal) {
      sliderId = id;
      sliderCheckbox.attr("id", sliderId);
    } else {
      sliderId = "m" + id;
      sliderCheckbox.attr("id", sliderId);
    }

    sliderLabel.append(sliderCheckbox);
    sliderLabel.append(sliderSpan);
    sliderDiv.append(sliderLabel);

    sliderCheckbox.click(() => {
      let isChecked = sliderCheckbox[0].checked;
      if (
        !isModal &&
        reportList.size == 5 &&
        sliderCheckbox[0].checked
      ) {
        sliderCheckbox[0].checked = false;
      }
      handleReportList(value, isChecked, isModal);
    });

    let cardDiv = $(`<div class = 'card inlineBlock'><div/>`);

    let idToDisplay = capitalizeFirstLetter(id);
    let idDiv = $(`<div class= "centralizationText">${idToDisplay}<div/>`);
    let symbolDiv = $(
      `<div class= "centralizationText">${value.symbol.toUpperCase()}<div/>`
    );
    let moreInfoButton = $(
      '<button type="button" class="btn btn-info btn-info-color">More info  <i class="fas fa-angle-double-down"></i></button>'
    );
    let progressBar = $(`<div class="spinner-border text-success" role="status">
            <span class="sr-only">Loading...</span>
          </div>`);
    progressBar.hide();

    let cardBody = $(`<div class = "card-body"></div>`);
    cardBody.append(sliderDiv);
    cardBody.append(idDiv);
    cardBody.append(symbolDiv);
    cardBody.append(moreInfoButton);
    cardBody.append(progressBar);

    cardDiv.append(cardBody);

    moreInfoButton.click(() => {
      moreInfoButton.hide();
      if (!currenciesToDisplayOnMoreInfoClicked.has(`${id}`)) {
        progressBar.show();
        insertMoreInfo(id, cardBody, moreInfoButton, progressBar);
      } else {
        buildCurrenciesDataOnUI(id, cardBody, moreInfoButton, progressBar);
        progressBar.hide();
      }
    });
    containerDiv.append(cardDiv);
  }
}

function createContainer(){
  let cardsContainer = $(`<div class="container" id="container"></div>`);
  $("body").append(cardsContainer);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function buildCurrenciesDataOnUI(id, cardBody, moreInfoButton, progressBar) {
  progressBar.hide();
  let currenciesContainerDiv = $(
    `<div id='currenciesContainer' class = "card-body"><center><img src="${
      currenciesToDisplayOnMoreInfoClicked.get(id).image
    } class"coin-img"></center></div>`
  );
  let imgDiv = $(`<div class = "img-div border-bottom"></div>`);
  let usdDiv = $(
    `<div class= "centralizationText"><i class="fa fa-dollar"></i> ${
      currenciesToDisplayOnMoreInfoClicked.get(id).usd
    }<div/>`
  );
  let ilsDiv = $(
    `<div class= "centralizationText"><i class="fa fa-sheqel"></i> ${
      currenciesToDisplayOnMoreInfoClicked.get(id).ils
    }<div/>`
  );
  let eurDiv = $(
    `<div class= "centralizationText"><i class="fa fa-eur"></i> ${
      currenciesToDisplayOnMoreInfoClicked.get(id).eur
    }<div/>`
  );
  let hideMoreInfoButton = $(
    `<button type="button" class="btn btn-secondary hide-btn"> Close <i class="fas fa-angle-double-up"></i></button>`
  );

  hideMoreInfoButton.click(() => {
    moreInfoButton.show();
    currenciesContainerDiv.remove();
  });

  currenciesContainerDiv.append(imgDiv);
  currenciesContainerDiv.append(usdDiv);
  currenciesContainerDiv.append(ilsDiv);
  currenciesContainerDiv.append(eurDiv);
  currenciesContainerDiv.append(hideMoreInfoButton);
  cardBody.append(currenciesContainerDiv);
}

function insertMoreInfo(id, cardBody, moreInfoButton, progressBar) {
  $.get(`https://api.coingecko.com/api/v3/coins/${id}`)
    .then((coinsData) => {
      initData(id, coinsData);
      buildCurrenciesDataOnUI(id, cardBody, moreInfoButton, progressBar);
    })
    .catch(() => console.log("Failed!"));
}

function initData(id, coinsData) {
  moreInfoCoin = {
    image: coinsData.image.small,
    usd: coinsData.market_data.current_price.usd,
    ils: coinsData.market_data.current_price.ils,
    eur: coinsData.market_data.current_price.eur,
  };
  currenciesToDisplayOnMoreInfoClicked.set(id, moreInfoCoin);
  setTimeout(function () {
    currenciesToDisplayOnMoreInfoClicked.delete(id);
  }, 20000);
}

function handleReportList(coinDetails, isChecked, isModal) {
  if (isChecked && !isModal) {
    if (reportList.size < 5) {
      addToReportList(coinDetails, isModal);
    } else if (reportList.size == 5) {
      let sixthCoin = new Map();
      sixthCoin.set(coinDetails.id, coinDetails);
      for (let [id, value] of reportList) {
        tempReportList.set(id, value);
      }
      showModalOfReportList(reportList, sixthCoin);
    }
  } else if (isChecked && isModal && tempReportList.size == 5) {
    alert(
      "Report list is limited to 5 coins. Before selecting this coin, make sure you don't have 5 selected coins"
    );
    $(`#m${coinDetails.id}`)[0].checked = false;
  } else if (isChecked && isModal && tempReportList.size < 5) {
    addToReportList(coinDetails, isModal);
  } else if (!isChecked) {
    removeFromReportList(coinDetails.id, isModal);
  }
}

function addToReportList(coinDetails, isModal) {
  if (isModal) {
    tempReportList.set(coinDetails.id, coinDetails);
  } else {
    reportList.set(coinDetails.id, coinDetails);
    for (let [id, value] of reportList) {
      tempReportList.set(id, value);
    }
  }
  saveData();
}

function removeFromReportList(elementToRemove, isModal) {
  if (isModal) {
    tempReportList.delete(elementToRemove);
  } else {
    reportList.delete(elementToRemove);
    tempReportList.delete(elementToRemove);
    saveData();
  }
}

function updateToggle(isModal, divId = null) {
  if (reportList != null) {
    if (divId != null && reportList.has(divId)) {
      $(`#${divId}`)[0].checked = true;
    }else if (!isModal) {
      for (let [key, value] of reportList) {
        $(`#${key}`)[0].checked = true;
      }
    } else {
      for (let [key, value] of reportList) {
        $(`#m${key}`)[0].checked = true;
      }
    }
  }
}

function saveData() {
  let coinDataArrayStorage = [];
  let count = 0;
  for (let [key, value] of reportList) {
    coinDataArrayStorage[count] = value;
    count++;
  }
  localStorage.setItem("savedCoins", JSON.stringify(coinDataArrayStorage));
}

function loadSavedData() {
  if (localStorage.getItem("savedCoins") != null) {
    coinsArray = JSON.parse(localStorage.getItem("savedCoins"));
    for (let i = 0; i < coinsArray.length; i++) {
      reportList.set(coinsArray[i].id, coinsArray[i]);
    }
    for (let [id, value] of reportList) {
      tempReportList.set(id, value);
    }
  }
}

function createModalElement(){
  let createModal = $(` <div class="modal" tabindex="-1" id="cardsModal">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Report list is limited up to 5 coins.</br>
                To select a coin, uncheck one of the other selected coins,</br> then click on Save changes</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="reportListCards">

            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="saveChangesButton">Save changes</button>
            </div>
        </div>
    </div>
</div>`);

  $("body").append(createModal);

}

function showModalOfReportList(reportList, sixthCoin) {
  createModalElement();

  var myModalEl = document.getElementById("cardsModal");
  myModalEl.addEventListener("hide.bs.modal", function (event) {
    $('#reportListCards').empty();
  });

  isModal = true;

  showBasicCoinsDataOnUI(reportList, "reportListCards", isModal);
  showBasicCoinsDataOnUI(sixthCoin, "reportListCards", isModal);

  $("#cardsModal").modal("show");
  console.log($("#cardsModal").hasClass("show"));

  let saveChangesButton = $("#saveChangesButton");
  saveChangesButton.click(() => {
    reportList.clear();
    for (let [id, value] of tempReportList) {
      reportList.set(id, value);
    }
    saveData();
    clearUI("container");
    isModal = false;
    showBasicCoinsDataOnUI(basicCoinDetailsMap, "container", isModal);
    $("#cardsModal").modal("hide");
    updateToggle(isModal);
  });
  updateToggle(isModal);
}

function clearUI(div) {
  let divId = $(`#${div}`);
  divId.remove();
}

function cleanFieldAfterClick(id) {
  $(`#${id}`).val("");
}

function onSearchClicked() {
  $(`#alertContainer`).empty();
  $(`#errorMessage`).empty();
  clearUI("chartContainer");
  try {
    let symbolCoinInput = $("#search").val().toLowerCase();
    cleanFieldAfterClick("search");
    validateInput(symbolCoinInput);
    clearUI("container");
    let searchBySymbol = new Map();
    for (let [key, value] of basicCoinDetailsMap) {
      if (value.symbol == symbolCoinInput) {
        searchBySymbol.set(key, value);
      }
    }
    
    isModal = false;
    showBasicCoinsDataOnUI(searchBySymbol, "container", isModal);

    for (let [key, value] of searchBySymbol) {
      if(reportList.has(key)){
        updateToggle(isModal, key);
      }
    }
  } catch (e) {
      let errorDiv = $(
        `<div class="alert alert-danger centralizationText" id="errorMessage">${e.message}</div>`
      );
      let closeAlertButton = $(
        `<button type="button" class="btn" id="clsoeError"><i class="far fa-times-circle"></i></button>`
      );
    errorDiv.append(closeAlertButton);
    $(`body`).append(errorDiv);
    closeAlertButton.click(() => {    
      $(`#alertContainer`).empty();
      $(`#errorMessage`).empty();

    });
    $("#alertContainer").append(errorDiv);
  }
}

function validateInput(id) {
  let errorMessage = "";
  if (isEmptyField(id)) {
    errorMessage += "Search field can not be empty!" + "<br/>";
  } else if (!isCoinExist(id)) {
    errorMessage +=
      "The coin's symbol you have enterd dosn't exist! Please enter an existing symbol (Example: For Bitcoin, insert: btc)" +
      "<br/>";
  }
  if (errorMessage != "") {
    throw new Error(errorMessage);
  } 
}

function isCoinExist(id) {
  for (let [key, value] of basicCoinDetailsMap) {
    if (value.symbol == id) {
      return true;
    }
  }
  return false;
}

function isEmptyField(inputValue) {
  if (inputValue == null || inputValue == "") {
    return true;
  }
  return false;
}

function onHomeClicked() {
  clearInterval(interval);
  clearUI("chartContainer");
  clearUI("container");
  isModal = false;
  showBasicCoinsDataOnUI(basicCoinDetailsMap, "container", isModal);
  updateToggle(isModal);
}

function onAboutClicked() {
  clearInterval(interval);

  clearUI("chartContainer");
  clearUI("container");
  createContainer();
  let containerDiv = $(`#container`);
  let aboutPage = $(`<div class="title">
  <div>
      <div class="img-head card aboutBorder">
          <img class="profile-img" src="WhatsApp Image 2021-06-15 at 21.20.23.jpeg">
          <div>
          </div>
          <h1 class="title-fonts about-title-fonts">Welcome!</h1>
          <h2 class="title-fonts about-title-fonts">Meet Aviezer Epstein!</h2>
      </div>
  </div>

  <div class="rezume-about">
      <div class="rezume card card-body">
          <h1>Rezume:</h1>
          <p1>Relevant work experience - 2021 - Today:</p1>
          <p1>Presently employed at Jon Brice Software Laboratories Ltd.</p1>
          <p1>FULL STACK programmer at NCR in Raanana -</p1>
          <p1>• Software development in C# .NET and WPF in new product features.</p1>
          <p1> • Integration with existing products and code bug fixing.</p1>
          <p1> • Development in MVVM architecture </p1>
          <p1> • Teamwork in the Agile methodology from the Discovery phase to the feature release phase.</p1>
          <p1> • Optimization of cash register systems and fuel systems.</p1>
          <p1> • Experience in Windows environment, expertise with SQL Server </p1>

      </div>
      <div class="aboutProject card card-body">
          <h1>About this project:</h1>
          <p3>In this project I created a single page application website, implementing the follwing subjects:
          </p3>
          <p2>HTML + CSS:</p2>
          <p2> • New HTML5 tags <br></p2>
          <p2>• CSS3 media queries and advanced selectors<br></p2>
          <p2>• Dynamic page layouts<br></p2>
          <p2> • Bootstrap & flex <br></p2>

          <p3> JavaScript:</p3>
          <p2>• Objects</p2>
          <p2> • Callbacks, Promises, Async Await<br></p2>
          <p2>• jQuery
              <br>
          </p2>
          <p2>• Events
              <br>
          </p2>
          <p2> • Ajax (RESTful API) <br></p2>
          <p2> • Documentation <br></p2>
      </div>
  </div>`);
  containerDiv.append(aboutPage);
}

function updateReportList() {
  for (let [key, value] of reportList) {
    $.get(`https://api.coingecko.com/api/v3/coins/${key}`)
      .then((coinsData, status) => {
        initReportList(coinsData);
      })
      .catch(() => console.log("Failed!"));
  }
}

function initReportList(coinsData) {
  let coinData = {
    id: coinsData.id,
    symbol: coinsData.symbol,
    usd: coinsData.market_data.current_price.usd,
  };
  reportList.set(coinData.id, coinData);
}

let dataPoints1 = [];
let dataPoints2 = [];
let dataPoints3 = [];
let dataPoints4 = [];
let dataPoints5 = [];

let chart;
let interval;

function onGetReportClicked() {
  if(reportList.size < 1){
    alert("Please select at least one item")
    return;
  }
 dataPoints1 = [];
 dataPoints2 = [];
 dataPoints3 = [];
 dataPoints4 = [];
 dataPoints5 = [];
  clearUI("container");
  clearUI("chartContainer");
  createContainer();
  let chartElement = $(`<div id="chartContainer" class="reportChart" style="height: 370px; width: 100%;"></div>`);
  $("#container").append(chartElement);  
  
    chart = new CanvasJS.Chart("chartContainer", {
    zoomEnabled: true,
    title: {
      text: "Share Value of Selected Coins",
    },
    axisX: {
      title: "chart updates every 3 secs",
    },
    axisY: {
      prefix: "$",
    },
    toolTip: {
      shared: true,
    },
    legend: {
      cursor: "pointer",
      verticalAlign: "top",
      fontSize: 22,
      fontColor: "dimGrey",
      itemclick: toggleDataSeries,
    },
    data: GetData(),
  });

  updateChart();
  let updateInterval = 3000;
  interval = setInterval(() =>{
    updateChart();
    updateReportList();
  }, updateInterval);
}







function toggleDataSeries(e) {
  if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
    e.dataSeries.visible = false;
  } else {
    e.dataSeries.visible = true;
  }
  chart.render();
}

function updateChart() {
  initDataPoints();
  setCoinLegendText();
  chart.render();
}

function GetData() {
  let chartDataArray = [];
  let count = 0;
  for (let [key, value] of reportList) {
    let chartData = {
      type: "line",
      xValueType: "dateTime",
      yValueFormatString: "$####.00",
      xValueFormatString: "hh:mm:ss TT",
      showInLegend: true,
      name: key,
      dataPoints: getDataPoints(count),
    };
    chartDataArray.push(chartData);
    count++;
  }
  return chartDataArray;
}

function getDataPoints(count) {
  if (count == 0) {
    return dataPoints1;
  } else if (count == 1) {
    return dataPoints2;
  } else if (count == 2) {
    return dataPoints3;
  } else if (count == 3) {
    return dataPoints4;
  } else if (count == 4) {
    return dataPoints5;
  }
}

function setCoinLegendText() {
  let count = 0;
  for (let [key, value] of reportList) {
    if (count == 0) {
      chart.options.data[0].legendText = key + " - $" + value.usd;
    } else if (count == 1) {
      chart.options.data[1].legendText = key + " - $" + value.usd;
    } else if (count == 2) {
      chart.options.data[2].legendText = key + " - $" + value.usd;
    } else if (count == 3) {
      chart.options.data[3].legendText = key + " - $" + value.usd;
    } else if (count == 4) {
      chart.options.data[4].legendText = key + " - $" + value.usd;
    }
    count++;
  }
}

function initDataPoints() {
  let count = 0;
  for (let [key, value] of reportList) {
    if (count == 0) {
      dataPoints1.push({ x: new Date(), y: value.usd });
    } else if (count == 1) {
      dataPoints2.push({ x: new Date(), y: value.usd });
    } else if (count == 2) {
      dataPoints3.push({ x: new Date(), y: value.usd });
    } else if (count == 3) {
      dataPoints4.push({ x: new Date(), y: value.usd });
    } else if (count == 4) {
      dataPoints5.push({ x: new Date(), y: value.usd });
    }
    console.log(count);
    count++;
  }
}