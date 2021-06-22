import path from 'path';
import AppConfig from '../../AppConfig';

const glob = require('glob');

export function name(appConfig: AppConfig) {
  return 'cms';
}

export function webpack(appConfig: AppConfig) {
  const behaviorItems = glob.sync(`${appConfig.absDesignSystemPath}/**/*.behavior.js`);

  const behaviorObject = behaviorItems.reduce((acc, item) => {
    const filename = path.basename(item).replace('.behavior.js', '');
    acc[`behaviors/${filename}`] = item;
    return acc;
  }, {});

  const vendorItems = glob.sync(`${appConfig.absDesignSystemPath}/**/*.vendor.js`);

  const vendorObject = vendorItems.reduce((acc, item) => {
    const filename = path.basename(item).replace('.vendor.js', '');
    acc[`vendors/${filename}`] = item;
    return acc;
  }, {});

  const cssItems = glob.sync(`${appConfig.absDesignSystemPath}/**/*.css`);

  const cssObject = cssItems.reduce((acc, item) => {
    const filename = path.basename(item).replace('.css', '');
    acc[`${filename}`] = item;
    return acc;
  }, {});

  return {
    target: 'web',
    devtool: appConfig.environment === 'development' ? 'cheap-source-map' : 'source-map',
    entry: {
      ...behaviorObject,
      ...cssObject,
      ...vendorObject,
    },
    module: {
      rules: [
        {
          test: /\.(yml|md|yaml)$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'wingsuit',
            emit: true,
          },
        },
        {
          test: /\.twig$/,
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
            outputPath: (url, resourcePath, context) => {
              const { namespaces } = appConfig;
              delete namespaces.wsdesignsystem;
              delete namespaces.wspatterns;
              let outputPath = url;
              Object.keys(namespaces).forEach(key => {
                const namespacePath = namespaces[key];
                if (resourcePath.substring(0, namespacePath.length) === namespacePath) {
                  outputPath = `${appConfig.assetAtomicFolder}/${key}/${resourcePath.substring(
                    namespacePath.length
                  )}`;
                }
              });
              return outputPath;
            },
            context: appConfig.absDesignSystemPath,
            emit: true,
          },
        },
      ],
    },
  };
}
