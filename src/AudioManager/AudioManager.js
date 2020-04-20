import Tone from 'tone'
import {
    Math
} from 'three'

// import SessionManager from 
export default class AudioManager {

    constructor() {
        // this.initAudioListener();
        this.level = 0.0;
        this.midLevel = 0.0;
        this.mic = new Tone.UserMedia();
        this.bassMeter = new Tone.Meter();
        this.midMeter = new Tone.Meter();
        this.trebleMeter = new Tone.Meter();
        this.inited = false;
        this.state = 0;
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

    initAudioListener() {
        this.mic.open().then(() => {
            //promise resolves when input is available
            this.mic.fan(this.bass, this.mid, this.treble);
            this.bass.connect(this.bassMeter);
            this.mid.connect(this.midMeter);
            this.treble.connect(this.trebleMeter);
            this.inited = true;
            // this.level = this.meter.getLevel();
        });


    }

    getAudioLevel() {

        if (this.inited) {
            this.midLevel = Math.mapLinear(this.midMeter.getLevel(), -70, 0, 0, 1);
            this.midLevel = Math.clamp(this.midLevel, 0, 1);
            //console.log(this.midLevel)
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
            return [0.0,0.0,0.0]
        }
    }










}

