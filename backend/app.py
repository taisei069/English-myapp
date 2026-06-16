import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

# 環境変数の読み込み (.envファイルから)
load_dotenv()

app = Flask(__name__)
CORS(app)

# クライアントの初期化
client = OpenAI(api_key=os.getenv("VITE_OPENAI_API_KEY"))

@app.route('/api/chat', methods=['POST'])
def chat():
    # データの受け取り
    data = request.json
    explanation = data.get('explanation', '')
    
    if not explanation:
        return jsonify({"error": "解説文がありません"}), 400

    # AIへの指示
    prompt = f"""
    あなたは英語のAIメンターです。以下のユーザー（先生）の解説を添削し、JSON形式で返答してください。
    【先生の解説】
    {explanation}

    出力は必ず以下のJSON形式にしてください：
    {{
        "is_correct": true,
        "feedback": "アオイちゃんへの優しい添削コメント",
        "deep_dive": "さらに深い文法的な補足情報"
    }}
    """

    try:
        # APIリクエスト
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "あなたは優秀な英語教育者です。常に有効なJSONオブジェクトを返してください。"},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        # AIの返答を解析
        ai_reply_json = json.loads(response.choices[0].message.content)
        return jsonify(ai_reply_json)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            "is_correct": False, 
            "feedback": "ごめんね、先生！今AIメンターが考え中みたい…🦉", 
            "deep_dive": "サーバー接続を確認してください。"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)