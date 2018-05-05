
library(RWeka)
library(e1071)
library(caret)
args<-commandArgs(TRUE)
LowestTemperature<-as.integer(args[1])
HighestTemperature<-as.integer(args[2])
Precipitation<-as.integer(args[3])
Humidity<-as.integer(args[4])
Finedust<-as.integer(args[5])
DailyTemperatureDifference<-as.integer(args[6])
Cloud<-as.integer(args[7])
Pressure.1.0<-as.integer(args[8])
Level <- as.integer(args[9])

testData<-data.frame(LowestTemperature,HighestTemperature,Precipitation,Humidity,Finedust,DailyTemperatureDifference,Cloud,Pressure.1.0)


if(Level==1)
{
nbModel<-readRDS("./final_model937.rds")

}else
{
nbModel<-readRDS("./final_model5050.rds")
}
predictValue<-predict(nbModel, testData)
cat(predictValue)
