export async function audioBlobToWav(blob: Blob): Promise<{ blob: Blob; mime: string }> {
  try {
    const AC: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const buffer = await ctx.decodeAudioData(await blob.arrayBuffer());
    ctx.close();

    const targetRate = 16000;
    const ratio = buffer.sampleRate / targetRate;
    const sampleCount = Math.ceil(buffer.length / ratio);
    const pcm = new Int16Array(sampleCount);
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < sampleCount; i++) {
      let v = channel[Math.floor(i * ratio)];
      if (v > 1) v = 1;
      if (v < -1) v = -1;
      pcm[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
    }

    const header = new ArrayBuffer(44);
    const dv = new DataView(header);
    const writeStr = (offset: number, s: string) => {
      for (let i = 0; i < s.length; i++) dv.setUint8(offset + i, s.charCodeAt(i));
    };
    writeStr(0, 'RIFF');
    dv.setUint32(4, 36 + pcm.byteLength, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    dv.setUint32(16, 16, true);
    dv.setUint16(20, 1, true);
    dv.setUint16(22, 1, true);
    dv.setUint32(24, targetRate, true);
    dv.setUint32(28, targetRate * 2, true);
    dv.setUint16(32, 2, true);
    dv.setUint16(34, 16, true);
    writeStr(36, 'data');
    dv.setUint32(40, pcm.byteLength, true);

    return { blob: new Blob([header, pcm], { type: 'audio/wav' }), mime: 'audio/wav' };
  } catch {
    return { blob, mime: blob.type || 'audio/webm' };
  }
}