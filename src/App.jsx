import React, { useState, useRef } from 'react';

// 🤖 文章を単語ごとに区切った配列
const SENTENCE_WORDS = ["I'm", "looking", "forward", "to", "meet", "you."];

function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // 🎯 ズーム中の単語（nullなら通常画面）
  const [focusedIndex, setFocusedIndex] = useState(null);
  
  // 🎯 当たり判定のためのメジャーとフラグ
  const oldPositionRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef(null);
  const [isDestroyed, setIsDestroyed] = useState(false);

  // 単語タップでバトル（ズーム）画面へ移行
  const handleWordClick = (index) => {
    setFocusedIndex(index);
    setIsDestroyed(false);
    // 刀を画面下部の中央に出現させる
    const initialX = window.innerWidth / 2 - 10;
    const initialY = window.innerHeight - 200;
    setPosition({ x: initialX, y: initialY });
    oldPositionRef.current = { x: initialX, y: initialY };
  };

  const handleBack = () => {
    setFocusedIndex(null);
  };

  // 👇 PC・スマホ両対応の「掴む」アクション
  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (focusedIndex === null || isDestroyed) return; 
    setIsDragging(true);
    oldPositionRef.current = { x: position.x, y: position.y };
  };

  // 👇 PC・スマホ両対応の「離す」アクション
  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // 👇 PC・スマホ両対応の「動かす＆斬る」アクション
  const handlePointerMove = (clientX, clientY) => {
    if (!isDragging || isDestroyed) return; 

    setPosition({ x: clientX, y: clientY });

    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const t1 = { x: centerX, y: rect.top };    
      const t2 = { x: centerX, y: rect.bottom }; 

      const p1 = { x: oldPositionRef.current.x, y: oldPositionRef.current.y };
      const p2 = { x: clientX, y: clientY };
      
      if (checkLineIntersection(p1, p2, t1, t2)) {
        setIsDestroyed(true); // 💥 斬撃成功！
        setIsDragging(false); // 刀を手放す
      }

      oldPositionRef.current = { x: clientX, y: clientY };
    }
  };

  return (
    <div 
      // 🖱️ マウス用イベント
      onMouseUp={handlePointerUp} 
      onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
      // 📱 スマホ（タッチ）用イベント
      onTouchEnd={handlePointerUp}
      onTouchMove={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
      style={{
        width: '100vw', height: '100vh', 
        backgroundColor: '#f5f7fa', // ✨ 爽やかなライトグレー
        position: 'relative', overflow: 'hidden'
      }}
    >
      <h1 style={{ color: '#333', fontSize: '16px', padding: '10px', position: 'absolute', zIndex: 20 }}>
        スマホ対応版: スワイプで一刀両断！
      </h1>

      {/* 🔄 通常画面 */}
      {focusedIndex === null ? (
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '100px 50px', justifyContent: 'center' }}>
          <div style={{ width: '100%', textAlign: 'center', color: '#666', marginBottom: '20px', fontWeight: 'bold' }}>
            怪しい単語をタップして選択してください
          </div>
          
          {SENTENCE_WORDS.map((word, index) => (
            <div
              key={index}
              onClick={() => handleWordClick(index)}
              style={{
                padding: '15px 25px', backgroundColor: '#333', color: '#fff',
                fontSize: '24px', fontWeight: 'bold', borderRadius: '8px',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)' // 影を少し優しく
              }}
            >
              {word}
            </div>
          ))}
        </div>

      ) : (

        // ⚔️ バトル画面（ズーム中）
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '150px' }}>
          
          <button 
            onClick={handleBack}
            style={{ 
              position: 'absolute', top: '20px', left: '20px', padding: '10px 20px', 
              cursor: 'pointer', zIndex: 10, borderRadius: '8px', border: 'none', 
              backgroundColor: '#e0e0e0', fontWeight: 'bold', color: '#333'
            }}
          >
            ◀ 戻る
          </button>

          {/* 🎯 巨大ターゲット単語（美しい1つの箱） */}
          <div
            ref={targetRef} 
            style={{
              display: 'flex', 
              gap: isDestroyed ? '60px' : '0px', 
              color: '#fff', 
              fontSize: '80px', fontWeight: 'bold',
              zIndex: 5,
              filter: 'drop-shadow(0 10px 20px rgba(255,71,87,0.4))', 
              transition: 'all 0.5s ease'
            }}
          >
            <div style={{
              padding: '30px 0px 30px 50px', 
              backgroundColor: '#ff4757',
              borderRadius: '16px 0 0 16px', 
              transform: isDestroyed ? 'translateX(-20px) rotate(-10deg) translateY(50px)' : 'none',
              transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              {SENTENCE_WORDS[focusedIndex].slice(0, Math.ceil(SENTENCE_WORDS[focusedIndex].length / 2))}
            </div>

            <div style={{
              padding: '30px 50px 30px 0px', 
              backgroundColor: '#ff4757',
              borderRadius: '0 16px 16px 0', 
              transform: isDestroyed ? 'translateX(20px) rotate(10deg) translateY(50px)' : 'none',
              transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              {SENTENCE_WORDS[focusedIndex].slice(Math.ceil(SENTENCE_WORDS[focusedIndex].length / 2))}
            </div>
          </div>

          {/* 🗡️ 刀オブジェクト */}
          <div 
            onMouseDown={handlePointerDown} 
            onTouchStart={handlePointerDown} 
            style={{
              position: 'absolute',
              left: `${position.x}px`, top: `${position.y}px`,
              width: '20px', height: '220px', 
              backgroundColor: isDragging ? '#f1c40f' : '#cbd5e1',
              borderRadius: '10px', cursor: 'grab',
              pointerEvents: isDragging ? 'none' : 'auto', 
              zIndex: 10,
              boxShadow: isDragging ? '0 0 25px rgba(241,196,15,1)' : '0 4px 10px rgba(0,0,0,0.2)',
              transition: 'background-color 0.2s, box-shadow 0.2s'
            }} 
          />

        </div>
      )}

    </div>
  );
}

// 🧮 線分交差判定の数学関数
function checkLineIntersection(p1, p2, p3, p4) {
  const ccw = (a, b, c) => (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

export default App;