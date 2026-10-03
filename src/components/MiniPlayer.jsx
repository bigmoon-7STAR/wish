import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_COLOR = 'rgba(30, 30, 30, 1)';

// 画像を小さなCanvasに縮小して平均色を求める（中心1ピクセルより安定する）
function extractAverageColor(img) {
  const size = 16;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  let r = 0, g = 0, b = 0;
  const count = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]; g += data[i + 1]; b += data[i + 2];
  }
  return `rgba(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)}, 0.8)`;
}

const MiniPlayer = ({ currentTrack, onPrev, onNext }) => {
  const [bgColor, setBgColor] = useState(DEFAULT_COLOR);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // ジャケット画像が変わったら色を抽出
  useEffect(() => {
    if (!currentTrack?.coverArt) {
      setBgColor(DEFAULT_COLOR);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous'; // src より先に設定する（後だとCanvasが汚染される）
    img.onload = () => {
      if (cancelled) return;
      try {
        setBgColor(extractAverageColor(img));
      } catch (err) {
        // CORS不許可の画像など
        console.warn('色の抽出に失敗しました:', err);
        setBgColor(DEFAULT_COLOR);
      }
    };
    img.onerror = () => !cancelled && setBgColor(DEFAULT_COLOR);
    img.src = currentTrack.coverArt;
    return () => { cancelled = true; };
  }, [currentTrack?.coverArt]);

  // 曲が変わったら先頭から再生
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) { setIsPlaying(false); return; }
    audio.load();
    audio.play().catch(() => setIsPlaying(false)); // 自動再生ブロック時は停止状態のまま
  }, [currentTrack?.audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };

  const btn = { background: 'none', border: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer' };

  return (
    <div
      className="mini-player"
      style={{
        background: `linear-gradient(135deg, ${bgColor} 0%, rgba(10,10,10,1) 100%)`,
        position: 'fixed', bottom: 0, left: 0, width: '100%', height: '90px',
        display: 'flex', alignItems: 'center', padding: '0 20px', color: 'white',
        boxSizing: 'border-box', transition: 'background 0.5s ease',
      }}
    >
      {currentTrack && (
        <img
          src={currentTrack.coverArt}
          alt={`${currentTrack.title} のジャケット`}
          style={{ width: 60, height: 60, borderRadius: 8, marginRight: 15, objectFit: 'cover' }}
        />
      )}

      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <h4 style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentTrack ? currentTrack.title : '未選択'}
        </h4>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#ccc' }}>
          {currentTrack ? currentTrack.artist : '-'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 15 }}>
        <button style={btn} onClick={onPrev} disabled={!onPrev} aria-label="前の曲">⏮</button>
        <button style={btn} onClick={togglePlay} disabled={!currentTrack} aria-label={isPlaying ? '一時停止' : '再生'}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button style={btn} onClick={onNext} disabled={!onNext} aria-label="次の曲">⏭</button>
      </div>

      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => onNext?.()}
        />
      )}
    </div>
  );
};

export default MiniPlayer;
