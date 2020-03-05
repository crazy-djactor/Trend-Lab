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
        updateSuggestionDiv(data['default'][['topics']], searchTerm);
    },
    error : function(request,error)
    {
        console.log(error)
        updateSuggestionDiv([], searchTerm);
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
  let url = window.location.href
  let urlParamStrings = url.split("?")
  if (urlParamStrings.length > 2){
    //join them
    var urlParamString = urlParamStrings.slice(1,).join("");
  }else{
    var urlParamString = urlParamStrings[1];
  }
  searchParams = new URLSearchParams(urlParamString);
  if (searchParams.has("timeperiod")){
    searchParams.set("timeperiod",option);
  }else{
    searchParams.append("timeperiod", option);
  }
  new_params = searchParams.toString();
  new_url = urlParamStrings[0] + "?" +new_params;
  window.location.href = new_url;
}

function updateSuggestionDiv(suggestions, searchTerm){
  //with search terms, dom manipulation to insert suggestions with links.
  //if empty, hide parent div too
  $('#autocomplete-parent-div').empty();
  if (suggestions.length == 0){
    $('#autocomplete-parent-div').hide();
  }else{
    //first append the search term itself
    let childDiv = `
    <div class="autocomplete-element" onclick="submitWithSuggestion('`+ searchTerm +`','` + searchTerm +`')">
      <span class="autocomplete-term">`
      + searchTerm + `</span><br/>
      <span class="autocomplete-term-topic">Search term</span>
    </div>
    `
    $('#autocomplete-parent-div').append(childDiv);
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
  //url params used to redirect to search page
  if (geo == ' '){
    let url = document.location.origin + "/search?q=" + encodeURIComponent(queryTerm) + "&originalTerm=" + originalTerm ;
    //redirect to that page
    window.location.href = url;
  }else{
    let url = document.location.origin + "/search?q=" + encodeURIComponent(queryTerm) + "&geo="+ geo + "&originalTerm=" + originalTerm ;
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


//handling results in searchpage below

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
        backgroundColor: "#2f55d4",
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
           tooltips: {
                enabled: false
           },
           responsive: true,
           maintainAspectRatio: false,
           scales: {
            yAxes: [{
              gridLines: {
                  drawBorder: false,
              },
              ticks: {
                display: false,
                // beginAtZero: true,
                // min: 0,
                // max: 100,
                // stepSize: 25,
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
           tooltips: {
                enabled: false
           },
           responsive: true,
           maintainAspectRatio: false,
           scales: {
            yAxes: [{
              gridLines: {
                  drawBorder: false,
              },
              ticks: {
                display: false,
                // beginAtZero: true,
                // min: 0,
                // max: 100,
                // stepSize: 25,
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
           tooltips: {
                enabled: false
           },
           responsive: true,
           maintainAspectRatio: false,
           scales: {
            yAxes: [{
              gridLines: {
                  drawBorder: false,
              },
              ticks: {
                display: false,
                // beginAtZero: true,
                // min: 0,
                // max: 100,
                // stepSize: 25,
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


//login popup
function launchGoogleSigninPopup(){

  // url = "https://trend-lab.auth.us-east-1.amazoncognito.com/login?client_id=6cb6cboefcl1a2santkqo042tk&response_type=token&scope=email+openid+profile&redirect_uri="+ document.location.origin +"/google-login-oauth-callback";
  url = "https://trend-lab.auth.us-east-1.amazoncognito.com/login?client_id=6cb6cboefcl1a2santkqo042tk&response_type=token&scope=email+openid+profile&redirect_uri="+ document.location.origin +"/google-login-oauth-callback";
  //dimension getting to center the popup
  x = window.innerWidth || document.documentElement.clientWidth;
  y = window.innerHeight|| documentElememt.clientHeight;
  x_pos = (x-450)/2 ;
  y_pos = (y-600)/2 ;
  window.open(url, 'auth-window','height=500,width=450, top='+ y_pos +', left='+x_pos);
}


//lazy load disambig description
function fetchWikipediaSummary(term, objRef){
  const url = window.location.origin + "/get-wiki-summary";
  let payload = {
      'term':term
  }
  $.ajax({
    url : url,
    type : 'POST',
    data : JSON.stringify(payload),
    contentType:'application/json',
    success : function(data) {
        objRef.append("<span class='text-muted font-italic' style='display:none;'>"+data['summary'][0]+"</span>");
    },
    error : function(request,error)
    {
        console.log(error);
    }
  });
}


$(document).ready(function(){
  //loop through disambig items if present
  if ($('#disambig-items').length > 0){
    $('#disambig-items').children().each(function(){
      let obj_cache = $(this);
      let term = $(this).children().first().text();
      fetchWikipediaSummary(term, obj_cache);
    });
  }
});

function showItemSummary(obj){
  if (obj.children[1].style.display == "none"){
    obj.children[1].style.display = 'block';
  }
  else{
    obj.children[1].style.display = 'none';
  }
}


function showTopNews(itemStart){
  let low = itemStart -1;
  let high = low + 3;
  if (low > newsStore.length){
    return 0;
  }else if(high > newsStore.length){
    let itemsToRender = newsStore.slice(low,);
    renderTopNews(itemsToRender, low+1, newsStore.length, newsStore.length);
  }else{
    let itemsToRender = newsStore.slice(low, high);
    renderTopNews(itemsToRender, low+1, high, newsStore.length);
  }
}
function renderTopNews(lst, low, high, total){
  //empty the div first
  $('#news-items-div').empty();
  let newHtml = ``
  for (i of lst){
    let toAppend = `
    <div class="clearfix post-recent">
        <div class="post-recent-thumb float-left"> <a href="` + i['link']+`"> <img alt="img" src="`+ i['img']+`" class="img-fluid rounded"></a></div>
        <div class="post-recent-content float-left"><a href="`+ i['link']+`">`+ i['title'] +`</a><span class="text-muted mt-2">`+ i['date'] +`</span></div>
    </div>
    `
    newHtml += toAppend
  }
  $('#news-items-div').append(newHtml);

  //update the nav buttons
  let newLow = 1;
  let newHigh = total;
  if (low > 1){
    newLow = low - 3;
    if(newLow < 1){
      newLow = 1
    }
  }
  if (high <= total){
    newHigh = high+1
    if (newHigh > total){
      newHigh = 1;
    }
  }
  let newNav = `<span onclick="showTopNews(`+ newLow +`)">&#x25C4;</span>   Showing `+low+`-`+high+` of `+total+` News <span onclick="showTopNews(`+ newHigh +`)">&#x25BA;</span>`
  $('#news-items-nav').empty();
  $('#news-items-nav').append(newNav);
}
function showRegionInterest(itemStart){
  let low = itemStart -1;
  let high = low + 5;
  if (low > regionInterest.length){
    return 0;
  }else if(high > regionInterest.length){
    let itemsToRender = regionInterest.slice(low,);
    renderTopInterestRegions(itemsToRender, low+1, regionInterest.length, regionInterest.length);
  }else{
    let itemsToRender = regionInterest.slice(low, high);
    renderTopInterestRegions(itemsToRender, low+1, high, regionInterest.length);
  }
}
function renderTopInterestRegions(lst, low, high, total){
  //empty the div first
  $('#region-interest-div').empty();
  let newHtml = ``;
  let pos_counter = low;
  for (i of lst){
    let toAppend = `
    <div class="progress-box mt-4">
        <h6 class="title text-muted">`+pos_counter+`. `+ i[1]+`</h6>
        <div class="progress">
            <div class="progress-bar position-relative bg-primary" style="width:`+i[0]+`%;">
                <div class="progress-value d-block text-muted h6">`+i[0]+`%</div>
            </div>
        </div>
    </div>
    `
    newHtml += toAppend;
    //increment counter
    pos_counter += 1;
  }
  $('#region-interest-div').append(newHtml);

  //update the nav buttons
  let newLow = 1;
  let newHigh = total;
  if (low > 1){
    newLow = low - 5;
    if(newLow < 1){
      newLow = 1
    }
  }
  if (high <= total){
    newHigh = high+1
    if (newHigh > total){
      newHigh = 1;
    }
  }
  let newNav = `<span onclick="showRegionInterest(`+ newLow +`)">&#x25C4;</span>   Showing `+low+`-`+high+` of `+total+` News <span onclick="showRegionInterest(`+ newHigh +`)">&#x25BA;</span>`
  $('#top-regions-nav').empty();
  $('#top-regions-nav').append(newNav);
}

//function for showing related topics
function showRelatedTopics(itemStart){
  let low = itemStart -1;
  let high = low + 3;
  if (low > relatedTopics.length){
    return 0;
  }else if(high > relatedTopics.length){
    let itemsToRender = relatedTopics.slice(low,);
    renderRelatedTopics(itemsToRender, low+1, relatedTopics.length, relatedTopics.length);
  }else{
    let itemsToRender = relatedTopics.slice(low, high);
    renderRelatedTopics(itemsToRender, low+1, high, relatedTopics.length);
  }
}
function renderRelatedTopics(lst, low, high, total){
  //empty the div first
  $('#related-topic-tbody').empty();
  let newHtml = ``;
  let pos_counter = low;
  for (i of lst){
    let toAppend = `
      <tr>
          <th scope="row">`+pos_counter+`</th>
          <td>`+i[5]+` - `+i[6]+`</td>
          <td>`+i[1]+`</td>
      </tr>
    `
    newHtml += toAppend;
    //increment counter
    pos_counter += 1;
  }
  $('#related-topic-tbody').append(newHtml);

  //update the nav buttons
  let newLow = 1;
  let newHigh = total;
  if (low > 1){
    newLow = low - 3;
    if(newLow < 1){
      newLow = 1
    }
  }
  if (high <= total){
    newHigh = high+1
    if (newHigh > total){
      newHigh = 1;
    }
  }
  let newNav = `<span onclick="showRelatedTopics(`+ newLow +`)">&#x25C4;</span>   Showing `+low+`-`+high+` of `+total+` News <span onclick="showRelatedTopics(`+ newHigh +`)">&#x25BA;</span>`
  $('#related-topic-nav').empty();
  $('#related-topic-nav').append(newNav);
}

//show related queries for this part
function showRelatedQueries(itemStart){
  let low = itemStart -1;
  let high = low + 3;
  if (low > relatedQueries.length){
    return 0;
  }else if(high > relatedQueries.length){
    let itemsToRender = relatedQueries.slice(low,);
    renderRelatedQueries(itemsToRender, low+1, relatedQueries.length, relatedQueries.length);
  }else{
    let itemsToRender = relatedQueries.slice(low, high);
    renderRelatedQueries(itemsToRender, low+1, high, relatedQueries.length);
  }
}
function renderRelatedQueries(lst, low, high, total){
  //empty the div first
  $('#related-queries-tbody').empty();
  let newHtml = ``;
  let pos_counter = low;
  for (i of lst){
    let toAppend = `
    <tr>
        <th scope="row">`+pos_counter+`</th>
        <td>`+i[0]+`</td>
        <td>`+i[1]+`</td>
    </tr>
    `

    newHtml += toAppend;
    //increment counter
    pos_counter += 1;
  }
  $('#related-queries-tbody').append(newHtml);

  //update the nav buttons
  let newLow = 1;
  let newHigh = total;
  if (low > 1){
    newLow = low - 3;
    if(newLow < 1){
      newLow = 1
    }
  }
  if (high <= total){
    newHigh = high+1
    if (newHigh > total){
      newHigh = 1;
    }
  }
  let newNav = `<span onclick="showRelatedQueries(`+ newLow +`)">&#x25C4;</span>   Showing `+low+`-`+high+` of `+total+` News <span onclick="showRelatedQueries(`+ newHigh +`)">&#x25BA;</span>`
  $('#related-queries-nav').empty();
  $('#related-queries-nav').append(newNav);
}




//show news articles on page load and other items
$(document).ready(function(){
  showTopNews(1);
  showRegionInterest(1);
  showRelatedTopics(1);
  showRelatedQueries(1);
});