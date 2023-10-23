# VV-Trans - Visual Studio Code 微微多语言插件

![VV-Trans 示例图片](/images/vv-trans-screenshot.png)

VV-Trans 是为 vv 开发人员设计的 Visual Studio Code 扩展插件，旨在为多语言开发提供便捷的辅助工具。这个插件可以将代码中的多语言翻译表达式转换成语料库中对应的文本，提供更友好的开发体验。

## 功能特点

-   自动检测代码中的多语言翻译表达式
-   将多语言翻译表达式替换为语料库中对应的文本
-   一键替换功能，将代码中的多语言翻译表达式快速替换为语料库中的键
-   可自定义语料库目录和样式
-   适用于微微科技开发框架的多语言支持

## 使用方法

1. 安装插件：在 Visual Studio Code 中搜索 "VV-Trans" 并安装插件
2. 配置语料库：在 VS Code 设置中，可以自定义语料库目录和样式
3. 打开代码文件：打开包含多语言翻译表达式的代码文件
4. 自动翻译：插件会自动检测多语言翻译表达式，将其替换为语料库中的文本
5. 一键替换：执行 "vv-replace" 命令一键替换，将其替换为语料库中的键（t('xxx') -> t(LMID_key)）
6. 定制样式：自定义语料文本样式

## 内置命令

-   `vv-translate`: 语料翻译，为 t(LMID_key) 添加语料注释，方便阅读和检查
-   `vv-replace`：将中文语料替换为语料库中的键，t('xxx') -> t(LMID_key) 节省时间提高效率
-   `vv-refreshZh`: 当语料发生变化执行此命令，更新插件缓存的语料数据

## 配置选项

-   `corpusDirectory`: 语料库目录的路径，默认为项目根目录下的 `.builtinLanguage/zh.json`。
-   `transStyle`: 语料翻译文本样式配置，可以定义文本样式，如颜色、字体等
-   `enable`: 是否开启，默认开启

## 配置示例

```json
{
    "vvtrans": {
        "corpusDirectory": "path/to/custom-corpus.json",
        "enable": true,
        "transStyle": {
            "fontStyle": "italic",
            "color": "#FFA22D",
            "backgroundColor": "#FFFFFF"
        }
    }
}
```
