/*
File:      github.com/ETmbit/general.ts
Copyright: ETmbit, 2026

License:
This file is part of the ETmbit extensions for MakeCode for micro:bit.
It is free software and you may distribute it under the terms of the
GNU General Public License (version 3 or later) as published by the
Free Software Foundation. The full license text you find at
https://www.gnu.org/licenses.

Disclaimer:
ETmbit extensions are distributed without any warranty.

Dependencies:
None
*/

/*
The 'general' extention defines three types of handlers. Projects
based on the extension should use them to get a uniform approach
of handlers.
- 'handler'    is a plain handler
- 'numhandler' is a handler that receives a number parameter
- 'strhandler' is a handler that receives a string parameter
- 'rethandler' is a handler that returns a status (number)

IMPORTANT NOTE:
Projects based on this 'general' extension MAY NOT implement the
next standard handlers. They are implemented in this extension and will be
overruled when used in a main program.
- 'input.onLogoEvent' - sets the radio group by pressing the logo repeatedly.
- 'input.onButtonPressed' - will call registered 'ETstartHandlers' or 'ETstopHandlers'.
- 'radio.onReceivedString' - will call registered 'ETradioHandlers'.
*/

type handler = () => void
type numhandler = (value: number) => void
type strhandler = (value: string) => void
type rethandler = () => number

const LOW = 0
const HIGH = 1

let ETwaitAbort = false // Aborts a wait function when set true by pressing the B-button.
let ETwaveDelay = 0     // Delay time to accomplish a wave amongst several robots.
// To activate a wave one needs the extension 'ETmbit/wave'

enum State {
    //% block="off"
    //% block.loc.nl="uit"
    Off,
    //% block="on"
    //% block.loc.nl="aan"
    On,
}

enum Pace {
    //% block="fast"
    //% block.loc.nl="snelle"
    Fast,
    //% block="normal"
    //% block.loc.nl="normale"
    Normal,
    //% block="slow"
    //% block.loc.nl="langzame"
    Slow,
}


//##### START AND STOP BUTTON HANDLING #####//


let ETstartHandlers: handler[] = []
let ETstopHandlers: handler[] = []
let ETbuttonAHandler: handler
let ETbuttonBHandler: handler

input.onButtonPressed(Button.A, function () {
    ETwaitAbort = false
    for (let ix = 0; ix < ETstartHandlers.length; ix++)
        ETstartHandlers[ix]()
    if (ETbuttonAHandler) ETbuttonAHandler()
})

input.onButtonPressed(Button.B, function () {
    ETwaitAbort = true
    for (let ix = 0; ix < ETstopHandlers.length; ix++)
        ETstopHandlers[ix]()
    if (ETbuttonBHandler) ETbuttonBHandler()
})


//##### RADIO MESSAGE HANDLING #####//


let ETradioIds: string[] = []
let ETradioMsgs: string[] = []
let ETradioHandlers: strhandler[] = []

let ETdisplayHandlers: handler[] = []

let ETlogoHandler: handler
let ETradioHandler: strhandler

const ETeventId = 200 + Math.randomRange(0, 100) // semi-unique id
let ETgroup = 1
let ETgroupTimer = 0
let ETgroupSet = false

function display() {
    if (ETdisplayHandlers.length) {
        for (let ix = 0; ix < ETdisplayHandlers.length; ix++)
            ETdisplayHandlers[ix]()
    }
    else
        basic.showIcon(IconNames.Yes)
}

function displayGroup() {
    basic.showNumber(ETgroup)
    display()
    if (ETlogoHandler) ETlogoHandler()
}

control.onEvent(ETeventId, 0, function () {
    while (ETgroupTimer > control.millis()) { basic.pause(1) }
    displayGroup()
    ETgroupTimer = 0
    ETgroupSet = false
})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (ETgroupSet) {
        ETgroup++
        if (ETgroup > 9) ETgroup = 1
        radio.setGroup(ETgroup)
    }
    else
        ETgroupSet = true
    basic.showNumber(ETgroup)
    if (!ETgroupTimer) {
        ETgroupTimer = control.millis() + 1000
        control.raiseEvent(ETeventId, 0)
    }
    else
        ETgroupTimer = control.millis() + 1000
})

radio.onReceivedString(function (msg: string) {
    // messages end with a '~'
    // messages are received in chunks
    // mbit radio buffer size is only 19 bytes
    //
    // chunk format:
    // -------------
    // char 0..1 :   id
    // char 2..18 :  msg chunk 

    let msgend = false
    let chunk: string
    let idstr = msg.substr(0, 2)
    let id = +idstr
    if (msg.substr(msg.length - 1) == "~") {
        msgend = true
        chunk = msg.substr(2, msg.length - 3)
    }
    else
        chunk = msg.substr(2, msg.length - 2)

    let ix: number
    for (ix = 0; ix < ETradioIds.length; ix++) {
        if (idstr == ETradioIds[ix]) break
    }
    if (ix == ETradioIds.length) {
        // if the message comes from a program
        // maybe the id is a new one
        if (id <= 0 || id >= 100) return
        General.registerMessageHandler(idstr, ETradioHandler)
    }

    ETradioMsgs[ix] += chunk
    if (msgend) {
        ETradioHandlers[ix](ETradioMsgs[ix])
        ETradioMsgs[ix] = ""
    }
})

radio.setGroup(1)
displayGroup()


//##### COLOR HANDLING #####//


enum Color {
    //% block="off"
    //% block.loc.nl="uit"
    None,
    //% block="red"
    //% block.loc.nl="rood"
    Red,
    //% block="green"
    //% block.loc.nl="groen"
    Green,
    //% block="blue"
    //% block.loc.nl="blauw"
    Blue,
    //% block="yellow"
    //% block.loc.nl="geel"
    Yellow,
    //% block="cyan"
    //% block.loc.nl="cyaan"
    Cyan,
    //% block="magenta"
    //% block.loc.nl="magenta"
    Magenta,
    //% block="black"
    //% block.loc.nl="zwart"
    Black,
    //% block="dark grey"
    //% block.loc.nl="donkergrijs"
    DarkGrey,
    //% block="grey"
    //% block.loc.nl="grijs"
    Grey,
    //% block="light grey"
    //% block.loc.nl="lichtgrijs"
    LightGrey,
    //% block="white"
    //% block.loc.nl="wit"
    White,
    //% block="orange"
    //% block.loc.nl="oranje"
    Orange,
    //% block="brown"
    //% block.loc.nl="bruin"
    Brown,
    //% block="pink"
    //% block.loc.nl="roze"
    Pink,
    //% block="indigo"
    //% block.loc.nl="indigo"
    Indigo,
    //% block="violet"
    //% block.loc.nl="violet"
    Violet,
    //% block="purple"
    //% block.loc.nl="paars"
    Purple
}

function rgbValues(red: number, green: number, blue: number): number {
    let rgb = ((red & 0xFF) << 16) | ((green & 0xFF) << 8) | (blue & 0xFF)
    return rgb;
}

function redValue(rgb: number): number {
    let r = (rgb >> 16) & 0xFF;
    return r;
}

function greenValue(rgb: number): number {
    let g = (rgb >> 8) & 0xFF;
    return g;
}

function blueValue(rgb: number): number {
    let b = (rgb) & 0xFF;
    return b;
}

function fromColor(color: Color): number {
    let val = 0
    switch (color) {
        case Color.Red: val = 0xFF0000; break;
        case Color.Green: val = 0x00FF00; break;
        case Color.Blue: val = 0x0000FF; break;
        case Color.Yellow: val = 0xFFFF00; break;
        case Color.Cyan: val = 0x00FFFF; break;
        case Color.Magenta: val = 0xFF00FF; break;
        case Color.Black: val = 0x000000; break;
        case Color.DarkGrey: val = 0xA9A9A9; break;
        case Color.Grey: val = 0x808080; break;
        case Color.LightGrey: val = 0xD3D3D3; break;
        case Color.White: val = 0xFFFFFF; break;
        case Color.Orange: val = 0xFFA500; break;
        case Color.Brown: val = 0xA52A2A; break;
        case Color.Pink: val = 0xFFC0CB; break;
        case Color.Indigo: val = 0x4b0082; break;
        case Color.Violet: val = 0x8a2be2; break;
        case Color.Purple: val = 0x800080; break;
    }
    return val
}

function fromRgbValues(red: number, green: number, blue: number): Color {
    let max = -1
    let min = -1
    let hue = 0

    if (red > green && red > blue) max = red
    if (green > red && green > blue) max = green
    if (blue > red && blue > green) max = blue
    if (red < green && red < blue) min = red
    if (green < red && green < blue) min = green
    if (blue < red && blue < green) min = blue

    if (red == max) hue = (0 + (green - blue) / (max - min)) * 60
    if (green == max) hue = (2 + (blue - red) / (max - min)) * 60
    if (blue == max) hue = (4 + (red - green) / (max - min)) * 60

    if (hue < 0) hue += 360

    // translate hue to color names
    if (hue == 0) return Color.White
    if (hue < 5) return Color.Orange
    if (hue < 30) return Color.Brown
    if (hue < 100) return Color.Yellow
    if (hue < 190) return Color.Green
    if (hue < 206) return Color.Cyan
    if (hue < 213) return Color.Blue
    if (hue < 217) return Color.Black
    if (hue < 230) return Color.Indigo
    if (hue < 255) return Color.Purple
    if (hue < 272) return Color.Pink
    if (hue < 300) return Color.Magenta
    return Color.Red
}

function fromRgb(rgb: number): Color {
    let red = redValue(rgb);
    let green = greenValue(rgb);
    let blue = blueValue(rgb);
    return fromRgbValues(red, green, blue)
}


//##### MOTION ENUMS #####//


enum Move {
    //% block="forward"
    //% block.loc.nl="vooruit"
    Forward,
    //% block="backward"
    //% block.loc.nl="achteruit"
    Backward,
}

enum Turn {
    //% block="left"
    //% block.loc.nl="links"
    Left,
    //% block="right"
    //% block.loc.nl="rechts"
    Right,
}

enum Rotate {
    //% block="clockwise"
    //% block.loc.nl="rechtsom"
    Clockwise,
    //% block="anticlockwise"
    //% block.loc.nl="linksom"
    AntiClockwise,
}

// in the block.loc.nl definition add "naar" in front
enum Movement {
    //% block="forward"
    //% block.loc.nl="voren"
    Forward,
    //% block="backward"
    //% block.loc.nl="achteren"
    Backward,
    //% block="to the left"
    //% block.loc.nl="links"
    Left,
    //% block="to the right"
    //% block.loc.nl="rechts"
    Right,
}


//##### GENERAL CODE BLOCKS #####//


//% color="#61CBF4" icon="\uf075"
//% block="General"
//% block.loc.nl="Algemeen"
namespace General {

    export function registerStartHandler(hnd: handler): number {
        ETstartHandlers.push(hnd)
        return ETstartHandlers.length - 1
    }

    export function registerStopHandler(hnd: handler): number {
        ETstopHandlers.push(hnd)
        return ETstopHandlers.length - 1
    }

    export function registerMessageHandler(id: string, hnd: strhandler) {
        // the message handler will be called after receiveing a
        // radio string message (see radio.onReceivedString)
        switch (id.length) {
            case 0: id = "ET"; break
            case 1: id += "#"; break
            case 2: break
            default: id = id.substr(0, 2)
        }
        ETradioHandlers.push(hnd)
        ETradioIds.push(id)
        ETradioMsgs.push("")
        return ETradioHandlers.length - 1
    }

    export function registerDisplayHandler(hnd: handler) {
        // the display handler will be called after changing
        // the radio group by touching the micro:bit logo
        // (see input.onLogoEvent and control.onEvent)
        ETdisplayHandlers.push(hnd)
        return ETdisplayHandlers.length - 1
    }

    //% subcategory="Invoer"
    //% color="#FFC000"
    //% block="when the logo is pressed"
    //% block.loc.nl="wanneer op het logo wordt gedrukt"
    export function onPressedLogo(code: () => void): void {
        ETlogoHandler = code
    }

    //% subcategory="Invoer"
    //% color="#FFC000"
    //% block="when button B is pressed"
    //% block.loc.nl="wanneer op knop B wordt gedrukt"
    export function onPressedB(code: () => void): void {
        ETbuttonBHandler = code
    }

    //% subcategory="Invoer"
    //% color="#FFC000"
    //% block="when button A is pressed"
    //% block.loc.nl="wanneer op knop A wordt gedrukt"
    export function onPressedA(code: () => void): void {
        ETbuttonAHandler = code
    }

    //% subcategory="Radio"
    //% color="#FFC000"
    //% block="when a message is received in "
    //% block.loc.nl="wanneer een bericht wordt ontvangen in "
    //% draggableParameters="reporter"
    export function onRadioMessage(code: (tekst: string) => void): void {
        ETradioHandler = code
    }

    //% subcategory="Radio"
    //% block="send message %text with id %id"
    //% block.loc.nl="stuur het bericht %text met id %id"
    //% id.min=1 id.max=99 id.defl=1
    export function sendRadioMessage(msg: string, id: number) {
        // messages end with a '~'
        // messages are sent in chunks
        // mbit radio buffer size is only 19 bytes
        //
        // chunk format:
        // -------------
        // char 0..1 :   id
        // char 2..18 :  msg chunk 

        // ensure that id is a number from 1 up to and including 99
        if (id <= 0 || id >= 100) return

        // ensure that id is a two digit number
        let idstr: string
        if (id < 10)
            idstr = "0" + id.toString()
        else
            idstr = id.toString()

        let chunk: string
        do {
            chunk = msg.substr(0, 17)
            msg = msg.substr(17)
            if (chunk.length < 17)
                chunk += '~'
            radio.sendString(idstr + chunk)
            basic.pause(1)
        } while (msg.length > 0)
    }

    //% color="#008800"
    //% block="comment: %dummy"
    //% block.loc.nl="uitleg: %dummy"
    //% dummy.defl="schrijf hier je uitleg"
    export function comment(dummy: string) {
    }

    //% block="a number from %min upto %max"
    //% block.loc.nl="een getal van %min t/m %max"
    //% min.defl=0 max.defl=10
    export function randomInt(min: number, max: number): number {
        let i = 0
        if (min > max) {
            i = min
            min = max
            max = i
        }
        i = max - min + 1
        i = min + Math.floor(Math.random() * i)
        return i
    }

    //% block="color %clr"
    //% block.loc.nl="kleur %clr"
    export function color(clr: Color): Color {
        return clr
    }

    //% block="wait %sec seconds"
    //% block.loc.nl="wacht %sec seconden"
    export function wait(sec: number) {
        let tm = control.millis() + sec * 1000
        while (control.millis() < tm) {
            if (ETwaitAbort) {
                ETwaitAbort = false
                return
            }
            basic.pause(1)
        }
    }
}
