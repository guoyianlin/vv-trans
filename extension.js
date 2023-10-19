const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

let disposable;
let userConfig; // 用于存储用户自定义配置
let decorationCache = new Map(); // 用于存储已计算的装饰信息：避免重复计算
let corpus; // 缓存语料库数据
// let prefix; // 表达式前缀

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// 判断文件类型是否受支持
function isSupportedFileType(document) {
    const supportedFileTypes = [".js", ".jsx", ".ts", ".tsx", ".html"];
    const fileName = document.fileName;
    const fileExtension = path.extname(fileName);
    return supportedFileTypes.includes(fileExtension);
}

// 在用户切换文件时检查 decorationCache 长度
function checkAndClearDecorationCache() {
    if (decorationCache.size > 1000) {
        decorationCache.clear();
    }
}

// 当文本编辑器的选择发生变化时，更新装饰器
function updateDecorations() {
    console.log("changeTextDocument");

    if (!corpus) return;

    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        return;
    }

    const text = activeEditor.document.getText();
    if (!text) {
        return;
    }

    const regEx = /t\(["']LMID_\d{8}["']\)/g;
    const decorations = [];

    console.log("updateDecorations triggered");

    let match;
    while ((match = regEx.exec(text))) {
        const startPos = activeEditor.document.positionAt(match.index);
        const endPos = activeEditor.document.positionAt(
            match.index + match[0].length
        );
        const range = new vscode.Range(startPos, endPos);
        // 获取 LMID_xxx 键
        const LMID_key = match[0].substring(3, match[0].length - 2);

        const rangeKey = `${LMID_key}-${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}`;

        console.log("range", rangeKey);

        if (decorationCache.has(rangeKey)) {
            console.log("has range", rangeKey);
            decorations.push(decorationCache.get(rangeKey));
            continue; // 跳过当前迭代
        }

        const corpusText = corpus[LMID_key];

        console.log("range", rangeKey, LMID_key, corpusText);

        if (corpusText) {
            // 根据用户配置或默认值设置样式
            const transStyle = userConfig.transStyle || {};

            const decoration = {
                range,
                renderOptions: {
                    after: {
                        contentText: corpusText,
                        fontStyle: "italic",
                        color: "#FFA22D",
                        opacity: 0.8,
                        ...transStyle,
                    },
                },
            };

            decorationCache.set(rangeKey, decoration);
            decorations.push(decoration);
        }
    }

    activeEditor.setDecorations(decorationType, decorations);
}

// 读取语料库
function readCorpus(corpusDirectory) {
    try {
        const corpusData = fs.readFileSync(corpusDirectory, "utf8");
        return JSON.parse(corpusData);
    } catch (error) {
        console.error("语料库文件读取失败", error);
        vscode.window.showErrorMessage(
            "语料库文件读取失败，请重新配置语料库目录"
        );
        return null;
    }
}

// 当插件激活时
function activate(context) {
    console.log("VV-Trans 插件已激活");

    // 获取用户配置
    userConfig = vscode.workspace.getConfiguration("vvtrans") || {};

    if (!userConfig.enable) return;

    // prefix = userConfig.prefix || "t";

    const corpusDirectory =
        userConfig.corpusDirectory ||
        path.join(vscode.workspace.rootPath, ".builtinLanguage", "zh.json");

    corpus = readCorpus(corpusDirectory);

    // 注册命令
    disposable = vscode.commands.registerCommand("VV-Trans.translate", () => {
        // 可以在这里执行翻译，但如果只想展示信息而不替换，可以将相关代码放在这里
        // translate();
    });

    const debouncedChangeTextDocument = debounce(updateDecorations, 500);

    // 注册文本编辑器装饰器
    // context.subscriptions.push(
    //     vscode.window.onDidChangeTextEditorSelection(debouncedUpdateDecorations)
    // );

    // 注册文本编辑器装饰器
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            // 仅处理特定文件类型
            if (isSupportedFileType(event.document)) {
                debouncedChangeTextDocument();
            }
        })
    );

    // 监听文本编辑器切换事件
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && editor.document && isSupportedFileType(editor.document)) {
            // 当切换到一个新的文本编辑器时，重新初始化和执行翻译
            console.log("Active");
            debouncedChangeTextDocument();
            checkAndClearDecorationCache();
        }
    });

    if (vscode.window.activeTextEditor) {
        updateDecorations();
    }

    context.subscriptions.push(disposable);
}

// 当插件停用时执行清理工作
function deactivate() {
    disposable.dispose();
}

// 创建装饰器类型
const decorationType = vscode.window.createTextEditorDecorationType({
    after: {
        margin: "0 0.6em 0 0.6em",
    },
});

module.exports = {
    activate,
    deactivate,
};
