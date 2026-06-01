import React, { useState, useRef } from 'react';

const SENTENCE_WORDS = ["I'm", "looking", "forward", "to", "meet", "you."];
const GRAMMAR_UNITS = ["不定詞 (to+動詞)", "動名詞 (~ing)", "時制 (過去/未来)", "関係代名詞"];

function App() {
  // 📱 画面のフェーズ管理: 'chat' -> 'select' -> 'slash' -> 'teach' -> 'explain' -> 'bet'
  const [phase, setPhase] = useState('chat'); 
  const [selectedUnit, setSelectedUnit] = useState(null); // 選んだ単元を覚えておく箱
  const [explanation, setExplanation] = useState('');     // 打ち込んだ解説を覚えておく箱
  const [coins, setCoins] = useState(100);                // 所持コイン
  const [betAmount, setBetAmount] = useState(0);          // ベット額

  const [focusedIndex, setFocusedIndex] = useState(null);
  const [isDestroyed, setIsDestroyed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [slashLine, setSlashLine] = useState(null);

  const oldPositionRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef(null);

  // 斬撃モードへ移行する処理
  const handleWordClick = (index) => {
    setFocusedIndex(index);
    setIsDestroyed(false);
    setSlashLine(null);
    setPhase('slash'); // フェーズを斬撃へ

    const initX = window.innerWidth / 2;
    const initY = window.innerHeight - 150;
    setPosition({ x: initX, y: initY });
    oldPositionRef.current = { x: initX, y: initY };
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (phase !== 'slash' || isDestroyed) return;
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
    oldPositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDragging || isDestroyed) return;

    const currentX = e.clientX;
    const currentY = e.clientY;
    setPosition({ x: currentX, y: currentY });

    const swordBladeLength = 250; 
    const currentHandle = { x: currentX, y: currentY };
    const currentTip = { x: currentX, y: currentY - swordBladeLength };
    const oldHandle = { x: oldPositionRef.current.x, y: oldPositionRef.current.y };
    const oldTip = { x: oldPositionRef.current.x, y: oldPositionRef.current.y - swordBladeLength };

    const distance = Math.hypot(currentTip.x - oldTip.x, currentTip.y - oldTip.y);
    if (distance > 8) {
      const angle = Math.atan2(currentTip.y - oldTip.y, currentTip.x - oldTip.x) * (180 / Math.PI);
      setSlashLine({ x: oldTip.x, y: oldTip.y, length: distance, angle: angle });
    }

    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const t1 = { x: centerX, y: rect.top };    
      const t2 = { x: centerX, y: rect.bottom }; 

      const isTipCrossed = checkLineIntersection(oldTip, currentTip, t1, t2);
      const isSlashCrossed = checkLineIntersection(oldTip, currentHandle, t1, t2) || 
                             checkLineIntersection(oldHandle, currentTip, t1, t2);

      if (isTipCrossed || isSlashCrossed) {
        setIsDestroyed(true); 
        setIsDragging(false);
        if (navigator.vibrate) navigator.vibrate(120); 
        setTimeout(() => setSlashLine(null), 300);
      }
    }

    oldPositionRef.current = { x: currentX, y: currentY };
  };

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
        backgroundColor: '#0a3d23', // ダークグリーン背景
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 2px, transparent 2px)',
        backgroundSize: '30px 30px', // 背景のドット柄を再現
        position: 'relative', overflow: 'hidden',
        touchAction: 'none', userSelect: 'none',
        WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
        display: 'flex', flexDirection: 'column'
      }}
    >
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          📱 フェーズ1: アオイちゃんの相談チャット画面 (Figma再現)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {phase === 'chat' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
          
          {/* ヘッダー部分 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', marginTop: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* アイコン */}
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b6b, #c56cf0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                あ
              </div>
              <div>
                <h2 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>AI生徒 アオイ</h2>
                <span style={{ color: '#4cd137', fontSize: '14px' }}>相談中...</span>
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', color: '#fff', fontWeight: 'bold' }}>
              Phase 1
            </div>
          </div>

          {/* 💬 チャットバブル */}
          <div style={{ backgroundColor: '#f4f6f8', borderRadius: '20px', padding: '25px', position: 'relative', borderTopLeftRadius: '0px' }}>
            <p style={{ color: '#333', fontSize: '18px', margin: '0 0 20px 0', fontWeight: 'bold' }}>
              先生、この例文作ったんだけど、合ってるかな...？
            </p>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#2c3e50', lineHeight: '1.4' }}>
              I'm looking forward to meet you.
            </div>
          </div>

          <div style={{ flex: 1 }}></div> {/* 余白埋め */}

          {/* 🔘 間違い探しスタートボタン */}
          <button 
            onClick={() => setPhase('select')}
            style={{
              width: '100%', padding: '20px', borderRadius: '15px', border: 'none',
              background: 'linear-gradient(90deg, #ffcc00, #ff6b00)',
              color: '#fff', fontSize: '22px', fontWeight: 'bold',
              boxShadow: '0 10px 20px rgba(255, 107, 0, 0.4)',
              cursor: 'pointer', marginBottom: '40px'
            }}
          >
            間違い探しスタート！
          </button>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          📱 フェーズ2: 単語選択画面 (斬る単語を選ぶ)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {phase === 'select' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', paddingTop: '80px' }}>
          <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '30px' }}>間違っている単語を斬れ！</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
            {SENTENCE_WORDS.map((word, index) => (
              <div 
                key={index} onClick={() => handleWordClick(index)} 
                style={{ padding: '15px 25px', backgroundColor: '#333', color: '#fff', fontSize: '24px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
              >
                {word}
              </div>
            ))}
          </div>
          <button onClick={() => setPhase('chat')} style={{ marginTop: '50px', padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#e0e0e0', fontWeight: 'bold', fontSize: '16px' }}>
            ◀ 相談画面に戻る
          </button>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          📱 フェーズ3: 日本刀斬撃モード
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {phase === 'slash' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '150px' }}>
          
          <button onClick={() => setPhase('select')} style={{ position: 'absolute', top: '60px', left: '20px', padding: '10px 20px', zIndex: 10, borderRadius: '8px', border: 'none', backgroundColor: '#e0e0e0', fontWeight: 'bold' }}>◀ 戻る</button>

          <div ref={targetRef} style={{ display: 'flex', gap: isDestroyed ? '100px' : '0px', color: '#fff', fontSize: '80px', fontWeight: 'bold', zIndex: 5, filter: 'drop-shadow(0 10px 20px rgba(255,71,87,0.4))', transition: 'all 0.4s ease' }}>
            <div style={{ padding: '30px 0px 30px 50px', backgroundColor: '#ff4757', borderRadius: '16px 0 0 16px', transform: isDestroyed ? 'translateX(-50px) rotate(-15deg) translateY(40px)' : 'none', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              {SENTENCE_WORDS[focusedIndex].slice(0, Math.ceil(SENTENCE_WORDS[focusedIndex].length / 2))}
            </div>
            <div style={{ padding: '30px 50px 30px 0px', backgroundColor: '#ff4757', borderRadius: '0 16px 16px 0', transform: isDestroyed ? 'translateX(50px) rotate(15deg) translateY(40px)' : 'none', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              {SENTENCE_WORDS[focusedIndex].slice(Math.ceil(SENTENCE_WORDS[focusedIndex].length / 2))}
            </div>
          </div>
          {isDestroyed && (
            <button onClick={() => setPhase('teach')}
            style={{marginTop:'80px',padding:'15px 30px',fontSize: '20px', zIndex: 20, cursor: 'pointer'}}
            >
            教える画面へ進む
            </button>
          )}

          {slashLine && (
            <div style={{ position: 'absolute', left: 0, top: 0, width: `${slashLine.length}px`, height: '8px', background: 'linear-gradient(90deg, transparent, #ffffff 50%, transparent)', backgroundColor: '#00e5ff', boxShadow: '0 0 20px #00e5ff, 0 0 40px rgba(0,229,255,0.6)', transformOrigin: '0 50%', transform: `translate3d(${slashLine.x}px, ${slashLine.y}px, 0) rotate(${slashLine.angle}deg)`, zIndex: 9, pointerEvents: 'none', borderRadius: '4px' }} />
          )}

          <div 
            onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}
            style={{
              position: 'absolute', left: 0, top: 0, width: '12px', height: '270px', 
              background: isDragging ? 'linear-gradient(to bottom, #ffffff 0%, #00e5ff 60%, #1e293b 100%)' : 'linear-gradient(to bottom, #cbd5e1 0%, #94a3b8 60%, #1e293b 100%)', 
              borderRadius: '6px 6px 2px 2px', cursor: 'grab',
              transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -90%) rotate(-10deg)`, transformOrigin: '50% 90%', zIndex: 10,
              boxShadow: isDragging ? '0 0 25px #00e5ff, 0 0 50px rgba(0,229,255,0.4)' : '0 4px 10px rgba(0,0,0,0.3)', pointerEvents: 'auto', touchAction: 'none', WebkitUserSelect: 'none', willChange: 'transform'
            }} 
          >
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40px', backgroundColor: '#001a33', borderRadius: '0 0 2px 2px', borderTop: '4px solid #ffd700' }} />
          </div>

        </div>
      )}
      {phase === 'teach' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', paddingTop: '60px', color: '#fff' }}>
          <p style={{ fontSize: '20px', textAlign: 'center' }}>アオイちゃん：<br/>これってそもそも「どこの単元」がポイントだったの…？</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
            
            {GRAMMAR_UNITS.map((unit, index) => {
              // 👇 ここでマークと色を計算
              const suits = ['♠️', '♥️', '♣️', '♦️'];
              const suit = suits[index % 4]; 
              const isRed = (index % 4 === 1 || index % 4 === 3);
              const suitColor = isRed ? '#e74c3c' : '#2c3e50';
              
              return (
                <div 
                  key={index} 
                  onClick={() => {
                    setSelectedUnit(unit);
                    setPhase('explain');
                  }}
                  style={{
                    width: '140px',
                    height: '200px',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* 左上のマーク */}
                  <div style={{ fontSize: '24px', color: suitColor, alignSelf: 'flex-start', lineHeight: '1' }}>
                    {suit}
                  </div>
                  
                  {/* 真ん中の単元名 */}
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                    {unit}
                  </div>

                  {/* 右下のマーク */}
                  <div style={{ fontSize: '24px', color: suitColor, alignSelf: 'flex-end', lineHeight: '1' }}>
                    {suit}
                  </div>
                </div>
              );
            })}
            
          </div>

          <button onClick={() => setPhase('chat')} style={{ marginTop: '40px', padding: '10px', backgroundColor: 'transparent', color: '#ccc', border: '1px solid #ccc', borderRadius: '8px', alignSelf: 'center' }}>
            ◀ 相談画面に戻る
          </button>
        </div>
      )}


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          📱 フェーズ5: 解説入力画面
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {phase === 'explain' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', paddingTop: '60px', color: '#fff' }}>
          <p style={{ fontSize: '18px', lineHeight: '1.5' }}>
            アオイちゃん：「<strong>{selectedUnit}</strong>」がポイントなんだね！<br />
            じゃあ、なんで「{SENTENCE_WORDS[focusedIndex]}」は間違ってたのか、先生の言葉で教えて！
          </p>

          <textarea 
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="ここに解説を入力してね"
            style={{ width: '100%', height: '150px', fontSize: '16px', padding: '15px', borderRadius: '8px', border: 'none', marginTop: '20px', boxSizing: 'border-box' }}
          />

          <button 
            onClick={() => setPhase('bet')}
            style={{ marginTop: '30px', padding: '15px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#ffcc00', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#333' }}
          >
            次へ進む（コインを賭ける）
          </button>

          <button onClick={() => setPhase('teach')} style={{ marginTop: '20px', padding: '10px', backgroundColor: 'transparent', color: '#ccc', border: '1px solid #ccc', borderRadius: '8px' }}>
            ◀ 単元選択に戻る
          </button>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          📱 フェーズ6: コインベット画面
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {phase === 'bet' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', paddingTop: '60px', color: '#fff' }}>
          <h2 style={{ fontSize: '28px', margin: '0 0 20px 0' }}>💰 コインを賭ける</h2>
          
          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '15px', width: '100%', textAlign: 'center' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '18px' }}>現在の所持コイン: <strong>{coins}</strong> 枚</p>
            <p style={{ margin: '0', fontSize: '20px' }}>ベット額: <strong style={{ color: '#ffcc00', fontSize: '36px' }}>{betAmount}</strong> 枚</p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '30px 0' }}>
            <button onClick={() => setBetAmount(betAmount + 10)} style={{ padding: '12px 20px', fontSize: '16px', borderRadius: '8px', border: 'none', backgroundColor: '#4cd137', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>+10枚</button>
            <button onClick={() => setBetAmount(betAmount + 50)} style={{ padding: '12px 20px', fontSize: '16px', borderRadius: '8px', border: 'none', backgroundColor: '#4cd137', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>+50枚</button>
            <button onClick={() => setBetAmount(coins)} style={{ padding: '12px 20px', fontSize: '16px', borderRadius: '8px', border: 'none', backgroundColor: '#ff6b6b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>全額マックス！</button>
            <button onClick={() => setBetAmount(0)} style={{ padding: '12px 20px', fontSize: '16px', borderRadius: '8px', border: 'none', backgroundColor: '#ccc', color: '#333', fontWeight: 'bold', cursor: 'pointer' }}>リセット</button>
          </div>

          <button 
            onClick={() => {
              setCoins(coins + betAmount);
              setPhase('result');
            }}
            style={{ width: '100%', padding: '20px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#ffcc00', border: 'none', borderRadius: '12px', cursor: 'pointer', color: '#333', boxShadow: '0 6px 15px rgba(255, 204, 0, 0.4)' }}
          >
            これで勝負する！
          </button>

          <button onClick={() => setPhase('explain')} style={{ marginTop: '30px', padding: '10px 20px', backgroundColor: 'transparent', color: '#ccc', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }}>
            ◀ 解説入力に戻る
          </button>
        </div>
      )}
{/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          📱 フェーズ7: リザルト画面 (超・骨組み版)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {phase === 'result' && (
        <div>
          <h2>大正解！🎉</h2>

          {/* 👩‍🎓 アオイちゃんの感謝チャット */}
          <div>
            <p>AI生徒 アオイ：</p>
            <p>
              「<strong>{selectedUnit}</strong>」がポイント<br/>
              『{explanation}』っていう解説
            </p>
          </div>

          {/* 💰 コイン獲得の演出 */}
          <div>
            <p>アオイちゃんに伝わった！</p>
            <p>+{betAmount} コイン獲得</p>
            <p>現在のトータル: <strong>{coins}</strong> 枚</p>
          </div>

          {/* 🔄 次の問題へ行くためのリセットボタン */}
          <button 
            onClick={() => {
              // 使ったデータを綺麗にお掃除して、フェーズ1に戻る
              setBetAmount(0);
              setExplanation('');
              setSelectedUnit(null);
              setPhase('chat');
            }}
          >
            次の英文の添削へ進む ➔
          </button>
        </div>
      )}
    </div>
  );
}

function checkLineIntersection(p1, p2, p3, p4) {
  const ccw = (a, b, c) => (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

export default App;