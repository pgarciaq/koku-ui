import { DynamicRemotePlugin } from '@openshift/dynamic-plugin-sdk-webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import TerserJSPlugin from 'terser-webpack-plugin';
import type { Configuration } from 'webpack';
import { DefinePlugin } from 'webpack';

const NODE_ENV = (process.env.NODE_ENV || 'development') as Configuration['mode'];

const srcDir = path.resolve(__dirname, './src');
const distDir = path.resolve(__dirname, './dist');

const exposedModules = {
  './FleetSummaryCards': './src/fed-modules/fleetSummaryCardsWrapper.tsx',
  './OptimizationsBadge': './src/fed-modules/optimizationsBadgeWrapper.tsx',
  './OptimizationsBreakdown': './src/fed-modules/optimizationsBreakdownWrapper.tsx',
  './OptimizationsContainersTable': './src/fed-modules/optimizationsContainersTableWrapper.tsx',
  './OptimizationsDetailsTitle': './src/fed-modules/optimizationsDetailsTitleWrapper.tsx',
  './OptimizationsGpuBadge': './src/fed-modules/optimizationsGpuBadgeWrapper.tsx',
  './OptimizationsGpuDetails': './src/fed-modules/optimizationsGpuDetailsWrapper.tsx',
  './OptimizationsLink': './src/fed-modules/optimizationsLinkWrapper.tsx',
  './OptimizationsNamespacesBadge': './src/fed-modules/optimizationsNamespacesBadgeWrapper.tsx',
  './OptimizationsNamespacesTable': './src/fed-modules/optimizationsNamespacesTableWrapper.tsx',
  './OptimizationsNodesBadge': './src/fed-modules/optimizationsNodesBadgeWrapper.tsx',
  './OptimizationsNodesTable': './src/fed-modules/optimizationsNodesTableWrapper.tsx',
  './OptimizationsStorageBadge': './src/fed-modules/optimizationsStorageBadgeWrapper.tsx',
  './OptimizationsStorageDetails': './src/fed-modules/optimizationsStorageDetailsWrapper.tsx',
  './OptimizationsQuotaBadge': './src/fed-modules/optimizationsQuotaBadgeWrapper.tsx',
  './OptimizationsQuotaDetails': './src/fed-modules/optimizationsQuotaDetailsWrapper.tsx',
  './OptimizationsTabSummaryBanner': './src/fed-modules/optimizationsTabSummaryBannerWrapper.tsx',
  './OptimizationsVmsBadge': './src/fed-modules/optimizationsVmsBadgeWrapper.tsx',
  './OptimizationsVmsTable': './src/fed-modules/optimizationsVmsTableWrapper.tsx',
  './OptimizationsProjectsTable': './src/fed-modules/optimizationsProjectsTableWrapper.tsx',
  './OptimizationsSummary': './src/fed-modules/optimizationsSummaryWrapper.tsx',
};

const config: Configuration = {
  entry: Object.values(exposedModules),
  mode: NODE_ENV,
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: /node_modules\/(?!@koku-ui)/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig-onprem.json',
              allowTsInNodeModules: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(svg|ttf|eot|woff|woff2)$/,
        type: 'asset/resource',
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, '../../node_modules/patternfly/dist/fonts'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-core/dist/styles/assets/fonts'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-core/dist/styles/assets/pficon'),
          path.resolve(__dirname, '../../node_modules/@patternfly/patternfly/assets/fonts'),
          path.resolve(__dirname, '../../node_modules/@patternfly/patternfly/assets/pficon'),
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif)$/i,
        type: 'asset/resource',
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, '../../node_modules/patternfly'),
          path.resolve(__dirname, '../../node_modules/@patternfly/patternfly/assets/images'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-styles/css/assets/images'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-core/dist/styles/assets/images'),
        ],
      },
    ],
  },
  output: {
    filename: '[name].bundle-[contenthash].js',
    path: distDir,
    publicPath: '/costManagementRos/',
    chunkFilename: '[name].bundle-[contenthash].js',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(srcDir, 'locales'),
          to: path.join(distDir, 'locales'),
        },
      ],
    }),
    new DynamicRemotePlugin({
      extensions: [],
      sharedModules: {
        react: { singleton: true, requiredVersion: '*' },
        'react-dom': { singleton: true, requiredVersion: '*' },
        'react-redux': { singleton: true, requiredVersion: '*' },
        'react-router-dom': { singleton: true, requiredVersion: '*' },
        '@scalprum/react-core': { singleton: true, requiredVersion: '*' },
        '@openshift/dynamic-plugin-sdk': { singleton: true, requiredVersion: '*' },
        '@koku-ui/ui-lib/': { singleton: true, requiredVersion: '*' },
      },
      pluginMetadata: {
        name: 'costManagementRos',
        version: '1.0.0',
        exposedModules,
      },
    }),
    new DefinePlugin({
      'process.env.KOKU_UI_COMMITHASH': undefined,
      'process.env.KOKU_UI_PKGNAME': undefined,
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.jsx'],
    cacheWithContext: false,
    modules: [srcDir, path.resolve(__dirname, './node_modules'), path.resolve(__dirname, '../../node_modules')],
    alias: {
      '@redhat-cloud-services': path.resolve(__dirname, '../../libs/onprem-cloud-deps/src'),
      '@unleash': path.resolve(__dirname, '../../libs/onprem-cloud-deps/src/unleash'),
    },
  },
};

/* Production settings */
if (NODE_ENV === 'production') {
  config.optimization = {
    minimizer: [
      new TerserJSPlugin({}),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ['default', { mergeLonghand: false }],
        },
      }),
    ],
  };
  config.plugins?.push(
    new MiniCssExtractPlugin({
      filename: '[name]-[contenthash].css',
      chunkFilename: '[name].bundle-[contenthash].css',
    })
  );
  config.devtool = 'source-map';
}

export default config;
