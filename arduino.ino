#include <Wire.h>
#include <LiquidCrystal_I2C.h> // 텍스트 LCD & IIC I2C 모듈을 사용하기 위한 헤더파일
//#define IWS_HEAT 0             //pin 2
//#define IWS_HUMI 1             //pin 3
//#define IWS_AIR 4              //pin 19
//#define IWS_ALL 5              //pin 18
#define UMP1 14 //bit 1
#define UMP2 15 //bit 2
#define UMP3 16 //bit 3
#define UMP4 17 //bit 4
#define UMP5 18 //bit 5

LiquidCrystal_I2C lcd(0x27, 16, 2); // 가로 16, 세로 2 LCD에 대한 0x3F LCD 주소를 설정
char HUMI_Sensor = A0;
int Sensor_val;
unsigned long pulse = 0;
float ugm3 = 0;
byte dht11_dat[5];
byte dht11_in; // 센서 변수
byte i;
String sending = "";     //온습도먼지 값을 보내려는 스트링
String iot_stat = ""; //기기가 꺼진지 켜진지 보는 스트링
char outstr[6];

const byte Relaypin1 = 5; //heater1, 2
const byte Relaypin2 = 6; //cooler
const byte Relaypin3 = 7; //air clean
const byte Relaypin4 = 8; //humi
const byte Dustpin = 9;

byte read_dht11_dat() // 온도 습도 센서 값 읽어오는 함수
{
    byte i = 0;             // for문 변수
    byte result = 0;        // 리턴 변수
    for (i = 0; i < 8; i++) // for문 9번 반복
    {
        while (!digitalRead(HUMI_Sensor))
            ;                              // 센서 값이 1이 될 때까지 무한루프
        delayMicroseconds(30);             // 30마이크로세크 대기
        if (digitalRead(HUMI_Sensor) != 0) // 만약 센서 값이 0과 같지 않으면
            bitSet(result, 7 - i);         // bitSet(n,x) n이라는 변수에 x번째의 비트를 on한다.
        while (digitalRead(HUMI_Sensor))
            ; // 센서 값이 0이 될 때까지 무한루프
    }
    return result; // result의 값을 리턴 한다.
}

void setup() // 초기화
{
    lcd_set();
    pinMode(HUMI_Sensor, OUTPUT);    // 센서 핀(Pin)을 출력으로 설정한다.
    digitalWrite(HUMI_Sensor, HIGH); // 센서에 출력을 넣는다
    pinMode(Relaypin1, OUTPUT);      //////////////////
    pinMode(Relaypin2, OUTPUT);
    pinMode(Relaypin3, OUTPUT);
    pinMode(Relaypin4, OUTPUT);
    pinMode(Dustpin, INPUT);

    pinMode(UMP1, INPUT_PULLUP);
    pinMode(UMP2, INPUT_PULLUP);
    pinMode(UMP3, INPUT_PULLUP);
    pinMode(UMP4, INPUT_PULLUP);
    pinMode(UMP5, INPUT_PULLUP);

    Serial.begin(115200);
    /*
    pinMode(2, INPUT_PULLUP);
    pinMode(3, INPUT_PULLUP);
    pinMode(18, INPUT_PULLUP);
    pinMode(19, INPUT_PULLUP);
    attachInterrupt(IWS_HEAT, inter_heater, HIGH);
    attachInterrupt(IWS_HUMI, inter_humier, HIGH);
    attachInterrupt(IWS_AIR, inter_airclean, HIGH);
    attachInterrupt(IWS_ALL, inter_all, HIGH); */
}

void loop() // 무한루프
{
    digitalWrite(HUMI_Sensor, LOW);  // 센서 핀(Pin)을 off한다
    delay(18);                       // 18ms만큼 지연
    digitalWrite(HUMI_Sensor, HIGH); // 센서 핀(Pin)을 on한다
    delayMicroseconds(5);            // 5us만큼 지연
    pinMode(HUMI_Sensor, INPUT);     // 센서 핀(Pin)을 입력으로 설정한다
    delayMicroseconds(200);          // 200us만큼 지연
    for (i = 0; i < 5; i++)
    {
        dht11_dat[i] = read_dht11_dat(); // 40bit의 데이터를 수신. 자세한 사항은 DHT11의 데이터시트를 참고
    }
    pinMode(HUMI_Sensor, OUTPUT);                       // 센서 핀(Pin)을 출력으로 설정한다
    digitalWrite(HUMI_Sensor, HIGH);                    // 센서에 출력을 넣는다
    byte dht11_check_sum = dht11_dat[0] + dht11_dat[2]; // check check_sum
    pulse = pulseIn(Dustpin, LOW, 20000);
    ugm3 = pulse2ugm3(pulse);
    lcd.setCursor(5, 0);
    lcd.print(ugm3);
    lcd.setCursor(11, 0);
    lcd.print("ug/m3"); //dust sensor lcd print

    lcd.setCursor(5, 1);          // 쓰기 좌표 1번줄에 4번칸
    lcd.print(dht11_dat[0], DEC); // LCD에 습도 값 출력
    lcd.print('%');               // LCD에 % 출력
    lcd.setCursor(13, 1);         // 쓰기 좌표 1번줄에 4번칸
    lcd.print(dht11_dat[2], DEC); // LCD에 온도 값 출력
    lcd.print('C');               // LCD에 C 출력
    //delay(2000);                  // 2초간 지연
    delay(1000);
    /*
    if (digitalRead(UMP1) == LOW && digitalRead(UMP2) == LOW && digitalRead(UMP3) == LOW)
    {
        device_control(dht11_dat[2], dht11_dat[0], ugm3); //normal status
    }
    if (digitalRead(UMP1) == LOW && digitalRead(UMP2) == LOW && digitalRead(UMP3) == HIGH)
    {
        device_control(0, dht11_dat[0], ugm3); //heater only
    }
    if (digitalRead(UMP1) == LOW && digitalRead(UMP2) == HIGH && digitalRead(UMP3) == LOW)
    {
        device_control(dht11_dat[2], dht11_dat[0], 123.45); //air only
    }
    if (digitalRead(UMP1) == LOW && digitalRead(UMP2) == HIGH && digitalRead(UMP3) == HIGH)
    {
        device_control(dht11_dat[2], 0, ugm3); //humi only
    }
    if (digitalRead(UMP1) == HIGH && digitalRead(UMP2) == LOW && digitalRead(UMP3) == LOW)
    {
        device_control(0, 0, 123.45); //all on
    }
    */
    zzisu_dduckbaegi();
    if (digitalRead(UMP1) == HIGH)
    {
        device_control(dht11_dat[2], dht11_dat[0], ugm3); //auto mode!
        iot_stat.concat("1aaaa");
    }
    else
    {
        iot_stat.concat("0");
        if (digitalRead(UMP2) == HIGH)
        {
            in_heat_on();
            iot_stat.concat("1");
        }
        else
        {
            in_heat_off();
            iot_stat.concat("0");
        }

        if (digitalRead(UMP3) == HIGH)
        {
            in_humi_on();
            iot_stat.concat("1");
        }
        else
        {
            in_humi_off();
            iot_stat.concat("0");
        }

        if (digitalRead(UMP4) == HIGH)
        {
            in_air_on();
            iot_stat.concat("1");
        }
        else
        {
            in_air_off();
            iot_stat.concat("0");
        }

        if (digitalRead(UMP5) == HIGH)
        {
            in_cool_on();
            iot_stat.concat("1");
        }
        else
        {
            in_cool_off();
            iot_stat.concat("0");
        }
    }
    // SERIAL connection
    sending.concat(String((int)dht11_dat[2])); //temp
    sending.concat("?");
    sending.concat(String((int)dht11_dat[0])); //humi
    sending.concat("?");
    //sending.concat(String(ugm3)); //dust
    dtostrf(ugm3, 6, 2, outstr);
    sending.concat(outstr);
    sending.concat("?");
    sending.concat(iot_stat);
    sending.concat("!");
    Serial.println(sending);

    delay(1000);
}

void lcd_set()
{
    lcd.init();                 // LCD 출력준비
    lcd.backlight();            // LCD 백라이트 ON
    lcd.setCursor(0, 0);        // 쓰기 좌표 1번줄에 4번칸
    lcd.print("DUST:");         // LCD에 LM35DZ 출력
    lcd.setCursor(0, 1);        // 쓰기 좌표 2번줄에 0번칸
    lcd.print("HUMI:   TEMP:"); // LCD에 TEMP: 출력
}

void zzisu_dduckbaegi()
{
    sending = "";
    //outstr = "";
    iot_stat = "";
}

void device_control(byte temp, byte humi, float ddd)
{
    if (temp < 22)
    {
        in_heat_on();
    }
    else if (temp > 28)
    {
        in_cool_on();
    }
    else
    {
        in_heat_off();
        in_cool_off();
    }

    if (humi < 45)
    {
        in_humi_on();
    }
    else
    {
        in_humi_off();
    }

    if (ddd > 50)
    {
        in_air_on();
    }
    else
    {
        in_air_off();
    }
}

void RelayOn(int port)
{
    digitalWrite(port, HIGH);
}

void RelayOff(int port)
{
    digitalWrite(port, LOW);
}

void in_heat_on()
{
    RelayOn(Relaypin1);
    RelayOn(Relaypin2);
}
void in_heat_off()
{
    RelayOff(Relaypin1);
    RelayOff(Relaypin2);
}

void in_humi_on()
{
    RelayOn(Relaypin4);
    //RelayOn(Relaypin2);
}
void in_humi_off()
{
    RelayOff(Relaypin4);
    //RelayOn(Relaypin2);
}

void in_air_on()
{
    RelayOff(Relaypin3);
} //This is hentai relay..
void in_air_off()
{
    RelayOn(Relaypin3);
}

void in_cool_on()
{
    RelayOn(Relaypin2);
}
void in_cool_off()
{
    RelayOff(Relaypin2);
}

float pulse2ugm3(unsigned long pulse)
{
    float value = (pulse - 1400) / 14.0;
    if (value > 300)
    {
        value = 0;
    }
    return value;
}
