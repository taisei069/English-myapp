import React, { useState, useRef, useEffect } from 'react';

const QUESTION_LIST = [
  {
    id: 1,
    sentenceWords: ["I'm", "looking", "forward", "to", "meet", "you."],
    aiData: {
      text1: "look forward to の to は",
      blank1_options: ["不定詞", "前置詞", "接続詞"],
      text2: "なので、後ろには",
      blank2_options: ["動詞の原形", "名詞 (-ing形)", "過去分詞"],
      text3: "が来ます。"
    }
  }
];

const GRAMMAR_UNITS = ["不定詞 (to+動詞)", "動名詞 (~ing)", "時制 (過去/未来)", "関係代名詞"];

function App() {
  const [currentQuestion] = useState(QUESTION_LIST[0]);
  const [phase, setPhase] = useState('chat'); 
  const [selectedUnit, setSelectedUnit] = useState(null); 
  const [blank1, setBlank1] = useState('');
  const [blank2, setBlank2] = useState('');
  const [coins, setCoins] = useState(100);                
  const [betAmount, setBetAmount] = useState(0);          

  const [focusedIndex, setFocusedIndex] = useState(null);
  const [isSlashing, setIsSlashing] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  // 💬 チャットログ
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'aoi', 
      text: `先生、この例文作ったんだけど、合ってるかな...？\n\n${currentQuestion.sentenceWords.join(' ')}` 
    }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, phase]);

  const handleWordClick = (index) => {
    if (isSlashing || isDestroyed) return;
    
    setFocusedIndex(index);
    setIsSlashing(true);
    if (navigator.vibrate) navigator.vibrate(50);

    setTimeout(() => {
      setIsDestroyed(true);
      if (navigator.vibrate) navigator.vibrate(120);
    }, 200);

    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'teacher', text: `「${currentQuestion.sentenceWords[index]}」が間違っているよ！` }]);
      setIsSlashing(false);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now()+1, sender: 'aoi', text: `えっ！そこが間違ってるの！？\nこれってそもそも「どこの単元」がポイントだったの…？` }]);
        setPhase('teach');
      }, 1000);
    }, 1200);
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    setMessages(prev => [...prev, { id: Date.now(), sender: 'teacher', text: `ここは「${unit}」がポイントだよ。` }]);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now()+1, sender: 'aoi', text: `「${unit}」がポイントなんだね！\nなんでダメなの？` }]);
      setPhase('explain');
    }, 1000);
  };

  const handleExplainSubmit = () => {
    setPhase('transition');
    setMessages(prev => [...prev, { 
      id: Date.now(), 
      sender: 'aoi', 
      text: `なるほど…！\nでも先生、それって本当に合ってる？自信はある？` 
    }]);

    setTimeout(() => {
      setPhase('bet');
    }, 1200);
  };

  const handleResult = () => {
    setCoins(coins + betAmount);
    const finalExplanation = `${currentQuestion.aiData.text1} ${blank1} ${currentQuestion.aiData.text2} ${blank2} ${currentQuestion.aiData.text3}`;
    
    setMessages(prev => [...prev, { id: Date.now(), sender: 'teacher', text: finalExplanation }]);
    setPhase('result');

    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now()+1, sender: 'aoi', text: `なるほど大正解！そういうことか！\n先生のおかげで完全に理解したよ！🎉` }]);
    }, 1000);
  };

  return (
    <div 
      style={{
        width: '100vw', height: '100vh', 
        backgroundColor: '#f1f5f9', // ノートのような少し落ち着いた背景
        position: 'relative', overflow: 'hidden',
        touchAction: 'none', userSelect: 'none',
        WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
        display: 'flex', flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Kaku Gothic ProN", sans-serif'
      }}
    >
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        @keyframes drawCheck { 0% { stroke-dashoffset: 30; } 100% { stroke-dashoffset: 0; } }
        @keyframes penMotion {
          0% { transform: translate(5px, 0px) rotate(-10deg); opacity: 0; }
          10% { transform: translate(7px, 20px) rotate(0deg); opacity: 1; }
          40% { transform: translate(15px, 28px) rotate(0deg); opacity: 1; }
          80% { transform: translate(32px, 12px) rotate(0deg); opacity: 1; }
          100% { transform: translate(45px, 0px) rotate(20deg); opacity: 0; }
        }
        
        /* 💡 穴埋めテスト風のセレクトボックスデザイン */
        select {
          appearance: none;
          background-color: transparent;
          border: none;
          border-bottom: 2px solid #0284c7;
          color: #0284c7;
          padding: 0 8px 4px 8px;
          border-radius: 0;
          outline: none;
          font-size: 15px;
          font-weight: 700;
          margin: 0 6px;
          cursor: pointer;
          text-align: center;
        }
        select:focus { border-bottom: 2px solid #ef4444; color: #ef4444; }
        
        button { transition: opacity 0.1s; }
        button:active { opacity: 0.7; }
        
        /* 英文用のフォントスタイル（教科書風） */
        .english-text { font-family: "Georgia", serif; font-size: 18px; letter-spacing: 0.5px; }
      `}</style>

      {/* 🟢 ヘッダー（アカデミックなネイビー） */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', backgroundColor: '#1e293b', color: '#fff', zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
         <img src="https://i.pravatar.cc/150?img=15" alt="アオイ" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>アオイ</h2>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{phase === 'result' ? 'Lesson Clear' : 'Learning...'}</span>
          </div>
        </div>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: '600' }}>
          🪙 {coins}枚
        </div>
      </div>

      {/* 💬 チャット表示エリア */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map(msg => {
          const isAoi = msg.sender === 'aoi';
          // 英文っぽい箇所を正規表現で判別してクラスを当てる（簡易的）
          const formattedText = msg.text.split('\n').map((line, i) => (
            <span key={i} className={/^[a-zA-Z\s'",.]+$/.test(line) ? "english-text" : ""}>
              {line}
              <br/>
            </span>
          ));

          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isAoi ? 'flex-start' : 'flex-end', gap: '10px', alignItems: 'flex-start' }}>
             {isAoi && <img src="https://i.pravatar.cc/150?img=15" alt="アオイ" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #cbd5e1' }} />}
              <div style={{
                maxWidth: '75%',
                backgroundColor: isAoi ? '#fff' : '#e0f2fe',
                color: '#334155',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '15px',
                lineHeight: '1.6',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                {formattedText}
              </div>

             {!isAoi && <img src="https://i.pravatar.cc/150?img=8" alt="先生" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #0284c7' }} />}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* 🛠 操作エリア */}
      <div style={{ 
        backgroundColor: '#fff', borderTop: '1px solid #cbd5e1', padding: '16px', 
        flexShrink: 0, boxShadow: '0 -4px 10px rgba(0,0,0,0.02)'
      }}>
        
        {phase === 'chat' && (
          <button 
            onClick={() => { setIsDestroyed(false); setFocusedIndex(null); setIsSlashing(false); setPhase('select'); }}
            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ef4444', backgroundColor: '#fef2f2', color: '#ef4444', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span style={{ fontSize: '20px' }}>🖋</span> 赤ペンで添削する
          </button>
        )}

        {phase === 'select' && (
          <div style={{ animation: 'slideUp 0.2s ease-out' }}>
            <p style={{ color: '#ef4444', textAlign: 'center', margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
              間違っている単語をタップして修正！
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {currentQuestion.sentenceWords.map((word, index) => {
                const isTarget = focusedIndex === index;
                return (
                  <div 
                    key={index} onClick={() => handleWordClick(index)}
                    style={{ 
                      position: 'relative', padding: '8px 14px', backgroundColor: '#fff', 
                      border: '1px solid #cbd5e1', borderBottom: '3px solid #cbd5e1', // 少し物理的なボタン感
                      color: (isTarget && isDestroyed) ? '#94a3b8' : '#1e293b', 
                      fontSize: '18px', fontFamily: '"Georgia", serif', borderRadius: '6px', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {word}
                    
                    {/* 🖋 赤ペンの手書きチェック＆ペンの動きエフェクト */}
                    {isTarget && isSlashing && (
                      <div style={{ 
                        position: 'absolute', top: '-15px', right: '-10px', 
                        width: '40px', height: '40px', zIndex: 10, pointerEvents: 'none' 
                      }}>
                        <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                          <path d="M4 12 l5 5 l10 -10" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: 'drawCheck 0.3s ease-out forwards' }} />
                        </svg>
                        <div style={{ position: 'absolute', top: '-8px', left: '-8px', width: '28px', height: '28px', animation: 'penMotion 0.4s ease-out forwards', transformOrigin: 'bottom left' }}>
                          <svg viewBox="0 0 24 24" fill="#ef4444" style={{ filter: 'drop-shadow(2px 4px 2px rgba(0,0,0,0.2))' }}>
                            <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setPhase('chat')} style={{ width: '100%', marginTop: '16px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '14px', color: '#64748b', cursor: 'pointer' }}>キャンセル</button>
          </div>
        )}

        {phase === 'teach' && (
          <div style={{ animation: 'slideUp 0.2s ease-out' }}>
            <p style={{ color: '#475569', textAlign: 'center', margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>関係する文法単元を選択してください</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {GRAMMAR_UNITS.map((unit) => (
                <button 
                  key={unit} onClick={() => handleUnitSelect(unit)}
                  style={{ 
                    position: 'relative', padding: '14px 10px 14px 24px', backgroundColor: '#fff', 
                    border: '1px solid #cbd5e1', borderRadius: '4px', color: '#334155', 
                    fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'left',
                    boxShadow: '2px 2px 0 rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ position: 'absolute', top: '50%', left: '8px', transform: 'translateY(-50%)', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f1f5f9', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)' }} />
                  {unit}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'explain' && (
          <div style={{ animation: 'slideUp 0.2s ease-out' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', color: '#334155', fontSize: '15px', lineHeight: '2.4', border: '1px solid #cbd5e1', marginBottom: '12px' }}>
              {currentQuestion.aiData.text1}
              <select value={blank1} onChange={(e) => setBlank1(e.target.value)}>
                <option value="" disabled>選択...</option>
                {currentQuestion.aiData.blank1_options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
              <br/>{currentQuestion.aiData.text2}
              <select value={blank2} onChange={(e) => setBlank2(e.target.value)}>
                <option value="" disabled>選択...</option>
                {currentQuestion.aiData.blank2_options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
              {currentQuestion.aiData.text3}
            </div>
            <button 
              disabled={!blank1 || !blank2} onClick={handleExplainSubmit}
              style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: '600', backgroundColor: (!blank1 || !blank2) ? '#e2e8f0' : '#1e293b', color: (!blank1 || !blank2) ? '#94a3b8' : '#fff', border: 'none', borderRadius: '8px', cursor: (!blank1 || !blank2) ? 'not-allowed' : 'pointer' }}
            >
              解説を送信する
            </button>
          </div>
        )}

        {phase === 'bet' && (
          <div style={{ animation: 'slideUp 0.2s ease-out', textAlign: 'center' }}>
            <p style={{ color: '#475569', margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}><strong style={{ color: '#0284c7' }}>自信度</strong>を<strong style={{ color: '#0284c7' }}>コイン</strong>で賭けよう</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
              <button onClick={() => setBetAmount(b => b + 10)} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontSize: '15px', fontWeight: '600', flex: 1, cursor: 'pointer' }}>+10</button>
              <button onClick={() => setBetAmount(b => b + 50)} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontSize: '15px', fontWeight: '600', flex: 1, cursor: 'pointer' }}>+50</button>
              <button onClick={() => setBetAmount(0)} style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', background: '#e2e8f0', color: '#64748b', fontSize: '15px', fontWeight: '600', flex: 1, cursor: 'pointer' }}>リセット</button>
            </div>
            <button onClick={handleResult} disabled={betAmount === 0} style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '600', backgroundColor: betAmount === 0 ? '#cbd5e1' : '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', cursor: betAmount === 0 ? 'not-allowed' : 'pointer', boxShadow: betAmount === 0 ? 'none' : '0 4px 0 #d97706' }}>
              {betAmount}枚賭けて送信
            </button>
          </div>
        )}

        {phase === 'result' && (
          <div style={{ animation: 'slideUp 0.2s ease-out', textAlign: 'center' }}>
            <p style={{ color: '#0369a1', fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0' }}>🎉 正解ボーナス +{betAmount} コイン！</p>
            <button 
              onClick={() => { 
                setBetAmount(0); setBlank1(''); setBlank2(''); setSelectedUnit(null); setFocusedIndex(null); setIsDestroyed(false); 
                setMessages(prev => [...prev, { id: Date.now(), sender: 'aoi', text: `先生！次の問題もお願い！\n\nHe enjoyed to play tennis.`}]);
                setPhase('chat'); 
              }}
              style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '600', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 0 #059669' }}
            >
              次の英文へ進む
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;