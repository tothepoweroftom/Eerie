import Tone from 'tone'
import {
    Math
} from 'three'

function lerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t
}
// import SessionManager from 
export default class AudioManager {

    constructor() {
        // this.initAudioListener();
        this.player = new Tone.Player("./audio/Inniu.mp3").toMaster();
        this.player.volume.value = -12;
        //play as soon as the buffer is loaded
        this.player.autostart = true;
        this.level = 0.0;
        this.midLevel = 0.0;
        this.autopan = new Tone.AutoPanner(10)

        this.tremolo = new Tone.Tremolo(0.1, 1.0).start().toMaster();
        var pingPong = new Tone.PingPongDelay("2n", 0.52).connect(this.tremolo)
        var filter = new Tone.Filter(800, "lowpass").connect(pingPong);

        this.mic = new Tone.UserMedia().connect(filter)
        this.micState = true;
        this.count = 0;

   

        window.addEventListener("mute", (state) => {

                this.setSource(false)
            
        }, false);
        window.addEventListener("startMP3", (state) => {

            this.setSource(true)
        
    }, false);
        // var reverb = new Tone.JCReverb(0.4)
        // var pitchShift = new Tone.PitchShift(-12)
        // pitchShift.windowSize = 0.01
        // var limiter = new Tone.Limiter(-6).toMaster()
        // let filter = new Tone.Filter(300, "lowpass");
        // // var delay = new Tone.FeedbackDelay(0.5);
        // this.mic.chain( this.autopan, this.tremolo, filter, limiter);
        this.bassMeter = new Tone.Meter();
        this.midMeter = new Tone.Meter();
        this.trebleMeter = new Tone.Meter();
        this.inited = false;
        this.follower = new Tone.Follower(0.94);
        this.state = 0;
        this.mp3 = true
        this.setSource(this.mp3)
        // Filters 
        this.bass = new Tone.Filter({
            type: "lowpass",
            frequency: 350,
            rolloff: -12,
            Q: 1,
            gain: 0
        });
        this.mid = new Tone.Filter({
            type: "bandpass",
            frequency: 900,
            Q: 0.4,
            gain: 6
        });
        this.treble = new Tone.Filter({
            type: "highpass",
            frequency: 5000,
            rolloff: -12,
            Q: 1,
            gain: 0
        });
    }

    setSource(bool) {
        console.log(bool)
        this.mp3 = bool
        if (bool) {
            this.mic.mute = true;
            this.player.mute = false;
        } else {
            this.mic.mute = false;
            this.player.mute = true;
        }
    }

    initAudioListener() {
        this.mic.open().then(() => {
            //promise resolves when input is available
            this.mic.fan(this.bass, this.mid, this.treble, this.follower);
            this.player.connect(this.follower)
            // this.bass.connect(this.bassMeter);
            // this.mid.connect(this.midMeter);
            // this.treble.connect(this.trebleMeter);
            this.follower.connect(this.midMeter)
            this.inited = true;
            var loop = new Tone.Loop((time)=>{
                //triggered every eighth note. 
                this.count += 1
                if(this.mp3 === false && this.count%5===0) {
                    this.micState = !this.micState
                    this.mic.mute = this.micState
                    // this.count = 0
                    console.log(time);

                }
            
            }, "2n").start(0);
            Tone.Transport.start();
            Tone.Transport.bpm.value = 60;
            // this.level = this.meter.getLevel();
        });


    }

    getAudioLevel() {

        if (this.inited) {
            this.midLevel = Math.mapLinear(this.midMeter.getLevel(), -80, -20, 0, 1);

            if (this.mp3) {
                this.midLevel = Math.clamp(this.midLevel, 0.2, 0.5);

            } else {
                this.midLevel = Math.clamp(this.midLevel, 0, 1.25);

            }
            // console.log(this.midLevel)
            return this.midLevel;
        } else {
            return 0.0
        }
    }


    getBassMidTreble() {

        if (this.inited) {
            this.bassLevel = Math.mapLinear(this.bassMeter.getLevel(), -80, 0, 0, 1);
            this.bassLevel = Math.clamp(this.midLevel, 0, 1);

            this.midLevel = Math.mapLinear(this.midMeter.getLevel(), -80, 0, 0, 1);
            this.midLevel = Math.clamp(this.midLevel, 0, 1);

            this.trebleLevel = Math.mapLinear(this.trebleMeter.getLevel(), -80, 0, 0, 1);
            this.trebleLevel = Math.clamp(this.midLevel, 0, 1);
            return [this.bassLevel, this.midLevel, this.trebleLevel];
        } else {
            return [0.0, 0.0, 0.0]
        }
    }










}