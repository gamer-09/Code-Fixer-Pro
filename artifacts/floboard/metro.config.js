const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Exclude yahoo-finance2's temporary build directories that Metro tries to
// watch but which get cleaned up after install, causing ENOENT watch errors.
config.resolver = config.resolver || {};
config.resolver.blockList = [
  // yahoo-finance2 creates _tmp_* dirs during postinstall that are removed afterwards
  /node_modules[\\/]yahoo-finance2[\\/].*_tmp_.*/,
  /node_modules[\\/]\.pnpm[\\/]yahoo-finance2[^\\/]*[\\/][^\\/]*_tmp_.*/,
];

// Monorepo: watch the workspace root so cross-package imports resolve
config.watchFolders = [
  path.resolve(__dirname, "../.."),
];

module.exports = config;
