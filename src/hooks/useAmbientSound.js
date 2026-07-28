import { useCallback, useEffect, useRef, useState } from 'react';

const AMBIENT_LEVEL = 0.028;

export default function useAmbientSound() {
  const audioContextRef = useRef(null);
  const ambientGainRef = useRef(null);
  const noiseSourceRef = useRef(null);
  const startTimerRef = useRef(null);
  const [ambientOn, setAmbientOn] = useState(false);

  const createAmbient = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error('Web Audio is unavailable.');

    const audioContext = new AudioContextClass();
    const ambientGain = audioContext.createGain();
    ambientGain.gain.value = AMBIENT_LEVEL;
    ambientGain.connect(audioContext.destination);

    const bufferSize = audioContext.sampleRate * 4;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < bufferSize; index += 1) {
      data[index] = (Math.random() * 2 - 1) * 0.22;
    }

    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 520;
    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 90;
    noiseSource.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(ambientGain);
    noiseSource.start();

    audioContextRef.current = audioContext;
    ambientGainRef.current = ambientGain;
    noiseSourceRef.current = noiseSource;
    return audioContext;
  }, []);

  const setAmbient = useCallback(async (on) => {
    const audioContext = createAmbient();
    if (audioContext.state === 'suspended') await audioContext.resume();
    const ambientGain = ambientGainRef.current;
    ambientGain.gain.cancelScheduledValues(audioContext.currentTime);
    ambientGain.gain.linearRampToValueAtTime(
      on ? AMBIENT_LEVEL : 0,
      audioContext.currentTime + 0.35,
    );
    setAmbientOn(on);
  }, [createAmbient]);

  const toggleAmbient = useCallback(() => {
    setAmbient(!ambientOn).catch(() => setAmbientOn(false));
  }, [ambientOn, setAmbient]);

  const scheduleAmbient = useCallback((delay = 450) => {
    window.clearTimeout(startTimerRef.current);
    startTimerRef.current = window.setTimeout(() => {
      setAmbient(true).catch(() => setAmbientOn(false));
    }, delay);
  }, [setAmbient]);

  useEffect(() => () => {
    window.clearTimeout(startTimerRef.current);
    try {
      noiseSourceRef.current?.stop();
    } catch {
      // The source may already have stopped during browser teardown.
    }
    const closing = audioContextRef.current?.close?.();
    closing?.catch?.(() => {});
  }, []);

  return {
    ambientOn,
    scheduleAmbient,
    toggleAmbient,
  };
}
