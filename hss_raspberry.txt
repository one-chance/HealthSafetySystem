/*
 Jipgyoudong~
 made by Ddukbaegi Squad
 
 */
 
// just that the Arduino IDE doesnt compile these files.
#ifdef RaspberryPi 
 
//include system librarys
#include <stdio.h> //for printf
#include <stdint.h> //uint8_t definitions
#include <stdlib.h> //for exit(int);
#include <string.h> //for errno
#include <errno.h> //error output

//added for text file
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h> 

//wiring Pi
#include <wiringPi.h>
#include <wiringSerial.h>
//for curl
#include <curl/curl.h>

// Find Serial device on Raspberry with ~ls /dev/tty*
// ARDUINO_UNO "/dev/ttyACM0"
// FTDI_PROGRAMMER "/dev/ttyUSB0"
// HARDWARE_UART "/dev/ttyAMA0"
char device1[]= "/dev/ttyACM0"; // weather sensor aduino
char device2[]= "/dev/ttyACM1"; // home aduino
// filedescriptor
int fd1; // weather sensor aduino
int fd2; // home aduino
unsigned long baud1 = 9600; //weather sensor aduino
unsigned long baud2 = 115200; //home aduino
unsigned long mtime1 = 0; //weather sensor aduino
unsigned long mtime2 = 0; //home aduino
//for count index
int count1;
int count2;
//check last char is 'a'
int check;
//prototypes
int main(void);
int loop(char arr[]);
int loop2(char arr[]);
void setup(void);
void riskcurl(int high, int low, int sub, int dust, int cloud, int hum, int rain, int press);
int extractInt(char *s, int numbers[]);
void weathercurl(int *high, int *low, int *sub, int *dust,int *cloud);
void savehomecurl(char homecode[]);
void savehomecurl2(int hometem, int homehum, int homedust, int homedusts);
char* callhomecurl(void);
void deviceControl(char *arr);
 
void setup(){
 
  printf("%s \n", "Raspberry Startup!");
  fflush(stdout);
 
  //get filedescriptor1
  if ((fd1 = serialOpen (device1, baud1)) < 0){
    fprintf (stderr, "Unable to open serial device1: %s\n", strerror (errno)) ;
    exit(1); //error
  }
 
   //get filedescriptor2
  if ((fd2 = serialOpen (device2, baud2)) < 0){
    fprintf (stderr, "Unable to open serial device1: %s\n", strerror (errno)) ;
    exit(1); //error
  }
 
  //setup GPIO in wiringPi mode
  if (wiringPiSetup () == -1){
    fprintf (stdout, "Unable to start wiringPi: %s\n", strerror (errno)) ;
    exit(1); //error
  }
 
}
 ///////////////////////////////// aduino1
int loop(char arr[]){
  char temp;
  // Pong every 3 seconds
  if(millis()-mtime1>=3000){
    serialPuts (fd1, "Pong!\n");
    // you can also write data from 0-255
    // 65 is in ASCII 'A'
    serialPutchar (fd1, 65);
    mtime1=millis();
  }
 
  // read signal
  if(serialDataAvail (fd1)){
//  file open for save
//	freopen("/home/pi/Downloads/text.txt", "a+",stdout);

	temp = serialGetchar(fd1);
	arr[count1] = temp;
	printf("%c",arr[count1]);
	count1++;
//  check last char is 'a'
	if(temp=='a'){
//		check=1;
		count1=0;
		return 1;
		}
	
	fflush(stdout);
//	fclose(stdout);
  }
 return 0;
}
 ///////////////////////////////// aduino2
int loop2(char arr[]){
  char temp;
  // Pong every 3 seconds
  if(millis()-mtime2>=3000){
    serialPuts (fd2, "Pong!\n");
    // you can also write data from 0-255
    // 65 is in ASCII 'A'
    serialPutchar (fd2, 65);
    mtime2=millis();
  }
 
  // read signal
  if(serialDataAvail (fd2)){
//  file open for save
//	freopen("/home/pi/Downloads/text.txt", "a+",stdout);
	temp = serialGetchar(fd2);
	arr[count2] = temp;
	printf("%c",arr[count2]);
	count2++;
//	printf("count : %d\n",count2);
 // check last char is '!'
	if(temp=='!'){
	printf("check2   leng : %d\n",strlen(arr));
		check=1;
		count2=0;
		return 1;
		}
	
	fflush(stdout);
//	fclose(stdout);
  }
 return 0;
}
 
int extractInt(char *s, int numbers[]){
	char *endp;
	int c=0;
	while(*s){
		if(isdigit(*s)){
			numbers[c++] = strtol(s, &endp, 10);
			while(isdigit(*s))
				s++;
		}
		else s++;
	}
	return c;
}

void savehomecurl(char homecode[]){
printf("\ncurlcurlcurlcurlcurlcurl\n");
  CURL *curl;
  CURLcode res;
printf("curl homecode : %s\n",homecode);
  char urladdress[] = "http://halarm.tk/state/";
  strcat(urladdress,homecode);
printf("sum %s\n",urladdress);
  curl = curl_easy_init();
  if(curl) {

    curl_easy_setopt(curl, CURLOPT_URL, urladdress);
    /* example.com is redirected, so we tell libcurl to follow redirection */ 
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    /* Perform the request, res will get the return code */ 
    res = curl_easy_perform(curl);
    /* Check for errors */

    if(res != CURLE_OK)
      fprintf(stderr, "curl_easy_perform() failed: %s\n",
              curl_easy_strerror(res));
			   
    curl_easy_cleanup(curl);
  }

}

void savehomecurl2(int hometem, int homehum, int homedust, int homedusts){
  CURL *curl;
  CURLcode res;
  char *tem;
  char *hum;
  char *dust;
  char *dusts;
  char buf[100];
  sprintf(buf,"?hTemperature=%d&hHumidity=%d&hFinedust=%d.%d",hometem,homehum,homedust,homedusts);
  
  char urladdress[] = "http://halarm.tk/savehome";
  strcat(urladdress,buf);
  printf("url : %s\n",urladdress);
  curl = curl_easy_init();
  if(curl) {

    curl_easy_setopt(curl, CURLOPT_URL, urladdress);
    /* example.com is redirected, so we tell libcurl to follow redirection */ 
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    /* Perform the request, res will get the return code */ 
    res = curl_easy_perform(curl);
    /* Check for errors */
	
    if(res != CURLE_OK)
      fprintf(stderr, "curl_easy_perform() failed: %s\n",
              curl_easy_strerror(res));
			   
    curl_easy_cleanup(curl);
  }

}

char* callhomecurl(void){
  CURL *curl;
  CURLcode res;

  char filename[]="test5.txt";
  int fd;
  int readn;
  char buf[80];
  char *str;
  
  int i,count,numbers[128];

  //
  // first file open
  FILE *file;
  file = fopen("test5.txt","w");

  curl = curl_easy_init();
  if(curl) {
    curl_easy_setopt(curl, CURLOPT_URL, "http://halarm.tk/state");
    /* example.com is redirected, so we tell libcurl to follow redirection */ 
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    /* Perform the request, res will get the return code */ 
	curl_easy_setopt(curl, CURLOPT_WRITEDATA,file);
    res = curl_easy_perform(curl);
    /* Check for errors */


    if(res != CURLE_OK)
      fprintf(stderr, "curl_easy_perform() failed: %s\n",
              curl_easy_strerror(res));
			   
    curl_easy_cleanup(curl);
  }
  
  fclose(file);
 // second file open
    fd = open(filename, O_RDONLY);
    // 에러 체크를 한다.
    if (fd < 0)
    {
        perror("file open err :");
    }

      while((readn = read(fd, buf, 80)) > 0)
    {
        // saved risk 1 at buf[9]     
    }
    close(fd);
// {"code":"xxxxx"} extract
	str = strtok(buf,"\"");	
	str = strtok(NULL,"\"");
	str = strtok(NULL,"\"");
	str = strtok(NULL,"\"");

	return str;
}




void weathercurl(int *high, int *low, int *sub, int *dust,int *cloud){
  CURL *curl;
  CURLcode res;
  
  char filename[]="test.txt";
  int fd1;
  int readn;
  char buf[80];
  
  //
  int i,count,numbers[128];
  
  //
  // first file open
  FILE *file;
  file = fopen("test.txt","w");

  curl = curl_easy_init();
  if(curl) {
    curl_easy_setopt(curl, CURLOPT_URL, "http://halarm.tk/getWeather?lat=37.41&lon=127.51");
    /* example.com is redirected, so we tell libcurl to follow redirection */ 
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
	/* Perform the request, res will get the return code */ 
	curl_easy_setopt(curl, CURLOPT_WRITEDATA,file);

	res = curl_easy_perform(curl);
    /* Check for errors */

    if(res != CURLE_OK)
      fprintf(stderr, "curl_easy_perform() failed: %s\n",
              curl_easy_strerror(res));
			   
    curl_easy_cleanup(curl);
  }
  fclose(file);
 // second file open
    fd1 = open(filename, O_RDONLY);
    // 에러 체크를 한다.
    if (fd1 < 0)
    {
        perror("file open err :");
    }

      while((readn = read(fd1, buf, 80)) > 0)
    {
        // saved risk 1 at buf[9]     
    }
//	printf("%s\n",buf);
    close(fd1);
  
  count = extractInt(buf,numbers);
  //printf("count : %d\n",count);
  /* check for right
  for(i=0; i<count;i++){
  	printf("%d i : %d\n",numbers[i],i);
  }
	*/
//	0 2 4 5 7

	*high = numbers[0];
	*low = numbers[2]-(numbers[2]+numbers[2]);
	*sub = numbers[4];
	*dust = numbers[5];
	*cloud = numbers[7];
	
} 

void riskcurl(int high, int low, int sub, int dust, int cloud, int hum, int rain, int press){
	
  CURL *curl;
  CURLcode res;
  
  char filename[]="test2.txt";
  int fd1;
  int readn;
  char buf[80];
  
  int WF1 = low;
  int WF2 = high;
  int WF3 = sub;
  int WF4 = hum;
  int WF5 = press;
  int WF6 = dust;
  int WF7 = rain;
  int WF8 = cloud;
  
  //input weather attribute
   if(WF1<5){WF1=0;}
            else if(WF1>-5 && WF1<5){WF1=1;}
            else if(WF1>=5 && WF1<15){WF1=2;}
            else if(WF1>=15 && WF1<20){WF1=3;}
            else if(WF1>=20 && WF1<25){WF1=4;}
            else if(WF1>=25){WF1=5;}
       
            if(WF2<5){WF2=0;}
            else if(WF2>=5 && WF2<15){WF2=1;}
            else if(WF2>=15 && WF2<25){WF2=2;}
            else if(WF2>=25 && WF2<35){WF2=3;}
            else if(WF2>=35){WF2=4;}

            if(WF3<10){WF3=0;}
            else if(WF3>=10 && WF3<20){WF3=1;}
            else if(WF3>=20){WF3=2;}

            if(WF4<40){WF4=0;}
            else if(WF4>=40 && WF4<60){WF4=1;}
            else if(WF4>=60 && WF4<80){WF4=2;}
            else if(WF4>=80){WF4=3;}

            /*
            if(WF5<){}
              else{}
           */

			WF5 = 0;

            //WF6 미세먼지 기준
            if(WF6<40){WF6=0;}
            else if(WF6<80){WF6=1;}
            else if(WF6<120){WF6=2;}
            else{WF6=3;}
            
            if(WF7>=0 && WF7<20){WF7=0;}
            else if(WF7>=20 && WF7<40){WF7=1;}
            else if(WF7>=40 && WF7<60){WF7=2;}
            else if(WF7>=80){WF7=3;}

       if(WF8 == 1){WF8=0;}
       else if(WF8 == 2){WF8=1;}
       else if(WF8== 3 || WF8== 4 || WF8== 5 || WF8== 6 ){WF8=2;}
       else{WF8=3;}
  
  
  
  
  
  // first file open
  FILE *file;
  file = fopen("test2.txt","w");

  curl = curl_easy_init();
  if(curl) {
    curl_easy_setopt(curl, CURLOPT_URL, "http://halarm.tk/mymodel?WT1=0&WT2=1&WT3=1&WT4=3&WT5=1&WT6=0&WT7=0&WT8=2&Level=1");
    /* example.com is redirected, so we tell libcurl to follow redirection */ 
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    /* Perform the request, res will get the return code */ 
	curl_easy_setopt(curl, CURLOPT_WRITEDATA,file);
    res = curl_easy_perform(curl);
    /* Check for errors */

	
    if(res != CURLE_OK)
      fprintf(stderr, "curl_easy_perform() failed: %s\n",
              curl_easy_strerror(res));
			   
    curl_easy_cleanup(curl);
  }
  fclose(file);
 // second file open
    fd1 = open(filename, O_RDONLY);
    // 에러 체크를 한다.
    if (fd1 < 0)
    {
        perror("file open err :");
        
    }

      while((readn = read(fd1, buf, 80)) > 0)
    {
        // saved risk 1 at buf[9]     
    }
	printf("Risk is %c  \n",buf[9]);
    close(fd1);
  
  
}
 
void deviceControl(char *arr){
printf("\n/////////////////////////////////////////\n");
	//wiringPiSetupGpio();
		
	printf("arr : %s\n",arr);
	if(wiringPiSetupGpio() == -1)
		return;
	/*
	digitalWrite(17,0);
	digitalWrite(27,0);
	digitalWrite(22,0);
	digitalWrite(24,0);
	digitalWrite(25,0);
	*/
	// check for server machine code is AUTO
	if(arr[0]=='1'){
		digitalWrite(17,1);  // turn on AUTO
		// another is anything input -> because
		digitalWrite(27,0);
		digitalWrite(22,0);
		digitalWrite(24,0);
		digitalWrite(25,0);
	}
	// code is not AUTO, then set home device
	else{
	printf("arr come on\n");
		digitalWrite(17,0);
		if(arr[1]=='1'){
			digitalWrite(27,1);
			}else{
			printf("arr come 0000000\n");
			digitalWrite(27,0);
			}
		if(arr[2]=='1'){
			digitalWrite(22,1);
			}else{
			digitalWrite(22,0);
			}
		if(arr[3]=='1'){
			digitalWrite(24,1);
			}else{
			digitalWrite(24,0);
			}
		if(arr[4]=='1'){
			digitalWrite(25,1);
			}else{
			digitalWrite(25,0);
			}
	}
	
}

 
// main function for normal c++ programs on Raspberry
int main(){
//	wiringPiSetup();
	// device order is 17 27 22 24 25

	pinMode(17,OUTPUT);
	pinMode(27,OUTPUT);
	pinMode(22,OUTPUT);
	pinMode(24,OUTPUT);
	pinMode(25,OUTPUT);
	
  char temparr[30]={0,};
  char temparr2[30]={0,};
  int strlenarr2;

  int i,count;
  int numbers[128];

  char *str;
  char *ptr;
  char *ptr2;
  int temp=0; // check for weather sensor send me, it is 'a', it is right
  int temp2;
  
  int tem; //temperature, infact this attribute is not use
  
  int high; // Highest temperature
  int low; // Lowest temperature
  int sub; // Highest - Lowest
  int dust; // finedust
  int cloud; // amount of cloud
  ////////////////////////////////////
  int hum; // humidity
  int rain; // rain
  int press; // bar pressure
  
  int hometem; // home temperature
  int homehum; // home humidity
  int homedust; // home findust
  int homedusts; // home findust sosutjum
  
  char *homecode;  
  char *servercode;
  char servercode2[10]={0,};
  char *servercode3;
  setup();
  
  while(1){ 
  temp = loop(temparr);

	  if(temp==1){
	    //get weather attribute by server halarm.tk // Suwon
		
	    weathercurl(&high, &low, &sub, &dust, &cloud);

		
	    printf("\nhighest temperature : %d\n", high);
		printf("lowest temperature : %d\n", low);
		printf("difference temperature : %d\n", sub);
		printf("dust : %d\n", dust);
		printf("cloud : %d\n", cloud);
		
 	 	ptr = strtok(temparr," ");
		tem = atoi(ptr); 	
		//printf("temperature : %d",tem); // now i don't want temperature
		
		ptr = strtok(NULL," ");
		hum = atoi(ptr);
		printf("humidity : %d\n",hum);
		
		ptr = strtok(NULL," ");
		rain = atoi(ptr);
		printf("rain : %d\n",rain);

		ptr = strtok(NULL,"a");
		press = atoi(ptr);
		printf("barpress : %d\n",press);	
				
		servercode=callhomecurl(); // go go go go go go go go	
		
		
		strcpy(servercode2,servercode);	
//		printf("\nhomecode : %s   servercode : %s\n",str,servercode);			
		printf("servercode[0] == %c servercode : %s \n",servercode[0],servercode);
		
		if(servercode[0]=='1'){
			riskcurl(high, low, sub, dust, cloud, hum, rain, press);    // go go go go go go go go go go
		}
		
		
		
		deviceControl(servercode2);  // go go go go go go go go
//		delay(2000);
		// HOME
		while(1){
		// this is while for loop2 ( home state call && save) 
		// i put strlenarr2 == 19 first but, second~ strlenarr2 == 21
		// so i put 21 -> 19
		temp2 = loop2(temparr2);
		strlenarr2=strlen(temparr2);

//		if(strlenarr2==21 || strlenarr2==23)
		if(strlenarr2>19)
			strlenarr2=19;
		// check for right
		if(temp2==1 && strlenarr2==19){
		printf("\ntemp2==1 19 \n");
		printf("temp arr : %s\n",temparr2);
		count = extractInt(temparr2,numbers);
		
		 for(i=0; i<count;i++){
  			printf("%d i : %d\n",numbers[i],i);
  		}

// input home state
		hometem = numbers[0];
		homehum = numbers[1];
		homedust = numbers[2];
		homedusts = numbers[3];
//extract for machine code at home
//str is home device code
		str = strtok(temparr2,"?");
		str = strtok(NULL,"?");
		str = strtok(NULL,"?");
		str = strtok(NULL,"!");

		// homecode == str   I don't use
		printf("\nservercode2 : %s str : %s\n",servercode2,str);
		savehomecurl2(hometem,homehum,homedust,homedusts);
	
		servercode3=callhomecurl();
		if(servercode3[0]=='1'){
		printf("\nsavehomecurl() str : %s\n",str);
		
			savehomecurl(str);   // go go go go go go go go go
		}
		printf("homecode : %s\n",str);
		temp2=0;
		memset(temparr2,0,30);
		printf("\nbreak\n");
		break;
		}
		temp2=0;  //for above check temp2 == 1, i change 1 -> 0
		}
//		printf("servercode : %s\n", servercode);
		
//		check=0;
  		memset(temparr,0,30);
		memset(temparr2,0,30);
		
		
		temp=0;
	//	break;
  	  }
	  memset(servercode2,0,10);
  }
  return 0;
}
 
#endif //#ifdef RaspberryPi
