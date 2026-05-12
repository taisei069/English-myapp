import { useState } from 'react'
import axios from 'axios';

function App() {
  const [inputText, setInputText] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // ★重要：async をここに追加して、関数の中にすべてを入れます
  const handleSend = async () => {
    if (inputText === "") {
      alert("何か入力してください")
      return
    }

    setLoading(true); // 通信開始！

    try {
      // ChatGPTにお手紙を送る
      const result = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "あなたは英語学習者の生徒です。ユーザーの説明に対して、英語と日本語で返答してください。" },
            { role: "user", content: inputText }
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
          }
        }
      );

      // AIの返事を箱（response）に入れる
      setResponse(result.data.choices[0].message.content);
      setInputText(""); // 入力欄を空にする

    } catch (error) {
      console.error("エラーだよ:", error);
      alert("通信に失敗しました。APIキーを確認してください。");
    } finally {
      setLoading(false); // 成功しても失敗しても、読み込み中を解除
    }
  }; // ここで handleSend 関数がおわり

  return (
    <div style={{ padding: '20px' }}>
      <h1>英語学習アプリ</h1>
      <textarea 
        value={inputText} 
        onChange={(e) => setInputText(e.target.value)}
        placeholder="教えたい英語を入力してね"
        disabled={loading}
      />
      <br />
      <button onClick={handleSend} disabled={loading}>
        {loading ? "送信中..." : "AIに送信する"}
      </button>

      {/* 返答を表示するエリアを追加 */}
      {response && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
          <strong>生徒AIの返答:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  )
}

export default App