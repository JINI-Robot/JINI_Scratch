// Boiler plate from the Scratch Team
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const SR = require('../../io/serial');
const Base64Util = require('../../util/base64-util');
const RateLimiter = require('../../util/rateLimiter.js');
const formatMessage = require('format-message');

const _DEBUG_BLOCK = false;
const _DEBUG_PACKET = false;

// The following are constants used within the extension
// Protocol
const ProtocolType = 0x03;    // toybot product number
const ProtocolVerison = 0x22; // protocal 2.2
// Content Index
const DeviceReturn = {
    multiple: true,
    index: 0x01,
    size: 0x02,
    count: 0x00,
    repeat_once: 0x02,
};
const DeviceMode = {
    multiple: false,
    index: 0x02,
    size: 0x01,
    count: 0x00,
    mode_control: 0x03,
};
const DeviceName = {
    multiple: true,
    index: 0x03,
    size: 0x0A,
    count: 0x00
};
const ServoControlEach = {
    multiple: true,
    index: 0x13,
    size: 0x04,
    count: 0x00
};

const ServoControlCalibration = {
    multiple: true,
    index: 0x1E,
    size: 0x03,
    count: 0x00
}
const DcControl = {
    multiple: true,
    index: 0x23,
    size: 0x03,
    count: 0x00
}
const PwmControl = {
    multiple: false,
    index: 0x33,
    size: 0x02,
    count: 0x00
}
const AnalogValue = {
    multiple: false,
    index: 0x43,
    size: 0x02,
    count: 0x00
}
const ButtonControl = {
    multiple: false,
    index: 0x53,
    size: 0x02,
    count: 0x00
}
const LedControl = {
    multiple: false,
    index: 0x63,
    size: 0x03,
    count: 0x00
}
const UltrasonicDistance = {
    multiple: false,
    index: 0x73,
    size: 0x02,
    count: 0x00
}
const MelodyPlayScore = {
    multiple: true,
    index: 0x83,
    size: 0x02,
    count: 0x00
}
const MelodyPlayList = {
    multiple: false,
    index: 0x87,
    size: 0x02,
    count: 0x00
}
const SignalHeartBeat = {
    multiple: false,
    index: 0xFF,
    size: 0x01,
    count: 0x00,
    type_serial: 0x01
};
// Content value
const HeartBeat_Serial = 0x01;
const RequestReadDatas = [
    {index: ServoControlEach.index,        repeat: DeviceReturn.repeat_once},
    {index: ServoControlCalibration.index, repeat: DeviceReturn.repeat_once},
    {index: AnalogValue.index,             repeat: DeviceReturn.repeat_once},
    {index: ButtonControl.index,           repeat: DeviceReturn.repeat_once},
    {index: UltrasonicDistance.index,      repeat: DeviceReturn.repeat_once}
];
const RequestReadName = [
    {index: DeviceName.index, repeat: DeviceReturn.repeat_once}
]

const PacketBufferSize = 256;
const PacketHeaderSize = 6;
const ContentHeaderSize = 3;
const ContentAddCountData = 1;
const PacketVerificationValue = 0xAA;

/**
 * units: ms
 */
const DefaultBlockReturnDelay = 10;
/**
 * uints: ms
 */
const PacketSendInterval = 40;

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

        this._toybotDetection = false;
        this._toybotInfo = {
            name: '',
            mode: 0,
            distance: 0,
            button: [0, 0],
            analog: 0,
            servo: [900, 900, 900, 900, 900],
            servoOffset: [0, 0, 0, 0, 0]
        };
        
        /**
         * contents buffer
         */
        this._contents = {
            buffer: new Uint8Array(PacketBufferSize),
            length: 0 
        };
        /**
         * received packet;
         */
        this._received = {
            buffer: new Uint8Array(PacketBufferSize),
            length: 0 
        };
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
            const bytes = Base64Util.base64ToUint8Array(params.message);
            const bytesSize = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
            const startAddr = this._received.length;
            for (let i = 0; i < bytesSize; i++) {
                this._received.buffer[i + startAddr] = bytes[4 + i];
            }
            this._received.length += bytesSize;

            while (this._received.length > PacketHeaderSize) {
                const header = new Uint8Array([
                    this._received.buffer[0],
                    this._received.buffer[1],
                    this._received.buffer[2],
                    this._received.buffer[3],
                    this._received.buffer[4],
                    this._received.buffer[5]
                ]);
                if(this.validateReceivedData(header)) {
                    const cLength = header[4] & 0xFF | ((header[5] << 8) & 0xFF);
                    const pLength = PacketHeaderSize + cLength;
                    if (this._received.length >= pLength) {
                        const packet = new Uint8Array(pLength);
                        for (let i = 0; i < pLength; i++) {
                            packet[i] = this._received.buffer[i];
                        }
                        for (let i = 0; i < pLength; i++) {
                            this._received.buffer[i] = this._received.buffer[pLength + i];
                        }
                        this._received.length -= pLength;
                        this.handleReceivedData(packet);
                    } else {
                        break;
                    }
                } else {                    
                    const pLength = this._received.length - 1;
                    for (let i = 0; i < pLength; i++) {
                        this._received.buffer[i] = this._received.buffer[i+1];
                    }
                    this._received.length -= 1;
                }
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
                        if (this._toybotDetection) {
                            const packet = this.handleIntervalSendData();
                            this._serial.sendMessage({
                                message: Base64Util.uint8ArrayToBase64(packet),
                                encoding: 'base64'
                            });
                        } else {
                            const packet = this.handleInitSendData();
                            this._serial.sendMessage({
                                message: Base64Util.uint8ArrayToBase64(packet),
                                encoding: 'base64'
                            });
                        }
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
        this._toybotInfo.name = '';
        this._toybotInfo.mode = 0;
        this._toybotInfo.distance = 0;
        this._toybotInfo.analog = 0;
        this._contents.length = 0;
        this._received.length = 0;
        for (let i = 0; i < 2; i++) {            
            this._toybotInfo.button[i] = 0;
        }
        for (let i = 0; i < 5; i++) {
            this._toybotInfo.servo[i] = 900;
            this._toybotInfo.servoOffset[i] = 0;
        }
        for (let i = 0; i < PacketBufferSize; i++) {
            this._contents.buffer[i] = 0;
            this._received.buffer[i] = 0;
        }
    }

    /**
     * 연결 해제 후 설정
     */
    reset() {
        this._connected = false;
        this._toybotDetection = false;
    }

    /**
     * COM port 연결 후 ToyBot 감지 전까지 송신할 데이터
     */
    handleInitSendData() {
        this.addReturn(RequestReadName);
        this.addDeviceMode(DeviceMode.mode_control);
        this.addHeartBeat(HeartBeat_Serial.type_serial);
        const packet = this.generatePacket();
        if (_DEBUG_PACKET) this.printPacket('SEND', packet);
        return packet;
    }

    /**
     * ToyBot 감지 후 PacketSendInterval에 설정된 값에 따라 주기적으로 송신할 데이터
     */
    handleIntervalSendData() {
        this.addReturn(RequestReadDatas);
        this.addHeartBeat(HeartBeat_Serial.type_serial);
        const packet = this.generatePacket();
        if (_DEBUG_PACKET) this.printPacket('SEND', packet);
        return packet;
    }

    /**
     * 수신 데이터 검증
     */
    validateReceivedData(header) {
        let verification = false;
        let checker = PacketVerificationValue;
        for (let i = 1; i < PacketHeaderSize; i++) {
            checker ^= header[i];
        }
        if (checker === header[0]) {
            this._toybotDetection = true;
            verification = true;
        }
        return verification;
    }

    /**
     * 수신 데이터 검증 통과 후 패킷 1개 처리
     */
    handleReceivedData(data) {
        if (_DEBUG_PACKET) this.printPacket('RECEIVED', data);
        const length = data[4] | (data[5] << 8);
        let addr = 0;
        while(addr < length) {
            const index = data[6 + addr];
            const cLength = data[7 + addr] | (data[8 + addr] << 8);
            switch (index) {
                case DeviceMode.index: {
                    this._toybotInfo.mode = data[9 + addr];
                } break;
                case DeviceName.index: {
                    const repeat = data[9 + addr];
                    for (let i = 0; i < repeat; i++) {
                        this._toybotInfo.name += String.fromCharCode(data[10 + i + addr]);
                    }
                } break;
                case ServoControlEach.index: {
                    const repeat = data[9 + addr] * 4;
                    for (let i = 0; i < repeat; i += 4) {
                        const id = data[10 + i + addr];
                        const speed = data[11 + i + addr];
                        const position = data[12 + i + addr] | (data[13 + i + addr] << 8);
                        this._toybotInfo.servo[id] = position;
                    }
                } break;
                case ServoControlCalibration.index: {
                    const repeat = data[9 + addr] * 3;
                    for (let i = 0; i < repeat; i += 3) {
                        const id = data[10 + i + addr];
                        const offset = data[11 + i + addr] | (data[12 + i + addr] << 8);
                        this._toybotInfo.servoOffset[id] = offset >= 32768 ? offset - 65536 : offset;
                    }
                } break;
                case AnalogValue.index: {
                    this._toybotInfo.analog = data[9 + addr] | (data[10 + addr] << 8);
                } break;
                case ButtonControl.index: {
                    this._toybotInfo.button[0] = data[9 + addr];
                    this._toybotInfo.button[1] = data[10 + addr];
                } break;
                case UltrasonicDistance.index: {
                    this._toybotInfo.distance = data[9 + addr] | (data[10 + addr] << 8);
                } break;
            }
            addr += ContentHeaderSize + cLength;
        }
    }

    printPacket(title, packet) {
        let msg = packet.length.toString() + ': ';
        for (let i = 0; i < packet.length; i++) {
            msg += '0x' + packet[i].toString(16) + ', ';
        }
        console.log('=========== ' + title + ' =============');
        console.log(msg);
    }

    generatePacket() {
        const cLength = this._contents.length;
        const packet = new Uint8Array(PacketHeaderSize + cLength);
        packet[0] = PacketVerificationValue;
        packet[1] = PacketVerificationValue;
        packet[2] = ProtocolType;
        packet[3] = ProtocolVerison;
        packet[4] = cLength & 0xFF;
        packet[5] = (cLength >> 8) & 0xFF;
        for (let i = 0; i < cLength; i++) {
            packet[1] ^= this._contents.buffer[i];
            packet[PacketHeaderSize + i] = this._contents.buffer[i];
        }
        for (let i = 1; i < PacketHeaderSize; i++) {
            packet[0] ^= packet[i];
        }
        this._contents.length = 0;
        return packet;
    }

    addContents(content, data) {
        const cLength = content.count * content.size + (content.multiple ? 1 : 0);
        data[0] = content.index;
        data[1] = cLength & 0xFF;
        data[2] = (cLength >> 8) & 0xFF;
        data[3] = content.multiple ? content.count : data[3];
        for (let i = 0; i < data.length; i++) {
            this._contents.buffer[i + this._contents.length] = data[i];
        }
        this._contents.length += data.length;
    }

    addReturn(callData) {
        const content = Object.assign({}, DeviceReturn);
        let buffer = [0, 0, 0, 0];
        for (let i = 0; i < callData.length; i++) {
            if (!Number.isNaN(callData[i].index) && !Number.isNaN(callData[i].repeat)) {
                buffer.push(callData[i].index);
                buffer.push(callData[i].repeat);
                content.count++;
            }
        }
        if (content.count > 0) {
            this.addContents(content, buffer);
        }
    }

    addDeviceMode(mode) {
        const content = Object.assign({}, DeviceMode);
        let buffer = [0, 0, 0];
        if (!Number.isNaN(mode)) {
            buffer.push(mode);
            content.count++;
        }
        if (content.count > 0) {
            this.addContents(content, buffer);
        }
    }

    addLedControl(rgb) {
        const content = Object.assign({}, LedControl);
        let buffer = [0, 0, 0];
        if (!Number.isNaN(rgb.r) && !Number.isNaN(rgb.g) && !Number.isNaN(rgb.b)) {
            buffer.push(rgb.r);
            buffer.push(rgb.g);
            buffer.push(rgb.b);
            content.count++;
        }
        if (content.count > 0) {
            this.addContents(content, buffer);
        }
    }

    addMelodyPlayScore(note) {
        const content = Object.assign({}, MelodyPlayScore);
        let buffer = [0, 0, 0, 0];
        for (let i = 0; i < note.length; i++) {
            if (!Number.isNaN(note[i].beat) && !Number.isNaN(note[i].pitch)) {
                buffer.push(note[i].beat);
                buffer.push(note[i].pitch);
                content.count++;
            }
        }
        if (content.count > 0) {
            this.addContents(content, buffer);
        }
    }

    addMelodyPlayList(melody) {
        const content = Object.assign({}, MelodyPlayList);
        let buffer = [0, 0, 0];
        if (!Number.isNaN(melody.title) && !Number.isNaN(melody.play)) {
            buffer.push(melody.title);
            buffer.push(melody.play);
            content.count++;
        }
        if (content.count > 0) {
            this.addContents(content, buffer);
        }
    }

    addServoControl(servo) {
        const content = Object.assign({}, ServoControlEach);
        let buffer = [0, 0, 0, 0];
        for (let i = 0; i < servo.length; i++) {
            if (!Number.isNaN(servo[i].id) && !Number.isNaN(servo[i].speed) && !Number.isNaN(servo[i].position)) {
                buffer.push(servo[i].id);
                buffer.push(servo[i].speed);
                buffer.push(servo[i].position & 0xFF);
                buffer.push((servo[i].position >> 8) & 0xFF);
                content.count++;
            }
        }
        if (content.count > 0) {
            this.addContents(content, buffer);
        }
    }

    addPwmControl(pwm) {
        const content = Object.assign({}, PwmControl);
        let buffer = [0, 0, 0];
        if (!Number.isNaN(pwm)) {
            buffer.push(pwm & 0xFF);
            buffer.push((pwm >> 8) & 0xFF);
            content.count++;
        }
        if (content.count > 0) {
            this.addContents(content, buffer);
        }
    }

    addDcControl(dc) {
        const content = Object.assign({}, DcControl);
        let buffer = [0, 0, 0, 0];
        for (let i = 0; i < dc.length; i++) {
            if (!Number.isNaN(dc[i].id) && !Number.isNaN(dc[i].speed)) {
                buffer.push(dc[i].id);
                buffer.push(dc[i].speed & 0xFF);
                buffer.push((dc[i].speed >> 8) & 0xFF);
                content.count++;
            }
        }
        if (content.count > 0) {
            console.log(buffer);
            this.addContents(content, buffer);
        }
    }
    
    addServoOffset(servoOffset) {
        const content = Object.assign({}, ServoControlCalibration);
        let buffer = [0, 0, 0, 0];
        for (let i = 0; i < servoOffset.length; i++) {
            if (!Number.isNaN(servoOffset[i].id) && !Number.isNaN(servoOffset[i].servoOffset)) {
                buffer.push(servoOffset[i].id);
                buffer.push(servoOffset[i].offset & 0xFF);
                buffer.push((servoOffset[i].offset >> 8) & 0xFF);
                content.count++;
            }
        }
        if (content.count > 0) {
            this.addContents(content, buffer);
        }
    }

    addHeartBeat(type) {
        const content = Object.assign({}, SignalHeartBeat);
        let buffer = [0, 0, 0];
        if (!Number.isNaN(type)) {
            buffer.push(type);
            content.count++;
        }
        if (content.count > 0 ) {
            this.addContents(content, buffer);
        }
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
                            type: ArgumentType.STRING,
                            defaultValue: '1',
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
                            type: ArgumentType.STRING,
                            defaultValue: '0',
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
                            type: ArgumentType.STRING,
                            defaultValue: '5',
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
                            type: ArgumentType.STRING,
                            defaultValue: '100'
                        },
                        GREEN: {
                            type: ArgumentType.STRING,
                            defaultValue: '100'
                        },
                        BLUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '100'
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
                            type: ArgumentType.STRING,
                            defaultValue: '2',
                            menu: 'dropdown_octave'
                        },
                        PITCH: {
                            type: ArgumentType.STRING,
                            defaultValue: '1',
                            menu: 'dropdown_pitch'
                        },
                        ACCIDENTAL: {
                            type: ArgumentType.STRING,
                            defaultValue: '1',
                            menu: 'dropdown_accidental'
                        },
                        BEAT: {
                            type: ArgumentType.STRING,
                            defaultValue: '4',
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
                            type: ArgumentType.STRING,
                            defaultValue: '1',
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
                            type: ArgumentType.STRING,
                            defaultValue: '1',
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
                            type: ArgumentType.STRING,
                            defaultValue: '0',
                            menu: 'dropdown_servo'
                        },
                        SPEED: {
                            type: ArgumentType.STRING,
                            defaultValue: '3',
                            menu: 'dropdown_speed'
                        },
                        ANGLE: {
                            type: ArgumentType.STRING,
                            defaultValue: '90'
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
                            type: ArgumentType.STRING,
                            defaultValue: '3',
                            menu: 'dropdown_speed'
                        },
                        ANGLE_0: {
                            type: ArgumentType.STRING,
                            defaultValue: '90'
                        },
                        ANGLE_1: {
                            type: ArgumentType.STRING,
                            defaultValue: '90'
                        },
                        ANGLE_2: {
                            type: ArgumentType.STRING,
                            defaultValue: '90'
                        },
                        ANGLE_3: {
                            type: ArgumentType.STRING,
                            defaultValue: '90'
                        },
                        ANGLE_4: {
                            type: ArgumentType.STRING,
                            defaultValue: '90'
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
                            type: ArgumentType.STRING,
                            defaultValue: '3',
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
                            type: ArgumentType.STRING,
                            defaultValue: '70',
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
                            type: ArgumentType.STRING,
                            defaultValue: '1',
                            menu: 'dropdown_dc'
                        },
                        SPEED: {
                            type: ArgumentType.STRING,
                            defaultValue: '3',
                            menu: 'dropdown_speed'
                        },
                        DIRECTION: {
                            type: ArgumentType.STRING,
                            defaultValue: '1',
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
                            type: ArgumentType.STRING,
                            defaultValue: '0',
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
                        {text: formatMessage({id: 'toybot.list_button_a', default: 'A'}), value: '1'},
                        {text: formatMessage({id: 'toybot.list_button_b', default: 'B'}), value: '2'}
                    ]
                },
                dropdown_color: {
                    acceptReporters: true,
                    items: [
                        {text: formatMessage({id: 'toybot.list_color_white',  default: 'White'}),  value: '1'},
                        {text: formatMessage({id: 'toybot.list_color_red',    default: 'Red'}),    value: '2'},
                        {text: formatMessage({id: 'toybot.list_color_orange', default: 'Orange'}), value: '3'},
                        {text: formatMessage({id: 'toybot.list_color_yellow', default: 'Yellow'}), value: '4'},
                        {text: formatMessage({id: 'toybot.list_color_green',  default: 'Green'}),  value: '5'},
                        {text: formatMessage({id: 'toybot.list_color_blue',   default: 'Blue'}),   value: '6'},
                        {text: formatMessage({id: 'toybot.list_color_navy',   default: 'Navy'}),   value: '7'},
                        {text: formatMessage({id: 'toybot.list_color_violet', default: 'Violet'}), value: '8'},
                        {text: formatMessage({id: 'toybot.list_color_off',    default: 'Off'}),    value: '9'}
                    ]
                },
                dropdown_octave: {
                    acceptReporters: true,
                    items: [
                        {text: formatMessage({id: 'toybot.list_octave_low',    default: 'Low'}),    value: '1'}, // 4 octave(0x40)
                        {text: formatMessage({id: 'toybot.list_octave_middle', default: 'Middle'}), value: '2'}, // 5 octave(0x50)
                        {text: formatMessage({id: 'toybot.list_octave_high',   default: 'High'}),   value: '3'}, // 6 octave(0x60)
                    ]
                },
                dropdown_pitch: {
                    acceptReporters: true,
                    items: [
                        {text: formatMessage({id: 'toybot.list_pitch_c', default: 'C'}), value: '1'},
                        {text: formatMessage({id: 'toybot.list_pitch_d', default: 'D'}), value: '2'},
                        {text: formatMessage({id: 'toybot.list_pitch_e', default: 'E'}), value: '3'},
                        {text: formatMessage({id: 'toybot.list_pitch_f', default: 'F'}), value: '4'},
                        {text: formatMessage({id: 'toybot.list_pitch_g', default: 'G'}), value: '5'},
                        {text: formatMessage({id: 'toybot.list_pitch_a', default: 'A'}), value: '6'},
                        {text: formatMessage({id: 'toybot.list_pitch_b', default: 'B'}), value: '7'},
                        {text: formatMessage({id: 'toybot.list_pitch_r', default: 'Rest'}), value: '8'},
                    ]                    
                },
                dropdown_accidental: {
                    acceptReporters: true,
                    items: [
                        {text: formatMessage({id: 'toybot.list_accidental_natural', default: 'Natural'}), value: '1'},
                        {text: formatMessage({id: 'toybot.list_accidental_sharp',   default: 'Sharp'}),   value: '2'},
                        {text: formatMessage({id: 'toybot.list_accidental_flat',    default: 'Flat'}),    value: '3'}
                    ]
                },
                dropdown_beat: {
                    acceptReporters: true,
                    items: [
                        {text: formatMessage({id: 'toybot.list_beat_oneeight', default: '1/8 of a beats'}), value: '1'},
                        {text: formatMessage({id: 'toybot.list_beat_onefour',  default: '1/4 of a beats'}), value: '2'},
                        {text: formatMessage({id: 'toybot.list_beat_onetwo',   default: '1/2 of a beats'}), value: '3'},
                        {text: formatMessage({id: 'toybot.list_beat_one',      default: '1 beat'}),         value: '4'},
                        {text: formatMessage({id: 'toybot.list_beat_onehalf',  default: '1.5 beats'}),      value: '5'},
                        {text: formatMessage({id: 'toybot.list_beat_two',      default: '2 beats'}),        value: '6'},
                        {text: formatMessage({id: 'toybot.list_beat_three',    default: '3 beats'}),        value: '7'},
                        {text: formatMessage({id: 'toybot.list_beat_four',     default: '4 beats'}),        value: '8'}
                    ]
                },
                dropdown_effect: {
                    acceptReporters: true,
                    items: [
                        {text: '1', value: '1'},
                        {text: '2', value: '2'},
                        {text: '3', value: '3'},
                        {text: '4', value: '4'},
                        {text: '5', value: '5'}
                    ]
                },
                dropdown_melody: {
                    acceptReporters: true,
                    items: [
                        {text: '1', value: '1'},
                        {text: '2', value: '2'},
                        {text: '3', value: '3'},
                        {text: '4', value: '4'}
                    ]
                },
                dropdown_servo: {
                    acceptReporters: true,
                    items: [
                        {text: '0', value: '0'},
                        {text: '1', value: '1'},
                        {text: '2', value: '2'},
                        {text: '3', value: '3'},
                        {text: '4', value: '4'}
                    ]
                },
                dropdown_speed: {
                    acceptReporters: true,
                    items: [
                        {text: '1', value: '1'},
                        {text: '2', value: '2'},
                        {text: '3', value: '3'},
                        {text: '4', value: '4'},
                        {text: '5', value: '5'}
                    ]
                },
                dropdown_dc: {
                    acceptReporters: true,
                    items: [
                        {text: '1', value: '1'},
                        {text: '2', value: '2'},
                        {text: formatMessage({id: 'toybot.list_all', default: 'All'}), value: '255'}
                    ]
                },
                dropdown_direction: {
                    acceptReporters: true,
                    items: [
                        {text: formatMessage({id: 'toybot.list_rotation_forward', default: 'Forward rotation'}), value: '1'},
                        {text: formatMessage({id: 'toybot.list_rotation_reverse', default: 'Reverse rotation'}), value: '2'},
                        {text: formatMessage({id: 'toybot.list_rotation_stop',    default: 'Stop'}),             value: '3'}
                    ]
                },
                dropdown_servo_all: {
                    acceptReporters: true,
                    items: [
                        {text: '0', value: '0'},
                        {text: '1', value: '1'},
                        {text: '2', value: '2'},
                        {text: '3', value: '3'},
                        {text: '4', value: '4'},
                        {text: formatMessage({id: 'toybot.list_all', default: 'All'}), value: '255'}
                    ]
                },
            }
        };
    }

    
    limit (value, min, max) {
        if (value < min) {
            value = min;
        } else if (value > max) {
            value = max
        };
        return value;
    }

    returnDelay(us) {
        return new Promise(resolve => {
            setTimeout(
                () => { resolve(); },
                us
            ); 
        });
    }

    get_ultrasonic_distance() {
        const out = this._peripheral._toybotInfo.distance / 10; // units: cm
        if(_DEBUG_BLOCK) console.log('get_ultrasonic_distance: ', out);
        return out;
    }

    get_button_state(args) {
        const state = this._peripheral._toybotInfo.button;
        const button = args['BUTTON'];
        let out = Number.NaN;
        switch (button) {
            case '1':
            case formatMessage({id: 'toybot.list_button_a', default: 'A'}):
                out = state[0] > 0 ? 1 : 0;
                break;
            case '2':
            case formatMessage({id: 'toybot.list_button_b', default: 'B'}):
                out = state[1] > 0 ? 1 : 0;
                break;
        }
        if(_DEBUG_BLOCK) console.log('get_button_state: ', out);
        return out;
    }

    get_analog_input() {
        const value = this._peripheral._toybotInfo.analog;
        const out = Math.round((value / 1024) * 100);
        if(_DEBUG_BLOCK) console.log('get_analog_input: ', out);
        return out;
    }

    get_servo_angle(args) {
        const angles = this._peripheral._toybotInfo.servo;
        const servo = args['SERVO'];
        let out = Number.NaN;
        switch (servo) {
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
                out = Math.round(angles[Number(servo)] / 10);
                break;
        }
        if(_DEBUG_BLOCK) console.log('get_servo_angle: ', out);
        return out;
    }

    set_led_color_name(args) {
        const rgb = {
            r: Number.NaN,
            g: Number.NaN,
            b: Number.NaN
        };
        switch(args['COLOR']) {
            case '1': // White
            case formatMessage({id: 'toybot.list_color_white', default: 'White'}):
                rgb.r = 0xFF;
                rgb.g = 0xFF;
                rgb.b = 0xFF;
                break;
            case '2': // Red
            case formatMessage({id: 'toybot.list_color_red', default: 'Red'}):
                rgb.r = 0xFF;
                rgb.g = 0x00;
                rgb.b = 0x00;
                break;
            case '3': // Orange
            case formatMessage({id: 'toybot.list_color_orange', default: 'Orange'}):
                rgb.r = 0xFF;
                rgb.g = 0x80;
                rgb.b = 0x00;
                break; 
            case '4': // Yellow
            case formatMessage({id: 'toybot.list_color_yellow', default: 'Yellow'}):
                rgb.r = 0xFF;
                rgb.g = 0xFF;
                rgb.b = 0x00;
                break;
            case '5': // Green
            case formatMessage({id: 'toybot.list_color_green', default: 'Green'}):
                rgb.r = 0x00;
                rgb.g = 0x80;
                rgb.b = 0x00;
                break;
            case '6': // Blue
            case formatMessage({id: 'toybot.list_color_blue', default: 'Blue'}):
                rgb.r = 0x00;
                rgb.g = 0x00;
                rgb.b = 0xFF;
                break;
            case '7': // Navy
            case formatMessage({id: 'toybot.list_color_navy', default: 'Navy'}):
                rgb.r = 0x00;
                rgb.g = 0x00;
                rgb.b = 0x80;
                break;
            case '8': // Violet
            case formatMessage({id: 'toybot.list_color_violet', default: 'Violet'}):
                rgb.r = 0x7F;
                rgb.g = 0x00;
                rgb.b = 0xFF;
                break;
            case '9': // off
            case formatMessage({id: 'toybot.list_color_off', default: 'Off'}):
                rgb.r = 0x00;
                rgb.g = 0x00;
                rgb.b = 0x00;
                break;
        }
        if(_DEBUG_BLOCK) console.log('set_led_color_name: ', rgb);
        this._peripheral.addLedControl(rgb);
        return this.returnDelay(DefaultBlockReturnDelay);
    }

    set_led_rgb(args) {
        const r = Number(args['RED']);
        const g = Number(args['GREEN']);
        const b = Number(args['BLUE']);
        const rgb = {
            r: this.limit(Math.round((Number.isNaN(r) ? 0 : r) * 2.55), 0, 255),
            g: this.limit(Math.round((Number.isNaN(g) ? 0 : g) * 2.55), 0, 255),
            b: this.limit(Math.round((Number.isNaN(b) ? 0 : b) * 2.55), 0, 255)
        };
        if(_DEBUG_BLOCK) console.log('set_led_rgb: ', rgb);
        this._peripheral.addLedControl(rgb);
        return this.returnDelay(DefaultBlockReturnDelay);
    }

    set_play_score(args) {
        let blockReturnDelay = Number.NaN; // units: ms
        let octave = Number.NaN;
        let accidental = Number.NaN;
        let pitch = Number.NaN;
        const note = [
            {
                beat: Number.NaN,
                pitch: Number.NaN
            }
        ];
        switch (args['BEAT']) {
            case '1':
            case formatMessage({id: 'toybot.list_beat_oneeight', default: '1/8 of a beats'}):
                blockReturnDelay = 63;
                break;
            case '2':
            case formatMessage({id: 'toybot.list_beat_onefour', default: '1/4 of a beats'}):
                blockReturnDelay = 125;
                break;
            case '3':
            case formatMessage({id: 'toybot.list_beat_onetwo', default: '1/2 of a beats'}):
                blockReturnDelay = 250;
                break;
            case '4':
            case formatMessage({id: 'toybot.list_beat_one', default: '1 beat'}):
                blockReturnDelay = 500;
                break;
            case '5':
            case formatMessage({id: 'toybot.list_beat_onehalf', default: '1.5 beats'}):
                blockReturnDelay = 750;
                break;
            case '6':
            case formatMessage({id: 'toybot.list_beat_two', default: '2 beats'}):
                blockReturnDelay = 1000;
                break;
            case '7':
            case formatMessage({id: 'toybot.list_beat_three', default: '3 beats'}):
                blockReturnDelay = 1500;
                break;
            case '8':
            case formatMessage({id: 'toybot.list_beat_four', default: '4 beats'}):
                blockReturnDelay = 2000;
                break;
        }
        switch (args['OCTAVE']) {
            case '1':
            case formatMessage({id: 'toybot.list_octave_low', default: 'Low'}):
                octave = 0x40;
                break;
            case '2':
            case formatMessage({id: 'toybot.list_octave_middle', default: 'Middle'}):
                octave = 0x50;
                break;
            case '3':
            case formatMessage({id: 'toybot.list_octave_high', default: 'High'}):
                octave = 0x60;
                break;
        }
        switch (args['ACCIDENTAL']) {
            case '1':
            case formatMessage({id: 'toybot.list_accidental_natural', default: 'Natural'}):
                accidental = 0;
                break;
            case '2':
            case formatMessage({id: 'toybot.list_accidental_sharp', default: 'Sharp'}):
                accidental = 1;
                break;
            case '3':
            case formatMessage({id: 'toybot.list_accidental_flat', default: 'Flat'}):
                accidental = -1;
                break;
        }
        switch (args['PITCH']) {
            case '1':
            case formatMessage({id: 'toybot.list_pitch_c', default: 'C'}):
                pitch = 1;
                break;
            case '2':
            case formatMessage({id: 'toybot.list_pitch_d', default: 'D'}):
                pitch = 3;
                break;
            case '3':
            case formatMessage({id: 'toybot.list_pitch_e', default: 'E'}):
                pitch = 5;
                break;
            case '4':
            case formatMessage({id: 'toybot.list_pitch_f', default: 'F'}):
                pitch = 6;
                break;
            case '5':
            case formatMessage({id: 'toybot.list_pitch_g', default: 'G'}):
                pitch = 8;
                break;
            case '6':
            case formatMessage({id: 'toybot.list_pitch_a', default: 'A'}):
                pitch = 10;
                break;
            case '7':
            case formatMessage({id: 'toybot.list_pitch_b', default: 'B'}):
                pitch = 12;
                break;
            case '8':
            case formatMessage({id: 'toybot.list_pitch_r', default: 'Rest'}):
                pitch = -1;
                break;
        }
        if (pitch > -1) {
            const temp = pitch + accidental
            let out = 0;
            switch (temp) {
                case 0:
                    out = (octave - 0x10) | 12;
                    break;
                case 13:
                    out = (octave + 0x10) | 1;
                    break;
                default:
                    out = octave | temp;
                    break;
            }
            note[0].beat = 0; // continue
            note[0].pitch = out;
        } else {
            note[0].beat = 0;  // continue
            note[0].pitch = 0; // rest
        }
        if(_DEBUG_BLOCK) console.log('set_play_score: ', note);
        this._peripheral.addMelodyPlayScore(note);
        return new Promise(resolve => {
            setTimeout(
                () => {
                    const rest = [
                        {
                            beat: 11, // 1/8 of a beats
                            pitch: 0  // rest
                        }
                    ];
                    this._peripheral.addMelodyPlayScore(rest);
                    resolve();
                },
                Number.isNaN(blockReturnDelay) ? DefaultBlockReturnDelay : blockReturnDelay
            );
        });
    }

    set_play_sound_effect(args) {
        const index = args['EFFECT'];
        const melody = {
            title: Number.NaN,
            play: Number.NaN
        }
        switch (index) {
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                melody.title = Number(index);
                melody.play = 1; // play
                break;
        }
        if(_DEBUG_BLOCK) console.log('set_play_sound_effect: ', melody);
        this._peripheral.addMelodyPlayList(melody);
        return this.returnDelay(DefaultBlockReturnDelay);
    }

    set_play_melody(args) {
        const index = args['MELODY'];
        const melody = {
            title: Number.NaN,
            play: Number.NaN
        }
        switch (index) {
            case '1':
            case '2':
            case '3':
            case '4':
                melody.title = (Number(index) + 12);
                melody.play = 1; // play
                break;
        }
        if(_DEBUG_BLOCK) console.log('set_play_melody: ', melody);
        this._peripheral.addMelodyPlayList(melody);
        return this.returnDelay(DefaultBlockReturnDelay);
    }

    set_servo_each(args) {
        const id = args['SERVO'];
        const speed = args['SPEED'];
        const angle = Number(args['ANGLE']);
        const servo = [{
            id: Number.NaN,
            speed: Number.NaN,
            position: Number.NaN
        }];

        switch (id) {
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
                servo[0].id = Number(id);
                break;
        }
        switch (speed) {
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                servo[0].speed = Number(speed);
                break;
        }
        if (!Number.isNaN(angle)) {
            servo[0].position = this.limit(angle, 0, 180) * 10;
        }
        if(_DEBUG_BLOCK) console.log('set_servo_each: ', servo);
        this._peripheral.addServoControl(servo);
        return this.returnDelay(DefaultBlockReturnDelay);
    }

    set_servo_all(args) {
        const speed = Number(args['SPEED']);
        const angle = [
            Number(args['ANGLE_0']),
            Number(args['ANGLE_1']),
            Number(args['ANGLE_2']),
            Number(args['ANGLE_3']),
            Number(args['ANGLE_4'])
        ];
        const servo = [
            { id: 0, speed: speed, position: Number.NaN },
            { id: 1, speed: speed, position: Number.NaN },
            { id: 2, speed: speed, position: Number.NaN },
            { id: 3, speed: speed, position: Number.NaN },
            { id: 4, speed: speed, position: Number.NaN },
        ];
        for (let i = 0; i < 5; i++) {
            if (!Number.isNaN(angle[i])) {
                servo[i].position = this.limit(angle[i], 0, 180) * 10;
            }
        }
        if(_DEBUG_BLOCK) console.log('set_servo_all: ', servo);
        this._peripheral.addServoControl(servo);
        return this.returnDelay(DefaultBlockReturnDelay);
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
        if(_DEBUG_BLOCK) console.log('set_servo_home: ', servo);
        this._peripheral.addServoControl(servo);
        return this.returnDelay(DefaultBlockReturnDelay);
    }
    
    set_analog_output(args) {
        const pwm = Number(args['PWM']);
        let out = Number.NaN;
        if (!Number.isNaN(pwm)) {
            out = this.limit(Math.round(pwm * 10.23), 0, 1023);
        }
        if(_DEBUG_BLOCK) console.log('set_analog_output: ', out);
        this._peripheral.addPwmControl(out);
        return this.returnDelay(DefaultBlockReturnDelay);
    }

    set_dc_run(args) {
        const id = args['DC'];
        let direction = Number.NaN;
        const dc = [
            { id: 0, speed: Number.NaN },
            { id: 1, speed: Number.NaN },
        ];
        switch (args['DIRECTION']) {
            case '1':
            case formatMessage({id: 'toybot.list_rotation_forward', default: 'Forward rotation'}):
                direction = 1;
                break;
            case '2':
            case formatMessage({id: 'toybot.list_rotation_reverse', default: 'Reverse rotation'}):
                direction = -1;
                break;                
            case '3':
            case formatMessage({id: 'toybot.list_rotation_stop',    default: 'Stop'}):
                    direction = 0;
                    break;
        }
        switch (args['SPEED']) {
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                const speed = Number(args['SPEED']) * 51 * direction;
                dc[0].speed = speed;
                dc[1].speed = speed;
                break;
        }
        switch (id) {
            case '1':
            case '2':
                this._peripheral.addDcControl([dc[Number(id) - 1]]);
                break;
            case '255':
            case formatMessage({id: 'toybot.list_all', default: 'All'}):
                this._peripheral.addDcControl(dc);
                break;
        }
        if(_DEBUG_BLOCK) console.log('set_dc_run: ', dc);
        return this.returnDelay(DefaultBlockReturnDelay);
    }

    set_servo_offset(args) {
        const id = args['SERVO'];
        const position = this._peripheral._toybotInfo.servo;
        const offset = this._peripheral._toybotInfo.servoOffset;
        const servoOffset = [
            { id: 0, offset: position[0] - 900 + offset[0] },
            { id: 1, offset: position[1] - 900 + offset[1] },
            { id: 2, offset: position[2] - 900 + offset[2] },
            { id: 3, offset: position[3] - 900 + offset[3] },
            { id: 4, offset: position[4] - 900 + offset[4] },
        ];
        switch (id) {
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
                this._peripheral.addServoOffset([servoOffset[Number(id)]]);
                break;
            case '5':
            case formatMessage({id: 'toybot.list_all', default: 'All'}):
                this._peripheral.addServoOffset(servoOffset);
                break;
        }
        if(_DEBUG_BLOCK) console.log('set_servo_offset: ', servoOffset);
        return this.returnDelay(DefaultBlockReturnDelay);
    }

    set_servo_reset() {
        const servoOffset = [
            { id: 0, offset: 0 },
            { id: 1, offset: 0 },
            { id: 2, offset: 0 },
            { id: 3, offset: 0 },
            { id: 4, offset: 0 },
        ];
        if(_DEBUG_BLOCK) console.log('set_servo_reset: ', servoOffset);
        this._peripheral.addServoOffset(servoOffset);
        return this.returnDelay(DefaultBlockReturnDelay);
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