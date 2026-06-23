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

# 🌟 ケンが新しい問題を持ってくる機能
@app.route('/api/generate_question', methods=['GET'])
def generate_question():
    try:
        prompt = """
        あなたは英語が苦手な中学生「ケン」の思考をシミュレーションするAIです。
        中学生がよく間違える英語の文法問題（初心者レベル：中1〜中2のbe動詞、三単現、過去形など）を1つ新しく作成してください。

        【出力要件】
        必ず以下のキーを持つJSONオブジェクトを出力してください。JSONのバリュー（値）には、今回作成した問題に合わせた具体的なテキストを入れてください。

        - "theme": 間違えた文法単元（例："三単現のs"、"不定詞" など）
        - "sentenceWords": 間違った英文を1単語ずつ区切った配列（例: ["My", "brother", "play", "soccer."]）
        - "kenComment": ケンが先生に質問するセリフ。なぜそう間違えたのか、中学生らしい勘違いの理由を必ず含めること。
        - "hintWords": 先生が解説に使える重要なキーワードの配列（3〜4個程度）。
        - "skeleton": 今回作成した問題専用の、解説文のテンプレート（骨組み）。先生がヒントワードを当てはめやすいように、キーワードが入る部分を「〇〇」と伏せ字にした文章を作成すること。

        【重要】"skeleton"には「解説の骨組みとなる文章〜」といったシステムへの指示文は絶対に含めず、実際に先生がそのまま使える穴埋めテキスト（例：「主語が『〇〇』のとき、動詞には『〇〇』をつけるよ！」など）だけを出力してください。
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "あなたは優秀な教育アシスタントです。常に有効なJSONオブジェクトを返してください。"},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        question_data = json.loads(response.choices[0].message.content)
        return jsonify(question_data)

    except Exception as e:
        print(f"Error generating question: {e}")
        # エラー発生時の予備データ
        fallback_data = {
            "theme": "エラー発生時の予備問題",
            "sentenceWords": ["I", "am", "play", "tennis."],
            "kenComment": "先生、ごめん！新しい問題持ってくる途中で転んじゃった…！とりあえずこれ教えて！「私はテニスをします」って意味だよ！",
            "hintWords": ["一般動詞", "be動詞", "一緒に使えない", "play"],
            "skeleton": "〇〇と〇〇は〇〇ので、ここは〇〇だけにするのが正解だよ。"
        }
        return jsonify(fallback_data), 500


# 🌟 ケンと田中先生の会話用
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    character = data.get('character', 'owl')
    message = data.get('message', '')
    
    # フロントから送られてきた問題の前提条件を受け取る
    context_data = data.get('context', {})
    
    if not message:
        return jsonify({"error": "メッセージがありません"}), 400

    try:
        if character == 'aoi': 
            prompt = f"""
            あなたは英語が苦手な中学生「ケン」です。
            先生（ユーザー）から以下の説明を受けました。
            【先生の説明】{message}
            
            中学生らしく、分かった部分は喜び、分からない部分は「〇〇ってこと？」と聞き返してください。
            出力は必ず以下のJSON形式にしてください：
            {{
                "reply": "ケンとしての自然なセリフ"
            }}
            """
        elif character == 'owl': 
            theme = context_data.get('theme', '不明')
            wrong_sentence = context_data.get('wrongSentence', '不明')

            prompt = f"""
            あなたは「教えることで学ぶ」体験をサポートするベテランAIメンター（田中先生）です。
            先生（ユーザー）が作成したケン向けの解説を評価し、添削してください。

            【前提となる問題データ】
            - ケンの間違えた英文：{wrong_sentence}
            - 関連する文法単元：{theme}

            【先生（ユーザー）の解説】
            {message}

            # 指導方針（超重要）
            1. ユーザーの解説が、上記の間違えた英文に対する説明として論理的に正しければ、別の正解（例: playをplayingにする等）があったとしても "is_correct" を true（合格）にしてください。重箱の隅をつつくような減点は不要です。
            2. 明らかに間違っていたり、説明が逆になっている場合のみ "is_correct" を false にし、絶対に直接的な答えを教えず、ユーザー自身が気づけるような「ヒント」を与えて思考を補助（コーチング）してください。

            出力は必ず以下のJSON形式にしてください：
            {{
                "is_correct": trueまたはfalse(必ず実際の正誤に基づいて論理的に判定すること),
                "feedback": "ケンへの教え方に対する評価コメント。間違っている場合は直接答えず、ヒントを出してください。",
                "deep_dive": "先生自身の思考をさらに深めるための補足情報"
            }}
            """
        else:
            return jsonify({"error": "キャラクターが不明です"}), 400

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "あなたは優秀なアシスタントです。常に有効なJSONオブジェクトを返してください。"},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        ai_reply_json = json.loads(response.choices[0].message.content)
        return jsonify(ai_reply_json)

    except Exception as e:
        print(f"Error in chat: {e}")
        return jsonify({
            "is_correct": False, 
            "feedback": "ごめんね、先生！今AIメンターが考え中みたい…👨‍🏫", 
            "deep_dive": "サーバー接続を確認してください。",
            "reply": "先生、ちょっと通信の調子が悪いみたい…！👦"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)