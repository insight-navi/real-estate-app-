# 不動産管理アプリ

Supabase 認証付きの不動産管理 Web アプリ（React + Vite）。

## 機能

- メールアドレス＋パスワードで会員登録・ログイン
- ログイン後は物件一覧（物件名・家賃・エリアのカード表示、ダミーデータ）
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

- 会員登録時の確認メールは、Supabase の「Authentication → Sign In / Providers → Email → Confirm email」で切り替えられる
  - 有効: 登録後に届くメールのリンクを開いてからログインする
  - 無効: 登録するとそのままログインして物件一覧に移動する

## ディレクトリ構成

- `src/lib/supabaseClient.js` — Supabase クライアント（.env の値を使う）
- `src/contexts/AuthContext.jsx` — ログイン状態の管理
- `src/components/ProtectedRoute.jsx` — 未ログイン時のリダイレクト
- `src/pages/` — ログイン・会員登録・物件一覧の各画面
- `src/data/properties.js` — 物件のダミーデータ
