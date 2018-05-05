'use strict';
 
var express = require('express'); 
var ejs = require('ejs');
var child_process = require('child_process');
var exec = child_process.exec;
var app = express();
var fs = require("fs");
var path = require("path");
var get_request = require("request-promise");
//var cons = require("consolidate");

app.use(express.static(path.join(__dirname, '')));
  
var server = app.listen(3000,function(){console.log("Express Server has started on port 3000"); })

app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
app.set('views', __dirname + "/views");
///////////////////////////////////////
var RiskJSON = {Risk : 0};
var weatherJSON = { HighestTemperature : 0 , LowestTemperature : 0, DailyTemperatureDifference : 0, Humidity : 0, Precipitation : 0, Cloud : 0, Pressure : 0,
                    Finedust : 0, Location : null};
var weatherLAZJSON = {HT : 0, LT : 0, DT : 0, FD :0, C : 0};
var fetch_options = {
    url: '',
    headers: {
        'x-skpop-userId': 'quwieo',
        'Accept': 'application/json',
        'Accept-Language': 'ko_KR',
        'appKey': 'b1d6ac90-6f0b-379e-aaaf-35ec9ce0210c'
    }
}

var fetch_options_dust = {
    url: '',
    headers: {
        'x-skpop-userId': 'quwieo',
        'Accept': 'application/json',
        'Accept-Language': 'ko_KR',
        'appKey': 'b1d6ac90-6f0b-379e-aaaf-35ec9ce0210c'
    }
}

function setURL_fetch_options (lat, lon){
  fetch_options.url = "http://apis.skplanetx.com/weather/current/minutely?";
  fetch_options.url += "lon="+lon;
  fetch_options.url += "&village=&county=&stnid=";
  fetch_options.url += "&lat="+lat;
  fetch_options.url += "&city=&version=1";
  //console.log(fetch_options.url);
  //get_request(fetch_options, fetch_callback);
}

function setURL_fetch_options_dust (lat, lon){
  fetch_options_dust.url = "http://apis.skplanetx.com/weather/dust?";
  fetch_options_dust.url += "lon=" +lon;
  fetch_options_dust.url += "&lat="+lat;
  fetch_options_dust.url += "&version=1";
 // console.log(fetch_options_dust.url);
  //get_request(fetch_options_dust, fetch_callback_dust);
}

function fetch_callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        var weatherInfo = info.weather.minutely[0];
        //console.log(info);
        console.log(weatherInfo.station.name);
        var HighestTemperature = weatherInfo.temperature.tmax;
        var LowestTemperature = weatherInfo.temperature.tmin;
        var Humidity = weatherInfo.humidity;
        var Precipitation = weatherInfo.precipitation.sinceOntime;
        var Cloud = weatherInfo.sky.name;
        var DailyTemperatureDifference = HighestTemperature - LowestTemperature;
        var Pressure = weatherInfo.pressure.surface;
        console.log("HighestTemperature:" + HighestTemperature);
        console.log("LowestTemperature:" + LowestTemperature);
        console.log("DailyTemperatureDifference:"+ DailyTemperatureDifference);
        console.log("Humidity:"+Humidity);
        console.log("Cloud:"+Cloud);
        console.log("Precipitation:"+Precipitation);
        console.log("Pressure:"+Pressure);
        weatherJSON.HighestTemperature = HighestTemperature;
        weatherJSON.LowestTemperature = LowestTemperature;
        weatherJSON.Humidity = Humidity;
        weatherJSON.Precipitation = Precipitation;
        weatherJSON.Cloud = Cloud;
        weatherJSON.DailyTemperatureDifference = DailyTemperatureDifference;
        weatherJSON.Pressure = Pressure;
        //console.log(info.weather.hourly[0]);
    }
}

function fetch_callback_dust(error, response, body) {
    if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        var weatherInfo = info.weather.dust[0];
        //console.log(info);
        console.log(weatherInfo.station.name);
        var Finedust = weatherInfo.pm10.value;
        weatherJSON.Finedust = Finedust;
        console.log("Finedust:"+Finedust);
        //console.log(info.weather.hourly[0]);
    }
}

app.get('/purchase', function(req,res){
	res.render('purchase.html');
});

app.get('/introduce', function(req, res){
	res.render('introduce.html');
});

app.get('/getAPI', function(req,res){
    
    var lat = req.query.lat;
    var lon = req.query.lon;
    
    setURL_fetch_options(lat,lon);
    setURL_fetch_options_dust(lat,lon);

  //get_request(fetch_options,fetch_callback);
  //get_request(fetch_options_dust,fetch_callback_dust);

    get_request(fetch_options,  function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            var weatherInfo = info.weather.minutely[0];
            console.log(info);
            console.log(weatherInfo.station.name);
            var HighestTemperature = weatherInfo.temperature.tmax;
            var LowestTemperature = weatherInfo.temperature.tmin;
            var Humidity = weatherInfo.humidity;
            var Precipitation = weatherInfo.precipitation.sinceOntime;
            var Cloud = weatherInfo.sky.code;
            var DailyTemperatureDifference = HighestTemperature - LowestTemperature;
            var Pressure = weatherInfo.pressure.surface;

            console.log("HighestTemperature:" + HighestTemperature);
            console.log("LowestTemperature:" + LowestTemperature);
            console.log("DailyTemperatureDifference:"+ DailyTemperatureDifference);
            console.log("Humidity:"+Humidity);
            console.log("Cloud:"+Cloud);
            console.log("Precipitation:"+Precipitation);
            console.log("Pressure:"+Pressure);

            weatherJSON.HighestTemperature = HighestTemperature;
            weatherJSON.LowestTemperature = LowestTemperature;
            weatherJSON.Humidity = Humidity;
            weatherJSON.Precipitation = Precipitation;
            weatherJSON.Cloud = Cloud;
            weatherJSON.DailyTemperatureDifference = DailyTemperatureDifference;
            weatherJSON.Pressure = Pressure;

            get_request(fetch_options_dust, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body);
                    var weatherInfo = info.weather.dust[0];
                    console.log(weatherInfo.station.name);
                    var Finedust = weatherInfo.pm10.value;
                    weatherJSON.Finedust = Finedust;
                    console.log("Finedust:"+Finedust);
                    res.send(weatherJSON);
                }  
            });
        }
    });
});

/////////////////////////////////////////get_request(fetch_options,fetch_callback); 로 실행
app.get('/mymodel', function(req,res){
    
    console.log("Loading......");
    var LowestTemperature=req.query.WT1;
    var HighestTemperature=req.query.WT2; 
    var DailyTemperatureDifference=req.query.WT3;
    var Humidity=req.query.WT4;
    var Pressure=req.query.WT5;
    var Finedust=req.query.WT6;
    var Precipitation=req.query.WT7;
    var Cloud=req.query.WT8;
    var mLevel = req.query.Level;

    console.log("LowestTemperature:"+LowestTemperature);
    console.log("HighestTemperature:"+HighestTemperature);
    console.log("Precipitation:"+Precipitation);
    console.log("Humidity:"+Humidity);
    console.log("Finedust:"+Finedust);
    console.log("DailyTemperatureDifference:"+DailyTemperatureDifference);
    console.log("Cloud:"+Cloud);
    console.log("Pressure:"+Pressure);
    console.log("Level: " + mLevel);

    var cmd = 'Rscript ./FinalModel.R '+LowestTemperature.toString()+" "+HighestTemperature.toString()+" "+Precipitation.toString()+" "+Humidity.toString()+
              " "+Finedust.toString()+" "+DailyTemperatureDifference.toString()+" "+Cloud.toString()+" "+Pressure.toString() +" "+mLevel.toString();
    
    child_process.exec(cmd, function(error, stdout, sterr){
      if(error!=null){
        console.log(error);
        res.send('Error occured');
        console.log("error occured");
      }
      else{
        RiskJSON.Risk = stdout;
        res.send(RiskJSON);
        console.log("Label:" + stdout);
      }  
    });
});

app.get('/getWeather', function(req,res){

    var lat = req.query.lat;
    var lon = req.query.lon;
    
    setURL_fetch_options(lat,lon);
    setURL_fetch_options_dust(lat,lon);

  //get_request(fetch_options,fetch_callback);
  //get_request(fetch_options_dust,fetch_callback_dust);

    get_request(fetch_options,  function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            var weatherInfo = info.weather.minutely[0];

            var HighestTemperature = weatherInfo.temperature.tmax;
            var LowestTemperature = weatherInfo.temperature.tmin;
            var Cloud = weatherInfo.sky.code;
            var DailyTemperatureDifference = HighestTemperature - LowestTemperature;

           weatherLAZJSON.LT = LowestTemperature;
           weatherLAZJSON.HT = HighestTemperature;
           weatherLAZJSON.DT = DailyTemperatureDifference;
           weatherLAZJSON.C = Cloud;

            get_request(fetch_options_dust, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body);
                    var weatherInfo = info.weather.dust[0];
                    var Finedust = weatherInfo.pm10.value;
                    weatherLAZJSON.FD = Finedust;
                    res.send(weatherLAZJSON);
                    }  
            });
        }
    });
});

var mCode = {code : "00000"}
var home = { hTemperature : null, hHumidity : null, hFinedust : null };

app.get('/state/:code', function(req,res){
    mCode.code=req.params.code;
    console.log("Received Code:" + mCode.code);
    res.end();
});

app.get('/state', function(req,res){
    console.log("Send Code: "+mCode.code);
    res.send(mCode);
});

app.get('/home', function(req,res){
  console.log("Send Home: " + home.hTemperature + " , " + home.hHumidity + " , " + home.hFinedust);
  res.send(home);
});

app.get('/savehome', function(req,res){
  home.hTemperature = req.query.hTemperature;
  home.hHumidity = req.query.hHumidity;
  home.hFinedust = req.query.hFinedust;
  console.log("Received Home: " + home.hTemperature + " , " + home.hHumidity + " , " + home.hFinedust);
  res.end();
});