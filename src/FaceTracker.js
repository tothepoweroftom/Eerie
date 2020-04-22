import * as faceFilter from './FaceFilter/jeelizFaceFilterES6.js'
import * as neuralNetworkModel from './FaceFilter/NNC.json'
import * as neuralNetworkModelLite from './FaceFilter/NNClight.json'


export default class FaceTracker {
    constructor(threeRender) {

        this.threeRender = threeRender;
        this.lastTime = new Date();
        console.log(this.threeRender)
        faceFilter.init({
            //you can also provide the canvas directly
            //using the canvas property instead of canvasId:
            canvasId: 'jeeFaceFilterCanvas',
            NNC: neuralNetworkModel,
            callbackReady: function (errCode, spec) {
                if (errCode) {
                    console.log('AN ERROR HAPPENS. ERROR CODE =', errCode);
                    return;
                }
                // [init scene with spec...]
                console.log('INFO: JEEFACEFILTERAPI IS READY');
            }, //end callbackReady()

            //called at each render iteration (drawing loop)
            callbackTrack: this.callbackHeadMove.bind(this),
            // disableRestPosition: true
        }); //end init call
    }


    callbackHeadMove(mv) {
        // console.log(mv.rx)
        // update mouth opening:
        let mouth = false;
        let mouthOpening = (mv.expressions[0] - 0.2) * 5.0;
        mouthOpening = Math.min(Math.max(mouthOpening, 0), 1);
        if (mouthOpening > 0.75) {
            // console.log("mouth open")
            let current = new Date()
            if (current.getTime() - this.lastTime.getTime() > 3000) {
                mouth = true;
                this.lastTime = current
                var event = new Event('mouth');


                // Dispatch the event.
                window.dispatchEvent(event);
            }
        } else {
            mouth = false;
        }


        if (this.threeRender) {
            this.threeRender(mv, mouth);

            // this.threeRender(mv)

        }
    }
}