# PDF Translator App

ブラウザのみで動作する PDF/HTML ビューア兼モック翻訳 UI のスケルトンです。左ペインで原文を表示し、右ペインで現在のページを日本語訳（モック）として表示します。低スペック端末でも動く軽量フロントエンド構成を目指しています。

## 主な特徴
- **TypeScript + Vite + React** による軽量フロントエンド。将来的に Electron / Tauri へ移植してもビルド成果物を再利用しやすい構成です。
- **pdfjs-dist** を用いた単ページ描画。ページごとに翻訳を実行し、メモリ使用量とパフォーマンスを両立します。
- **HTML ファイルは sandbox 付き iframe 表示**。安全性を優先し、同一オリジンに限定した最低限の許可のみ付与しています。
- **左右ペインはドラッグでリサイズ可能**。`react-split` + `split.js` を使用しています。
- **ダークモードをサポート**。Radix UI の Switch コンポーネントでトグル操作でき、選択状態は `localStorage` に保存されます。
- **翻訳機能はモック実装**。Ollama 等のローカル LLM を接続する際は `MockTranslationService` を差し替えてください。

## セットアップ
```bash
npm install
npm run dev
```

開発サーバは <http://localhost:5173> で起動します。

## 使い方
1. 画面左上の「ファイルを開く」ボタンから PDF もしくは HTML ファイルを選択します。
2. PDF の場合はページを前後ボタンで切り替えられます。HTML は 1 ページ固定表示です。
3. 「このページを翻訳」ボタンで現在表示中のページのみ翻訳（モック）を実行します。
4. ダークモードを切り替えると設定が `localStorage` に保存され、次回以降も維持されます。

## ディレクトリ構成（抜粋）
```
src/
├─ components/
│  ├─ SplitLayout.tsx        # react-split をラップした左右レイアウト
│  ├─ Toolbar.tsx            # ファイル選択・ページ操作・翻訳ボタン・テーマ切替
│  ├─ ThemeToggle.tsx        # Radix UI Switch ベースのテーマトグル
│  ├─ TranslationPane.tsx    # 翻訳結果表示ペイン
│  └─ ViewerPane.tsx         # PDF/HTML 表示とテキスト抽出
├─ hooks/
│  └─ useTranslation.ts      # 翻訳サービス呼び出し用カスタムフック
├─ services/
│  ├─ MockTranslationService.ts  # モック翻訳実装（遅延 + 固定レスポンス）
│  └─ TranslationService.ts      # 翻訳サービスのインターフェース
├─ styles/
│  └─ theme.css              # ライト/ダーク共通の CSS 変数
├─ types/
│  └─ viewer.ts              # ビューア関連の型定義
├─ App.tsx                   # アプリ全体レイアウトと状態管理
├─ index.css                 # Tailwind と全体スタイル
└─ main.tsx                  # エントリポイント
```

## 技術スタックと選定理由
- **Vite**: 開発サーバ起動が高速で、Tauri/Electron 用のビルドにも流用しやすい。
- **React + TypeScript**: コンポーネントの再利用性と型安全性を両立。
- **Tailwind CSS**: JIT により未使用スタイルを削減し、ダークモード対応もクラスの切り替えで完結。
- **pdfjs-dist**: ブラウザ組み込みビューより制御性が高く、ページ単位で描画・テキスト抽出が可能。
- **react-split / split.js**: 依存が少なく軽量なリサイズ可能レイアウト。
- **Radix UI (Switch, Icons)**: アクセシビリティ配慮済みで軽量な UI コンポーネント群。

## 今後の拡張アイデア
- Ollama などのローカル LLM 連携実装。
- ページ連続スクロール表示や全文翻訳への対応。
- Vitest / Playwright による自動テスト整備。
- 翻訳履歴の保存やエクスポート機能。

## ライセンス
このプロジェクトは [MIT License](./LICENSE) の下で提供されています。
