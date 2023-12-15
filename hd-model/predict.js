//ML Prediction function block start
const tf = require('@tensorflow/tfjs-node');

//async execPredict(req, res) => {

exports.execPredict = async function predict(vitals) {
    console.log('entering predict function');
    const MODEL_URL = 'file://../../hd-model/heart-model.json';
    const WEIGHTS_URL = 'file://../../hd-model/hd-model.bin';
    const model = await tf.loadLayersModel(MODEL_URL, WEIGHTS_URL);
    console.log('model loaded');
    const input = tf.tensor2d([vitals]);
    const prediction = model.predict(input);
    const pIndex = tf.argMax(prediction, axis = 1);
    const p = pIndex.dataSync()[0];
    console.log(p);
    return p;
}
//ML Prediction function block end