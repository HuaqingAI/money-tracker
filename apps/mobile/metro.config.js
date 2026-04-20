const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// monorepo: 监听整个 workspace 的文件变更
config.watchFolders = [monorepoRoot];

// monorepo: 解析共享包的 node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 防止 Metro 通过 Node 标准算法向上查找 node_modules，
// 强制只从 nodeModulesPaths 中解析，避免 monorepo 下出现重复模块
config.resolver.disableHierarchicalLookup = true;

// 将 singleton 包固定到 mobile 自身的 node_modules，
// 防止 react-native 内部模块交叉引用不同副本
const appModules = path.resolve(projectRoot, 'node_modules');
config.resolver.extraNodeModules = new Proxy(
  {},
  { get: (_, name) => path.resolve(appModules, name) },
);

module.exports = config;
