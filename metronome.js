const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const tempoInput = document.getElementById('tempo');
const timeSignatureSelect = document.getElementById('time-signature');
const subdivisionRadioButtons = document.querySelectorAll('#subdivision input[type="radio"]');
const tempoDisplay = document.getElementById('tempo-display');
let interval;

const beat1 = new Audio('1.mp3');
const beat2 = new Audio('2.mp3');
const beat3 = new Audio('3.mp3');
const beat4 = new Audio('4.mp3');

const beatsPool = [];

const eSamplePool = [];
const plusSamplePool = [];
const aSamplePool = [];

function playMetronome(bpm, subdivision, timeSignature) {
    if (interval) {
      clearInterval(interval);
    }
  
    if (timeSignature === '6/8') {
      bpm = bpm * 2 / 3;
    }
  
    let beatsPerMeasure;
    let subdivisionsPerBeat;
  
    switch (timeSignature) {
      case '4/4':
        beatsPerMeasure = 4;
        break;
      case '6/8':
        beatsPerMeasure = 6;
        break;
      case '3/4':
        beatsPerMeasure = 3;
        break;
      default:
        beatsPerMeasure = 4;
    }
  
    switch (subdivision) {
      case 'quarter':
        subdivisionsPerBeat = 1;
        break;
      case 'eighth':
        subdivisionsPerBeat = 2;
        break;
      case 'sixteenth':
        subdivisionsPerBeat = 4;
        break;
      default:
        subdivisionsPerBeat = 1;
    }
  
    if (timeSignature === '6/8') {
      if (subdivision === 'quarter') {
        subdivisionsPerBeat = 2; // Update subdivisionsPerBeat for 6/8 quarter notes
      } else if (subdivision === 'eighth') {
        subdivisionsPerBeat = 3; // Update subdivisionsPerBeat for 6/8 eighth notes
      }
    }
  
    const intervalDuration = 60000 / (bpm * subdivisionsPerBeat);
    let currentBeat = 0;
  
    interval = setInterval(() => {
      const beatInMeasure = currentBeat / subdivisionsPerBeat % beatsPerMeasure;
      const beatInSubdivision = currentBeat % subdivisionsPerBeat;
  
      if (beatInSubdivision === 0) {
        if (timeSignature === '6/8' && beatInMeasure >= 2) {
            beatsPool[1][0].play();
        } else {
            beatsPool[beatInMeasure][0].play();
        }
    }

      if (subdivisionsPerBeat === 2 && timeSignature !== '6/8') {
        if (beatInSubdivision === 1) {
        plusSamplePool[0].play();
        }
      } else if (subdivisionsPerBeat === 3 && timeSignature === '6/8') {
        if (beatInSubdivision === 1) {
            eSamplePool[0].play();
        } else if (beatInSubdivision === 2) {
            aSamplePool[0].play();
        }
      } else if (subdivisionsPerBeat === 4) {
        if (beatInSubdivision === 1) {
            eSamplePool[0].play();
        } else if (beatInSubdivision === 2) {
            plusSamplePool[0].play();
        } else if (beatInSubdivision === 3) {
            aSamplePool[0].play();
        }
      }
  
      currentBeat = (currentBeat + 1) % (beatsPerMeasure * subdivisionsPerBeat);
    }, intervalDuration);
  }
  


function stopMetronome() {
    clearInterval(interval);
}

startButton.addEventListener('click', () => {
    const bpm = parseInt(tempoInput.value);
    const timeSignature = timeSignatureSelect.value;
    const subdivision = getCurrentSubdivision();
    playMetronome(bpm, subdivision, timeSignature);
  });

timeSignatureSelect.addEventListener('change', () => {
    const bpm = parseInt(tempoInput.value);
    const timeSignature = timeSignatureSelect.value;
    const subdivision = getCurrentSubdivision();
    playMetronome(bpm, subdivision, timeSignature);
  });
  
stopButton.addEventListener('click', stopMetronome);

tempoInput.addEventListener('input', () => {
    tempoDisplay.textContent = tempoInput.value;
    if (interval) { // Only update the tempo if the metronome is running
      const bpm = parseInt(tempoInput.value);
      const timeSignature = timeSignatureSelect.value;
      const subdivision = getCurrentSubdivision();
      playMetronome(bpm, subdivision, timeSignature);
    }
  });


function getCurrentSubdivision() {
    for (const radioButton of subdivisionRadioButtons) {
      if (radioButton.checked) {
        return radioButton.value;
      }
    }
  }
  subdivisionRadioButtons.forEach(radioButton => {
    radioButton.addEventListener('change', () => {
      if (interval) { // Only update the subdivision if the metronome is running
        const bpm = parseInt(tempoInput.value);
        const subdivision = getCurrentSubdivision();
        const timeSignature = timeSignatureSelect.value;
        playMetronome(bpm, subdivision, timeSignature);
      }
    });
  });

function createAudioPool(src, count = 4) {
    const pool = [];
    for (let i = 0; i < count; i++) {
        pool.push(new Audio(src));
    }
    return pool;
}




function loadAudio(src) {
    return new Promise((resolve, reject) => {
        const audio = new Audio(src);
        audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.src = src;
    });
}


startButton.disabled = true;

Promise.all([
    loadAudio('1.mp3'),
    loadAudio('2.mp3'),
    loadAudio('3.mp3'),
    loadAudio('4.mp3'),
    loadAudio('e.mp3'),
    loadAudio('+.mp3'),
    loadAudio('a.mp3')
]).then(loadedSamples => {
    const [beat1, beat2, beat3, beat4, loadedESample, loadedPlusSample, loadedASample] = loadedSamples;
    beatsPool.push(createAudioPool(beat1.src), createAudioPool(beat2.src), createAudioPool(beat3.src), createAudioPool(beat4.src));
    eSamplePool.push(...createAudioPool(loadedESample.src));
    plusSamplePool.push(...createAudioPool(loadedPlusSample.src));
    aSamplePool.push(...createAudioPool(loadedASample.src));
    startButton.disabled = false;
}).catch(error => {
    console.error('Error loading audio files:', error);
    alert('Error loading audio files. Please refresh the page and try again.');
});