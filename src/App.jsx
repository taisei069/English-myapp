import React, { useState } from 'react';

const SENTENCE_WORDS = ["I'm", "looking", "forward", "to", "meet", "you."];
const GRAMMAR_UNITS = ["不定詞 (to+動詞)", "動名詞 (~ing)", "時制 (過去/未来)", "関係代名詞"];

function App() {
  // 📱 画面のフェーズ管理: 'chat' -> 'select' (ここで斬る！) -> 'teach' -> 'explain' -> 'bet' -> 'result'
  const [phase, setPhase] = useState('chat'); 
  const [selectedUnit, setSelectedUnit] = useState(null); 
  const [explanation, setExplanation] = useState('');     
  const [coins, setCoins] = useState(100);                
  const [betAmount, setBetAmount] = useState(0);          

  // ⚔️ 斬撃演出用のステート
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [isSlashing, setIsSlashing] = useState(false); // 剣が振られているか？
  const [isDestroyed, setIsDestroyed] = useState(false); // 単語が割れたか？

  // 🎯 単語がクリックされた時の瞬間移動ダッシュ斬撃ロジック
  const handleWordClick = (index) => {
    if (isSlashing || isDestroyed) return; // 連打防止
    
    setFocusedIndex(index);
    setIsSlashing(true); // 剣のアニメーション開始！
    
    if (navigator.vibrate) navigator.vibrate(50); // スマホのブルッ（軽め）

    // 0.2秒後（剣が届いた瞬間）に単語を割る
    setTimeout(() => {
      setIsDestroyed(true);
      if (navigator.vibrate) navigator.vibrate(120); // 斬った瞬間の強いブルッ
    }, 200);

    // 1.2秒後に次の画面（教える画面）へ自動で進む
    setTimeout(() => {
      setPhase('teach');
      setIsSlashing(false); // 剣を元の状態に戻す
    }, 1200);
  };

  return (
    <div 
      style={{
        width: '100vw', height: '100vh', 
        backgroundColor: '#0a3d23', 
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 2px, transparent 2px)',
        backgroundSize: '30px 30px', 
        position: 'relative', overflow: 'hidden',
        touchAction: 'none', userSelect: 'none',
        WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
        display: 'flex', flexDirection: 'column'
      }}
    >
      {/* 🌟 アニメーションの設計図 */}
      <style>{`
        /* 画面が下からフワッと出る動き */
        @keyframes slideUp {
          from { transform: translateY(60px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        /* 青い斬撃エフェクト（左から右へシャキン！） */
        @keyframes flashSlash {
          0% { opacity: 0; transform: translateY(-50%) rotate(20deg) scaleX(0); }
          50% { opacity: 1; transform: translateY(-50%) rotate(20deg) scaleX(1.2); }
          100% { opacity: 0; transform: translateY(-50%) rotate(20deg) scaleX(1.5); }
        }

        /* ⚔️ 剣が単語の上で直接振り下ろされる動き */
        @keyframes slashSwordOnWord {
          0% { opacity: 0; transform: translate(-40px, -60px) rotate(-40deg); }
          20% { opacity: 1; transform: translate(-20px, -40px) rotate(-20deg); }
          80% { opacity: 1; transform: translate(40px, 40px) rotate(50deg); }
          100% { opacity: 0; transform: translate(60px, 60px) rotate(70deg); }
        }
      `}</style>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          📱 フェーズ1: アオイちゃんの相談チャット画面
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {phase === 'chat' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', marginTop: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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

          <div style={{ backgroundColor: '#f4f6f8', borderRadius: '20px', padding: '25px', position: 'relative', borderTopLeftRadius: '0px' }}>
            <p style={{ color: '#333', fontSize: '18px', margin: '0 0 20px 0', fontWeight: 'bold' }}>
              先生、この例文作ったんだけど、合ってるかな...？
            </p>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#2c3e50', lineHeight: '1.4' }}>
              I'm looking forward to meet you.
            </div>
          </div>

          <div style={{ flex: 1 }}></div>

          <button 
            onClick={() => {
              setIsDestroyed(false);
              setFocusedIndex(null);
              setIsSlashing(false);
              setPhase('select');
            }}
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
          📱 フェーズ2: 単語選択画面（直接斬撃スタイル）
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {phase === 'select' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', paddingTop: '80px', position: 'relative' }}>
          <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '30px', zIndex: 1 }}>タップして間違っている単語を斬れ！</h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', zIndex: 1 }}>
            {SENTENCE_WORDS.map((word, index) => {
              const isTarget = focusedIndex === index;
              return (
                <div 
                  key={index} 
                  onClick={() => handleWordClick(index)}
                  style={{ 
                    position: 'relative', // 斬撃線を中に入れるため
                    padding: '15px 25px', backgroundColor: '#333', color: '#fff', fontSize: '24px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    // 斬られた単語はパカンと割れる演出
                    transform: (isTarget && isDestroyed) ? 'scale(1.2) rotate(15deg) translateY(20px)' : 'scale(1)',
                    opacity: (isTarget && isDestroyed) ? 0 : 1,
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  {word}

                  {/* ⚔️ タップした単語の上にだけ現れる「剣」と「斬撃の光」 */}
                  {isTarget && isSlashing && (
                    <>
                      {/* 青い斬撃エフェクト */}
                      <div style={{
                        position: 'absolute', top: '50%', left: '-50%', width: '200%', height: '6px',
                        backgroundColor: '#fff', boxShadow: '0 0 20px #00e5ff',
                        transformOrigin: 'left center',
                        animation: 'flashSlash 0.25s ease-out forwards',
                        zIndex: 10, pointerEvents: 'none'
                      }}/>
                      
                      {/* 日本刀（剣）の本体 */}
                      <div style={{
                        position: 'absolute', 
                        top: '0px', left: '50%',
                        width: '12px', height: '180px', // 単語の上で振るため少し短め
                        background: 'linear-gradient(to bottom, #ffffff 0%, #00e5ff 60%, #1e293b 100%)',
                        borderRadius: '6px 6px 2px 2px',
                        transformOrigin: 'bottom center',
                        animation: 'slashSwordOnWord 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                        zIndex: 11, pointerEvents: 'none'
                      }}>
                         <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '30px', backgroundColor: '#001a33', borderRadius: '0 0 2px 2px', borderTop: '4px solid #ffd700' }} />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={() => setPhase('chat')} style={{ marginTop: '50px', padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#e0e0e0', fontWeight: 'bold', fontSize: '16px', alignSelf: 'center', position: 'relative', zIndex: 20 }}>
            ◀ 相談画面に戻る
          </button>

          {/* ⚔️ 普段は下で待機している剣（斬る瞬間だけ非表示にする！） */}
          {!isSlashing && (
            <div style={{
              position: 'absolute', 
              bottom: '5%', left: '50%',
              width: '12px', height: '250px',
              background: 'linear-gradient(to bottom, #ffffff 0%, #00e5ff 60%, #1e293b 100%)',
              borderRadius: '6px 6px 2px 2px',
              transform: 'translateX(-50%) rotate(-10deg)',
              transformOrigin: 'bottom center',
              boxShadow: '0 0 15px rgba(0,229,255,0.4)',
              pointerEvents: 'none', zIndex: 10
            }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40px', backgroundColor: '#001a33', borderRadius: '0 0 2px 2px', borderTop: '4px solid #ffd700' }} />
            </div>
          )}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          📱 フェーズ4: 教える画面 (トランプ選択)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {phase === 'teach' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', paddingTop: '60px', color: '#fff', animation: 'slideUp 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}>
          <p style={{ fontSize: '20px', textAlign: 'center' }}>アオイちゃん：<br/>これってそもそも「どこの単元」がポイントだったの…？</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
            {GRAMMAR_UNITS.map((unit, index) => {
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
                    width: '140px', height: '200px', backgroundColor: '#fff', borderRadius: '12px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.4)', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px', boxSizing: 'border-box'
                  }}
                >
                  <div style={{ fontSize: '24px', color: suitColor, alignSelf: 'flex-start', lineHeight: '1' }}>{suit}</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>{unit}</div>
                  <div style={{ fontSize: '24px', color: suitColor, alignSelf: 'flex-end', lineHeight: '1' }}>{suit}</div>
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', paddingTop: '60px', color: '#fff', animation: 'slideUp 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}>
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
        <div 
          style={{ 
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', paddingTop: '60px', color: '#fff',
            animation: 'slideUp 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards'
          }}
        >
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
          📱 フェーズ7: リザルト画面
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {phase === 'result' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', paddingTop: '60px', color: '#fff', animation: 'slideUp 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}>
          <h2>大正解！🎉</h2>
          <div style={{ backgroundColor: '#fff', color: '#333', padding: '20px', borderRadius: '12px', marginTop: '20px', width: '100%' }}>
            <p style={{ fontWeight: 'bold' }}>AI生徒 アオイ：</p>
            <p>
              「<strong>{selectedUnit}</strong>」がポイントで、<br/>
              『{explanation}』っていう解説、めちゃくちゃ分かりやすい！
            </p>
          </div>
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <p style={{ fontSize: '18px' }}>アオイちゃんに伝わった！</p>
            <p style={{ color: '#ffcc00', fontSize: '24px', fontWeight: 'bold' }}>+{betAmount} コイン獲得</p>
            <p>現在のトータル: <strong>{coins}</strong> 枚</p>
          </div>
          <button 
            onClick={() => {
              setBetAmount(0);
              setExplanation('');
              setSelectedUnit(null);
              setFocusedIndex(null);
              setIsDestroyed(false);
              setPhase('chat');
            }}
            style={{ marginTop: '40px', padding: '15px 30px', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', border: 'none', backgroundColor: '#4cd137', color: '#fff', cursor: 'pointer' }}
          >
            次の英文の添削へ進む ➔
          </button>
        </div>
      )}
    </div>
  );
}

export default App;