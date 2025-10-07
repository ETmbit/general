//////////////////////
//##################//
//##              ##//
//##  general.ts  ##//
//##              ##//
//##################//
//////////////////////

/*
The 'general' extention defines three types of handlers. Projects
based on the extension should use them to get a uniform approach
of handlers.
- 'handler'    is a plain handler
- 'rethandler' is a handler that returns a value
- 'prmhandler' is a handler that receive a number parameter

Projects based on the 'general' extension should implement the next
two handlers. They are called from this extension.
- 'runHandler'	is called upon pressing the A-button
- 'stopHandler' is called upon pressing the B-button

IMPORTANT NOTE:
Projects based on this 'general' extension may not implement the
next standard handlers. They are implemented in this extension.
- 'input.onLogoEvent' - sets the radio group by pressing the logo repeatedly.
- 'input.onButtonPressed' - will call 'runHandler()' or 'stopHandler()'.
- 'radio.onReceivedNumber' - will call 'messageHandler(number)'.
*/

type handler = () => void                   // plain handler
type prmhandler = (value: number) => void   // hander accepting a number parameter
type rethandler = () => number              // handler returning a number

let runHandler: handler      // call to activate a model
let stopHandler: handler     // call to stop all activity of a model

const LOW = 0
const HIGH = 1

let WAITABORT = false

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

input.onButtonPressed(Button.A, function () {
    WAITABORT = false
    if (runHandler) runHandler()
})

input.onButtonPressed(Button.B, function () {
    WAITABORT = true
    if (stopHandler) stopHandler()
})

//////////////////
//              //
// RADIO MODULE //
//              //
//////////////////

/*
Serveral projects incorporate radio communication between the models.
The group module creates a uniform approach to select the radio group
on which the models communicate and to send messages between the
models. The messaging system supports the performance of a 'wave'. It
delays the through put of a received radio message to the messageHander.

- The radio group is selected by repeatedly touching the logo-button.
- To receive radio messages a project must define the messageHander:
  'messageHandler = (message: number) => { ..code.. }'
- The wave delay time is set by 'General.setWave(seconds)' and the wave
  is (de)activated by 'General.waveOn()' and 'General.waveOff()'.
*/

let displayHandler: handler
let messageHandler: prmhandler

let GROUP = 1

const EVENTID = 200 + Math.randomRange(0, 100); // semi-unique id

let WAVE = false        // WAVE is set by General.waveOn
let WAVEWAIT = 1000     // WAVEWAIT is set by General.setWave

let tm_group = 0

control.onEvent(EVENTID, 0, function () {
    while (tm_group > control.millis()) { basic.pause(1) }
    displayGroup()
    tm_group = 0
})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    GROUP++
    if (GROUP > 9) GROUP = 1
    radio.setGroup(GROUP)
    basic.showNumber(GROUP)
    if (!tm_group) {
        tm_group = control.millis() + 1000
        control.raiseEvent(EVENTID, 0)
    }
    else
        tm_group = control.millis() + 1000
})

radio.onReceivedNumber(function (value: number) {
    if (WAVE) basic.pause(WAVEWAIT)
    if (messageHandler) messageHandler(value)
})

function displayGroup() {
    basic.showNumber(GROUP)
    basic.pause(500)
    if (displayHandler) displayHandler()
    else basic.showIcon(IconNames.Yes)
}

displayGroup()


//////////////////
//              //
// COLOR MODULE //
//              //
//////////////////

/*
The color module ensures uniform color definitions amongst the projects.
It defines color names and turns them into hexadecimal rgb values or
retrieves them from those values. Furthermore, one can pack and unpack
rgb color values and in/decrease the brightness of an rgb value.

- Color names are stored in enum Color.
- Transform red/green/blue values into the closest Color name by
  'fromRgbValues(red,green,blue):Color'.
- Transform an rgb value into the closest Color name by
  'fromRgb(rgb):Color'.
- Transform a Color name into its rgb value by 'fromColor(Color):rgb'.
- Pack rgb values by 'rgbValues(red,green,blue):rgb'
- Unpack rgb values by 'redValue(rgb):red', 'greenValue(rgb):green'
  and 'blueValue(rbg):blue'.
- Change the rgb brightness by 'brightness(rgb,percentage):rgb'.
*/

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


////////////////////
//                //
// MOTION  MODULE //	
//                //
////////////////////

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


///////////////////
//               //
// BLOCKS MODULE //
//               //
///////////////////

//% color="#61CBF4" icon="\uf075"
//% block="General"
//% block.loc.nl="Algemeen"
namespace General {

    //% color="#008800"
    //% block="comment: %dummy"
    //% block.loc.nl="uitleg: %dummy"
    //% dummy.defl="schrijf hier je uitleg"
    export function comment(dummy: string) {
    }

    //% block="turn off the wave"
    //% block.loc.nl="zet de wave uit"
    export function waveOff() {
        WAVE = false;
    }

    //% block="turn on the wave"
    //% block.loc.nl="zet de wave aan"
    export function waveOn() {
        WAVE = true;
    }

    //% block="wave after %sec seconds"
    //% block.loc.nl="wave na %sec seconden"
    export function setWave(sec: number) {
        WAVEWAIT = sec * 1000
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

    //% block="wait until %state"
    //% block.loc.nl="wacht totdat %state"
    export function waitUntil(state: boolean) {
        while (!state) {
			if (WAITABORT) return
			basic.pause(1)
		}
    }

    //% block="wait %sec seconds"
    //% block.loc.nl="wacht %sec seconden"
    export function wait(sec: number) {
		let tm = control.millis() + sec * 1000
        while (control.millis() < tm) {
			if (WAITABORT) return
			basic.pause(1)
		}
    }
}
