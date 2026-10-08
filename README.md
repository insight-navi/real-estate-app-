# 不動産管理アプリ

Supabase 認証付きの不動産管理 Web アプリ（React + Vite）。

## 機能

- メールアドレス＋パスワードで会員登録・ログイン
- 物件の一覧表示・新規登録・編集・削除（物件名・家賃・エリア・間取り）
- 自分が登録した物件だけが見える（Supabase の RLS で制御）
- 未ログインで物件一覧を開くとログイン画面へリダイレクト
- ログアウト

## セットアップ

```bash
npm install
cp .env.example .env   # Supabase の Project URL と Publishable key を設定する
npm run dev            # http://localhost:5173
```

`.env` は `.gitignore` 済みで、Git にはコミットされません。
接続情報が未設定のまま起動すると、画面に「設定エラー」が表示されます。

## Supabase 側の設定

### テーブルの作成

Supabase のダッシュボードで「SQL Editor」を開き、`supabase/schema.sql` の中身を貼り付けて実行する。
物件テーブル `properties` と、RLS のポリシー（自分の物件のみ表示・登録・編集・削除できる）が作られる。何度実行しても問題ない。

### 認証の設定（Authentication）

- Sign In / Providers → User Signups → **Confirm email** はオンにする
  - オンだと、登録済みのアドレスで会員登録しても「確認メールを送信しました」と同じ表示になり、アドレスが登録済みかどうかを外から判別できない
  - 登録後に届くメールのリンクを開くと、アプリの物件一覧に戻ってログイン状態になる
- Sign In / Providers → Email → **Minimum password length** は 8（アプリの入力チェック `MIN_PASSWORD_LENGTH` と合わせる）
- URL Configuration
  - Site URL: 公開先の URL（例: `https://real-estate-app-65rc.vercel.app`）
  - Redirect URLs: 公開先とローカルの両方を登録する（`https://real-estate-app-65rc.vercel.app/**` と `http://localhost:5173/**`）

## ディレクトリ構成

- `src/lib/supabaseClient.js` — Supabase クライアント（.env の値を使う）
- `src/contexts/AuthContext.jsx` — ログイン状態の管理
- `src/components/ProtectedRoute.jsx` — 未ログイン時のリダイレクト
- `src/pages/` — ログイン・会員登録・物件一覧の各画面
- `src/lib/propertiesApi.js` — 物件の取得・登録・更新・削除（Supabase とのやりとり）
- `src/components/PropertyForm.jsx` — 物件の登録・編集フォーム
- `supabase/schema.sql` — テーブル・RLS ポリシーを作る SQL

## 公開（Vercel）

- `vercel.json` で、どの URL にアクセスされても `index.html` を返すようにしている（`/properties` などを直接開いたり再読み込みしても 404 にならない）。JS や CSS などの実在するファイルはそのまま配信される
- 環境変数は `vercel.json` には書かず、Vercel のダッシュボード（Settings → Environment Variables）で次の2つを設定する
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
- Secret key（`sb_secret_...`）や `service_role` キーは絶対に登録しない（`VITE_` 付きの変数はブラウザに公開されるため）
- Vite はビルド時に環境変数を埋め込むため、環境変数を追加・変更したら再デプロイする（未設定のままだと画面に「設定エラー」が表示される）
