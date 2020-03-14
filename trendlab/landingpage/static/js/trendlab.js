//show news articles on page load and other items
$(document).ready(function(){

    let searchInputtimerId;
    const searchInput = document.querySelector('#trend-search-input');
    // Throttle function: Input as function which needs to be throttled and delay is the time interval in milliseconds
    const throttleFunction = function (func, delay) {
        // If setTimeout is already scheduled, no need to do anything
        if (searchInputtimerId) {
            return
        }
        // Schedule a setTimeout after delay seconds
        searchInputtimerId = setTimeout(function () {
            func()
            // Once setTimeout function execution is finished, timerId = undefined so that in <br>
            // the next scroll event function execution can be scheduled by the setTimeout
            searchInputtimerId = undefined;
        }, delay)
    };

    // Debounce function: Input as function which needs to be debounced and delay is the debounced time in milliseconds
    const debounceFunction = function (func, delay) {
        // Cancels the setTimeout method execution
        clearTimeout(searchInputtimerId)

        // Executes the func after delay time.
        searchInputtimerId = setTimeout(func, delay)
    };

    function sendRequestTrendsSuggestion(){
        const searchTerm = searchInput.value;
        if (searchTerm.length < 2){
            //empty and hide parent div
            var autocomplete_parent_div = $('#autocomplete-parent-div');
            autocomplete_parent_div.empty();
            autocomplete_parent_div.hide();
            return 0;
        }
        fetchGoogleTrendsSuggestion(searchTerm);
    }


    // $('#trend-search-input').change(function(){
    //     throttleFunction(sendRequestTrendsSuggestion, 100)
    //     // sendRequestTrendsSuggestion();
    // });

    // $('#trend-search-input').addEventListener('keyup', function(){
    //     throttleFunction(sendRequestTrendsSuggestion, 200);
    // })

    if ((typeof searchInput !== 'undefined') && (searchInput != null)){
        searchInput.addEventListener('input', function(){
            //query the api for search term suggestions
            // throttleFunction(sendRequestTrendsSuggestion, 200);
            debounceFunction(sendRequestTrendsSuggestion, 100);
        });
    }

//global variables storing location, timezone etc
    const tz = "0";
    const lang = "en-GB";
    let geo = " ";

//set geo programmatically
    function setGeo(){
        let url = window.location.href
        let urlParamStrings = url.split("?")
        let urlParamString = '';
        if (urlParamStrings.length > 2){
            //join them
            urlParamString = urlParamStrings.slice(1,).join("");
        }else{
            urlParamString = urlParamStrings[1];
        }
        let searchParams = new URLSearchParams(urlParamString);

        if (searchParams.has('geo')){
            geo = searchParams.get('geo');
        }else{
            geo = " ";
        }
    }
    setGeo();


    // function fetchGoogleTrendsSuggestion(searchTerm){
    //     //call api
    //     const url = window.location.origin + "search/autocomplete/" + searchTerm;
    //     let payload = {
    //         'hl' : lang,
    //         'tz': tz,
    //         'term':searchTerm
    //     }
    //
    //     $.ajax({
    //         url : document.location.origin + '/search/autocomplete/',
    //         type : 'POST',
    //         data : JSON.stringify(payload),
    //         contentType:'application/json',
    //         success : function(data) {
    //             updateSuggestionDiv(data['default'][['topics']], searchTerm);
    //         },
    //         error : function(request,error)
    //         {
    //             console.log(error)
    //             updateSuggestionDiv([], searchTerm);
    //         }
    //     });
    //
    // }

    function fetchGoogleTrendsSuggestion(searchTerm){
        //call api
        const url =  + searchTerm;
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
        let urlParamString = "";
        if (urlParamStrings.length > 2){
            //join them
            urlParamString = urlParamStrings.slice(1,).join("");
        }else{
            urlParamString = urlParamStrings[1];
        }
        let searchParams = new URLSearchParams(urlParamString);
        if (newLocale === ' '){
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
        let new_params = searchParams.toString();
        window.location.href = urlParamStrings[0] + "?" + new_params;
    }

    $("#dropdown_local").find("a").each(function(index){
        $(this).click(function() {
            const data_country = $(this).attr('data-country');
            switchTrendLocale(data_country);
        })

    });

    let current_timeFrame = 1;
//function to toggle the time periods btn 5 yrs, 1 year and 30 days
    $( "#toggle_interest_all" ).click(function() {
        toggleTimePeriod(s_queryTerm, 'all');
    });
    $( "#toggle_interest_5year" ).click(function() {
        toggleTimePeriod(s_queryTerm, 'today 5-y');
    });
    $( "#toggle_year_filter" ).click(function() {
        toggleTimePeriod(s_queryTerm, 'yearfilter');
    });

    $( "#toggle_today1_m" ).click(function() {
        toggleTimePeriod(s_queryTerm, 'today 1-m');
    });

    $( "#toggle_now_7d" ).click(function() {
        toggleTimePeriod(s_queryTerm, 'now 7-d');
    });


    function toggleTimePeriod(toggleQuery, timeframe){
        const url = window.location.origin + "/search/get_search_result/";
        let payload = {
            'q' : toggleQuery,
            'originalTerm': searchResTerm,
            'geo': 'US',
            'timeperiod': timeframe
        }

        // var dat = JSON.stringify(payload);
        // alert(dat)

        $("#load_img").show();
        $.ajax({
            url : url,
            type : 'POST',
            data : payload,
            dataType:'json',

            success : function(data) {
                // alert(data.related_topics);
                relatedTopics = JSON.parse(data.related_topics);
                relatedQueries = JSON.parse(data.related_queries);
                chartData = data.chart_data;
                newsStore = JSON.parse(data.top_news);
                regionInterest = data.region_interest;
                timeSpan = data.timespan;
                s_queryTerm  = data.query_term;
                searchResTerm  = data.search_term_name;
                $("#load_img").hide();
                // plotInterestChart0(data.chart_data, timeframe);
                plotInterestChart0(chartData, timeSpan)
                showTopNews(1);
                showRegionInterest(1);
                showRelatedTopics(1);
                showRelatedQueries(1);
            },
            error : function(request,error)
            {
                $("#load_img").hide();
                console.log(error);
            }
        });
        current_timeFrame = timeframe;
        // plotInterestChart0()
        // switch (timeframe) {
        //     case 0:
        //         plotInterestChart0();
        //         break;
        //     case 1:
        //         plotInterestChart1();
        //         break;
        //     case 2:
        //         plotInterestChart2();
        //         break;
        //     case 3:
        //         plotInterestChart3();
        //         break;
        //     case 4:
        //         plotInterestChart4();
        //         break;
        // }

        // showRegionInterest(0)
        // showRelatedQueries(0)
        // showRelatedTopics(0)
    }

    function updateSuggestionDiv(suggestions, searchTerm){
        //with search terms, dom manipulation to insert suggestions with links.
        //if empty, hide parent div too
        var autocomplete_parent_div = $('#autocomplete-parent-div');
        autocomplete_parent_div.empty();
        if (suggestions.length === 0){
            autocomplete_parent_div.hide();
        }else{
            //first append the search term itself
            let childDiv = `
                <div class="autocomplete-element"
                         data-mid=` + searchTerm + `
                         data-title=` + searchTerm + `>  
<!--                        onclick="submitWithSuggestion('`+ searchTerm +`','` + searchTerm +`')">-->
                  <span class="autocomplete-term">`
                            + searchTerm + `</span><br/>
                  <span class="autocomplete-term-topic">Search term</span>
                </div>
            `
            autocomplete_parent_div.append(childDiv);
            suggestions.forEach(function(suggestion){
                let childDiv = `
                    <div class="autocomplete-element"
                         data-mid="${suggestion['mid']}"
                         data-title="${suggestion['title']}">
<!--                         onclick="submitWithSuggestion('`+ suggestion['mid'] +`','` + suggestion['title'] +`')">-->
                        <span class="autocomplete-term">`
                            + suggestion['title'] + `</span><br/>
                        <span class="autocomplete-term-topic">`+ suggestion['type'] +`</span>
                    </div>
                    `
                autocomplete_parent_div.append(childDiv);
            });
            autocomplete_parent_div.show();
        }

        $(".autocomplete-element").each(function(index) {
            $(this).click(function(){
                const qTerm = $(this).attr('data-mid');
                const originalTerm = $(this).attr('data-title');

                submitWithSuggestion(qTerm, originalTerm);
                // toggleTimePeriod(, '')
            })
        });
    }

    function submitWithSuggestion(queryTerm, originalTerm){
      if (geo === ' '){
          //redirect to that page
        window.location.href = document.location.origin + "/search?q=" + encodeURIComponent(queryTerm) + "&originalTerm=" + originalTerm;
      }else{
          //redirect to that page
        window.location.href = document.location.origin + "/search?q=" + encodeURIComponent(queryTerm) + "&geo=" + geo + "&originalTerm=" + originalTerm;
      }
    }



    $('#search-form').on('submit',function(e){
        e.preventDefault();
        const searchTerm = searchInput.value;
        submitWithSuggestion(searchTerm, searchTerm);
    })


//handling results in searchpage below
//chart 0 for interest over time
    function plotInterestChart0(data, timeframe){
        var ctx0 = null;
        var chart_time = null;
        var timeframe_index = 0;
        if (timeframe === 'all') {
            timeframe_index = 0
        }
        else if (timeframe === 'today 5-y')
            timeframe_index = 1
        else if (timeframe === 'today 1-m')
            timeframe_index = 3
        else if (timeframe === 'now 7-d')
            timeframe_index = 4
        else
            timeframe_index = 2

        switch(timeframe_index) {
            case 0:
                ctx0 = document.getElementById("allinterest");
                chart_time = {'unit': "week", 'unitStepSize': 50};
                break;
            case 1:
                ctx0 = document.getElementById("5yearinterest");
                chart_time = {'unit': "week", 'unitStepSize': 50};
                break;
            case 2:
                ctx0 = document.getElementById("12monthinterest");
                chart_time = {'unit': "month", 'unitStepSize': 2};
                break;
            case 3:
                ctx0 = document.getElementById("30dayinterest");
                chart_time = {'unit': "day", 'unitStepSize': 5};
                break;
            case 4:
                ctx0 = document.getElementById("7daysinterest");
                chart_time = {'unit': "day", 'unitStepSize': 1};
                break;
        }
        var myChart0 = new Chart(ctx0, {
            type: 'line',
            data: {
                backgroundColor: "rgba(255,255,255,0.5)",
                labels: data['date_values'],
                datasets: [{
                    data: data['interest_values'],
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
                // tooltips: {
                //      enabled: false
                // },
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
                            unit: chart_time['unit'],
                            unitStepSize: chart_time['unitStepSize']
                        }
                    }]
                },
            }
        });
    }
// plotInterestChart0();

//chart 1 for interest over time
// function plotInterestChart1(){
//   var ctx1 = document.getElementById("5yearinterest");
//   var myChart1 = new Chart(ctx1, {
//     type: 'line',
//     data: {
//       backgroundColor: "rgba(255,255,255,0.5)",
//       // labels: chartData['interest_data_5y']['date_values'],
//         labels: chartData[1]['date_values'],
//       datasets: [{
//         // data: chartData['interest_data_5y']['interest_values'],
//           data: chartData[1]['interest_values'],
//         fill: false,
//         backgroundColor: "#2f55d4",
//         pointBackgroundColor: "#fff",
//         pointBorderColor: "#fff",
//         pointRadius:0,
//         borderColor:"#2f55d4",
//       }]
//     },
//     options: {
//            legend: {
//               display: false
//            },
//            // tooltips: {
//            //      enabled: false
//            // },
//            responsive: true,
//            maintainAspectRatio: false,
//            scales: {
//             yAxes: [{
//               gridLines: {
//                   drawBorder: false,
//               },
//               ticks: {
//                 display: false,
//                 // beginAtZero: true,
//                 // min: 0,
//                 // max: 100,
//                 // stepSize: 25,
//               }
//             }],
//             xAxes:[{
//               type: 'time',
//               gridLines: {
//                   color: "rgba(0, 0, 0, 0)",
//               },
//               time: {
//                     unit: 'week',
//                     unitStepSize: 50
//               }
//             }]
//           },
//
//       }
//   });
// }
// plotInterestChart1();
//
//
// function plotInterestChart2(){
//   var ctx2 = document.getElementById("12monthinterest");
//   var myChart1 = new Chart(ctx2, {
//     type: 'line',
//     data: {
//       backgroundColor: "rgba(255,255,255,0.5)",
//       // labels: chartData['interest_data_12m']['date_values'],
//         labels: chartData[2]['date_values'],
//       datasets: [{
//         // data: chartData['interest_data_12m']['interest_values'],
//         data: chartData[2]['interest_values'],
//         fill: false,
//         pointBackgroundColor: "#fff",
//         pointBorderColor: "#fff",
//         pointRadius:0,
//         borderColor:"#2f55d4",
//       }]
//     },
//     options: {
//            legend: {
//               display: false
//            },
//            tooltips: {
//                 enabled: false
//            },
//            responsive: true,
//            maintainAspectRatio: false,
//            scales: {
//             yAxes: [{
//               gridLines: {
//                   drawBorder: false,
//               },
//               ticks: {
//                 display: false,
//                 // beginAtZero: true,
//                 // min: 0,
//                 // max: 100,
//                 // stepSize: 25,
//               }
//             }],
//             xAxes:[{
//               type: 'time',
//               gridLines: {
//                   color: "rgba(0, 0, 0, 0)",
//               },
//               time: {
//                     unit: 'month',
//                     unitStepSize: 2
//               }
//             }]
//           },
//
//       }
//   });
// }
// plotInterestChart2();
//
//
// function plotInterestChart3(){
//   var ctx3 = document.getElementById("30dayinterest");
//   var myChart1 = new Chart(ctx3, {
//     type: 'line',
//     data: {
//       backgroundColor: "rgba(255,255,255,0.5)",
//       // labels: chartData['interest_data_1m']['date_values'],
//         labels: chartData[3]['date_values'],
//       datasets: [{
//         // data: chartData['interest_data_1m']['interest_values'],
//           data: chartData[3]['interest_values'],
//         fill: false,
//         pointBackgroundColor: "#fff",
//         pointBorderColor: "#fff",
//         pointRadius:0,
//         borderColor:"#2f55d4",
//       }]
//     },
//     options: {
//            legend: {
//               display: false
//            },
//            tooltips: {
//                 enabled: false
//            },
//            responsive: true,
//            maintainAspectRatio: false,
//            scales: {
//             yAxes: [{
//               gridLines: {
//                   drawBorder: false,
//               },
//               ticks: {
//                 display: false,
//                 // beginAtZero: true,
//                 // min: 0,
//                 // max: 100,
//                 // stepSize: 25,
//               }
//             }],
//             xAxes:[{
//               type: 'time',
//               gridLines: {
//                   color: "rgba(0, 0, 0, 0)",
//               },
//               time: {
//                     unit: 'day',
//                     unitStepSize: 5
//               }
//             }]
//           },
//
//       }
//   });
// }
// plotInterestChart3();
//
// function plotInterestChart4(){
//   var ctx4 = document.getElementById("7daysinterest");
//   var myChart4 = new Chart(ctx4, {
//     type: 'line',
//     data: {
//       backgroundColor: "rgba(255,255,255,0.5)",
//       // labels: chartData['interest_data_7days']['date_values'],
//         labels: chartData[4]['date_values'],
//       datasets: [{
//         // data: chartData['interest_data_7days']['interest_values'],
//           data: chartData[4]['interest_values'],
//         fill: false,
//         pointBackgroundColor: "#fff",
//         pointBorderColor: "#fff",
//         pointRadius:0,
//         borderColor:"#2f55d4",
//       }]
//     },
//     options: {
//            legend: {
//               display: false
//            },
//            tooltips: {
//                 enabled: false
//            },
//            responsive: true,
//            maintainAspectRatio: false,
//            scales: {
//             yAxes: [{
//               gridLines: {
//                   drawBorder: false,
//               },
//               ticks: {
//                 display: false,
//                 // beginAtZero: true,
//                 // min: 0,
//                 // max: 100,
//                 // stepSize: 25,
//               }
//             }],
//             xAxes:[{
//               type: 'time',
//               gridLines: {
//                   color: "rgba(0, 0, 0, 0)",
//               },
//               time: {
//                     unit: 'day',
//                     unitStepSize: 5
//               }
//             }]
//           },
//
//       }
//   });
// }
// plotInterestChart4();

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



    $( "#signin_google" ).click(function () {
        launchGoogleSigninPopup();
    });



//lazy load disambig descriptions
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
        var disambig_items = $('#disambig-items');
        if (disambig_items.length > 0){
            disambig_items.children().each(function(){
                let obj_cache = $(this);
                let term = $(this).children().first().text();
                fetchWikipediaSummary(term, obj_cache);
            });
        }
    });

    function showItemSummary(obj){
        if (obj.children[1].style.display === "none"){
            obj.children[1].style.display = 'block';
        }
        else{
            obj.children[1].style.display = 'none';
        }
    }


    function showTopNews(itemStart){
        let low = itemStart -1;
        let high = low + 5;
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
        var div_news_item = $('#news-items-div');
        div_news_item.empty();
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
        div_news_item.append(newHtml);

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

        let newNav = `<span class="news_span" data-value="` + newLow + `">&#x25C4;</span>   Showing `+low+`-`+high+` of `+total+` News <span class="news_span" data-value="` + newHigh +`">&#x25BA;</span>`
        var news_items_nav = $('#news-items-nav');

        news_items_nav.empty();
        news_items_nav.append(newNav);

        news_items_nav.find("span").each(function(index) {
            $(this).click(function() {
                let news_id = $(this).attr('data-value');
                showTopNews(news_id)
            })
        });
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
        var region_interest_div = $('#region-interest-div');
        region_interest_div.empty();
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
        region_interest_div.append(newHtml);

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
        let newNav = `<span class="interest_span" data-value="` + newLow + `">&#x25C4;</span>   Showing `+low+`-`+high+` of `+total+` News <span class="interest_span" data-value="`+ newHigh +`">&#x25BA;</span>`
        const top_regions_nav = $('#top-regions-nav');
        top_regions_nav.empty();
        top_regions_nav.append(newNav);

        top_regions_nav.find("span").each(function(index) {
            $(this).click(function() {
                let spanValue = $(this).attr("data-value");
                showRegionInterest(spanValue);
                });
        });
    }

//function for showing related topics
    function showRelatedTopics(itemStart){
        let low = itemStart -1;
        let high = low + 5;

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
        var related_topic_tbody = $('#related-topic-tbody');
        related_topic_tbody.empty();
        let newHtml = ``;
        let pos_counter = low;
        for (i of lst){
            let toAppend = `
              <tr>
                  <th scope="row">`+pos_counter+`</th>
                  <td>`+i[4]+` - `+i[5]+`</td>
                  <td>`+i[1]+`</td>
              </tr>
            `
            newHtml += toAppend;
            //increment counter
            pos_counter += 1;
        }
        related_topic_tbody.append(newHtml);

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
        let newNav = `<span class="relatedtopic_span" data-value="` + newLow + `">&#x25C4;</span>   Showing `+low+`-`+high+` of `+total+` News <span class="relatedtopic_span" data-value="` + newHigh + `">&#x25BA;</span>`
        var related_topic_nav = $('#related-topic-nav');
        related_topic_nav.empty();
        related_topic_nav.append(newNav);

        related_topic_nav.find("span").each(function(index) {
            $(this).click(function() {
                let spanValue = $(this).attr('data-value')
                showRelatedTopics(spanValue);
            });
        });
    }

//show related queries for this part
    function showRelatedQueries(itemStart){
        let low = itemStart -1;
        let high = low + 5;
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
        var related_queries_tbody = $('#related-queries-tbody');
        related_queries_tbody.empty();
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
        related_queries_tbody.append(newHtml);

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
            newHigh = high+1;
            if (newHigh > total){
                newHigh = 1;
            }
        }
        let newNav = `<span class="relatedqueries_span" data-value="`+ newLow + `">&#x25C4;</span>   Showing `+low+`-`+high+` of `+total+` News <span class="relatedqueries_span" data-value="`+ newHigh + `">&#x25BA;</span>`

        const related_queries_nav = $('#related-queries-nav');
        related_queries_nav.empty()
        related_queries_nav.append(newNav);
        related_queries_nav.find("span").each(function(index) {
            $(this).click(function() {
                let spanValue = $(this).attr('data-value');
                showRelatedQueries(spanValue);
            })
        });
    }


    if ((typeof timeSpan !== 'undefined') && (timeSpan !== '')){
        // alert('document ready ' + timeSpan);
        plotInterestChart0(chartData, timeSpan)
        showTopNews(1);
        showRegionInterest(1);
        showRelatedTopics(1);
        showRelatedQueries(1);
    }

});



