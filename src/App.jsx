import React, { useState, useRef, useEffect } from 'react';

const GRAMMAR_UNITS = ["不定詞 (to+動詞)", "動名詞 (~ing)", "時制 (過去/未来)", "関係代名詞", "三単現のs", "be動詞と一般動詞", "助動詞", "前置詞"];

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(null); 
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true); 

  const [phase, setPhase] = useState('chat'); 
  const [selectedUnit, setSelectedUnit] = useState(null); 
  
  // 🌟 変更点1：穴埋め用のstateを削除し、自由記述用のstateとRefを追加
  const [explanationText, setExplanationText] = useState('');
  const textareaRef = useRef(null);

  const [coins, setCoins] = useState(100);                
  const [betAmount, setBetAmount] = useState(0);          

  const [focusedIndex, setFocusedIndex] = useState(null);
  const [isSlashing, setIsSlashing] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  const [isCorrect, setIsCorrect] = useState(false);

  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, phase]);

  const fetchNewQuestion = async () => {
    setIsLoadingQuestion(true);
    setPhase('loading_question'); 
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/generate_question');
      const data = await response.json();
      
      setCurrentQuestion(data);
      setMessages([
        { 
          id: Date.now(), 
          sender: 'aoi', 
          text: `${data.kenComment}\n\n📝 ${data.sentenceWords.join(' ')}` 
        }
      ]);
      setPhase('chat');
    } catch (error) {
      console.error("問題取得エラー:", error);
      setMessages([{ id: Date.now(), sender: 'aoi', text: '先生、新しい問題を取りに行く途中で転んじゃった…！ちょっと待っててね！' }]);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  useEffect(() => {
    fetchNewQuestion();
  }, []); 

  // 🌟 追加：テキストエリアのカーソル位置に文字を挿入するロジック
  const insertText = (textToInsert) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 現在のカーソル位置（選択範囲）を取得
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // カーソル位置を基準に文字列を合体
    const newText = explanationText.substring(0, start) + textToInsert + explanationText.substring(end);
    setExplanationText(newText);

    // 文字を挿入した後、カーソルを挿入した文字の直後に移動させる（Reactのレンダリングを待つためsetTimeoutを使用）
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
      textarea.focus();
    }, 0);
  };

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
      text: `なるほど…！\nでも先生、それって本当に合ってる？どれくらい自信ありますか？` 
    }]);

    setTimeout(() => {
      setPhase('bet');
    }, 1200);
  };

  const handleResult = async () => {
    // 🌟 変更点2：自由記述のテキストをそのまま送信内容にする
    const finalExplanation = explanationText;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'teacher', text: finalExplanation }]);
    
    setPhase('judging');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          character: 'owl', 
          message: finalExplanation,
          context: {
            theme: currentQuestion.theme,
            wrongSentence: currentQuestion.sentenceWords.join(' ')
          }
        })
      });

      const data = await response.json(); 
      const aiText = `【田中先生のフィードバック】\n${data.feedback}\n\n【さらに深い補足】\n${data.deep_dive}`;
      
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'owl', text: aiText }]);
      setIsCorrect(data.is_correct);

      if (data.is_correct) {
        setCoins(prev => prev + betAmount); 
      } else {
        setCoins(prev => prev - betAmount); 
      }

      setPhase('result');

    } catch (error) {
      console.error("通信エラー:", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'owl', text: "先生、今ちょっと返事ができないみたい…！" }]);
      setIsCorrect(false);
      setPhase('result'); 
    }
  };

  const handleNextQuestion = () => {
    setBetAmount(0); 
    // 🌟 変更点3：入力欄をリセット
    setExplanationText('');
    setSelectedUnit(null); 
    setFocusedIndex(null); 
    setIsDestroyed(false); 
    
    setMessages(prev => [...prev, { id: Date.now(), sender: 'teacher', text: `よし、次の問題に行こう！`}]);
    fetchNewQuestion(); 
  };


  return (
    <div 
      style={{
        width: '100vw', height: '100vh', 
        backgroundColor: '#f1f5f9', 
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
        
        button { transition: opacity 0.1s; }
        button:active { opacity: 0.7; }
        .english-text { font-family: "Georgia", serif; font-size: 18px; letter-spacing: 0.5px; }
      `}</style>

      {/* 🟢 ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', backgroundColor: '#1e293b', color: '#fff', zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
         <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ken&backgroundColor=ffd5dc" alt="ケン" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>ケン</h2>
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
          const isOwl = msg.sender === 'owl';
          
          let avatarSrc = "https://api.dicebear.com/7.x/avataaars/svg?seed=Ken&backgroundColor=ffd5dc";
          let bubbleBg = "#fff";

          if (!isAoi && !isOwl) {
            avatarSrc = "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher&backgroundColor=b6e3f4";
            bubbleBg = "#e0f2fe";
          } else if (isOwl) {
            avatarSrc = "https://ui-avatars.com/api/?name=👨‍🏫&background=f59e0b&color=fff&size=150";
            bubbleBg = "#fef3c7";
          }

          const formattedText = msg.text.split('\n').map((line, i) => (
            <span key={i} className={/^[a-zA-Z\s'",.]+$/.test(line) ? "english-text" : ""}>
              {line}
              <br/>
            </span>
          ));

          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isAoi || isOwl ? 'flex-start' : 'flex-end', gap: '10px', alignItems: 'flex-start' }}>
             {(isAoi || isOwl) && <img src={avatarSrc} alt="sender" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #cbd5e1' }} />}
              <div style={{
                maxWidth: '75%',
                backgroundColor: bubbleBg,
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
             {!isAoi && !isOwl && <img src={avatarSrc} alt="先生" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #0284c7' }} />}
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
        
        {phase === 'loading_question' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#0284c7', fontSize: '16px', fontWeight: 'bold' }}>👦 ケンが問題を考え中...</p>
          </div>
        )}

        {currentQuestion && (
          <>
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
                <p style={{ color: '#ef4444', textAlign: 'center', margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>間違っている単語をタップして修正！</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                  {currentQuestion.sentenceWords.map((word, index) => {
                    const isTarget = focusedIndex === index;
                    return (
                      <div 
                        key={index} onClick={() => handleWordClick(index)}
                        style={{ 
                          position: 'relative', padding: '8px 14px', backgroundColor: '#fff', 
                          border: '1px solid #cbd5e1', borderBottom: '3px solid #cbd5e1',
                          color: (isTarget && isDestroyed) ? '#94a3b8' : '#1e293b', 
                          fontSize: '18px', fontFamily: '"Georgia", serif', borderRadius: '6px', cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {word}
                        {isTarget && isSlashing && (
                          <div style={{ position: 'absolute', top: '-15px', right: '-10px', width: '40px', height: '40px', zIndex: 10, pointerEvents: 'none' }}>
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

            {/* 🌟 変更点4：自由記述＆ヒントワードUIの実装 */}
            {phase === 'explain' && (
              <div style={{ animation: 'slideUp 0.2s ease-out' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px' }}>
                  
                  {/* ヒントワードエリア */}
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                      💡 ヒントワード（タップで入力）
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {currentQuestion.hintWords?.map((hint, i) => (
                        <button 
                          key={i} 
                          onClick={() => insertText(hint)} 
                          style={{ padding: '6px 12px', backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          {hint}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 自由記述エリア */}
                  <textarea
                    ref={textareaRef}
                    value={explanationText}
                    onChange={(e) => setExplanationText(e.target.value)}
                    placeholder="ケンへの説明を自由に書いてみよう！&#13;&#10;例：主語が3人称単数なので..."
                    style={{ 
                      width: '100%', height: '120px', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', 
                      fontSize: '15px', resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
                    }}
                  />

                  {/* 骨組みを作るボタン */}
                  <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    <button 
                      onClick={() => setExplanationText(currentQuestion.skeleton || '')} 
                      style={{ padding: '6px 12px', backgroundColor: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ≡ 骨組みを作る
                    </button>
                  </div>

                </div>
                
                <button 
                  disabled={!explanationText.trim()} onClick={handleExplainSubmit}
                  style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: '600', backgroundColor: !explanationText.trim() ? '#e2e8f0' : '#1e293b', color: !explanationText.trim() ? '#94a3b8' : '#fff', border: 'none', borderRadius: '8px', cursor: !explanationText.trim() ? 'not-allowed' : 'pointer' }}
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

            {phase === 'judging' && (
              <div style={{ animation: 'slideUp 0.2s ease-out', textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#0284c7', fontSize: '16px', fontWeight: '700', margin: 0 }}>
                  👨‍🏫 田中先生が解説をチェック中... 🖋️
                </p>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>ちょっとだけ待ってね</span>
              </div>
            )}

            {phase === 'result' && (
              <div style={{ animation: 'slideUp 0.2s ease-out', textAlign: 'center' }}>
                {isCorrect ? (
                  <>
                    <p style={{ color: '#10b981', fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0' }}>
                      🎉 田中先生から合格をもらった！ (+{betAmount} コイン)
                    </p>
                    <button 
                      onClick={handleNextQuestion}
                      style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '600', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 0 #059669' }}
                    >
                      次の英文へ進む
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ color: '#ef4444', fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0' }}>
                      🤔 惜しい！教え方に改善点があるみたい (-{betAmount} コイン)
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => setPhase('explain')}
                        style={{ flex: 1, padding: '14px', fontSize: '15px', fontWeight: '600', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', cursor: 'pointer' }}
                      >
                        もう一度教え直す
                      </button>
                      <button 
                        onClick={handleNextQuestion}
                        style={{ flex: 1, padding: '14px', fontSize: '15px', fontWeight: '600', borderRadius: '8px', border: 'none', backgroundColor: '#64748b', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 0 #475569' }}
                      >
                        あきらめて次へ
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default App;