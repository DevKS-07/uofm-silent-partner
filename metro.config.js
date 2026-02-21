const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Work around third-party packages that still import subpaths not declared in "exports".
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
