import React, { useState, useRef } from 'react';

// 🤖 文章を単語ごとに区切った配列
const SENTENCE_WORDS = ["I'm", "looking", "forward", "to", "meet", "you."];

function App() {
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [isDestroyed, setIsDestroyed] = useState(false);

  // 🗡️ 日本刀（持ち手）の現在座標
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // ⚡ 剣の刃が通った「軌跡（残像）」のスタイルデータ
  const [slashLine, setSlashLine] = useState(null);

  // 🎯 過去の刃先・持ち手の座標を記憶するリファレンス
  const oldPositionRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef(null);

  // 通常画面からバトル画面へ移行時の初期配置
  const handleWordClick = (index) => {
    setFocusedIndex(index);
    setIsDestroyed(false);
    setSlashLine(null);

    // 画面下部中央に日本刀を構える
    const initX = window.innerWidth / 2;
    const initY = window.innerHeight - 150;
    setPosition({ x: initX, y: initY });
    oldPositionRef.current = { x: initX, y: initY };
  };

  // 📱 指（マウス）で日本刀を掴んだ瞬間
  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (focusedIndex === null || isDestroyed) return;
    setIsDragging(true);
    
    // スマホでの指のすり抜けを100%防止するおまじない
    e.target.setPointerCapture(e.pointerId);
    oldPositionRef.current = { x: position.x, y: position.y };
  };

  // 🔄 剣を振り回している間の「軌跡計算」と「切断判定」
  const handlePointerMove = (e) => {
    if (!isDragging || isDestroyed) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    // 1. 刀の持ち手を指の座標に同期
    setPosition({ x: currentX, y: currentY });

    const swordBladeLength = 250; // 日本刀の刃の長さ(px)

    // 2. 「今回の刃先・持ち手」と「前回の刃先・持ち手」の4つの座標を確定
    const currentHandle = { x: currentX, y: currentY };
    const currentTip = { x: currentX, y: currentY - swordBladeLength };
    const oldHandle = { x: oldPositionRef.current.x, y: oldPositionRef.current.y };
    const oldTip = { x: oldPositionRef.current.x, y: oldPositionRef.current.y - swordBladeLength };

    // 3. ⚡ 剣の通った軌跡（前回の刃先から今回の刃先まで）を視覚化する
    const distance = Math.hypot(currentTip.x - oldTip.x, currentTip.y - oldTip.y);
    if (distance > 8) {
      const angle = Math.atan2(currentTip.y - oldTip.y, currentTip.x - oldTip.x) * (180 / Math.PI);
      setSlashLine({
        x: oldTip.x,
        y: oldTip.y,
        length: distance,
        angle: angle
      });
    }

    // 4. 🎯 【最重要】「剣の軌跡が作った面」がブロックを通過したかの切断判定
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const t1 = { x: centerX, y: rect.top };    
      const t2 = { x: centerX, y: rect.bottom }; 

      // 軌跡の網を張る（刃先の移動線、および前後のブレードが作った四角形を網羅判定）
      const isTipCrossed = checkLineIntersection(oldTip, currentTip, t1, t2);
      const isSlashCrossed = checkLineIntersection(oldTip, currentHandle, t1, t2) || 
                             checkLineIntersection(oldHandle, currentTip, t1, t2);

      // 剣の通った軌跡がブロックの判定線を一瞬でも通過したら、一刀両断！
      if (isTipCrossed || isSlashCrossed) {
        setIsDestroyed(true); // 💥 切断成功！
        setIsDragging(false);
        if (navigator.vibrate) navigator.vibrate(120); // 強めの斬撃振動
        
        // 斬撃の余韻を残して、軌跡エフェクトをフェードアウト
        setTimeout(() => setSlashLine(null), 300);
      }
    }

    // 次回のフレーム判定用に現在の位置を記憶
    oldPositionRef.current = { x: currentX, y: currentY };
  };

  // ✋ 剣を離したとき
  const handlePointerUp = (e) => {
    setIsDragging(false);
    if (e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }
    if (!isDestroyed) setSlashLine(null);
  };

  return (
    <div 
      style={{
        width: '100vw', height: '100vh', 
        backgroundColor: '#0f3d23', // カジノグリーン背景
        position: 'relative', overflow: 'hidden',
        touchAction: 'none', userSelect: 'none'
      }}
    >
      <h1 style={{ color: '#ffd700', fontSize: '16px', padding: '10px', position: 'absolute', zIndex: 20 }}>
        刀剣軌跡・切断システム
      </h1>

      {focusedIndex === null ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '100px 50px', justifyContent: 'center' }}>
          {SENTENCE_WORDS.map((word, index) => (
            <div key={index} onClick={() => handleWordClick(index)} style={{ padding: '15px 25px', backgroundColor: '#333', color: '#fff', fontSize: '24px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>
              {word}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '150px' }}>
          
          <button onClick={() => setFocusedIndex(null)} style={{ position: 'absolute', top: '20px', left: '20px', padding: '10px 20px', zIndex: 10, borderRadius: '8px', border: 'none', backgroundColor: '#e0e0e0', fontWeight: 'bold' }}>
            ◀ 戻る
          </button>

          {/* 🎯 切断されるターゲットブロック（英単語） */}
          <div ref={targetRef} style={{ display: 'flex', gap: isDestroyed ? '100px' : '0px', color: '#fff', fontSize: '80px', fontWeight: 'bold', zIndex: 5, filter: 'drop-shadow(0 10px 20px rgba(255,71,87,0.4))', transition: 'all 0.4s ease' }}>
            <div style={{ padding: '30px 0px 30px 50px', backgroundColor: '#ff4757', borderRadius: '16px 0 0 16px', transform: isDestroyed ? 'translateX(-50px) rotate(-15deg) translateY(40px)' : 'none', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              {SENTENCE_WORDS[focusedIndex].slice(0, Math.ceil(SENTENCE_WORDS[focusedIndex].length / 2))}
            </div>
            <div style={{ padding: '30px 50px 30px 0px', backgroundColor: '#ff4757', borderRadius: '0 16px 16px 0', transform: isDestroyed ? 'translateX(50px) rotate(15deg) translateY(40px)' : 'none', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              {SENTENCE_WORDS[focusedIndex].slice(Math.ceil(SENTENCE_WORDS[focusedIndex].length / 2))}
            </div>
          </div>

          {/* ⚡ 剣の通った軌跡のエフェクト（空中に残る光の斬撃線） */}
          {slashLine && (
            <div style={{
              position: 'absolute', left: `${slashLine.x}px`, top: `${slashLine.y}px`,
              width: `${slashLine.length}px`, height: '8px',
              background: 'linear-gradient(90deg, transparent, #ffffff 50%, transparent)',
              backgroundColor: '#00e5ff', 
              boxShadow: '0 0 20px #00e5ff, 0 0 40px rgba(0,229,255,0.6)',
              transformOrigin: '0 50%', transform: `rotate(${slashLine.angle}deg)`,
              zIndex: 9, pointerEvents: 'none',
              borderRadius: '4px'
            }} />
          )}

          {/* 🗡️ ユーザーが握るネオン日本刀本体 */}
          <div 
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              position: 'absolute',
              left: `${position.x}px`, top: `${position.y}px`,
              width: '12px', height: '270px', 
              background: isDragging 
                ? 'linear-gradient(to bottom, #ffffff 0%, #00e5ff 60%, #1e293b 100%)' 
                : 'linear-gradient(to bottom, #cbd5e1 0%, #94a3b8 60%, #1e293b 100%)', 
              borderRadius: '6px 6px 2px 2px',
              cursor: 'grab',
              transform: 'translate(-50%, -90%) rotate(-10deg)', 
              transformOrigin: '50% 90%', 
              zIndex: 10,
              boxShadow: isDragging ? '0 0 25px #00e5ff, 0 0 50px rgba(0,229,255,0.4)' : '0 4px 10px rgba(0,0,0,0.3)',
              pointerEvents: 'auto', // スマホのタッチロストを防止
              touchAction: 'none',
              willChange: 'transform'
            }} 
          >
            {/* カタナのハバキ・鍔・柄の意匠 */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40px', backgroundColor: '#001a33', borderRadius: '0 0 2px 2px', borderTop: '4px solid #ffd700' }} />
          </div>

        </div>
      )}
    </div>
  );
}

// 🧮 線分交差判定
function checkLineIntersection(p1, p2, p3, p4) {
  const ccw = (a, b, c) => (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

export default App;