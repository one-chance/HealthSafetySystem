Purpose: Predict risk of getting cold by weather factors such as temperatures, humidities etc into two category: Safe, Danger

Download the file uploaded on the E-class. File name: Ddukbaegi Squad

Install node js (https://nodejs.org/en/)
Install npm
In chrome, download and appy: Chrome webstore ? allow-control-allow-origin
After installing it,  open chrome and on "allow-control-allow-origin" , apply url "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastSpaceData" in Intercepted URLs or URL patterns

Execute
To execute in your own local
--->
1. Change some source code of model.js file which is located in your ddukbaegi folder
--> open model.js by using your own tool to open javascript file.
Change 
var cmd = 'Rscript C:/Users/js960/Desktop/startbootstrap-portfolio-item-gh-pages/FinalModel.R '+LowestTemperature.toString()+" "+HighestTemperature.toString()+" "+Precipitation.toString()+" "+Humidity.toString()+" "+Finedust.toString()+" "+DailyTemperatureDifference.toString()+" "+Cloud.toString()+" "+Pressure.toString();
-->var cmd ='Rscript "Ddukbaegi folder location"/FinalModel.R "+LowestTemperature.toString()+" "+HighestTemperature.toString()+" "+Precipitation.toString()+" "+Humidity.toString()+" "+Finedust.toString()+" "+DailyTemperatureDifference.toString()+" "+Cloud.toString()+" "+Pressure.toString();
Save the changes.
2.Open cmd-->enter"ipconfig"
3. Get your ip address first. ipv4: ==> ip
4.Open cmd and enter folder where you downloaded the project, then enter "node index.html"
It will open the local server on your computer
. Open chrome, go to url yourip:3000/index.html

Test
Click the circle button on the map you want to get weather.
If you want to know the risk of getting cold, click "검색" on the top right of the page
After about 15seconds(depends on computer performance),it will show you the risk.
"예상 위험도" image will be changed depending on the weather factor.

