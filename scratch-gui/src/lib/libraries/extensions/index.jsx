import React from 'react';
import {FormattedMessage} from 'react-intl';

import musicIconURL from './music/music.png';
import musicInsetIconURL from './music/music-small.svg';

import penIconURL from './pen/pen.png';
import penInsetIconURL from './pen/pen-small.svg';

import videoSensingIconURL from './videoSensing/video-sensing.png';
import videoSensingInsetIconURL from './videoSensing/video-sensing-small.svg';

import text2speechIconURL from './text2speech/text2speech.png';
import text2speechInsetIconURL from './text2speech/text2speech-small.svg';

import translateIconURL from './translate/translate.png';
import translateInsetIconURL from './translate/translate-small.png';

import makeymakeyIconURL from './makeymakey/makeymakey.png';
import makeymakeyInsetIconURL from './makeymakey/makeymakey-small.svg';

import microbitIconURL from './microbit/microbit.png';
import microbitInsetIconURL from './microbit/microbit-small.svg';
import microbitConnectionIconURL from './microbit/microbit-illustration.svg';
import microbitConnectionSmallIconURL from './microbit/microbit-small.svg';

import ev3IconURL from './ev3/ev3.png';
import ev3InsetIconURL from './ev3/ev3-small.svg';
import ev3ConnectionIconURL from './ev3/ev3-hub-illustration.svg';
import ev3ConnectionSmallIconURL from './ev3/ev3-small.svg';

import wedo2IconURL from './wedo2/wedo.png'; // TODO: Rename file names to match variable/prop names?
import wedo2InsetIconURL from './wedo2/wedo-small.svg';
import wedo2ConnectionIconURL from './wedo2/wedo-illustration.svg';
import wedo2ConnectionSmallIconURL from './wedo2/wedo-small.svg';
import wedo2ConnectionTipIconURL from './wedo2/wedo-button-illustration.svg';

import boostIconURL from './boost/boost.png';
import boostInsetIconURL from './boost/boost-small.svg';
import boostConnectionIconURL from './boost/boost-illustration.svg';
import boostConnectionSmallIconURL from './boost/boost-small.svg';
import boostConnectionTipIconURL from './boost/boost-button-illustration.svg';

import gdxforIconURL from './gdxfor/gdxfor.png';
import gdxforInsetIconURL from './gdxfor/gdxfor-small.svg';
import gdxforConnectionIconURL from './gdxfor/gdxfor-illustration.svg';
import gdxforConnectionSmallIconURL from './gdxfor/gdxfor-small.svg';

import ml2scratchIconURL from './ml2scratch/ml2scratch.png';
import ml2scratchInsetIconURL from './ml2scratch/ml2scratch-small.png';

import tm2scratchIconURL from './tm2scratch/tm2scratch.png';
import tm2scratchInsetIconURL from './tm2scratch/tm2scratch-small.png';

import tmpose2scratchIconURL from './tmpose2scratch/tmpose2scratch.png';
import tmpose2scratchInsetIconURL from './tmpose2scratch/tmpose2scratch-small.png';

import facemesh2scratchIconURL from './facemesh2scratch/facemesh2scratch.png';
import facemesh2scratchInsetIconURL from './facemesh2scratch/facemesh2scratch-small.png';

import handpose2scratchIconURL from './handpose2scratch/handpose2scratch.png';
import handpose2scratchInsetIconURL from './handpose2scratch/handpose2scratch-small.png';

import ic2scratchIconURL from './ic2scratch/ic2scratch.png';
import ic2scratchInsetIconURL from './ic2scratch/ic2scratch-small.png';

import posenet2scratchIconURL from './posenet2scratch/posenet2scratch.png';
import posenet2scratchInsetIconURL from './posenet2scratch/posenet2scratch-small.png';

import speech2scratchIconURL from './speech2scratch/speech2scratch.png';
import speech2scratchInsetIconURL from './speech2scratch/speech2scratch-small.png';


import aibotIconURL from './aibot/aibot.png';
import aibotInsetIconURL from './aibot/aibot-small.svg';
import aibotConnectionIconURL from './aibot/aibot-illustration.svg';
import aibotConnectionSmallIconURL from './aibot/aibot-small.svg';
import aibotPeripheralImage from './aibot/aibot-illustration.svg';
import aibotMenuImage from './aibot/aibot-small.svg';

import toybotIconURL from './toybot/toybot_main.png';
import toybotInsetIconURL from './toybot/toybot-small.svg';
import toybotConnectionIconURL from './toybot/toybot-illustration.svg';
import toybotConnectionSmallIconURL from './toybot/toybot-small.svg';

export default [
    {
        name: 'AIBot',
        extensionId: 'aibot',
        collaborator: 'JINI Co.,Ltd',
        iconURL: aibotIconURL,
        insetIconURL: aibotConnectionSmallIconURL,//aibotInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Connect your projects with the world."
                description="Description for the 'AIBot' extension"
                id="gui.extension.aibot.description"
            />
        ),
        featured: true,
        disabled: false,
        bluetoothRequired: false,
        internetConnectionRequired: false,
        usbRequired: true,
        launchPeripheralConnectionFlow: true,
        useAutoScan: false,
        
        connectionIconURL: aibotConnectionSmallIconURL,//aibotConnectionIconURL
        connectionSmallIconURL: aibotConnectionSmallIconURL,
        connectingMessage: (
            <FormattedMessage
                defaultMessage="Connecting"
                description="Message to help people connect to their AIBot."
                id="gui.extension.aibot.connectingMessage"
            />
        ),
        helpLink: 'https://www.jinirobot.com'
    },
    {
        name: 'ToyBot',
        extensionId: 'toybot',
        collaborator: 'JINI Co.,Ltd',
        iconURL: toybotIconURL,
        insetIconURL: toybotInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Connect your projects with the world."
                description="Description for the 'ToyBot' extension"
                id="gui.extension.toybot.description"
            />
        ),
        featured: true,
        disabled: false,
        bluetoothRequired: false,
        internetConnectionRequired: false,
        usbRequired: true,
        launchPeripheralConnectionFlow: true,
        useAutoScan: false,

        connectionIconURL: toybotConnectionIconURL,
        connectionSmallIconURL: toybotConnectionSmallIconURL,
        connectingMessage: (
            <FormattedMessage
                defaultMessage="Connecting"
                description="Message to help people connect to their ToyBot."
                id="gui.extension.toybot.connectingMessage"
            />
        ),
        helpLink: 'https://www.jinirobot.com'

    },
    // '음성인식' 클래스 미표시 변경으로 인해 주석 처리    
    // {
    //     name: (
    //         <FormattedMessage
    //             defaultMessage="Speech Recognition"
    //             description="Name for the Speech Recognition extension"
    //             id="gui.extension.speech2scratch.name"
    //         />
    //     ),
    //     //name: 'Speech2Scratch',
    //     extensionId: 'speech2scratch',
    //     extensionURL: '',
    //     collaborator: 'Google, JINI Co.,Ltd',
    //     iconURL: speech2scratchIconURL,
    //     insetIconURL: speech2scratchInsetIconURL,
    //     description: (
    //         <FormattedMessage
    //             defaultMessage="Speech2Scratch Blocks."
    //             description="Description for Speech2Scratch Blocks."
    //             id="gui.extension.speech2scratch.description"
    //         />
    //     ),
    //     featured: true,
    //     disabled: false,
    //     internetConnectionRequired: true,
    //     translationMap: {            
    //         'en': {
    //             'gui.extension.speech2scratch.description': 'Recognize your voice.'
    //         },
    //         'ko': {
    //             'gui.extension.speech2scratch.description': ''
    //         }
    //     }
    // },
    // 송하권, 2023.10.10
    {
        name: (
            <FormattedMessage
                defaultMessage="PoseNet Recognition"
                description="Name for the PoseNet Recognition extension"
                id="gui.extension.posenet2scratch.name"
            />
        ),
        //name: 'posenet2Scratch',
        extensionId: 'posenet2scratch',
        extensionURL: '',//'https://champierre.github.io/posenet2scratch/posenet2scratch.mjs',
        collaborator: 'Google, JINI Co.,Ltd',
        iconURL: posenet2scratchIconURL,
        insetIconURL: posenet2scratchInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Obtain the coordinates of each part of the body."
                description="Description for PoseNet2Scratch Blocks."
                id="gui.extension.posenet2scratch.description"
            />
        ),
        featured: true,
        disabled: false,
        internetConnectionRequired: true,
        translationMap: {
            'en': {
                'gui.extension.posenet2scratch.description': 'Recognize your poses.'
            },
            'ko': {
                'gui.extension.posenet2scratch.description': '자세를 인식해볼까요'
            }
        }
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Image Recognition"
                description="Name for the Image Recognition extension"
                id="gui.extension.ic2scratchblocks.name"
            />
        ),
        //name: 'ImageClassifier2Scratch',
        extensionId: 'ic2scratch',
        collaborator: 'Google, JINI Co.,Ltd',
        iconURL: ic2scratchIconURL,
        insetIconURL: ic2scratchInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage='ImageClassifier2Scratch'
                description='Image Classifier Blocks.'
                id='gui.extension.ic2scratchblocks.description'
            />
        ),
        featured: true,
        disabled: false,
        internetConnectionRequired: true,
        translationMap: {            
            'en': {
                'gui.extension.ic2scratchblocks.description': 'Detect an object.'
            },
            'ko': {
                'gui.extension.ic2scratchblocks.description': '사물을 인식해볼까요?'
            }
        }
    },
    // '손동작인식' 클래스 미표시 변경으로 인해 주석 처리
    // {
    //     name: (
    //         <FormattedMessage
    //             defaultMessage="Hand Recognition"
    //             description="Name for the Hand Recognition extension"
    //             id="gui.extension.handpose2scratchblocks.name"
    //         />
    //     ),
    //     //name: 'Handpose2Scratch',
    //     extensionId: 'handpose2scratch',
    //     collaborator: 'JINI Co.,Ltd',
    //     iconURL: handpose2scratchIconURL,
    //     insetIconURL: handpose2scratchInsetIconURL,
    //     description: (
    //         <FormattedMessage
    //             defaultMessage='Handpose2Scratch'
    //             description='HandPose2Scratch Blocks.'
    //             id='gui.extension.handpose2scratchblocks.description'
    //         />
    //     ),
    //     featured: true,
    //     disabled: false,
    //     internetConnectionRequired: true,
    //     bluetoothRequired: false,
    //     helpLink: 'https://www.jinirobot.com',
    //     translationMap: {            
    //         'en': {
    //             'gui.extension.handpose2scratchblocks.description': 'Recognize your own hand.'
    //         },
    //         'ko': {
    //             'gui.extension.handpose2scratchblocks.description': '나의 손동작을 인식해볼까요'
    //         }
    //     }
    // },
    // 송하권, 2023.09.18
    {
        name: (
            <FormattedMessage
                defaultMessage="Face Recognition"
                description="Name for the Face Recognition extension"
                id="gui.extension.facemesh2scratch.name"
            />
        ),
        //name: 'Facemesh2Scratch',
        extensionId: 'facemesh2scratch',
        collaborator: 'Google, JINI Co.,Ltd',
        iconURL: facemesh2scratchIconURL,
        insetIconURL: facemesh2scratchInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage='Facemesh2Scratch'
                description='Face Tracking'
                id='gui.extension.facemesh2scratch.description'
            />
        ),
        featured: true,
        disabled: false,
        internetConnectionRequired: true,
        translationMap: {            
            'en': {
                'gui.extension.facemesh2scratch.description': 'Recognize your own face.'
            },
            'ko': {
                'gui.extension.facemesh2scratch.description': '나의 얼굴 동작을 인식해볼까요'
            }
        }

    },
    // '포즈인식' 클래스 미표시 변경으로 인해 주석 처리
    // {
    //     name: (
    //         <FormattedMessage
    //             defaultMessage="Pose Recognition"
    //             description="Name for the Pose Recognition extension"
    //             id="gui.extension.tmpose2scratchblocks.name"
    //         />
    //     ),
    //     //name: 'TMPose2Scratch',
    //     extensionId: 'tmpose2scratch',
    //     collaborator: 'JINI Co.,Ltd',
    //     iconURL: tmpose2scratchIconURL,
    //     insetIconURL: tmpose2scratchInsetIconURL,
    //     description: (
    //         <FormattedMessage
    //             defaultMessage='TMPose2Scratch Blocks.'
    //             description='Recognize your own poses.'
    //             id='gui.extension.tmpose2scratchblocks.description'
    //         />
    //     ),
    //     featured: true,
    //     disabled: false,
    //     internetConnectionRequired: true,
    //     bluetoothRequired: false,
    //     helpLink: 'https://www.jinirobot.com',
    //     translationMap: {            
    //         'en': {
    //             'gui.extension.tmpose2scratchblocks.description': 'Recognize your own poses.'
    //         },
    //         'ko': {
    //             'gui.extension.tmpose2scratchblocks.description': '나의 몸동작 포즈를 인식해볼까요'
    //         }
    //     }
    // },
    // 송하권, 2023.09.18
    // '머신러닝' 클래스 미표시 변경으로 인해 주석 처리
    // {
    //     name: (
    //         <FormattedMessage
    //             defaultMessage="Machine Learning"
    //             description="Name for the Machine Learning extension"
    //             id="gui.extension.ml2scratch.name"
    //         />
    //     ),
    //     //name: 'ML2Scratch',
    //     extensionId: 'ml2scratch',
    //     extensionURL: '',//'https://champierre.github.io/ml2scratch/ml2scratch.mjs',
    //     collaborator: 'JINI Co.,Ltd',
    //     iconURL: ml2scratchIconURL,
    //     insetIconURL: ml2scratchInsetIconURL,
    //     description: (
    //         <FormattedMessage
    //             defaultMessage="ML2Scratch Blocks."
    //             description="Description for ML2Scratch Blocks."
    //             id="gui.extension.ml2scratch.description"
    //         />
    //     ),
    //     featured: true,
    //     disabled: false,
    //     bluetoothRequired: false,
    //     internetConnectionRequired: true,
    //     helpLink: 'https://www.jinirobot.com', 
    //     translationMap: {           
    //         'ko': {
    //             'gui.extension.ml2scratch.description': '머신러닝'
    //         },
    //         'en': {
    //             'gui.extension.ml2scratch.description': 'machine learning'
    //         },
    //     }
    // },
    // 송하권, 2023.09.18
    {
        name: (
            <FormattedMessage
                defaultMessage="Teachable Machine"
                description="Name for the Teachable Machine extension"
                id="gui.extension.tm2scratch.name"
            />
        ),
        //name: 'TM2Scratch',
        extensionId: 'tm2scratch',
        extensionURL: '',
        collaborator: 'Google, JINI Co.,Ltd',
        iconURL: tm2scratchIconURL,
        insetIconURL: tm2scratchInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="TM2Scratch Blocks."
                description="Description for TM2Scratch Blocks."
                id="gui.extension.tm2scratch.description"
            />
        ),
        featured: true,
        disabled: false,
        internetConnectionRequired: true,
        translationMap: {
            'ko': {
                'gui.extension.tm2scratch.description': '티처블머신'
            },
            'en': {
                'gui.extension.tm2scratch.description': 'teachable machine'
            },
        }
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Music"
                description="Name for the 'Music' extension"
                id="gui.extension.music.name"
            />
        ),
        extensionId: 'music',
        iconURL: musicIconURL,
        insetIconURL: musicInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Play instruments and drums."
                description="Description for the 'Music' extension"
                id="gui.extension.music.description"
            />
        ),
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Pen"
                description="Name for the 'Pen' extension"
                id="gui.extension.pen.name"
            />
        ),
        extensionId: 'pen',
        iconURL: penIconURL,
        insetIconURL: penInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Draw with your sprites."
                description="Description for the 'Pen' extension"
                id="gui.extension.pen.description"
            />
        ),
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Video Sensing"
                description="Name for the 'Video Sensing' extension"
                id="gui.extension.videosensing.name"
            />
        ),
        extensionId: 'videoSensing',
        iconURL: videoSensingIconURL,
        insetIconURL: videoSensingInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Sense motion with the camera."
                description="Description for the 'Video Sensing' extension"
                id="gui.extension.videosensing.description"
            />
        ),
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Text to Speech"
                description="Name for the Text to Speech extension"
                id="gui.extension.text2speech.name"
            />
        ),
        extensionId: 'text2speech',
        collaborator: 'Amazon Web Services',
        iconURL: text2speechIconURL,
        insetIconURL: text2speechInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Make your projects talk."
                description="Description for the Text to speech extension"
                id="gui.extension.text2speech.description"
            />
        ),
        featured: true,
        internetConnectionRequired: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Translate"
                description="Name for the Translate extension"
                id="gui.extension.translate.name"
            />
        ),
        extensionId: 'translate',
        collaborator: 'Google',
        iconURL: translateIconURL,
        insetIconURL: translateInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Translate text into many languages."
                description="Description for the Translate extension"
                id="gui.extension.translate.description"
            />
        ),
        featured: true,
        internetConnectionRequired: true
    },
    // 'Makey Makey' 타사제품 미표시로 인한 주석처리
    // {
    //     name: 'Makey Makey',
    //     extensionId: 'makeymakey',
    //     collaborator: 'JoyLabz',
    //     iconURL: makeymakeyIconURL,
    //     insetIconURL: makeymakeyInsetIconURL,
    //     description: (
    //         <FormattedMessage
    //             defaultMessage="Make anything into a key."
    //             description="Description for the 'Makey Makey' extension"
    //             id="gui.extension.makeymakey.description"
    //         />
    //     ),
    //     featured: true
    // },
    // 송하권, 2023.09.18
    // 'micro:bit' 타사제품 미표시로 인한 주석처리
    // {
    //     name: 'micro:bit',
    //     extensionId: 'microbit',
    //     collaborator: 'micro:bit',
    //     iconURL: microbitIconURL,
    //     insetIconURL: microbitInsetIconURL,
    //     description: (
    //         <FormattedMessage
    //             defaultMessage="Connect your projects with the world."
    //             description="Description for the 'micro:bit' extension"
    //             id="gui.extension.microbit.description"
    //         />
    //     ),
    //     featured: true,
    //     disabled: false,
    //     bluetoothRequired: true,
    //     internetConnectionRequired: true,
    //     launchPeripheralConnectionFlow: true,
    //     useAutoScan: false,
    //     connectionIconURL: microbitConnectionIconURL,
    //     connectionSmallIconURL: microbitConnectionSmallIconURL,
    //     connectingMessage: (
    //         <FormattedMessage
    //             defaultMessage="Connecting"
    //             description="Message to help people connect to their micro:bit."
    //             id="gui.extension.microbit.connectingMessage"
    //         />
    //     ),
    //     helpLink: 'https://scratch.mit.edu/microbit'
    // },
    // 송하권, 2023.09.18
    // 'LEGO MINDSTORMS EV3' 타사제품 미표시로 인한 주석처리
    // {
    //     name: 'LEGO MINDSTORMS EV3',
    //     extensionId: 'ev3',
    //     collaborator: 'LEGO',
    //     iconURL: ev3IconURL,
    //     insetIconURL: ev3InsetIconURL,
    //     description: (
    //         <FormattedMessage
    //             defaultMessage="Build interactive robots and more."
    //             description="Description for the 'LEGO MINDSTORMS EV3' extension"
    //             id="gui.extension.ev3.description"
    //         />
    //     ),
    //     featured: true,
    //     disabled: false,
    //     bluetoothRequired: true,
    //     internetConnectionRequired: true,
    //     launchPeripheralConnectionFlow: true,
    //     useAutoScan: false,
    //     connectionIconURL: ev3ConnectionIconURL,
    //     connectionSmallIconURL: ev3ConnectionSmallIconURL,
    //     connectingMessage: (
    //         <FormattedMessage
    //             defaultMessage="Connecting. Make sure the pin on your EV3 is set to 1234."
    //             description="Message to help people connect to their EV3. Must note the PIN should be 1234."
    //             id="gui.extension.ev3.connectingMessage"
    //         />
    //     ),
    //     helpLink: 'https://scratch.mit.edu/ev3'
    // },
    // 송하권, 2023.09.18
    // 'LEGO BOOST' 타사제품 미표시로 인한 주석처리
    // {
    //     name: 'LEGO BOOST',
    //     extensionId: 'boost',
    //     collaborator: 'LEGO',
    //     iconURL: boostIconURL,
    //     insetIconURL: boostInsetIconURL,
    //     description: (
    //         <FormattedMessage
    //             defaultMessage="Bring robotic creations to life."
    //             description="Description for the 'LEGO BOOST' extension"
    //             id="gui.extension.boost.description"
    //         />
    //     ),
    //     featured: true,
    //     disabled: false,
    //     bluetoothRequired: true,
    //     internetConnectionRequired: true,
    //     launchPeripheralConnectionFlow: true,
    //     useAutoScan: true,
    //     connectionIconURL: boostConnectionIconURL,
    //     connectionSmallIconURL: boostConnectionSmallIconURL,
    //     connectionTipIconURL: boostConnectionTipIconURL,
    //     connectingMessage: (
    //         <FormattedMessage
    //             defaultMessage="Connecting"
    //             description="Message to help people connect to their BOOST."
    //             id="gui.extension.boost.connectingMessage"
    //         />
    //     ),
    //     helpLink: 'https://scratch.mit.edu/boost'
    // },
    // 송하권, 2023.09.18
    // 'LEGO Education WeDo 2.0' 타사제품 미표시로 인한 주석처리
    // {
    //     name: 'LEGO Education WeDo 2.0',
    //     extensionId: 'wedo2',
    //     collaborator: 'LEGO',
    //     iconURL: wedo2IconURL,
    //     insetIconURL: wedo2InsetIconURL,
    //     description: (
    //         <FormattedMessage
    //             defaultMessage="Build with motors and sensors."
    //             description="Description for the 'LEGO WeDo 2.0' extension"
    //             id="gui.extension.wedo2.description"
    //         />
    //     ),
    //     featured: true,
    //     disabled: false,
    //     bluetoothRequired: true,
    //     internetConnectionRequired: true,
    //     launchPeripheralConnectionFlow: true,
    //     useAutoScan: true,
    //     connectionIconURL: wedo2ConnectionIconURL,
    //     connectionSmallIconURL: wedo2ConnectionSmallIconURL,
    //     connectionTipIconURL: wedo2ConnectionTipIconURL,
    //     connectingMessage: (
    //         <FormattedMessage
    //             defaultMessage="Connecting"
    //             description="Message to help people connect to their WeDo."
    //             id="gui.extension.wedo2.connectingMessage"
    //         />
    //     ),
    //     helpLink: 'https://scratch.mit.edu/wedo'
    // },
    // 송하권, 2023.09.18
    // 'Go Direct Force & Acceleration' 타사제품 미표시로 인한 주석처리
    // {
    //     name: 'Go Direct Force & Acceleration',
    //     extensionId: 'gdxfor',
    //     collaborator: 'Vernier',
    //     iconURL: gdxforIconURL,
    //     insetIconURL: gdxforInsetIconURL,
    //     description: (
    //         <FormattedMessage
    //             defaultMessage="Sense push, pull, motion, and spin."
    //             description="Description for the Vernier Go Direct Force and Acceleration sensor extension"
    //             id="gui.extension.gdxfor.description"
    //         />
    //     ),
    //     featured: true,
    //     disabled: false,
    //     bluetoothRequired: true,
    //     internetConnectionRequired: true,
    //     launchPeripheralConnectionFlow: true,
    //     useAutoScan: false,
    //     connectionIconURL: gdxforConnectionIconURL,
    //     connectionSmallIconURL: gdxforConnectionSmallIconURL,
    //     connectingMessage: (
    //         <FormattedMessage
    //             defaultMessage="Connecting"
    //             description="Message to help people connect to their force and acceleration sensor."
    //             id="gui.extension.gdxfor.connectingMessage"
    //         />
    //     ),
    //     helpLink: 'https://scratch.mit.edu/vernier'
    // }
];
