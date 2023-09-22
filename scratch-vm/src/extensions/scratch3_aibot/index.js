  

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
const log = require('../../util/log');


// The following are constants used within the extension

const sensorTypes = {
    SERVO_CONTROL: 0,
    HOME_CONTROL: 1,
    PORT_CONTROL: 2,
    PORT_OUT_CONTROL: 3,
    BUZZ_CONTROL: 4,
    SERVO_SPEED: 5,
    SET_SERVO_OFFSET_ZERO: 6,
    SET_SERVO_HOME_POS: 7,
    AIDESK_CONTROL: 8,
    REMOTE_DEVICE: 9,
    CONNECT_DEVICE: 10,
};
     
/**
 * A maximum number of BT message sends per second, to be enforced by the rate limiter.
 * @type {number}
 */
const BTSendRateMax = 10;
const SRSendInterval  = 100;



const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI1MHB4IiBoZWlnaHQ9IjUwcHgiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNTAgNTAiIHhtbDpzcGFjZT0icHJlc2VydmUiPiAgPGltYWdlIGlkPSJpbWFnZTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgeD0iMCIgeT0iMCIKICAgIGhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBRElBQUFBeUNBWUFBQUFlUDRpeEFBQUFCR2RCVFVFQUFMR1BDL3hoQlFBQUFDQmpTRkpOCkFBQjZKZ0FBZ0lRQUFQb0FBQUNBNkFBQWRUQUFBT3BnQUFBNm1BQUFGM0NjdWxFOEFBQUFCbUpMUjBRQS93RC9BUCtndmFlVEFBQUEKQ1hCSVdYTUFBQTdFQUFBT3hBR1ZLdzRiQUFBTzUwbEVRVlJvM3UyYWE0eGRWM1hIZjJ2dmZjNjU1OTZaTzU3eDJJNHpUaHc3eEhGZQpoRUJ3SUJDU0dFaFNxQ2hWS1VWSWZLajRVQ2dWSCtBREZhZ2ZrR2lGV2dHS1VvbFVhZ0dKbDNpVU40Z29TZ0tpQklvcUFXbXd5VGpCCklYN0U5b3puZVIvbm5QMVkvWEFuZGtMR1RneUVJc1NTanU3UlBlZXN1LzU3cmZWZmE2OXpSVlg1UXhEei8yM0FINEg4b1FKeDlXZGYKZGs0UGhHcUFtYm1VOHJLYjhZL3Z3eDU3RUxPNlN0aVdNN2hNeVl4bjJFQWR3QXBrRmg2ZnU4V3BHZ2UwUVVDMDJySDFyc0dSdWV2ZgpKbEsvWGhuc3NLWS9uYm1WTGpLMVVGVmJQK3hENS9ienB1K3FGRkFGNUJtQS9DNVd5MGpjaWFtdnM3YStTVVRMRU1xN0ZUN2U3Wng0CmozV0h0OWRORURFZ0JNcFdmN00xOHM2VjNnVUhnQzg5YTQvOHRvMCtmUHpHWFdLcWR4dmJ2eUdsY2piNHNUdGFyZm4zNWRuQ2k4VDIKMjZDa01QNG44NHRYdjNteWUyZ215MnJKTWlGRWFPcUk5MUMyam01Vk5SOCtmbkx2c2MwYjc3My9kd2RremZWSDUyKzhzbFBPZmFUZApmdndHTWZORlhZM3Y4bjd6dFdVeGY1NjF5emF0TWIxa3l4dHNhM2x2NWlyanJHQU1OQUl4R29JS2tvYlM2VHk2UFNYN0gzTUxlLzkyCmV2TGUrNTdSNjc4TkhMUFpEYTFIVi9lOHBvd0xkNVJoYm0vZUxCYzJRVjZzMkxKOGVBYTdiTk9UN2hjRmwvV05TQmpGdjRJelNsRTQKbkVEd0NlOGJOblFQN0c2M1RueGtmbkh2SzNpR2N2ZGJBWktaNXJhSmF1NzJtWU9QM09RZnJNM3lRdzYvQkxrVFJFQllzM1l0WVJNUQprNDVzVzd0a1JHZzVKWE1qOTRZQWpZOU1iZGgvZGFzNCtmNjVoVmZ0T2o1LzZ4bnQvWTJCSFBBdk5tMlczek9Wamp6UERpcTZ6U29jCnJHam1CQ29oend3b2F3dXFDT0RNT2hTMEJpalBER1U3dzJXRzRDTStLQnMzek41WXR1YnVSSmd5QnRZN3pqMUhWQkZqd1JWZ00wb0cKLzl4TngxNG8waEJGS1FVcUovaGVJZzJGMWhpa0tQZzQ4b0N6a051UkttR05XcDhFeGhrUVVWS0VDcUh4RVIrR1lzM1I2NDJPZjJCNQpJYnh0UGJQT0dZaTRqRWRYdDk5WS9PVEF1MmhrTUpVT3Y3YkZTcTVZTUdBUUpFVjhyMEZxUnd0TFlVR1RrTmE4a1ZsSUNkYUxleEV3CnFzU2crQ1lDaXFKNG4vQk52akpZRE92YWRVNUFEcm9iMnNhRlYzYkNzWCthV0oyOTBvclFTbW5rSVFXYlJ2RS82QVhpaEVldElVWkwKWm9RaWd5WW9JU29PRUNOckxua1NDQVBHR0JxZmFPcElqUDdVdGJyZTlyQVAzZHQ5czM3V254TVFnODZNNmZ3SHgrUHM1VlgwdERJTApZay9STHlxc05GQjN4dFJlVkZCT1JKR2tSSVRNQ2xXVmFIekVsbzdDbm9yVTA1R1ZRSTFTMVpFbUJFQlFiYWxxSjhVNCtUMGRmdmFJCmM2eGI1WjA3QnlpR21PWGkyNlUxaU9UNHBDUURGaEFFanpDM05GVlZ1M2JmMmUzTTNUVGUvZmtML0ZEQlFGVWxxdHFQSENBUW9tTFgKdkNJaXFNS3dpb1NCanU3VFNOSzJWdFdlZTVKMjdrMnA4L1drWUlTblVaUXFHRzJhdFlDRlU5UnhobU9IM3I4dnFqc1JFelJKY2FmNApFeUt3V0VWV1pmYzN2RXorWStXbjM3R3dkTkVCR05XRlhoVlJZOGhiRHArVUtvQ1BwL01DQlIrVnludFVJTThMeWpLbkxJZmphSDZ2Ck5KOS9rSHdFSXMxYTBrOGM4b0RGN1hPVUJ6S2NPVzg3YVhtQlZBMFFjM1kyZnRSZS8veHhQVDVWb1NRU3RRakZtcC83VVRnNTJINnkKYm0zK1VIdmgwL1BicnNyblR5eGY5ejRONFk1V2NYaUxkVG5HUmtRQ2NXMEJtcWdJaGx4R1RKVm5ocEFzQ2hneFFCU3h2WjA0blloMQpCaWN5Sk5ib01VRUdJMithWEhBdGh6SFQyOUdzSUZXUjFBaXBZZlFaaGFSUFBWcjAzcGV6c0QyaDVOWVFCWUlJRGNwQzFXMTZ4ZTZQClVoUS82aDFTcXA2eTQrSWZmV0ZsY1A2N2hzMkZKenZkdHJZS082THZ0VENQT3ZKc2lJb1l5TjNhOXlIaEcwOVZCYXErRGFuS0IrbEUKRzM3WlFRNW1vOUJxQVRsb0Rwb3BqdWdSNDVCT2hoUlAvQVJvb3pES053NjZWeGhEdUdaS0Q5N1Mwc1ZNUlJBUmNrbFVKSVpEV1BVegpEeDMrL2hmL3dSaFlPUXpUdXl5VDJ4d3pVLy85bVVQSFh0WVlrWDl0bGYwdFVVWTB6Qk5na3RLSUlDb002MGhWQlViMEFDazUwbkpuCk1TM1pxVmk4cml2ajMxeWhwNUNlSGkwT3dJNWZnRnhhb3VjdlFiQmdJdWwvaHZETEFLV0E2RmduTGR5ZTYxSlhHQ1czSCtVd0s3M0kKU25QWnNlSFl4ZThXK1FITjZranI0RUhIY3RhbXFSSkQyLzFLWEpBOTNhMkRkN1FuajdaakNDUTFpSXd5dHdtSnVsRjhDQmlYU0NJWQpCZnBLZWVLaHkwM3dIdy9sOW45TEt1ODlVOWlQT010a1NKRkJhU0JZMUNqNEJQM0V3YzdOR3dxR2J5L2wrQjVEWmRCUlBCdFZlblZrCnVOcU5kZmVDYnp6MjVVL2RMVG04NGdNek5ESWt6RVlHaDJCKzA4M0doRGlUNW9ldkhqWUxKVVBRTWhDZEFSbFJSWW90Q0lLR1F0VzMKc0w0bm9hZm9zWUFkREJrdkRrd1ZadW5kdy9PdWVFMWpOMzhvN2YvS0o4MjZRRFNOQWpZcWhCRkRtY3ZHMFk1SGpxY0w4N0R5RjZURgpUSjlVdmFJcXcwT2VZWG5WRDV1dytZN3UrWlpMMzdLSkxic242YWRJTTBqay9SWkwxbmNMNmIrSGxTTlg4TC9MVW05eHlQbVRWR2JqCklQckp4MU0rL2pET0xGQ0pqY3V1cjlGRTA5UXpNdXh0ZDdFLzNjME9iczZreHRXSDgwS09YOTB2ZG40bzIzWHo2d0pqOXlkYTkranMKRng4NERlUlhKU3AyMnpneDk1aTV0TE1JaTdzTW9HWkVsVDRxcTMybGF1L3MrVzJiMzYrem4zbmcwcithWnZ0MVc0R0dhamxpU2loMwpHTXd4bjVkdWVGa3F2VzNHeGtoK0RPYTZPb3lYZkM0eThjRncrTk96blFzczJXckIwZnVIQksrb2hjMjMvWFczMEtVL1RhYTVnM2hvClNuM0VtY0JFYzJCVDRORTM5TUsyV3hxMzhVMWNjdXM5aldsOWVWMGdEeCs4dHExTzJyS3FaYUdydHhaaGFTelB3SXNRVVBwVlpMQmkKU0ZmTlBOVHE5alowcnR5N3ZhOWE3ZHRuYTZCSjhkSm13L1JkZ1FMMDhUU29VdjZkM0U3c01ac21DODA3Q1YwMmFURHhzZDc5bjU1dAo3UUMxb0ZZeHhhamdKUVBMMy9uRXl2UXIzL3lsU3JhOVBHSC9Nc3VPYnlUVklqRWlvU0k3c3E5YmJEQjc3UFRXYTFheXkzWStEY2pzCkl5OW81MW4xMW53czNGTFkvdlB6eFJOYjdjcEFFaFlEOUFhQlFTOGdsNDV4NFl0T3ZGRGMwcWRxbnk5V1ZYbkErK3luSWRqOVRaM2YKTGNpc0pFR1Z5Z2YzMVZMeWQ5RHV1S0ZwTjdwME1sTVZYL2ZCTnFNZWF6MlJCejVYTmRmODJYdWphZC9abVBQZm5PbkpOK2IreUhZLwpYREFZSmU4WVJDRDRyRDROeENad2lvaHU3YlRuLzI0c205OXBWaXZINGhDY1FXWEVWaFlobTg2eE13VjUyWmVVRnZOUzdSYlh5amZWCllxOVRLM0haYjcxN1llN1ZmNSs3Ky9aZE1YVWcvR3p4a2djeHhiRWlIWjF1YXVlcU1INDRXVE1mNDRpRHpWbmFwSTNIdjdXVVpiSjAKZk9xMng2SzI3cXBreTR1Yk1iMDJiNTk4Zml0LzdIbVZqdmNhcytGakl4Vk9ZYUZrOXZFOWVXdXk5N3BXNi9HZE1yZmtPQ1JRbVJFRgpyL0YrYmd6Smd2cWExWVVhVEVNMm9nY1RtMkNFbUJrNnU2RzdLWVVBR3JsaWFuOTRiUG5DSCtVK1hPRldqcGlrTDF6RXBsNnJhOUJWCjhITkMyVHI3dkdmNnhMZVhFTzRMWHU4N3V2bE5MYUg5c2xYRzMxaFRMaTc4OFBQZmRZaEJYRUxuMitDNXlHM3M3VFZoNlBTWVE1WVYKaXRQRkt3UklRZEFtNG1NUDB5U01NemdMcUVWWlcySnNqVWdVRlNDQktoWDUxek1tM3BDRzh4T3hOZmFJTVM2NlhJaUxNUERBZVhIVQo4ajNEL0FxZy8xK2ZxRHJUY2svUnNmZjBWMGQ1NVg1MmVHS0dwSk1tNnFhczAreDFWZHh0VWtLR28xM2FhTjQwWXVqYVFIQ0pPS25vCmhJenFENk1xcjJ2YkN3RlFWSlNVVkFpMVFVM0NwOWIzQjZGMTBnOG1pemkyOFU1TnN1SUhvNjV4c0F5OWt3SFNhTnVhbnUxY1hkWWEKVHNCMXc5eC90a3g5U2FiMXVBNEhOaTZzR0prTUlKWm9GWVBnRlBwVklsMFVZVXF3cFVCdVRqZkdUeE8xSXVxRy9jREJINTlFMnVCbgoyZ3NoYnZta2JwemFtV3oyM2Q3M1A5NFllL3FKSjg1REF6U01FdkljeEJIcXduRm9RNjRENDRNUTVpMHBHOE9rR3BzbEpDbE5ndDU4ClJlc2FRM20rSXlxa2VnUml0Q0ptRFZGYU81ZElvcEdKaEx5a3hqOWdhZjNpVzJtdy9iVWZUWVZycjM3dkU0MzhTZ2pKNlRidjF4SlgKTS9idE10bkxremE1VVV0V0tjd1o4R0NNRWhMMGZTTGxnbk1GWlFhREprSVVmQmlQVGRwOG9wSnNFSk5tVFNpV05HWExNWGEvbk5RYwpKSSs0OHlEdWQ0Z1h6T3hYajY4dVZHZTI1amQ0VmVNQzdYL3ZtUXV1amJSZmJEUmxsc2F4NmwyeTBUaE5wQ2hvZ254REFYT1dRUk5wClNIaWYwNCs3ZjZ6dGlmZGltVlUxbmNudXZmdU1FWWFEaXVBajBRdGFDYWxTN0xNWVJQOG00bWFHOXoyQzhPb2pyWnUyR0lrdnNkUXYKeit6Z1doZUd6OHZ5L3NhOFBXeDE2MXJFMTZ6K3ZHWlFCUkFsbFIydHo5LzBCZFBpdTFlOTRKRm0vNzd0cmVYQlRWczFtWDd3cmpkVwpmQzBaWjlGY1lNcWd5OER3T1FSeXlxdGk1NkxhdXlMNWZZMFpiMGtNUlRibDN6NXgwYkYzdGhhT2RPaURtWXhJbzZnazdJWkdPdDNGClcyT3IvWXY5KzdmOXZGVU8vNmJNRi85OE1OendOU2ovWmN1MlRRZWYwQzBYR3VidnJWajVRZlBjQTlrMnZDY0JGWkdLNWJRaTE1Y2MKRzl1enluaXlqQXRXYzRvS2pJK29HRnllTTFZZXZsRnM1eVVpRXRGaFMvMktxNGJsbGFMbGVBcHJveHdCazBOcUZLM2xPWHUxOU5UbQpvRm1iYUx6SXdRNEx5MmxTWTJXOXJZaldvS1ZpMXlxd01RSFJPU3YrWkJ1QmxBSXhLQnE4MHlSbTJPdWZVaXRHeVhjYXNxT0o4Rk5CCk9zOGhFUEdnRHNLTW9ydnNpRityWkpLdEpEQUFHVzJvbjhqWEJHaUs2Rm94RVRGQVRsSVZUUkNhcDRaUk5nUGRQVEJjaE5WRHArdkcKcjBxcVI4V1gvRnlCUEttb3hSbWx2bHlSUVFNS0tUR01NZmRpU3ljU2dmUlVoalQyVkRWWHRjVFVTYWcwNjVVRTM0UHhDMEZlbzFTZgpBVnV3TG91WkFDeUR4bk1Fb28waUZmaXJ3RjhNRWs0dmUwenRML1dHT3ljeU8vbXFkamw3bVRIMUdSVTFmbU05R083OFZreWR1MUp5CmgzV2RBWUVmUU40VkxuN3JtUk1sSytIUXZZbGozMUE0N3h5QVpMZE5JQXEyRFhrSjhxUVo4Y20rUm1QdGlyaThQOXBlcTZ5M2pBcUkKT0JYakZraG1EcU9OeTdQMTc4c2hIK09NeGM5WXVPQ1YwSmtNckg0N29WdWVYUUZ5dXNtT3pJdWo0OGs5VHViQ1RlMzI0bHNzUzV0Rgo0NW0xcWVLeVh0RzI4NjhmRHFlZE51Nm5yc2hXbnYxNlBoVnRaMHJJWCtvb1d4RjdGRFE4ODJQT3I1eXRaUWk3YzN2NEF1S0NLR2Z2CnNZMzBwQ3dPYm15YThtcWtNNVZTZXVUWEFnTFVQY1VXd3VTMWh1YWJDUjBDMmRtZmNUSDRNMTdVUk04M1diRFVtWml6YUJKQk5kSFUKU3ZUME5ScGY5d2UvTG80MU5FQUR0aWd3dFR6anUzWW5adzAvQ1loZGUvbG56cTZKaUdBVU1SRkl6elJIZmxhU1EzcXBSMzZjd1NFegpHcE9leWRJLy9qdm85MHorQ09UM1RmNFByWHpETW00YjAyTUFBQUFsZEVWWWRHUmhkR1U2WTNKbFlYUmxBREl3TWpNdE1Ea3RNakJVCk1EUTZNRGM2TXpNck1ESTZNREFJa0dLeUFBQUFKWFJGV0hSa1lYUmxPbTF2WkdsbWVRQXlNREl6TFRBNUxUSXdWREEwT2pBM09qTXoKS3pBeU9qQXdlYzNhRGdBQUFBQkpSVTVFcmtKZ2dnPT0iIC8+Cjwvc3ZnPgo=';
// flag to indicate if the user connected to a board

// common

const Message = {
    name: {      
        'en': 'AIBOT',
        'ko': 'AIBOT'
    },
    angle_control_1234: {
        'en': 'modules 1[ANG1], 2[ANG2], 3[ANG3], 4[ANG4] degrees',
        'ko': '모듈 1[ANG1], 2[ANG2], 3[ANG3], 4[ANG4] 각도로 제어'    
    },
    remote_angle_control_1234: {
        'en': 'remote modules 1[ANG1], 2[ANG2], 3[ANG3], 4[ANG4] degrees',
        'ko': '원격모듈 1[ANG1], 2[ANG2], 3[ANG3], 4[ANG4] 각도로 제어'    
    }      
}

class aibotSR{
    constructor (runtime, extensionId) {
    //the_locale = this._setLocale();
        /**
         * The Scratch 3.0 runtime used to trigger the green flag button.
         * @type {Runtime}
         * @private
         */
         // the pin assigned to the sonar trigger
         // initially set to -1, an illegal value
         this.sonar_report_pin = -1;

        
         // general outgoing websocket message holder
         this.msg = null;
         

         this.ble_str = null;

         this._runtime = runtime;
         
         this._runtime.on('PROJECT_STOP_ALL', this.stopAll.bind(this));
         
         this._extensionId = extensionId;
 
         this.connected = false;
         this._serial = null;
         this._runtime.registerPeripheralExtension(extensionId, this);

         this._timeoutID = null;
        
         this.pin_modes = new Array(34).fill(-1);
    
         this._rateLimiter = new RateLimiter(BTSendRateMax);
 
         this.reset = this.reset.bind(this);
         this._onConnect = this._onConnect.bind(this);
         this._onMessage = this._onMessage.bind(this);

         this.rcvCount = 0;
         
         this.array = {
            SERVO_CONTROL: 0,
            HOME_CONTROL: 1,
            PORT_CONTROL: 2,
            PORT_OUT_CONTROL: 3,
            BUZZ_CONTROL: 4,
            SERVO_SPEED: 5,
            SET_SERVO_OFFSET_ZERO: 6,
            SET_SERVO_HOME_POS: 7,
            AIDESK_CONTROL: 8,
            REMOTE_DEVICE: 9,
            CONNECT_DEVICE: 10,
        };

        this.sensorData = {
            SENSOR: {
                A0: 0,
                A1: 0,
                A2: 0,
                A3: 0,
                A4: 0,
                A5: 0,
                A6: 0,
                A7: 0,
                A8: 0,
                A9 : 0,
                A10: 0,
                A11: 0,
                A12: 0,
                A13: 0,
                A14: 0,
                A15: 0,
                A16: 0,
                A17: 0,
                A18: 0,
                A19: 0,
            },
            AIDESK: {
                AD0: 0,
                AD1: 0,
                AD2: 0,
                AD3: 0,
                AD4: 0,
                AD5: 0,
            },
        };

        this.delayTime = 1000;
        this.timeouts = [];
    }
    stopAll () {



    }
    
    reset () {
        this.pin_modes.fill(-1);
    }
    _onConnect () {
        console.log('connected AIBot....');
        this.connected = true; 
        
        this._timeoutID = window.setInterval(
            () => this._serial.handleDisconnectError('SerialDataStoppedError'),            
            3000000
        );
                  
    }
    scan () {
        console.log('scanning....');
        if (this._serial) {
            this._serial.disconnect();
        }
        this._serial = new SR(this._runtime, this._extensionId, {
            majorDeviceClass: 0,
            minorDeviceClass: 0
        }, this._onConnect, this.reset, this._onMessage);
    }
    /**
     * Called by the runtime when user wants to connect to a certain LECOBOARD peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     */

    connect (id) {
        if (this.connected) {
            // ignore additional connection attempts
            //console.log('connect ignored....');
            return;
        }
        if (this._serial) {
            this._serial.connectPeripheral(id);
            //console.log('connected....');
        }
    }    
    disconnect () {
        window.clearInterval(this._timeoutID);
        console.log('disconnect....');
        if (this._serial) {
            this._serial.disconnect();
        }
        this.connected = false;
        this.reset();
    }   
    /**
     * Send a message to the peripheral BT socket.
     * @param {Uint8Array} message - the message to send.
     * @param {boolean} [useLimiter=true] - if true, use the rate limiter
     * @return {Promise} - a promise result of the send operation.
     */
    isConnected () {        
        let _connected = false;
        if (this._serial) {
            _connected = this._serial.isConnected();
        }
        return _connected;
    }
    send (message, useLimiter = true) {
        //console.log('send message....');
        if (!this.isConnected()) return Promise.resolve();

        

        if (useLimiter) {
            if (!this._rateLimiter.okayToSend()) return Promise.resolve();
        }

        return this._serial.sendMessage({
            message: Base64Util.uint8ArrayToBase64(message),
            encoding: 'base64'
        });
    }
    generateCommand (byteCommands) {
        let command = [];
        // Bytecodes (Bytes 7 - n)
        command = command.concat(byteCommands);
        //this.sensorIdx = 0;
        return command;
    }
    
    getDataByBuffer (buffer) {
        const datas = [];
        let lastIndex = 0;
        
        buffer.forEach((value,idx) => {
            if (value == 73 && buffer[idx+1] == 1) {      
                if( buffer.length > (idx+28) )          
                datas.push(buffer.subarray(idx, idx+28));
                idx = idx + 28;
            }
            else if (value == 88 && buffer[idx+1] == 1) {     
                if( buffer.length > (idx+14) )             
                datas.push(buffer.subarray(idx, idx+14)); 
                idx = idx + 14;
            }
        });
        return datas;
    }

    _onMessage (params) { 
        //console.log('onMessage....');         
        window.clearInterval(this._timeoutID);
        this._timeoutID = window.setInterval(
            () => this._serial.handleDisconnectError('SerialDataStoppedError'),
            3000000
        );
        if(params==null){
            return;
        }         
        
        const message = params.message;
        const dataOrigin = Base64Util.base64ToUint8Array(message);
        const datas = this.getDataByBuffer(dataOrigin);
        var sd = this.sensorData.SENSOR;
        var ad = this.sensorData.AIDESK;
        var val = 0;
        var data = datas[0];
        if(data != null)             
        if(data[0]==73 && data[1]==1){  //'I'
            for (var i = 0; i < 4; i++) {
                sd[i] = data[2+i];	
            }
            for (var i = 0; i < 4; i++) {
                val = (((data[6+i*2] & 0xFF) << 8) | (data[6+i*2+1] & 0xFF));
                sd[4+i] = val;  	
            }
            //console.log(data);
        }
        if(data[14]==73 && data[15]==2){  //'I'
            for (var i = 0; i < 4; i++) {
                sd[8+i] = data[14+2+i];	
            }                
            for (var i = 0; i < 4; i++) {
                val = (((data[14+6+i*2] & 0xFF) << 8) | (data[14+6+i*2+1] & 0xFF));
                sd[8+4+i] = val;  	
            }
            //console.log(data);
            this.rcvCount++;
            if(this.rcvCount > 2){
                this.rcvCount==0;
                this.connect_device(1);
            }
        }
        
        var s = 0;
        if(data != null)  
        if(data[s]==88 && data[s+1]==1){//'X'
            for (var i = 0; i < 6; i++) {
                val = (((data[s+2+i*2] & 0xFF) << 8) | (data[s+2+i*2+1] & 0xFF));
                if(val>32767)val=val-65536;
                if(val>-2000 && val<2000)ad[i] = val;  	
                
            }
        }	

        return;
    }
    
    port_digital_out(remote,port,set){
        const cmd = this.generateCommand(                
            [68,remote,port,set,255,255,255,255,255,255,255,255,255,255]
            );        
        this.send(cmd);
        //console.log('port digital out...');
        //console.log(cmd);
    }
    port_setting(remote,port,set){
        const cmd = this.generateCommand(                
            [80,remote,port,set,255,255,255,255,255,255,255,255,255,255]
            );        
        this.send(cmd);
        //console.log('port setting...');
        //console.log(cmd);
    }
    buzzer_melody(remote,melody){
        const cmd = this.generateCommand(                
            [77,remote,melody,0,0,255,255,255,255,255,255,255,255,255]
            );        
        this.send(cmd);
        //console.log('buzzer melody...');
        //console.log(cmd);
    }
    control_speed(remote,speed){
        const cmd = this.generateCommand(                
            [83,remote,speed,0,0,255,255,255,255,255,255,255,255,255]
            );        
        this.send(cmd);
        //console.log('control speed...');
        //console.log(cmd);
    }
    control_go_home(remote){
        const cmd = this.generateCommand(                
            [72,remote,0,0,0,255,255,255,255,255,255,255,255,255]
            );        
        this.send(cmd);        
    }
    factory_reset(remote){
        const cmd = this.generateCommand(                
            [67,remote,0,0,0,255,255,255,255,255,255,255,255,255]
            );        
        this.send(cmd);        
    }
    set_home_position(remote,sv1,sv2,sv3,sv4,sv5,sv6){
        const cmd = this.generateCommand(                
            [
                67,remote,
                sv1>>8, sv1&0xff,
                sv2>>8, sv2&0xff,
                sv3>>8, sv3&0xff,
                sv4>>8, sv4&0xff,
                sv5>>8, sv5&0xff,
                sv6>>8, sv6&0xff               
            ]
            );        
        this.send(cmd);
        //console.log('control angle...');
        console.log(cmd);
    }
    control_angle(remote,sv1,sv2,sv3,sv4,sv5,sv6){
        const cmd = this.generateCommand(                
            [
                66,remote,
                sv1>>8, sv1&0xff,
                sv2>>8, sv2&0xff,
                sv3>>8, sv3&0xff,
                sv4>>8, sv4&0xff,
                sv5>>8, sv5&0xff,
                sv6>>8, sv6&0xff               
            ]
            );        
        this.send(cmd);
        //console.log('control angle...');
        //console.log(cmd);
    }
    remote_device_set(remote,v1,v2,v3){
        const cmd = this.generateCommand(                
            [90,remote,v1,v2,v3,255,255,255,255,255,255,255,255,255]
            );        
        this.send(cmd);        
    }
    aidesk_func(remote,func,v1,v2,v3,v4){
        if(v1<0)v1=65536+v1;
		if(v2<0)v2=65536+v2;
		if(v3<0)v3=65536+v3;
		if(v4<0)v4=65536+v4;
        const cmd = this.generateCommand(                
            [
                75,remote,func, 0,
                v1>>8, v1&0xff,
                v2>>8, v2&0xff,
                v3>>8, v3&0xff,
                v4>>8, v4&0xff,
                255, 255               
            ]
            );        
        this.send(cmd);
        //console.log('control angle...');
        //console.log(cmd);
    }
    connect_device(remote){
        const cmd = this.generateCommand(                
            [65,remote,0,0,0,0,0,0,0,0,0,0,0,0]
            );        
        this.send(cmd);   
        //console.log(cmd);     
    }
    removeTimeout(id) {
        clearTimeout(id);
        var timeouts = this.timeouts;
        var index = timeouts.indexOf(id);
        if (index >= 0) {
            timeouts.splice(index, 1);
        }
    }

}

class Scratch3aibotSR {
    /**
     * The ID of the extension.
     * @return {string} the id
     */
     static get EXTENSION_ID () {
        return 'aibot';
    }

    /**
     * Creates a new instance of the lecoboard extension.
     * @param  {object} runtime VM runtime
     * @constructor
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.  
         * @type {Runtime}
         */
        this.runtime = runtime;

        this.locale = this._setLocale();

        // Create a new aibotSR peripheral instance
        this._peripheral = new aibotSR(this.runtime, Scratch3aibotSR.EXTENSION_ID);

    }

    getInfo() {
        //the_locale = this._setLocale();
        //this.connect();

        return {
            id: Scratch3aibotSR.EXTENSION_ID,
            color1: '#0f83bd',
            //color2: '#34B0F7',
            name: 'AIBOT',
            showStatusButton: true,
            blockIconURI: blockIconURI,
            blocks: [ 
                {
                    opcode: 'analog_read',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'aibot.analoginput',
                        default: 'read [PORT] analog input',
                        description: 'Read Analog Input Value'
                    }),
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: '0',
                            menu: 'target_port'
                        },
                    }
                },              
                {
                    opcode: 'digital_read',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'aibot.digitalinput',
                        default: 'read [PORT] digital input',
                        description: 'Read Digital Input Value'
                    }),
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: '0',
                            menu: 'target_port'
                        },
                    }
                },
                '---',
                {
                    opcode: 'port_setting',
                    blockType: BlockType.COMMAND,                    
                    text: formatMessage({
                        id: 'aibot.portsetting',
                        default: 'set port[PORT] mode to [SET]',
                        description: 'Set Port Mode'
                    }),
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: '0',
                            menu: 'target_port'
                        },
                        SET: {
                            type: ArgumentType.STRING,
                            defaultValue: '0',
                            menu: 'port_inout'
                        },
                    }
                },  
                {
                    opcode: 'port_digital_out',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'aibot.setdigitalport',
                        default: 'set port[PORT] to [SET]',
                        description: 'Set Digital Port'
                    }),
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: '0',
                            menu: 'target_port'
                        },
                        SET: {
                            type: ArgumentType.STRING,
                            defaultValue: '1',
                            menu: 'on_off'
                        },
                    }
                },     
                {
                    opcode: 'buzzer_melody',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'aibot.playmelody',
                        default: 'play buzzer melody [MEL]',
                        description: 'Play Buzzer Melody'
                    }),
                    arguments: {
                        MEL: {
                            type: ArgumentType.STRING,
                            defaultValue: '1',
                            menu: 'melody_no'
                        },
                    }
                },      
                {
                    opcode: 'control_speed',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'aibot.controlspeed',
                        default: 'set module speed to [SPD]',
                        description: 'Set Control Speed of Module'
                    }),
                    arguments: {
                        SPD: {
                            type: ArgumentType.STRING,
                            defaultValue: '1',
                            menu: 'speed_no'
                        },
                    }
                },   
                {
                    opcode: 'control_angle',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'aibot.servoangle',
                        default: 'module [SV] to [ANG] degrees',
                        description: 'Control Angle'
                    }),
                    arguments: {
                        SV: {
                            type: ArgumentType.STRING,
                            defaultValue: '1',
                            menu: 'servo_no'
                        },
                        ANG: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                    }
                },   
                {
                    opcode: 'control_angle',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'aibot.servoangle',
                        default: 'module [SV] to [ANG] degrees',
                        description: 'Control Angle'
                    }),
                    arguments: {
                        SV: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '1',
                        },
                        ANG: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                    }
                },         
                {
                    opcode: 'control_angle_123',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'aibot.servoangle123',
                        default: 'modules 1[ANG1], 2[ANG2], 3[ANG3] degrees',
                        description: 'Control Angle of Module 1,2,3'
                    }),
                    arguments: {                        
                        ANG1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                        ANG2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                        ANG3: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                    }
                },  
                {
                    opcode: 'control_angle_1234',
                    blockType: BlockType.COMMAND,
                    text: Message.angle_control_1234[this.locale],
                    arguments: {                        
                        ANG1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                        ANG2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                        ANG3: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                        ANG4: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                    }
                },  
                {
                    opcode: 'control_angle_56',
                    blockType: BlockType.COMMAND,                    
                    text: formatMessage({
                        id: 'aibot.servoangle56',
                        default: 'modules 5[ANG5], 6[ANG6] degrees',
                        description: 'Control Angle of Module5,6'
                    }),
                    arguments: {  
                        ANG5: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                        ANG6: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                    }
                },  
                {
                    opcode: 'control_angle_123456',
                    blockType: BlockType.COMMAND,                    
                    text: formatMessage({
                        id: 'aibot.servoangle123456',
                        default: 'modules 1[ANG1], 2[ANG2], 3[ANG3], 4[ANG4], 5[ANG5], 6[ANG6] degrees',
                        description: 'Control Angle of All Modules'
                    }),
                    arguments: {                        
                        ANG1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                        ANG2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                        ANG3: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                        ANG4: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                        ANG5: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                        ANG6: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '90',
                        },
                    }
                },                  
                {
                    opcode: 'control_go_home',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'aibot.gohomeposition',
                        default: 'return to home position of all modules',
                        description: 'All Modules Return to Home Position'
                    }),
                    arguments: {    
                    }
                }, 
                {
                    opcode: 'set_home_position',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'aibot.sethomeposition',
                        default: 'set current angle of module [SV] as 90 degrees',
                        description: 'Set Current Angle of a Module as 90 degrees'
                    }),
                    arguments: {  
                        SV: {
                            type: ArgumentType.STRING,
                            defaultValue: '1',
                            menu: 'servo_no'
                        },
                    }
                },
                {
                    opcode: 'factory_reset',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'aibot.factoryreset',
                        default: 'factory reset of all settings',
                        description: 'Reset to Factory Settings'
                    }),
                    arguments: {    
                    }
                }, 
                // {
                //     opcode: 'remote_control_speed',
                //     blockType: BlockType.COMMAND,
                //     text: formatMessage({
                //         id: 'aibot.remotecontrolspeed',
                //         default: 'set remote module speed to [SPD]',
                //         description: 'Set Control Speed of Remote Module'
                //     }),
                //     arguments: {
                //         SPD: {
                //             type: ArgumentType.STRING,
                //             defaultValue: '1',
                //             menu: 'speed_no'
                //         },
                //     }
                // },
                // {
                //     opcode: 'remote_control_angle',
                //     blockType: BlockType.COMMAND,
                //     text: formatMessage({
                //         id: 'aibot.remoteservoangle',
                //         default: 'remote module [SV] to [ANG] degrees',
                //         description: 'Control Angle of Remote Module'
                //     }),
                //     arguments: {
                //         SV: {
                //             type: ArgumentType.STRING,
                //             defaultValue: '1',
                //             menu: 'servo_no'
                //         },
                //         ANG: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //     }
                // },      
                // {
                //     opcode: 'remote_control_angle',
                //     blockType: BlockType.COMMAND,
                //     text: formatMessage({
                //         id: 'aibot.remoteservoangle',
                //         default: 'remote module [SV] to [ANG] degrees',
                //         description: 'Control Angle of Remote Module'
                //     }),
                //     arguments: {
                //         SV: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '1',
                //         },
                //         ANG: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //     }
                // },   
                // {
                //     opcode: 'remote_control_angle_123',
                //     blockType: BlockType.COMMAND,
                //     text: formatMessage({
                //         id: 'aibot.remoteservoangle123',
                //         default: 'remote modules 1[ANG1], 2[ANG2], 3[ANG3] degrees',
                //         description: 'Control Angle of Remote Module 1,2,3'
                //     }),
                //     arguments: {                        
                //         ANG1: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //         ANG2: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //         ANG3: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //     }
                // },  
                // {
                //     opcode: 'remote_control_angle_1234',
                //     blockType: BlockType.COMMAND,
                //     text: Message.remote_angle_control_1234[this.locale],
                //     arguments: {                        
                //         ANG1: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //         ANG2: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //         ANG3: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //         ANG4: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //     }
                // },  
                // {
                //     opcode: 'remote_control_angle_56',
                //     blockType: BlockType.COMMAND,
                //     text: formatMessage({
                //         id: 'aibot.remoteservoangle56',
                //         default: 'remote modules 5[ANG5], 6[ANG6] degrees',
                //         description: 'Control Angle of Remote Module 5,6'
                //     }),
                //     arguments: {  
                //         ANG5: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //         ANG6: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //     }
                // },  
                // {
                //     opcode: 'remote_control_angle_123456',
                //     blockType: BlockType.COMMAND,
                //     text: formatMessage({
                //         id: 'aibot.remoteservoangle123456',
                //         default: 'remote modules 1[ANG1], 2[ANG2], 3[ANG3], 4[ANG4], 5[ANG5], 6[ANG6] degrees',
                //         description: 'Control Angle of All Remote Modules'
                //     }),
                //     arguments: {
                //         ANG1: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //         ANG2: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //         ANG3: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //         ANG4: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //         ANG5: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //         ANG6: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '90',
                //         },
                //     }
                // },                  
                // {
                //     opcode: 'remote_control_go_home',
                //     blockType: BlockType.COMMAND,
                //     text: formatMessage({
                //         id: 'aibot.remotegohomeposition',
                //         default: 'return to home position of all remote modules',
                //         description: 'All Remote Modules Return to Home Position'
                //     }),
                //     arguments: {
                //     }
                // }, 
                // {
                //     opcode: 'remote_device_set',
                //     blockType: BlockType.COMMAND,
                //     text: formatMessage({
                //         id: 'aibot.setremotedevice',
                //         default: 'set remote device',
                //         description: 'Set a Remote Device'
                //     }),
                //     arguments: {    
                //     }
                // }, 
                // {
                //     opcode: 'aidesk_read_number',
                //     blockType: BlockType.REPORTER,
                //     text: formatMessage({
                //         id: 'aibot.readaidesk',
                //         default: 'read value from [FN] of AIDesk',
                //         description: 'Return a value from AIDesk'
                //     }),
                //     arguments: {
                //         FN: {
                //             type: ArgumentType.STRING,
                //             defaultValue: '1',
                //             menu: 'aidesk_read_no'
                //         },
                //     }
                // },     
                // {
                //     opcode: 'aidesk_func_start',
                //     blockType: BlockType.COMMAND,
                //     text: formatMessage({
                //         id: 'aibot.startaideskfunc',
                //         default: 'start function [FN] of AIDesk (var1:[VAR1], var2:[VAR2], var3:[VAR3], var4:[VAR4])',
                //         description: 'Start an AIDesk Function'
                //     }),
                //     arguments: {
                //         FN: {
                //             type: ArgumentType.STRING,
                //             defaultValue: '1',
                //             menu: 'aidesk_read_no'
                //         },
                //         VAR1: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '0',
                //         },
                //         VAR2: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '0',
                //         },
                //         VAR3: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '0',
                //         },
                //         VAR4: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: '0',
                //         },
                //     }
                // },
                // {
                //     opcode: 'aidesk_func_stop',
                //     blockType: BlockType.COMMAND,
                //     text: formatMessage({
                //         id: 'aibot.stopaideskfunc',
                //         default: 'stop function [FN] of AIDesk',
                //         description: 'Stop an AIDesk Function'
                //     }),
                //     arguments: {
                //         FN: {
                //             type: ArgumentType.STRING,
                //             defaultValue: '1',
                //             menu: 'aidesk_read_no'
                //         },
                //     }
                // },
            ],            
            menus: {
                target_port: {
                    acceptReporters: true,
                    //items: ['1', '2', '3', '4' , '원격1', '원격2', '원격3', '원격4']
                    items: [ {text: "1", value: '0'}, 
                             {text: "2", value: '1'},
                             {text: "3", value: '2'}, 
                             {text: "4", value: '3'},
                             {text: formatMessage({id: 'aibot.remote1',default: 'remote1'}), value: '4'}, 
                             {text: formatMessage({id: 'aibot.remote2',default: 'remote2'}), value: '5'},
                             {text: formatMessage({id: 'aibot.remote3',default: 'remote3'}), value: '6'}, 
                             {text: formatMessage({id: 'aibot.remote4',default: 'remote4'}), value: '7'}
                           ]
                },
                port_inout: {
                    acceptReporters: true,
                    items: [ {text: formatMessage({id: 'aibot.digitalin',default: 'DigitalIn'}), value: '0'}, 
                             {text: formatMessage({id: 'aibot.digitalout',default: 'DigitalOut'}), value: '1'}, 
                             {text: formatMessage({id: 'aibot.analogin',default: 'AnalogIn'}), value: '2'}
                           ]
                },
                on_off: {
                    acceptReporters: true,
                    items: [ {text: formatMessage({id: 'aibot.digitalon',default: 'On'}), value: '1'}, 
                             {text: formatMessage({id: 'aibot.digitaloff',default: 'Off'}), value: '0'}
                           ]
                },
                melody_no: {
                    acceptReporters: true,
                    items: ['1', '2', '3', '4' , '5']
                },
                speed_no: {
                    acceptReporters: true,
                    items: ['1', '2', '3', '4' , '5']
                },
                servo_no: {
                    acceptReporters: true,
                    items: ['1', '2', '3', '4' , '5' , '6']
                },
                aidesk_read_no: {
                    acceptReporters: true,
                    items: ['1', '2', '3', '4' , '5']
                },
            }
        };
    }
    analog_read(args) {
        let pin = args['PORT'];
        let idx = parseInt(pin, 10);
        if (pin == 0) idx = 4;
        else if (pin == 1) idx = 5;
        else if (pin == 2) idx = 6;
        else if (pin == 3) idx = 7;
        else if (pin == 4) idx = 12;
        else if (pin == 5) idx = 13;
        else if (pin == 6) idx = 14;
        else if (pin == 7) idx = 15;
        let v = this._peripheral.sensorData.SENSOR[idx];
        return v;
    }
    digital_read(args) {
        let pin = args['PORT'];
        let idx = parseInt(pin, 10);
        if (pin == 0) idx = 0;
        else if (pin == 1) idx = 1;
        else if (pin == 2) idx = 2;
        else if (pin == 3) idx = 3;
        else if (pin == 4) idx = 8;
        else if (pin == 5) idx = 9;
        else if (pin == 6) idx = 10;
        else if (pin == 7) idx = 11;
        let v = this._peripheral.sensorData.SENSOR[idx];
        if (v == 0) v = 0;
        else v = 1;
        return v;
    }
    port_setting(args){
        let pin = args['PORT'];
        let set = parseInt(args['SET'], 10);
        let remote = 1;

        let port = parseInt(pin, 10);
        if (port >= 4) {
            remote = 2;
            port = port - 4;
        }
        this._peripheral.port_setting(remote,port,set);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    port_digital_out(args){
        let pin = args['PORT'];
        let set = parseInt(args['SET'], 10);
        let remote = 1;

        let port = parseInt(pin, 10);
        if (port >= 4) {
            remote = 2;
            port = port - 4;
        }
        this._peripheral.port_digital_out(remote,port,set);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    buzzer_melody(args){
        let melody = parseInt(args['MEL'], 10);
        let remote = 1;
        melody = melody - 1;
        this._peripheral.buzzer_melody(remote,melody);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    control_speed(args){
        let speed = parseInt(args['SPD'], 10);
        let remote = 1;
        this._peripheral.control_speed(remote,speed);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    control_angle(args,script){
        let sv = parseInt(args['SV'], 10);
        let Angle = parseFloat(args['ANG'], 10);
        let remote = 1;
        let sv1=0,sv2=0,sv3=0,sv4=0,sv5=0,sv6=0;
        if(Angle<0)Angle = 0;if(Angle>180)Angle = 180;Angle = Angle*10 + 700;
        if(sv==1)sv1 = Angle;
        else if(sv==2)sv2 = Angle;
        else if(sv==3)sv3 = Angle;
        else if(sv==4)sv4 = Angle;
        else if(sv==5)sv5 = Angle;
        else if(sv==6)sv6 = Angle; 
        this._peripheral.control_angle(remote,sv1,sv2,sv3,sv4,sv5,sv6);  
        //
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });              
    }
    control_angle_123(args){
        let sv1 = parseFloat(args['ANG1'], 10);
        let sv2 = parseFloat(args['ANG2'], 10);
        let sv3 = parseFloat(args['ANG3'], 10);
        let remote = 1;
        let sv4=0,sv5=0,sv6=0;

        if(sv1<0)sv1 = 0;if(sv1>180)sv1 = 180;sv1 = sv1*10 + 700;  
        if(sv2<0)sv2 = 0;if(sv2>180)sv2 = 180;sv2 = sv2*10 + 700;  
        if(sv3<0)sv3 = 0;if(sv3>180)sv3 = 180;sv3 = sv3*10 + 700;
        this._peripheral.control_angle(remote,sv1,sv2,sv3,sv4,sv5,sv6);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    control_angle_1234(args){
        let sv1 = parseFloat(args['ANG1'], 10);
        let sv2 = parseFloat(args['ANG2'], 10);
        let sv3 = parseFloat(args['ANG3'], 10);
        let sv4 = parseFloat(args['ANG4'], 10);
        let remote = 1;
        let sv5=0,sv6=0;

        if(sv1<0)sv1 = 0;if(sv1>180)sv1 = 180;sv1 = sv1*10 + 700;  
        if(sv2<0)sv2 = 0;if(sv2>180)sv2 = 180;sv2 = sv2*10 + 700;  
        if(sv3<0)sv3 = 0;if(sv3>180)sv3 = 180;sv3 = sv3*10 + 700;
        if(sv4<0)sv4 = 0;if(sv4>180)sv4 = 180;sv4 = sv4*10 + 700;
        this._peripheral.control_angle(remote,sv1,sv2,sv3,sv4,sv5,sv6);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    control_angle_56(args){
        let sv5 = parseFloat(args['ANG5'], 10);
        let sv6 = parseFloat(args['ANG6'], 10);
        let remote = 1;
        let sv1=0,sv2=0,sv3=0,sv4=0;

        if(sv5<0)sv5 = 0;if(sv5>180)sv5 = 180;sv5 = sv5*10 + 700;  
        if(sv6<0)sv6 = 0;if(sv6>180)sv6 = 180;sv6 = sv6*10 + 700;
        this._peripheral.control_angle(remote,sv1,sv2,sv3,sv4,sv5,sv6);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    control_angle_123456(args){
        let sv1 = parseFloat(args['ANG1'], 10);
        let sv2 = parseFloat(args['ANG2'], 10);
        let sv3 = parseFloat(args['ANG3'], 10);
        let sv4 = parseFloat(args['ANG4'], 10);
        let sv5 = parseFloat(args['ANG5'], 10);
        let sv6 = parseFloat(args['ANG6'], 10);
        let remote = 1;

        if(sv1<0)sv1 = 0;if(sv1>180)sv1 = 180;sv1 = sv1*10 + 700;  
        if(sv2<0)sv2 = 0;if(sv2>180)sv2 = 180;sv2 = sv2*10 + 700;  
        if(sv3<0)sv3 = 0;if(sv3>180)sv3 = 180;sv3 = sv3*10 + 700;
        if(sv4<0)sv4 = 0;if(sv4>180)sv4 = 180;sv4 = sv4*10 + 700;
        if(sv5<0)sv5 = 0;if(sv5>180)sv5 = 180;sv5 = sv5*10 + 700;  
        if(sv6<0)sv6 = 0;if(sv6>180)sv6 = 180;sv6 = sv6*10 + 700;
        this._peripheral.control_angle(remote,sv1,sv2,sv3,sv4,sv5,sv6);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    control_go_home(args){
        let remote = 1;
        this._peripheral.control_go_home(remote);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    factory_reset(args){
        let remote = 2;
        this._peripheral.factory_reset(remote);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    set_home_position(args){
        let sv = parseInt(args['SV'], 10);
        let remote = 4;
        let sv1=0,sv2=0,sv3=0,sv4=0,sv5=0,sv6=0;
        if(sv==1)sv1 = 1;
        else if(sv==2)sv2 = 1;
        else if(sv==3)sv3 = 1;
        else if(sv==4)sv4 = 1;
        else if(sv==5)sv5 = 1;
        else if(sv==6)sv6 = 1; 
        this._peripheral.set_home_position(remote,sv1,sv2,sv3,sv4,sv5,sv6);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    remote_control_speed(args){
        let speed = parseInt(args['SPD'], 10);
        let remote = 2;
        this._peripheral.control_speed(remote,speed);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    remote_control_angle(args){
        let sv = parseInt(args['SV'], 10);
        let Angle = parseFloat(args['ANG'], 10);
        let remote = 2;
        let sv1=0,sv2=0,sv3=0,sv4=0,sv5=0,sv6=0;
        if(Angle<0)Angle = 0;if(Angle>180)Angle = 180;Angle = Angle*10 + 700;
        if(sv==1)sv1 = Angle;
        else if(sv==2)sv2 = Angle;
        else if(sv==3)sv3 = Angle;
        else if(sv==4)sv4 = Angle;
        else if(sv==5)sv5 = Angle;
        else if(sv==6)sv6 = Angle; 
        this._peripheral.control_angle(remote,sv1,sv2,sv3,sv4,sv5,sv6);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    remote_control_angle_123(args){
        let sv1 = parseFloat(args['ANG1'], 10);
        let sv2 = parseFloat(args['ANG2'], 10);
        let sv3 = parseFloat(args['ANG3'], 10);
        let remote = 2;
        let sv4=0,sv5=0,sv6=0;

        if(sv1<0)sv1 = 0;if(sv1>180)sv1 = 180;sv1 = sv1*10 + 700;  
        if(sv2<0)sv2 = 0;if(sv2>180)sv2 = 180;sv2 = sv2*10 + 700;  
        if(sv3<0)sv3 = 0;if(sv3>180)sv3 = 180;sv3 = sv3*10 + 700;
        this._peripheral.control_angle(remote,sv1,sv2,sv3,sv4,sv5,sv6);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    remote_control_angle_1234(args){
        let sv1 = parseFloat(args['ANG1'], 10);
        let sv2 = parseFloat(args['ANG2'], 10);
        let sv3 = parseFloat(args['ANG3'], 10);
        let sv4 = parseFloat(args['ANG4'], 10);
        let remote = 2;
        let sv5=0,sv6=0;

        if(sv1<0)sv1 = 0;if(sv1>180)sv1 = 180;sv1 = sv1*10 + 700;  
        if(sv2<0)sv2 = 0;if(sv2>180)sv2 = 180;sv2 = sv2*10 + 700;  
        if(sv3<0)sv3 = 0;if(sv3>180)sv3 = 180;sv3 = sv3*10 + 700;
        if(sv4<0)sv4 = 0;if(sv4>180)sv4 = 180;sv4 = sv4*10 + 700;
        this._peripheral.control_angle(remote,sv1,sv2,sv3,sv4,sv5,sv6);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    remote_control_angle_56(args){
        let sv5 = parseFloat(args['ANG5'], 10);
        let sv6 = parseFloat(args['ANG6'], 10);
        let remote = 2;
        let sv1=0,sv2=0,sv3=0,sv4=0;

        if(sv5<0)sv5 = 0;if(sv5>180)sv5 = 180;sv5 = sv5*10 + 700;  
        if(sv6<0)sv6 = 0;if(sv6>180)sv6 = 180;sv6 = sv6*10 + 700;
        this._peripheral.control_angle(remote,sv1,sv2,sv3,sv4,sv5,sv6);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    remote_control_angle_123456(args){
        let sv1 = parseFloat(args['ANG1'], 10);
        let sv2 = parseFloat(args['ANG2'], 10);
        let sv3 = parseFloat(args['ANG3'], 10);
        let sv4 = parseFloat(args['ANG4'], 10);
        let sv5 = parseFloat(args['ANG5'], 10);
        let sv6 = parseFloat(args['ANG6'], 10);
        let remote = 2;

        if(sv1<0)sv1 = 0;if(sv1>180)sv1 = 180;sv1 = sv1*10 + 700;  
        if(sv2<0)sv2 = 0;if(sv2>180)sv2 = 180;sv2 = sv2*10 + 700;  
        if(sv3<0)sv3 = 0;if(sv3>180)sv3 = 180;sv3 = sv3*10 + 700;
        if(sv4<0)sv4 = 0;if(sv4>180)sv4 = 180;sv4 = sv4*10 + 700;
        if(sv5<0)sv5 = 0;if(sv5>180)sv5 = 180;sv5 = sv5*10 + 700;  
        if(sv6<0)sv6 = 0;if(sv6>180)sv6 = 180;sv6 = sv6*10 + 700;
        this._peripheral.control_angle(remote,sv1,sv2,sv3,sv4,sv5,sv6);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    remote_control_go_home(args){
        let remote = 2;
        this._peripheral.control_go_home(remote);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    remote_device_set(args){
        let remote = 2;
        this._peripheral.remote_device_set(remote,1,1,1);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    aidesk_read_number(args){
        let fn = parseInt(args['FN'], 10);
        let v = this._peripheral.sensorData.AIDESK[fn-1];
        return v;
    }
    aidesk_func_start(args){
        let func=parseInt(args['FN'], 10);
        let Var1=parseInt(args['VAR1'], 10);
        let Var2=parseInt(args['VAR2'], 10);
        let Var3=parseInt(args['VAR3'], 10);
        let Var4=parseInt(args['VAR4'], 10);

        if(Var1>2000)Var1=2000;
        if(Var1<-2000)Var1=-2000;
        if(Var2>2000)Var2=2000;
        if(Var2<-2000)Var2=-2000;
        if(Var3>2000)Var3=2000;
        if(Var3<-2000)Var3=-2000;
        if(Var4>2000)Var4=2000;
        if(Var4<-2000)Var4=-2000;
        let remote = 1;
        this._peripheral.aidesk_func(remote,func,Var1,Var2,Var3,Var4);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    aidesk_func_stop(args){
        let func=parseInt(args['FN'], 10);
        let remote = 2;
        this._peripheral.aidesk_func(remote,func,0,0,0,0);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, SRSendInterval);
        });    
    }
    

    // end of block handlers

    _setLocale () {
        let now_locale = '';
        switch (formatMessage.setup().locale) {
            case 'ko':
                now_locale = 'ko';
                break;
            case 'pt-br':
            case 'pt':
                now_locale='pt-br';
                break;
            case 'en':
                now_locale='en';
                break;
            case 'fr':
                now_locale='fr';
                break;
            case 'zh-tw':
                now_locale= 'zh-tw';
                break;
            case 'zh-cn':
                now_locale= 'zh-cn';
                break;
            default:
                now_locale='en';
                break;
        }
        return now_locale;
    }
}

module.exports = Scratch3aibotSR;
