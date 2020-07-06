const path = require("path");

// vue-loader@15 から必要
const VueLoaderPlugin = require("vue-loader/lib/plugin");

// 補完が効きます！
/** @type import('webpack').Configuration */
module.exports = {
    mode: "development",
    resolve: {
        // '.ts' と '.vue' を追加
        extensions: [".js", ".ts", ".vue", ".json"]
    },
    entry: "./src/ts/vue-typescript.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    module: {
        rules: [{
                // 'ts-loader' で TypeScript をコンパイル
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: "ts-loader",
                // '*.vue' ファイルも TS として認識させるためのオプション
                options: {
                    appendTsSuffixTo: [/\.vue$/]
                }
            },
            {
                // 単一ファイルコンポーネントは vue-loader が処理
                test: /\.vue$/,
                exclude: /node_modules/,
                loader: "vue-loader"
            },
            {
                test: /\.css$/,
                // 配列最後尾のローダーから実行される
                use: ["vue-style-loader", "css-loader"]
            }
        ]
    },
    // プラグイン起動
    plugins: [new VueLoaderPlugin()],
    // ローカルサーバ
    devServer: {
        contentBase: path.resolve(__dirname, "dist"),
        port: 1234,
        open: true
    }
};