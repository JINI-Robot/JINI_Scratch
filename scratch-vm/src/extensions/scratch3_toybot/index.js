// Boiler plate from the Scratch Team
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');
const uid = require('../../util/uid');
const SR = require('../../io/serial');
const Base64Util = require('../../util/base64-util');
const MathUtil = require('../../util/math-util');
const RateLimiter = require('../../util/rateLimiter.js');

// The following are constants used within the extension
// Protocol
const ProtocolType = 0x03;    // toybot product number
const ProtocolVerison = 0x22; // protocal 2.2
// Content Index
const DeviceName = 0x03;
const ServoControlEach = 0x13;
const ServoControlCalibration = 0x1E;
const AnalogValue = 0x43;
const ButtonControl = 0x53;
const UltrasonicDistance = 0x73;
// Content value
const DeviceReturn_Repeat = 0x02;
const DeviceMode_Control = 0x03;
const RequestReadDatas = [
    {index: ServoControlEach,        repeat: DeviceReturn_Repeat},
    {index: ServoControlCalibration, repeat: DeviceReturn_Repeat},
    {index: AnalogValue,             repeat: DeviceReturn_Repeat},
    {index: ButtonControl,           repeat: DeviceReturn_Repeat},
    {index: UltrasonicDistance,      repeat: DeviceReturn_Repeat}
];
const requestReadName = [
    {index: DeviceName, repeat: DeviceReturn_Repeat}
]

/**
 * units: mm
 */
const DefaultDelayTime = 10;
/**
 * uints: mm
 */
const PacketSendInterval = 40;
/**
 * uints: mm
 */
const LostTime = 1000;

/**
 * A maximum number of BT message sends per second, to be enforced by the rate limiter.
 * @type {number}
 */
const BTSendRateMax = 10;
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI1MHB4IiBoZWlnaHQ9IjQycHgiIHZpZXdCb3g9IjAgMCA1MCA0MiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNTAgNDIiIHhtbDpzcGFjZT0icHJlc2VydmUiPiAgPGltYWdlIGlkPSJpbWFnZTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI0MiIgeD0iMCIgeT0iMCIKICAgIGhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBRElBQUFBcUNBWUFBQUR4dWdoSEFBQUFCR2RCVFVFQUFMR1BDL3hoQlFBQUFDQmpTRkpOCkFBQjZKZ0FBZ0lRQUFQb0FBQUNBNkFBQWRUQUFBT3BnQUFBNm1BQUFGM0NjdWxFOEFBQUFCbUpMUjBRQS93RC9BUCtndmFlVEFBQUEKQ1hCSVdYTUFBQXNUQUFBTEV3RUFtcHdZQUFBTGFrbEVRVlJvM3MyWmUyeGN4M1dIdjVuNzNpZVgzQWRKa2VKS1pDakplam15Rk1WUwoydGlXbXpaUTFGWklJcmR5M0lmdDFFZ2R0QVVLLzJFWWlCc1VyZHVpYVJLZ0xRS2tDT3cwY05vS2FaTTRyWnJxQWR0eEV0bXlSWXVKCkhoUkZVaVFsdnNsZDdvTzdkL2ZlTy8yRGtseGJkdENsRkxVRExEREEzdG41ZmVmc09UUG5YS0dVb3BIaCsvNzFlYTFXdy9NOFROTkUKS1FYQ1FsVXY3YlV1ZnVRZmhONVN3a2dzb2lYeWFKRUNXcXdBaVlLSTMxR2tlZi9mZ3Bya1orMHRaRU82OUlhZUJqUk51ejQzRElPcApxU2txbFFxbWFlS0tEakwraVk4NDNzVlc1RVdZQmFxQURUakFMTlJTMnhEYjkvK25JWm1FeG96NHMwWmoyTyswZ3E3VDF0YUc3L3NVCkNnV3FkWVdqSDl0YSt3a1V2cjBkdHdLcUJXb0ZuV0wvV2xRRVBMbVdXb2xGRUNDMDkvNDBxdVZtTFdIYk5yMjl2U3dzTEtBNWhtWlcKMHB1MHpINWlXamZFQmJTT1kwNmxNU2Z2aFkwdlUwZWdGaS9YaVhYY01tL2NFaEFBeTdKb2EydWpGZ1NaRjcvYTN5SmpOdm9IMzQ5VgorVEQ2cFFEcmZWR2MrSGNSc3h1cFZReXlxeGJxOFA4TVJBWEJKaUdZUnNqWk9qSTZPdFJQTURBT0oxNUVDWXRBaGlEU2hUN3pDbldsCnNYSEhQV3hvaXRldnJyNzZLK0wyZzF6YmVxbEdTcStYVCtwekMxM0N0R2RsVzZvYnlhaVp1Z05yY1J4YnpsUHpBUi9rL0VWOENVc3QKNnpEakdSQm01YW9WVmhRUHR3UmsrdVIvWVZnR1Y0WW5tcThVWTEwZmZXZ2ZxbHhPVlplV2ZsajIxTzlvcGFHYTBEQ3hCRlFWQ0loSApvRmdFbEF0YVFtRWtacFlkb2FIQUVGQmZOdEhLUGRNd1NLQlY4V1ZBUERJcVRoMzVNZDhMcFJHNVBOVktiZk82K3pmdHpGaXpRZjhzCmZPVUhDVDYzMXlFc2wvalRZeDYvM2wyazA3eUVGVjh0UEduL3krTEUyZm1XK3N1YktROTFWenIrOENIZmJEOHEvS1hyKzRURDRaOHYKU0M2MENUMmNvRFR2bVZIdktXWk9KTkVuaXlTeXhtZzAvcVh6YjNpOXR0VUIyNXQ3V01wMDR1SVJwTTlTNXdUejgzbTJkT3hFRjN3eQpZbGZneGM4Z0JJalVudTJ1MlhGVXE5ZHZuMGR5ZzMxb29TYUtseTVhczR1cmljZlBVSnc0U2RQNnRyQnRoejQ5bGRoUFBGSGhnYmpQCmROVkhKanA0K3JGMUxJeHZZV0o4RUNmZHc1THJVYW5HMFpNcGd2RjVsa2JkTG1jYkVKaTNEMlRENmhCV0xNSlVCV3NnMEZrb3BIRTkKV0NocXlYQTQrcHNILytCSjhoUGpGS1lINEtkbldQanhqemh2ek9Fbk5wSDh4Y2M0ZC81MWxyNzhhYXB1aFkvOVdpdUZ5MVhNN3JGdQpRMENnclR6d0d3WTUvOU96MktFSXN4ZUhMTU9RNkhhZFNBTHF5dVNIci95QU5hWEQxRXA1cXRuZkpZaDFVM1ZlcGFxTmtjd2VwQnBJCitrOGNwdlhjWlpxMnJzV01yY0t3QmxERnFZMUNnSlFhSzcyMk5Bd1NmOThlN0tZMkt1Vkt5SCsxU3JVWXdsNkMxcFlNazJNWG1EMzAKREdZYzNJL3V3bXBPMGJ6M1U4UkxCd2paSnZNems0VFNHekRiSU5DVEJKRWV6TkFSQ2xmbTI1VkhtOVMxU1lMZzlvQ01uWGtackNSaQordFdRcWVmUUhKK21NUGkrd25iQ2hGSVF0UGNTeER0UTVSbUVsSmhDbzFvcUVJODV5TmhHeE5RT3FvVUNGYmthT3diZTlFK0FZcThRCjBVbkV5bEp3d3lCN0huZ1lCUVMxZTQ2L1l2bFQwNmNPdFRZQmJnMUFRUUJlKzYrZ05BdEJnQW9VUGo1Q0NIdy93S3ZWMEdOMzRPVlAKa0t0RWFkY1Y3VjAvUW5mSHMraDN2SFRiUUt4UVpIa1Npc3h1LzYxL3ZQZjdSZTN6aFVEZjQ3Wi9xTVVzamtCVTRDZTNJOTA1Ymp6ZwpGQW9CN2dMNDArU3FtMWk3OHlpVTIyRXBkVGRobmxzcHlFMWQ0NXRqMXZsZitxTnZQdEQ4eTArUDFtS2JvVEtEa29EbVFPRGR1RUFwCkVCSWpmeExoNWhrcnhKbXAzTWRZdVlsY0xXaTVHUzBOZStUMDZkUFg1MElJZE4zQW54Lzd2dTZyYldnT2Nra2hxak1Fc1Y1RUxRZWEKQ2RKQ2FSYkt5YURseitLT1RLRjFiMkh0bXRnVFZYdDRWTTlZbCt4RTg4WGJDdUo1YjdlMGxCTEhjYzZKa285dGdwWUhiZTUxNmgzNwprSVZCaEp0RHVETklkeDVxZWF5cEZ4bkpIaXpmKytCVFQyOWR2K1lMTnlQK2Z3N1JhTTFlS0JTdUxRV1d5OTJGaGZrN3YzMzB0VDYvCk1FVDcyTCtpeTNuOCtBYkUwbVhrMGhXRU93YzFENk1HdmdaTmo3enlzVzBmMlAzdjBxdmdPTTR0QVdrNFJwUlNCRUZBNE5jSmdqcGUKNEpOWnRlck5iRXcrTjM3MEcraWRLU0xWQzlnRDM4RzQvQVo2YVFycGUrZ1dsSVJnZkRHSnJGVXVEdzRPMHRmWHgvejgvQzBCYWZ4QQpqTWV2emdLb0YvR0tzMmc2YkVzdWZPdHk2ZlJ2ejQ5Mk16MFpKNU1zWXVnQjlacEVvTkIxUmJXdVVhNDZyT3JzQ2ljNzFyQlVpR1BiCjl2OE5pRkxxYXV0SElMUUlTdk9vTEV4eDRkUWJXajNzb0V1SjYrb0VMSGQwQWs5RHlnQ2xmQ1FRQ3Jra1dscUdJN1pPeEU3ZkVnaTQKbWZTckZBZ05JOTVDcUszN0F4MGJvaytJZWdVUVJKMHFVbDB0QUlVQ3FaQVN5a3VTbWg5Qk43UXZBdmZlTW9xYkFsbW02UVcrQWJ5Swp2WFZYb2duOG9FSys0QkFBVW9DUUhwb0lvQTQyTldMT0RFSXpmd000RHJ3SmZBN291ZTBnUWdpa2xERWh4RjhMSVFhQUJ3SEsxbTRXCnpmdUk2R05FNUJ5eUh1QlZ3YTlDeldzaVYrMUZ0M3V4dzUzWDYvUWdDTGI2bnZkNVlCQjRBYmh2cFNBTnAxL2Y5OWRvbW5ZQ1NBT1UKU2lVTXc2QldWL3piMS82RDZ0bG5hS2xNa3hkMzRhazRBb0dWN01GTVpERk5rM2cyeGYwSDdpRlhLT0lZT3BxbThhMmlSb2NKSDRwcQpLS1hXS3FWR3BHek14ZzJEVEUxTmZXSndjUERRNXMyYmFXcHFBbUJrWklSVU9va1JqdkM5cjM2VHNCY2pzcXFEV01MQmpCcVlJY21xCnpnelcxVE9qVkN3eG5Wc2syOUdHSmlWRFBsZ0JkQmpnKy80aDMvY1BtR1pqMVdMRElCTVRFdzg5Ly96elg0L0ZZdlQwOUxCdTNUcFMKcVJTRlFnRUYrRUlTaTBjSTZUY0tLWmJMRkFzRmZNOGprMGxqbXRZTnoxdzlwMW8xVFp0dVJOZEswbThzR28waWhLQy92NSt6WjgrUwp6V2JwNmVraEVva1FpOFVvekM4dzU5WVFRbURxT2kwNlRKZXJCSnBPT0J5bXVhM3QrdStOREEvd3ovLzBkUjUrNURPa014Mkk1ZHZ2Clh1QnJQMWVRVXFrVUFUQk5FOXUyQ1lLQTBkRlJob2FHYUc5dnA3ZTNsMncyUzJ1bUZZQmNxY3hMcnM3N095eWEzMlczTjArZjRzbW4KL3B4VXVwMUhIbjBjQUUzVE5qU3FxMkdRaFlXRnNLN3IxN3lERUlKb05Mb3NPcGZqK1BIalJDSVJzdGtzNjlldG8zWDFhbVlsRkgxRgpzeTVRZ2MrWHZ2d1haRmRuMmYveEI5bDE5eS93eVUvc3BiUHpyVjV3THBlTEpoS0poblExSENPSER4LytxK25wNlNmZUs2c0lJYWpYCjZ4U0xSVFJOb3pXVjR1UDNmeGpSc3V3aDM2K3dlZk0yRE1PZzc5VHJTTzJ0V0NxWHl3d1BENk9VK3JzdFc3Wjh0aEZkRFo4ajlYcmQKQ1lLQTl6S0FVZ3BkMTJsdWJpWWFqVEk4T3NxaFl5OWQvMTdUSEQ3NytLUDg2cjc3M3dZeE9qTE9heWRmWTJ4c0RNTXdTbzNxYXJ6VQp0YXhRcVZUQ2NSeXVwVWp4THVYcHRiOWRhMnNyRXhPVGpJK1AwOW5aQ2NEdlAvN0h5OTRKQXNxVEpmcEgrcG5LVDVHSlpEQk5FMTNYCks0M3FhdGdqdTNidCtrSlhWOWV6Z0ovTDVTaVZTdmkrLzlabDhwMGJTSWxoR0J3NWN1UnQ3eC9uWm5QMHYzNmE1MTU5amhldXZJQnUKYTRoQW9KVEN0dTJoUm5VMUhDTUFaODZjUVNuVlZTNlhIeDBaR1hsNGVucTZQUWdDWXJFWTF4TEJOUzhKSVFpQ2dIdyt6L3IxNjFtLwpmajM1Zko3QzNDS25pbjNNQlhQY0ZiNkxKdEZFWUFSek5iZjJKenQzN3Z4S0lwSHdHOUhVTUlqbmVmVDE5WkZNSmxtelpnMUtLWE40CmVQamd1WFBuSGhzYkcvdGdwVkloRW9sY3J6T1cyMEErVWtwMFhhZXBxWWxJWkxrVFU2Z1h5T2daNnFwZVRYV2svc2F4bmI4OGRlcFUKWWZmdTNTU1R5WVowcmZpTmxldTY1SEk1RW9sRXJidTcrOW51N3U1bloyWm05cHcvZi83M2hvYUdEc3pOeldGWkZwRklCS1VVcnV0aQptaWFXWlNHbEpBZ0M0bG9jVjNQL3ZxMjk3Wm1lN3A3TE16TXpCTGVyMC9nMmQ3NGp5TlBwOUxGME9uMXN4NDRkVHcwTUREeHk0Y0tGClQwMU9UblpjODRicnV0ZlhWYXZWNXpWTis3TjBTL3FzWXp1NHJrdTlYbi9YeFBHL0dUZFpqN3o3Y0J6bjRwMTMzdm5rZ1FNSDF1N2IKdCs5Z0twWDZUcVZTbVpKU3pnWkI4TjE4UG45M3BWSjVVRXA1MXZmOUd6b3pLeG4vRFlFMDA2eWRkMkFwQUFBQUpYUkZXSFJrWVhSbApPbU55WldGMFpRQXlNREkwTFRBekxURXpWREEzT2pJM09qSTVLekF4T2pBdzljZU53UUFBQUNWMFJWaDBaR0YwWlRwdGIyUnBabmtBCk1qQXlOQzB3TXkweE0xUXdOem95TnpveU9Tc3dNVG93TUlTYU5YMEFBQUFBU1VWT1JLNUNZSUk9IiAvPgo8L3N2Zz4K';

// common
const Message = {
    name: {
        'en': 'ToyBot',
        'ko': 'ToyBot'
    }
}

class toybotSR {
    constructor (runtime, extensionId) {
        //the_locale = this._setLocale();
        /**
         * The Scratch 3.0 runtime used to trigger the green flag button.
         * @type {Runtime}
         * @private
         */
        this._runtime = runtime;
        this._runtime.registerPeripheralExtension(extensionId, this);
        this._runtime.on('PROJECT_STOP_ALL', this.onStopAll.bind(this));

        this._extensionId = extensionId;
        this._connected = false;
        this._serial = null;
        this._timeoutID = null;  
        this._sendID = null;
        this._rateLimiter = new RateLimiter(BTSendRateMax);

        this.toybotDetection = false;
        this.toybotInfo = {
            name: '',
            distance: 0,
            button: [0, 0],
            analog: 0,
            servo: [900, 900, 900, 900, 900],
            servoOffset: [0, 0, 0, 0, 0]
        };
        
        /**
         * contents buffer
         */
        this.cBuffer = [];
        /**
         * received packet;
         */
        this.rPacket = [];
    }

    /**
     * Scratch 프로젝트(사용자 코드) 실행 완료 후 호출
     */
    onStopAll() {
    }

    /**
     * WebSocket 연결 성공 시 호출
     */
    onConnect() {
        this._connected = true;
        this._timeoutID = window.setInterval(
            () => this._serial.handleDisconnectError('SerialDataStoppedError'),            
            3000000
        );
    }

    /**
     * 연결 종료 후 초기화
     */
    onReset() {
    }

    /**
     * WebSocket 메시지 수신시 호출
     */
    onMessage(params) {
        window.clearInterval(this._timeoutID);
        this._timeoutID = window.setInterval(
            () => this._serial.handleDisconnectError('SerialDataStoppedError'),
            3000000
        );

        if(params != null) {
            const dataOrigin = Base64Util.base64ToUint8Array(params.message);
            const dataOnly = dataOrigin.subarray(4);  // 해더(0x40, 0x00, 0x00, 0x00) 제거 데이터
            if (this.validateReceivedData(dataOnly)) {
                this.handleReceivedData(dataOnly);
            }
        }
    }

    /**
     * Scratch에서 호출하는 메소드
     * 하드웨어 장치 검색 시도시 호출
     */
    scan() {
        const options = {
            majorDeviceClass: 0,
            minorDeviceClass: 0
        };
        if (this._serial) {
            this._serial.disconnect();
        }
        this._serial = new SR(
            this._runtime,
            this._extensionId,
            options,
            this.onConnect.bind(this),
            this.onReset.bind(this),
            this.onMessage.bind(this)
        );
    }

    /**
     * 하드웨어 장치와 연결(Scratch에서 정의 됨)
     */
    connect(id) {
        if (this._serial) {
            // JINI 제품들은 'pid\\this._extensionId'를 보내 scratch link에서 제품에 따라 baudrate를 설정하도록 함. 송하권, 24.03.14
            this._serial.connectPeripheral(id + '\\' + this._extensionId);
            this.init();
            this._sendID = window.setInterval(
                () => {
                    if (!this.isConnected() || !this._rateLimiter.okayToSend()) {
                        Promise.resolve();
                    } else {
                        const packet = this.handleSendData();
                        this._serial.sendMessage({
                            message: Base64Util.uint8ArrayToBase64(packet),
                            encoding: 'base64'
                        });
                    }
                }, 
                PacketSendInterval
            );
        }
    }

    /**
     * 하드웨어 장치와 연결 해제(Scratch에서 정의 됨)
     */
    disconnect() {
        window.clearInterval(this._timeoutID);
        window.clearInterval(this._sendID);
        if (this._serial) {
            this._serial.disconnect();
        }
        this.reset();
    }

    /**
     * 하드웨어 장치와 연결 상태
     */
    isConnected() {
        this._connected = this._serial ? this._serial.isConnected() : false;
        return this._connected;
    }

    /**
     * 연결 성공 후 설정
     */
    init() {
        this.toybotInfo = {
            name: '',
            distance: 0,
            button: [0, 0],
            analog: 0,
            servo: [900, 900, 900, 900, 900],
            servoOffset: [0, 0, 0, 0, 0]
        };
        this.cBuffer = [];
        this.rPacket = [];
    }

    /**
     * 연결 해제 후 설정
     */
    reset() {
        this.connected = false;
        this.toybotDetection = false;
    }

    /**
     * sendDuration에서 설정된 값으로 주기적인 송신 데이터 생성
     */
    handleSendData() {
        if (this.toybotDetection) {
            this.addReturn(RequestReadDatas);
            this.addHeartBeat();
        } else {
            this.addReturn(requestReadName);
            this.addDeviceMode(DeviceMode_Control);
            this.addHeartBeat();
        }

        const sPacket = new Uint8Array(6 + this.cBuffer.length);
        sPacket[0] = 0xAA;
        sPacket[1] = 0xAA;
        sPacket[2] = ProtocolType;
        sPacket[3] = ProtocolVerison;
        sPacket[4] = this.cBuffer.length & 0xFF;
        sPacket[5] = (this.cBuffer.length >> 8) & 0xFF;
        for (let i = 0; i < this.cBuffer.length; i++) {
            sPacket[1] ^= this.cBuffer[i];
            sPacket[6 + i] = this.cBuffer[i];
        }
        for (let i = 1; i < 6; i++) {
            sPacket[0] ^= sPacket[i];
        }
        this.cBuffer = [];

        return sPacket;
    }

    /**
     * 수신 데이터 검증
     */
    validateReceivedData(data) {
        let verification = false;
        if (data.length >= 6) {
            let checker = 0xAA;
            for (let i = 1; i < 6; i++) {
                checker ^= data[i];
            }
            if (checker === data[0]) {
                this.toybotDetection = true;
                verification = true;
            }
        }
        return verification;
    }

    /**
     * 수신 데이터 검증 통과 후 처리
     */
    handleReceivedData(data) {
        const length = data[4] | (data[5] << 8);
        let count = 0;

        while(true) {
            const index = data[6 + count];
            const size = data[7 + count] | (data[8 + count] << 8);
            switch (index) {
                case 0x03: { // Device Name
                    this.toybotInfo.name = '';
                    for (let i = 10; i < 21; i++) {
                        this.toybotInfo.name += String.fromCharCode(data[i + count]);
                    }
                } break;
                case 0x13: { // Control Each
                    const repeat = data[9 + count] * 4;
                    for (let i = 0; i < repeat; i += 4) {
                        const id = data[10 + i + count];
                        const position = data[12 + i + count] | (data[13 + i + count] << 8);
                        this.toybotInfo.servo[id] = position;
                    }
                } break;
                case 0x1E: { // Calibration
                    const repeat = data[9 + count] * 3;
                    for (let i = 0; i < repeat; i += 3) {
                        const id = data[10 + i + count];
                        const offset = data[11 + i + count] | (data[12 + i + count] << 8);
                        this.toybotInfo.servoOffset[id] = offset >= 32768 ? offset - 65536 : offset;
                    }
                } break;
                case 0x43: { // Analog Value
                    this.toybotInfo.analog = data[9 + count] | (data[10 + count] << 8);
                } break;
                case 0x53: { // Button Control
                    this.toybotInfo.button[0] = data[9 + count];
                    this.toybotInfo.button[1] = data[10 + count];
                } break;
                case 0x73: { // Ultrasonic Distance
                    this.toybotInfo.distance = data[9 + count] | (data[10 + count] << 8);
                } break;
            }
            count += 3 + size;
            if (count >= length) {
                break;
            }
        }
    }

    printPacket(packet) {
        let msg = packet.length.toString() + ': ';
        for (let i = 0; i < packet.length; i++) {
            msg += '0x' + packet[i].toString(16) + ', ';
        }
        console.log(msg);
    }

    addReturn(data) {
        const length = data.length * 2 + 1;
        const buffer = new Uint8Array(3 + length);
        buffer[0] = 0x01;
        buffer[1] = length & 0xFF;
        buffer[2] = (length >> 8) & 0xFF;
        buffer[3] = data.length;
        for (let i = 0; i < data.length; i++) {
            const addr = i * 2;
            buffer[addr + 4] = data[i].index;
            buffer[addr + 5] = data[i].repeat;
        }
        this.cBuffer.push(...buffer);
    }

    addDeviceMode(mode) {
        const buffer = new Uint8Array(4);
        buffer[0] = 0x02;
        buffer[1] = 0x01;
        buffer[2] = 0x00;
        buffer[3] = mode;
        this.cBuffer.push(...buffer);
    }

    addLedControl(rgb) {
        const buffer = new Uint8Array(6);
        buffer[0] = 0x63;
        buffer[1] = 0x03;
        buffer[2] = 0x00;
        buffer[3] = rgb.r;
        buffer[4] = rgb.g;
        buffer[5] = rgb.b;
        this.cBuffer.push(...buffer);
    }

    addMelodyPlayScore(note) {
        const buffer = new Uint8Array(6);
        buffer[0] = 0x83;
        buffer[1] = 0x03;
        buffer[2] = 0x00;
        buffer[3] = 0x01;
        buffer[4] = note.beat;
        buffer[5] = note.pitch;
        this.cBuffer.push(...buffer);
    }

    addMelodyPlayList(list) {
        const buffer = new Uint8Array(5);
        buffer[0] = 0x87;
        buffer[1] = 0x02;
        buffer[2] = 0x00;
        buffer[3] = list.title;
        buffer[4] = list.play;
        this.cBuffer.push(...buffer);
    }

    addServoControl(servo) {
        const length = servo.length * 4 + 1;
        const buffer = new Uint8Array(3 + length);
        buffer[0] = 0x13;
        buffer[1] = length & 0xFF;
        buffer[2] = (length >> 8) & 0xFF;
        buffer[3] = servo.length;
        for (let i = 0; i < servo.length; i++) {
            const addr = i * 4;
            buffer[addr + 4] = servo[i].id;
            buffer[addr + 5] = servo[i].speed;
            buffer[addr + 6] = servo[i].position & 0xFF;
            buffer[addr + 7] = (servo[i].position >> 8) & 0xFF;
        }
        this.cBuffer.push(...buffer);
    }

    addPwmControl(pwm) {
        const buffer = new Uint8Array(5);
        buffer[0] = 0x33;
        buffer[1] = 0x02;
        buffer[2] = 0x00;
        buffer[3] = pwm & 0xFF;
        buffer[4] = (pwm >> 8) & 0xFF;
        this.cBuffer.push(...buffer);
    }

    addDcControl(dc) {
        const length = dc.length * 3 + 1;
        const buffer = new Uint8Array(3 + length);
        buffer[0] = 0x23;
        buffer[1] = length & 0xFF;
        buffer[2] = (length >> 8) & 0xFF;
        buffer[3] = dc.length;
        for (let i = 0; i < dc.length; i++) {
            const addr = i * 3;
            buffer[addr + 4] = dc[i].id;
            buffer[addr + 5] = dc[i].speed & 0xFF;
            buffer[addr + 6] = (dc[i].speed >> 8) & 0xFF;
        }
        this.cBuffer.push(...buffer);
    }
    
    addServoOffset(servoOffset) {
        const length = servoOffset.length * 3 + 1;
        const buffer = new Uint8Array(3 + length);
        buffer[0] = 0x1E;
        buffer[1] = length & 0xFF;
        buffer[2] = (length >> 8) & 0xFF;
        buffer[3] = servoOffset.length;
        for (let i = 0; i < servoOffset.length; i++) {
            const addr = i * 3;
            buffer[addr + 4] = servoOffset[i].id;
            buffer[addr + 5] = servoOffset[i].offset & 0xFF;
            buffer[addr + 6] = (servoOffset[i].offset >> 8) & 0xFF;
        }
        this.cBuffer.push(...buffer);
    }

    addHeartBeat() {
        const buffer = new Uint8Array(4);
        buffer[0] = 0xFF;
        buffer[1] = 0x01;
        buffer[2] = 0x00;
        buffer[3] = 0x01;
        this.cBuffer.push(...buffer);
    }
}

class Scratch3toybotSR {
    static get EXTENSION_ID () {
        return 'toybot';
    }

    constructor (runtime) {
        this.runtime = runtime;
        this.locale = this._setLocale();
        // Create a new toybotSR peripheral instance
        this._peripheral = new toybotSR(this.runtime, Scratch3toybotSR.EXTENSION_ID);
    }

    getInfo() {
        return {
            id: Scratch3toybotSR.EXTENSION_ID,
            color1: '#0f83bd',
            //color2: '#34B0F7',
            name: 'ToyBot',
            showStatusButton: true,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'get_ultrasonic_distance',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'toybot.get_ultrasonic_distance',
                        default: 'Ultrasonic wave sensor distance value',
                        description: 'Read distance from ultrasonic wave'
                    }),
                    arguments: {
                    }
                },
                {
                    opcode: 'get_button_state',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'toybot.get_button_state',
                        default: '[BUTTON] button value',
                        description: 'Read button state pushed or released'
                    }),
                    arguments: {                        
                        BUTTON: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                            menu: 'dropdown_button'
                        }
                    }
                },
                {
                    opcode: 'get_analog_input',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'toybot.get_analog_input',
                        default: 'Analog input value',
                        description: 'Read analog value 0 - 100'
                    }),
                    arguments: {
                    }
                },
                {
                    opcode: 'get_servo_angle',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'toybot.get_servo_angle',
                        default: 'No.[SERVO] servo motor angle value',
                        description: 'Read servo angle'
                    }),
                    arguments: {
                        SERVO: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                            menu: 'dropdown_servo'
                        },
                    }
                },
                '---',
                {
                    opcode: 'set_led_color_name',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'toybot.set_led_color_name',
                        default: 'Set LED color to [COLOR]',
                        description: 'Set led color'
                    }),
                    arguments: {
                        COLOR: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5,
                            menu: 'dropdown_color'
                        }
                    }
                },
                {
                    opcode: 'set_led_rgb',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'toybot.set_led_rgb',
                        default: 'Set LED color to red [RED], green [GREEN], blue [BLUE]',
                        description: 'Set led rgb'
                    }),
                    arguments: {
                        RED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100
                        },
                        GREEN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100
                        },
                        BLUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100
                        }
                    }
                },
                {
                    opcode: 'set_play_score',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'toybot.set_play_score',
                        default: 'Play note to [OCTAVE] [PITCH] [ACCIDENTAL] [BEAT]',
                        description: 'Play score'
                    }),
                    arguments: {
                        OCTAVE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 80,
                            menu: 'dropdown_octave'
                        },
                        PITCH: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1,
                            menu: 'dropdown_pitch'
                        },
                        ACCIDENTAL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                            menu: 'dropdown_accidental'
                        },
                        BEAT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 500,
                            menu: 'dropdown_beat'
                        }
                    }
                },
                {
                    opcode: 'set_play_sound_effect',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'toybot.set_play_sound_effect',
                        default: 'Play No.[EFFECT] sound effect',
                        description: 'Play melody effect'
                    }),
                    arguments: {
                        EFFECT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1,
                            menu: 'dropdown_effect'
                        }
                    }
                },
                {
                    opcode: 'set_play_melody',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'toybot.set_play_melody',
                        default: 'Play No.[MELODY] melody',
                        description: 'Play melody'
                    }),
                    arguments: {
                        MELODY: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 13,
                            menu: 'dropdown_melody'
                        }
                    }
                },
                {
                    opcode: 'set_servo_each',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'toybot.set_servo_each',
                        default: 'Rotate [SERVO] servo motor to speed [SPEED], angle [ANGLE]',
                        description: 'control servo each other'
                    }),
                    arguments: {
                        SERVO: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                            menu: 'dropdown_servo'
                        },
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 3,
                            menu: 'dropdown_speed'
                        },
                        ANGLE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        }
                    }
                },
                {
                    opcode: 'set_servo_all',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'toybot.set_servo_all',
                        default: 'Rotate all servo motor to speed [SPEED], angle [ANGLE_0], [ANGLE_1], [ANGLE_2], [ANGLE_3], [ANGLE_4]',
                        description: 'control all servo'
                    }),
                    arguments: {
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 3,
                            menu: 'dropdown_speed'
                        },
                        ANGLE_0: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        },
                        ANGLE_1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        },
                        ANGLE_2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        },
                        ANGLE_3: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        },
                        ANGLE_4: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        },
                    }
                },
                {
                    opcode: 'set_servo_home',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'toybot.set_servo_home',
                        default: 'Control all servo motor to speed [SPEED], home position',
                        description: 'control all servo to home angle'
                    }),
                    arguments: {
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 3,
                            menu: 'dropdown_speed'
                        },
                    }
                },
                {
                    opcode: 'set_analog_output',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'toybot.set_analog_output',
                        default: 'Set analog output to [PWM]',
                        description: 'Ouput pwm'
                    }),
                    arguments: {
                        PWM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 70,
                        },
                    }
                },
                {
                    opcode: 'set_dc_run',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'toybot.set_dc_run',
                        default: '[DIRECTION] DC motor [DC] to speed [SPEED]',
                        description: 'Ouput pwm'
                    }),
                    arguments: {
                        DC: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                            menu: 'dropdown_dc'
                        },
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 3,
                            menu: 'dropdown_speed'
                        },
                        DIRECTION: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1,
                            menu: 'dropdown_direction'
                        }
                    }
                },
                {
                    opcode: 'set_servo_offset',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'toybot.set_servo_offset',
                        default: 'Set angle 90° of servo motor [SERVO] to current position',
                        description: 'Offset setting'
                    }),
                    arguments: {
                        SERVO: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                            menu: 'dropdown_servo_all'
                        }
                    }
                },
                {
                    opcode: 'set_servo_reset',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'toybot.set_servo_reset',
                        default: 'Factory reset all settings',
                        description: 'default offset setting'
                    }),
                    arguments: {
                    }
                }
            ],
            menus: {
                dropdown_button: {
                    acceptReporters: true,
                    items: [
                        {text: formatMessage({id: 'toybot.list_button_a', default: 'A'}), value: 0},
                        {text: formatMessage({id: 'toybot.list_button_b', default: 'B'}), value: 1}
                    ]
                },
                dropdown_color: {
                    acceptReporters: true,
                    items: [
                        {text: formatMessage({id: 'toybot.list_color_white',  default: 'White'}),  value: 1},
                        {text: formatMessage({id: 'toybot.list_color_red',    default: 'Red'}),    value: 2},
                        {text: formatMessage({id: 'toybot.list_color_orange', default: 'Orange'}), value: 3},
                        {text: formatMessage({id: 'toybot.list_color_yellow', default: 'Yellow'}), value: 4},
                        {text: formatMessage({id: 'toybot.list_color_green',  default: 'Green'}),  value: 5},
                        {text: formatMessage({id: 'toybot.list_color_blue',   default: 'Blue'}),   value: 6},
                        {text: formatMessage({id: 'toybot.list_color_navy',   default: 'Navy'}),   value: 7},
                        {text: formatMessage({id: 'toybot.list_color_violet', default: 'Violet'}), value: 8},
                        {text: formatMessage({id: 'toybot.list_color_off',    default: 'Off'}),    value: 0}
                    ]
                },                
                dropdown_octave: {
                    acceptReporters: true,
                    items: [
                        {text: formatMessage({id: 'toybot.list_octave_low',    default: 'Low'}),    value: 64}, // 4 octave(0x40)
                        {text: formatMessage({id: 'toybot.list_octave_middle', default: 'Middle'}), value: 80}, // 5 octave(0x50)
                        {text: formatMessage({id: 'toybot.list_octave_high',   default: 'High'}),   value: 96}, // 6 octave(0x60)
                    ]
                },
                dropdown_pitch: {
                    acceptReporters: true,
                    items: [
                        {text: formatMessage({id: 'toybot.list_pitch_c', default: 'C'}), value: 1},
                        {text: formatMessage({id: 'toybot.list_pitch_d', default: 'D'}), value: 3},
                        {text: formatMessage({id: 'toybot.list_pitch_e', default: 'E'}), value: 5},
                        {text: formatMessage({id: 'toybot.list_pitch_f', default: 'F'}), value: 6},
                        {text: formatMessage({id: 'toybot.list_pitch_g', default: 'G'}), value: 8},
                        {text: formatMessage({id: 'toybot.list_pitch_a', default: 'A'}), value: 10},
                        {text: formatMessage({id: 'toybot.list_pitch_b', default: 'B'}), value: 12},
                        {text: formatMessage({id: 'toybot.list_pitch_r', default: 'Rest'}), value: -1},
                    ]                    
                },
                dropdown_accidental: {
                    acceptReporters: true,
                    items: [
                        {text: formatMessage({id: 'toybot.list_accidental_natural', default: 'Natural'}), value: 0},
                        {text: formatMessage({id: 'toybot.list_accidental_sharp',   default: 'Sharp'}),   value: 1},
                        {text: formatMessage({id: 'toybot.list_accidental_flat',    default: 'Flat'}),    value: -1}
                    ]
                },
                dropdown_beat: {
                    acceptReporters: true,
                    items: [
                        {text: formatMessage({id: 'toybot.list_beat_oneeight', default: '1/8 of a beats'}), value: 63},
                        {text: formatMessage({id: 'toybot.list_beat_onefour',  default: '1/4 of a beats'}), value: 125},
                        {text: formatMessage({id: 'toybot.list_beat_onetwo',   default: '1/2 of a beats'}), value: 250},
                        {text: formatMessage({id: 'toybot.list_beat_one',      default: '1 beat'}),         value: 500},
                        {text: formatMessage({id: 'toybot.list_beat_onehalf',  default: '1.5 beats'}),      value: 750},
                        {text: formatMessage({id: 'toybot.list_beat_two',      default: '2 beats'}),        value: 1000},
                        {text: formatMessage({id: 'toybot.list_beat_three',    default: '3 beats'}),        value: 1500},
                        {text: formatMessage({id: 'toybot.list_beat_four',     default: '4 beats'}),        value: 2000}
                    ]
                },
                dropdown_effect: {
                    acceptReporters: true,
                    items: [
                        {text: '1', value: 1},
                        {text: '2', value: 2},
                        {text: '3', value: 3},
                        {text: '4', value: 4},
                        {text: '5', value: 5}
                    ]
                },
                dropdown_melody: {
                    acceptReporters: true,
                    items: [
                        {text: '1', value: 13},
                        {text: '2', value: 14},
                        {text: '3', value: 15},
                        {text: '4', value: 16}
                    ]
                },
                dropdown_servo: {
                    acceptReporters: true,
                    items: [
                        {text: '0', value: 0},
                        {text: '1', value: 1},
                        {text: '2', value: 2},
                        {text: '3', value: 3},
                        {text: '4', value: 4}
                    ]
                },
                dropdown_speed: {
                    acceptReporters: true,
                    items: [
                        {text: '1', value: 1},
                        {text: '2', value: 2},
                        {text: '3', value: 3},
                        {text: '4', value: 4},
                        {text: '5', value: 5}
                    ]
                },
                dropdown_dc: {
                    acceptReporters: true,
                    items: [
                        {text: '1', value: 0},
                        {text: '2', value: 1},
                        {text: formatMessage({id: 'toybot.list_all', default: 'All'}), value: 2}
                    ]
                },
                dropdown_direction: {
                    acceptReporters: true,
                    items: [
                        {text: formatMessage({id: 'toybot.list_rotation_forward', default: 'Forward rotation'}), value: 1},
                        {text: formatMessage({id: 'toybot.list_rotation_reverse', default: 'Reverse rotation'}), value: -1},
                        {text: formatMessage({id: 'toybot.list_rotation_stop',    default: 'Stop'}),             value: 0}
                    ]
                },
                dropdown_servo_all: {
                    acceptReporters: true,
                    items: [
                        {text: '0', value: 0},
                        {text: '1', value: 1},
                        {text: '2', value: 2},
                        {text: '3', value: 3},
                        {text: '4', value: 4},
                        {text: formatMessage({id: 'toybot.list_all', default: 'All'}), value: 5}
                    ]
                },
            }
        };
    }

    returnDelay(us) {
        return new Promise(resolve => {
            setTimeout(() => { resolve(); }, us); 
        });
    }

    get_ultrasonic_distance() {
        const mm = this._peripheral.toybotInfo.distance;
        return cm / 10;
    }

    get_button_state(args) {
        const button = Number(args['BUTTON']);
        const state = this._peripheral.toybotInfo.button;
        return state[button] > 0 ? 1 : 0;

    }

    get_analog_input() {
        const value = this._peripheral.toybotInfo.analog;
        return Math.round((value / 1024) * 100)
    }

    get_servo_angle(args) {
        const servo = Number(args['SERVO']);
        const angles = this._peripheral.toybotInfo.servo;
        return Math.round(angles[servo] / 10);
    }

    set_led_color_name(args) {
        const rgb = {
            r: 0x00,
            g: 0x00,
            b: 0x00
        };
        const color = Number(args['COLOR']);
        switch(color) {
            case 0: rgb.r = 0x00; rgb.g = 0x00; rgb.b = 0x00; break; // off
            case 1: rgb.r = 0xFF; rgb.g = 0xFF; rgb.b = 0xFF; break; // White
            case 2: rgb.r = 0xFF; rgb.g = 0x00; rgb.b = 0x00; break; // Red
            case 3: rgb.r = 0xFF; rgb.g = 0x80; rgb.b = 0x00; break; // Orange
            case 4: rgb.r = 0xFF; rgb.g = 0xFF; rgb.b = 0x00; break; // Yellow
            case 5: rgb.r = 0x00; rgb.g = 0xFF; rgb.b = 0x00; break; // Green
            case 6: rgb.r = 0x00; rgb.g = 0x00; rgb.b = 0xFF; break; // Blue
            case 7: rgb.r = 0x00; rgb.g = 0x00; rgb.b = 0x80; break; // Navy
            case 8: rgb.r = 0x7F; rgb.g = 0x00; rgb.b = 0xFF; break; // Violet
        }
        this._peripheral.addLedControl(rgb);
        return this.returnDelay(DefaultDelayTime);
    }

    set_led_rgb(args) {
        const limit = (value) => {
            if (value < 0) {
                value = 0;
            } else if (value > 255) {
                value = 255
            };
            return value;
        }
        const rgb = {
            r: limit(Math.round(Number(args['RED']) * 2.55)),
            g: limit(Math.round(Number(args['GREEN']) * 2.55)),
            b: limit(Math.round(Number(args['BLUE']) * 2.55))
        };
        this._peripheral.addLedControl(rgb);
        return this.returnDelay(DefaultDelayTime);
    }
    
    set_play_score(args) {
        const beat = Number(args['BEAT']);
        const octave = Number(args['OCTAVE']);
        const accidental = Number(args['ACCIDENTAL']);
        const pitch = Number(args['PITCH']);
        const note = {
            beat: 0,
            pitch: 0
        };
        if (pitch > -1) {
            const temp = pitch + accidental
            switch (temp) {
                case 0:
                    note.pitch = (octave - 0x10) | 12;
                    break;
                case 13:
                    note.pitch = (octave + 0x10) | 1;
                    break;
                default:
                    note.pitch = octave | temp;
                    break;
            }
        }
        this._peripheral.addMelodyPlayScore(note); // continue, rest
        return new Promise(resolve => {
            setTimeout(() => {
                this._peripheral.addMelodyPlayScore({beat: 11, pitch: 0});
                resolve();
            }, beat);
        });
    }

    set_play_sound_effect(args) {
        const list = {
            title: Number(args['EFFECT']),
            play: 1
        };
        this._peripheral.addMelodyPlayList(list);
        return this.returnDelay(DefaultDelayTime);
    }

    set_play_melody(args) {
        const list = {
            title: Number(args['MELODY']),
            play: 1
        };
        this._peripheral.addMelodyPlayList(list);
        return this.returnDelay(DefaultDelayTime);
    }

    set_servo_each(args) {
        const servo = [{
            id: Number(args['SERVO']),
            speed: Number(args['SPEED']),
            position: Number(args['ANGLE']) * 10
        }];
        if (servo.position < 0) {
            servo.position = 0;
        } else if (servo.position > 1800) {
            servo.position = 1800;
        }
        this._peripheral.addServoControl(servo);
        return this.returnDelay(DefaultDelayTime);
    }

    set_servo_all(args) {
        const speed = Number(args['SPEED']);
        const position = [
            Number(args['ANGLE_0']) * 10,
            Number(args['ANGLE_1']) * 10,
            Number(args['ANGLE_2']) * 10,
            Number(args['ANGLE_3']) * 10,
            Number(args['ANGLE_4']) * 10
        ];
        const servo = [
            { id: 0, speed: speed, position: position[0] },
            { id: 1, speed: speed, position: position[1] },
            { id: 2, speed: speed, position: position[2] },
            { id: 3, speed: speed, position: position[3] },
            { id: 4, speed: speed, position: position[4] },
        ];
        this._peripheral.addServoControl(servo);
        return this.returnDelay(DefaultDelayTime);
    }

    set_servo_home(args) {        
        const speed = Number(args['SPEED']);
        const servo = [
            { id: 0, speed: speed, position: 900 },
            { id: 1, speed: speed, position: 900 },
            { id: 2, speed: speed, position: 900 },
            { id: 3, speed: speed, position: 900 },
            { id: 4, speed: speed, position: 900 },
        ];
        this._peripheral.addServoControl(servo);
        return this.returnDelay(DefaultDelayTime);
    }
    
    set_analog_output(args) {
        const pwm =  Math.round(Number(args['PWM']) * 10.23);
        this._peripheral.addPwmControl(pwm);
        return this.returnDelay(DefaultDelayTime);
    }

    set_dc_run(args) {
        const id = Number(args['DC']);
        const speed = Number(args['SPEED']) * 51 * Number(args['DIRECTION']);
        const dc = [
            { id: 0, speed: speed },
            { id: 1, speed: speed },
        ];
        if (id < 2) {
            this._peripheral.addDcControl([dc[id]]);
        } else {
            this._peripheral.addDcControl(dc);
        }
        return this.returnDelay(DefaultDelayTime);
    }

    set_servo_offset(args) {
        const id = Number(args['SERVO']);
        const position = this._peripheral.toybotInfo.servo;
        const offset = this._peripheral.toybotInfo.servoOffset;
        const servoOffset = [
            { id: 0, offset: position[0] - 900 + offset[0] },
            { id: 1, offset: position[1] - 900 + offset[1] },
            { id: 2, offset: position[2] - 900 + offset[2] },
            { id: 3, offset: position[3] - 900 + offset[3] },
            { id: 4, offset: position[4] - 900 + offset[4] },
        ];
        if (id < 4) {
            this._peripheral.addServoOffset([servoOffset[id]]);
        } else {
            this._peripheral.addServoOffset(servoOffset);
        }
        return this.returnDelay(DefaultDelayTime);
    }

    set_servo_reset() {
        const servoOffset = [
            { id: 0, offset: 0 },
            { id: 1, offset: 0 },
            { id: 2, offset: 0 },
            { id: 3, offset: 0 },
            { id: 4, offset: 0 },
        ];
        this._peripheral.addServoOffset(servoOffset);
        return this.returnDelay(DefaultDelayTime);
    }

    // end of block handlers
    _setLocale() {
        switch (formatMessage.setup().locale) {
            case 'ko':
                return 'ko';
            case 'pt-br':
            case 'pt':
                return 'pt-br';
            case 'en':
                return 'en';
            case 'fr':
                return 'fr';
            case 'zh-tw':
                return 'zh-tw';
            case 'zh-cn':
                return 'zh-cn';
            default:
                return 'en';
        }
    }
}

module.exports = Scratch3toybotSR;