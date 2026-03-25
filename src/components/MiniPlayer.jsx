import React, { useState, useEffect, useRef } from 'react';

const MiniPlayer = ({ currentTrack }) => {
  const [bgColor, setBgColor] = useState('rgba(30, 30, 30, 1)'); // デフォルトの暗い背景
  const audioRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // ジャケット画像が変更されたら色を抽出する処理
  useEffect(() => {
    if (!currentTrack || !currentTrack.coverArt) return;

    const img = imgRef.current;
    img.crossOrigin = "Anonymous"; // CORSエラー回避
    
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 画像をCanvasに描画
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      // 画像の中心付近のピクセルデータを取得してメインカラーを推測（簡易版）
      const imageData = ctx.getImageData(img.width / 2, img.height / 2, 1, 1).data;
      const rgb = `rgba(${imageData[0]}, ${imageData[1]}, ${imageData[2]}, 0.8)`;
      
      setBgColor(rgb);
    };
  }, [currentTrack]);

  return (
    <div 
      className="mini-player"
      style={{
        // 動的にグラデーションを生成
        background: `linear-gradient(135deg, ${bgColor} 0%, rgba(10,10,10,1) 100%)`,
        position: 'fixed',
        bottom: 0,
        width: '100%',
        height: '90px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        color: 'white',
        transition: 'background 0.5s ease' // ふんわり色が切り替わる演出
      }}
    >
      {/* 隠しCanvas (色抽出用) */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {/* ジャケット画像 */}
      {currentTrack && (
        <img 
          ref={imgRef}
          src={currentTrack.coverArt} 
          alt="cover" 
          style={{ width: '60px', height: '60px', borderRadius: '8px', marginRight: '15px' }}
        />
      )}

      {/* 曲情報 */}
      <div style={{ flexGrow: 1 }}>
        <h4 style={{ margin: 0 }}>{currentTrack ? currentTrack.title : '未選択'}</h4>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#ccc' }}>
          {currentTrack ? currentTrack.artist : '-'}
        </p>
      </div>

      {/* コントロールボタン（UIのみ） */}
      <div style={{ display: 'flex', gap: '15px' }}>
        <button>⏮</button>
        <button onClick={() => audioRef.current?.play()}>▶</button>
        <button onClick={() => audioRef.current?.pause()}>⏸</button>
        <button>⏭</button>
      </div>

      {/* 実際のオーディオ要素 (バックグラウンド再生用) */}
      {currentTrack && (
        <audio ref={audioRef} src={currentTrack.audioUrl} />
      )}
    </div>
  );
};

export default MiniPlayer;
