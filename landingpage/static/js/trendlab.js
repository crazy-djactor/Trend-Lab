const searchInput = document.querySelector('#trend-search-input');

searchInput.addEventListener('keyup', function(){
  //query the api for search term suggestions
  const searchTerm = searchInput.value;
  if (searchTerm.length < 2){
    //empty and hide parent div
    $('#autocomplete-parent-div').empty();
    $('#autocomplete-parent-div').hide();
    return 0;
  }
  fetchGoogleTrendsSuggestion(searchTerm);
});


//global variables storing location, timezone etc
var tz = "0";
var lang =  "en-GB";
var geo = " ";
//set geo programmatically
function setGeo(){
  let url = window.location.href
  let urlParamStrings = url.split("?")
  if (urlParamStrings.length > 2){
    //join them
    var urlParamString = urlParamStrings.slice(1,).join("");
  }else{
    var urlParamString = urlParamStrings[1];
  }
  searchParams = new URLSearchParams(urlParamString);

  if (searchParams.has('geo')){
    geo = searchParams.get('geo');
  }else{
    geo = " ";
  }
}
setGeo();


function fetchGoogleTrendsSuggestion(searchTerm){
  //call api
  const url = window.location.origin + "search/autocomplete/" + searchTerm;
  let payload = {
      'hl' : lang,
      'tz': tz,
      'term':searchTerm
  }
  $.ajax({
    url : document.location.origin + '/search/autocomplete/',
    type : 'POST',
    data : JSON.stringify(payload),
    contentType:'application/json',
    success : function(data) {
        updateSuggestionDiv(data['default'][['topics']]);
    },
    error : function(request,error)
    {
        console.log(error)
        updateSuggestionDiv([]);
    }
  });

}

//switching location --geo
function switchTrendLocale(newLocale){
  let url = window.location.href
  let urlParamStrings = url.split("?")
  if (urlParamStrings.length > 2){
    //join them
    var urlParamString = urlParamStrings.slice(1,).join("");
  }else{
    var urlParamString = urlParamStrings[1];
  }
  searchParams = new URLSearchParams(urlParamString);
  if (newLocale == ' '){
    //remove any geo params since its worldwide
    if (searchParams.has("geo")){
      searchParams.delete("geo");
    }
  }else{
    //replace if present, add if not present and refresh with new params
    if (searchParams.has("geo")){
      searchParams.set("geo",newLocale);
    }else{
      searchParams.append("geo", newLocale);
    }
  }
  new_params = searchParams.toString();
  new_url = urlParamStrings[0] + "?" +new_params;
  window.location.href = new_url;
}


//function to toggle the time periods btn 5 yrs, 1 year and 30 days
function toggleTimePeriod(option){

}

function updateSuggestionDiv(suggestions){
  //with search terms, dom manipulation to insert suggestions with links.
  //if empty, hide parent div too
  $('#autocomplete-parent-div').empty();
  if (suggestions.length == 0){
    $('#autocomplete-parent-div').hide();
  }else{
    suggestions.forEach(function(suggestion){
      let childDiv = `
      <div class="autocomplete-element" onclick="submitWithSuggestion('`+ suggestion['mid'] +`','` + suggestion['title'] +`')">
        <span class="autocomplete-term">`
        + suggestion['title'] + `</span><br/>
        <span class="autocomplete-term-topic">`+ suggestion['type'] +`</span>
      </div>
      `
      $('#autocomplete-parent-div').append(childDiv);
    });
    $('#autocomplete-parent-div').show();
  }
}

function submitWithSuggestion(queryTerm, originalTerm){
  //url params used to redirect to detail page
  if (geo == ' '){
    let url = document.location.origin + "/detailpage?q=" + encodeURIComponent(queryTerm) + "&originalTerm=" + originalTerm ;
    //redirect to that page
    window.location.href = url;
  }else{
    let url = document.location.origin + "/detailpage?q=" + encodeURIComponent(queryTerm) + "&geo="+ geo + "&originalTerm=" + originalTerm ;
    //redirect to that page
    window.location.href = url;
  }



}

$('#search-form').on('submit',function(e){
    e.preventDefault();
    //get what was on input and submit with suggestion
    const searchTerm = searchInput.value;
    submitWithSuggestion(searchTerm, searchTerm);
})


//handling results in detailpage below

//chart 1 for interest over time
function plotInterestChart1(){
  var ctx1 = document.getElementById("5yearinterest");
  var myChart1 = new Chart(ctx1, {
    type: 'line',
    data: {
      backgroundColor: "rgba(255,255,255,0.5)",
      labels: chartData['interest_data_5y']['date_values'],
      datasets: [{
        data: chartData['interest_data_5y']['interest_values'],
        fill: false,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#fff",
        pointRadius:0,
        borderColor:"#2f55d4",
      }]
    },
    options: {
           legend: {
              display: false
           },
           responsive: true,
           maintainAspectRatio: false,
           scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                min: 0,
                max: 100,
                stepSize: 25,
              }
            }],
            xAxes:[{
              type: 'time',
              gridLines: {
                  color: "rgba(0, 0, 0, 0)",
              },
              time: {
                    unit: 'week',
                    unitStepSize: 50
              }
            }]
          },

      }
  });
}
plotInterestChart1();


function plotInterestChart2(){
  var ctx2 = document.getElementById("12monthinterest");
  var myChart1 = new Chart(ctx2, {
    type: 'line',
    data: {
      backgroundColor: "rgba(255,255,255,0.5)",
      labels: chartData['interest_data_12m']['date_values'],
      datasets: [{
        data: chartData['interest_data_12m']['interest_values'],
        fill: false,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#fff",
        pointRadius:0,
        borderColor:"#2f55d4",
      }]
    },
    options: {
           legend: {
              display: false
           },
           responsive: true,
           maintainAspectRatio: false,
           scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                min: 0,
                max: 100,
                stepSize: 25,
              }
            }],
            xAxes:[{
              type: 'time',
              gridLines: {
                  color: "rgba(0, 0, 0, 0)",
              },
              time: {
                    unit: 'month',
                    unitStepSize: 2
              }
            }]
          },

      }
  });
}
plotInterestChart2();


function plotInterestChart3(){
  var ctx3 = document.getElementById("30dayinterest");
  var myChart1 = new Chart(ctx3, {
    type: 'line',
    data: {
      backgroundColor: "rgba(255,255,255,0.5)",
      labels: chartData['interest_data_1m']['date_values'],
      datasets: [{
        data: chartData['interest_data_1m']['interest_values'],
        fill: false,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#fff",
        pointRadius:0,
        borderColor:"#2f55d4",
      }]
    },
    options: {
           legend: {
              display: false
           },
           responsive: true,
           maintainAspectRatio: false,
           scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                min: 0,
                max: 100,
                stepSize: 25,
              }
            }],
            xAxes:[{
              type: 'time',
              gridLines: {
                  color: "rgba(0, 0, 0, 0)",
              },
              time: {
                    unit: 'day',
                    unitStepSize: 5
              }
            }]
          },

      }
  });
}
plotInterestChart3();
