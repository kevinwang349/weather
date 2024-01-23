document.addEventListener("DOMContentLoaded",init);
let map;

async function init() {

    // Instructions
    const i1=document.createElement('h1');
    i1.innerHTML='Double click a location on the map to see the local weather';
    i1.style.textAlign='center';
    document.body.appendChild(i1);
    const i2=document.createElement('h2');
    i2.innerHTML='Drag to move the map and scroll on the map to zoom in/out';
    i2.style.textAlign='center';
    document.body.appendChild(i2);
    
    // Create the container div
    const container = document.createElement('div');
    container.setAttribute('style', 'width: 90%; margin: auto;');
    document.body.appendChild(container);
    
    // Add weatherAPI link
    const br=document.createElement('br');
    document.body.appendChild(br);
    const a=document.createElement('a');
    a.innerHTML='<img src="//cdn.weatherapi.com/v4/images/weatherapi_logo.png" alt="Weather data by WeatherAPI.com" border="0">';
    a.href='https://www.weatherapi.com/';
    a.style='bottom: 0px; left: 0px; padding: 0px;';
    a.title='Free Weather API';
    document.body.appendChild(a);

    // Add about page link
    const about=document.createElement('a');
    about.href='https://w-uta8.onrender.com/about';
    about.innerHTML='About';
    about.style='padding: 15px; font-size: 20px;';
    document.body.appendChild(about);

    // Create the div that will hold the Leaflet map
    const mapdiv = document.createElement('div');
    mapdiv.setAttribute('style', 'height: 550px;');
    container.appendChild(mapdiv);

    // Create the map and fill it with tiles
    map = L.map(mapdiv);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1Ijoia2V2aW53MjQwMSIsImEiOiJja3I1ODZqdWszMmdqMnBwYW9qbWVnY2c4In0.qqgVHQu94DuWbLbgjWMN9w'
    }).addTo(map);
    //let layerGroup=L.layerGroup();

    // Zoom the map to the world
    map.setView([0,0],2);

    // Add event listener
    map.on('dblclick', async function(ev){
        //layerGroup.clearLayers();
        const latlng = map.mouseEventToLatLng(ev.originalEvent);
        let currentPt=[latlng.lat,latlng.lng];
        if(currentPt[1]>180) currentPt[1]-=360;
        if(currentPt[1]<-180) currentPt[1]+=360;
        const currentUrl=`https://api.weatherapi.com/v1/current.json?key=2135c58562bd4098a6420220232006&q=${currentPt.join(',')}`;
        const response=await request(currentUrl);
        const json=JSON.parse(response);
        if(json.error!=undefined&&json.error.message!=undefined){
            const pop='Sorry, no weather information available in uninhabited areas.';
            map.openPopup(pop, currentPt);
            return;
        }
        //display(response);
        currentPt=[json.location.lat,json.location.lon];
        const date=new Date(json.location.localtime);
        const pop=`Current weather in ${json.location.name}, ${json.location.region}, ${json.location.country}<br>
        Temperature ${json.current.temp_c}°C<br>
        <img src='${json.current.condition.icon}'></img><br>
        ${json.current.condition.text}<br>
        Current time: ${date.toLocaleString()}<br>
        <a href='https://w-uta8.onrender.com/details/?lat=${json.location.lat}&lon=${json.location.lon}'>Click here for weather predictions for this location</a>`;
        //layerGroup.addLayer(L.marker(currentPt,{icon:draw()}).bindPopup(pop));
        //layerGroup.addTo(map);
        map.openPopup(pop, currentPt);
    });
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