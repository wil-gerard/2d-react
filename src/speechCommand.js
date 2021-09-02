
import * as tf from '@tensorflow/tfjs'; // eslint-disable-line
import * as speechCommands from '@tensorflow-models/speech-commands';

const recognizer = speechCommands.create('BROWSER_FFT', 'directional4w');
let callback = null;

async function initSpeechRecognizer (cb) {
    await recognizer.ensureModelLoaded();

    callback = cb;
};

const suppressionTimeMillis = 1000;

recognizer
  .listen(
    result => {
      checkPredictions(recognizer.wordLabels(), result.scores,
      2, suppressionTimeMillis);
    },
    {
      includeSpectrogram: true,
      suppressionTimeMillis,
      probabilityThreshold: 0.9
    }
  )
  .then(() => {
    console.log("Streaming recognition started.");
  })
  .catch(err => {
    console.log("ERROR: Failed to start streaming display: " + err.message);
  });

const checkPredictions = (
  candidateWords,
  probabilities,
  topK,
  timeToLiveMillis
) => {
  if (topK != null) {
    let wordsAndProbs = [];
    for (let i = 0; i < candidateWords.length; ++i) {
      wordsAndProbs.push([candidateWords[i], probabilities[i]]);
    }
    wordsAndProbs.sort((a, b) => b[1] - a[1]);
    wordsAndProbs = wordsAndProbs.slice(0, topK);
    candidateWords = wordsAndProbs.map(item => item[0]);
    probabilities = wordsAndProbs.map(item => item[1]);
    console.log(wordsAndProbs);
    // Highlight the top word.
    const topWord = wordsAndProbs[0][0];
    
    if (topWord === 'up') { // if Tensorflow hears 'up' call callback which === handleSpeechInput
        if (callback !== null) callback();
        console.log('up');
    }
  }
}

export { initSpeechRecognizer }