const vscode = require("vscode");
const axios = require("axios");
const xmlParser = require("fast-xml-parser");

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  // Make an HTTP GET request to the XML file
  const res = await axios.get("https://medium.com/feed/@kingofthepirates");

  // Parse the XML into a JavaScript object
  const articles = xmlParser
    .parse(res.data)
    .rss.channel.item.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .map((article) => {
      return {
        label: article.title,
        detail: article.description,
        link: article.link,
      };
    });

  // Register a command that shows a quick pick list of articles
  let disposable = vscode.commands.registerCommand(
    "extension.searchMedium",
    async function () {
      const article = await vscode.window.showQuickPick(articles, {
        matchOnDetail: true,
      });

      if (article == null) return;

      vscode.env.openExternal(article.link);
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
