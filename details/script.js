document.addEventListener("DOMContentLoaded",init);
let map;
let weatherDays=[];
let msg=['Actions speak louder than words!','Never put off what you can do today until tomorrow.','Believe in yourself!',"Winners do what losers don't want to do.",'Whatever is worth doing, is worth doing well.','Live well, love lots, and laugh often!','Quitters never win, and winners never quit.','Knowledge is power.','Asking costs nothing.','Better late than never!','Never too old to learn.','Give more than you planned to.'];

async function init() {

    // Create animation div
    const container=document.getElementById('fadeIn');
    const mainMsg=document.getElementById('msg');
    mainMsg.style.fontFamily='fantasy';
    mainMsg.style.fontSize='40px';
    const index=Math.floor(Math.random()*(msg.length));
    mainMsg.innerHTML=msg[index];

    // Loading
    const loading=document.createElement('p');
    loading.innerHTML='Waiting for response...';
    loading.style='position: absolute; z-index: 3';
    document.body.appendChild(loading);

    // Get coordinates from URL flags
    const params=new URLSearchParams(window.location.search);
    const currentPt=[params.get('lat'),params.get('lon')];

    // Get API requests
    const forecastUrl=`https://api.weatherapi.com/v1/forecast.json?key=2135c58562bd4098a6420220232006&q=${currentPt.join(',')}&days=3`;
    const forecastTXT=await request(forecastUrl);
    const forecastJSON=JSON.parse(forecastTXT);
    weatherDays=forecastJSON.forecast.forecastday;
    for(let i=1;i<=2;i++){
        const date=new Date(forecastJSON.location.localtime);
        date.setDate(date.getDate()-i);
        const dateStr=`${date.getFullYear()}-${(date.getMonth()+1)<10?'0'+(date.getMonth()+1):(date.getMonth()+1)}-${(date.getDate())<10?('0'+date.getDate()):(date.getDate())}`;
        const historyUrl=`https://api.weatherapi.com/v1/history.json?key=2135c58562bd4098a6420220232006&q=${currentPt.join(',')}&dt=${dateStr}`;
        const historyTXT=await request(historyUrl);
        const historyJSON=JSON.parse(historyTXT);
        weatherDays.unshift(historyJSON.forecast.forecastday[0]);
    }
    document.body.removeChild(loading);

    // Add header
    const h1=document.createElement('h1');
    h1.innerHTML=`Weather at ${forecastJSON.location.name}, ${forecastJSON.location.region}, ${forecastJSON.location.country}`;
    container.appendChild(h1);
    const localtime=document.createElement('p');
    const localDate=new Date(forecastJSON.location.localtime);
    const tmrDate=new Date(localDate.getTime()+86400000);
    const yesterDate=new Date(localDate.getTime()-86400000);
    localtime.innerHTML=`Current local time: ${localDate.toLocaleString()}`;
    container.appendChild(localtime);

    // Display weather in a table
    const table=document.createElement('table');
    table.setAttribute('id','weatherTable');
    const headRow=document.createElement('tr');
    headRow.innerHTML='<td>Date + Time</td> <td colspan=2>Weather</td> <td>High °C</td> <td>Low °C</td> <td></td>';
    /*const dateH=document.createElement('td');
    dateH.innerHTML='Date';
    headRow.appendChild(dateH);
    const condH=document.createElement('td');
    condH.innerHTML='Weather';
    headRow.appendChild(condH);
    const hiH=document.createElement('td');
    hiH.innerHTML='High °C';
    headRow.appendChild(hiH);
    const loH=document.createElement('td');
    loH.innerHTML='Low °C';
    headRow.appendChild(loH);*/
    table.appendChild(headRow);
    for(const day of weatherDays){
        // Add daily weather
        const dateObj=new Date(day.date_epoch*1000+(localDate.getTimezoneOffset()+120)*60000);
        const dayRow=document.createElement('tr');
        //dayRow.setAttribute('id',dateObj.toDateString().substring(0,10));
        dayRow.id=dateObj.toDateString().substring(0,10);
        let dateStr=dateObj.toDateString().substring(0,10);
        if(dateObj.toDateString()==localDate.toDateString()){
            dayRow.setAttribute('style','font-size: 20px; font-weight: bold;');
            dateStr+=' (Today)';
        }else if(dateObj.toDateString()==tmrDate.toDateString()){
            dateStr+=' (Tomorrow)';
        }else if(dateObj.toDateString()==yesterDate.toDateString()){
            dateStr+=' (Yesterday)';
        }
        dayRow.innerHTML=`<td>${dateStr}</td>
        <td><img src="https:${day.day.condition.icon}"></img></td>
        <td>${day.day.condition.text}</td>
        <td>${day.day.maxtemp_c}</td>
        <td>${day.day.mintemp_c}</td>
        <td><button value='${dateObj.toDateString().substring(0,10)}' onclick='showHourly()'>Show hourly forecast</button></td>
        `;
        table.appendChild(dayRow);
        // Add hourly weather
        for(const hour of day.hour){
            const hrRow=document.createElement('tr');
            hrRow.style.display='none';
            hrRow.setAttribute('class',dateObj.toDateString().substring(0,10));
            hrRow.innerHTML=`<td>${hour.time.substring(11)}</td>
            <td><img src="https:${hour.condition.icon}" width="32px" height="32px"></img></td>
            <td>${hour.condition.text}</td>
            <td colspan=2 style='text-align: center;'>${hour.temp_c}</td>
            `;
            table.appendChild(hrRow);
        }
    }
    const outerBox=document.createElement('div');
    outerBox.setAttribute('style','width: 90%; height: 570px; margin: auto; overflow: scroll; border: 2px black solid');
    outerBox.setAttribute('id','outerBox');
    outerBox.appendChild(table);
    container.appendChild(outerBox);
}

async function showHourly(){
    const rows=document.querySelectorAll('tr');
    for(const row of rows){
        if(row.className==event.target.value){
            if(row.style.display=='none'){
                event.target.innerHTML='Hide hourly forecast';
                row.style.display='';
            }else{
                event.target.innerHTML='Show hourly forecast';
                row.style.display='none';
            }
        }
    }
}

async function request(url) {
    let str='';
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'text';
    request.onload = function () {
        str+=request.response;
    };
    request.send();
    return new Promise(resolve => {
        let interval=setInterval(() => {
            if(str.length>0){
                clearInterval(interval);
                resolve(str);
            }
        }, 500);
    });
}

function draw(){
    const cvs = document.createElement('canvas');
    cvs.setAttribute('style', 'height: 20px, width: 20px');
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#ff0000';
    ctx.arc(10, 10, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.arc(10, 10, 9, 0, Math.PI * 2);
    ctx.stroke();
    const srcUrl = cvs.toDataURL();
    const circle = L.icon({ iconUrl: srcUrl, iconSize: [200, 100], iconAnchor: [10, 10], popupAnchor: [0, -9] });
    return circle;
}

function display(output='') {
    const p = document.createElement('p');
    p.innerText = output;
    document.body.appendChild(p);
}