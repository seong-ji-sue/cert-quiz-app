const {join} = require('path');
const {NextFederationPlugin} = require('@module-federation/nextjs-mf');
const dotenv = require('dotenv');

dotenv.config({path: join(__dirname, `../../.env.${process.env.NODE_ENV}`)});

const config = {
	output: 'standalone',
	reactStrictMode: false,
	swcMinify: true,
	webpack: (config, {isServer}) => {
		if (!isServer) {
			config.resolve.fallback = {
				dns: false,
				net: false,
				tls: false,
			};
			config.plugins.push(
				new NextFederationPlugin({
					name: 'remote',
					filename: 'static/chunks/remoteEntry.js',
					exposes: {
						'./Test': './src/pages/index.js',
						'./Edit': './src/pages/test/index.js',
					},
					shared: {
						'next/navigation': {singleton: true},
						'next/router': {singleton: true},
						recoil: {singleton: true},
						react: {singleton: true},
					},
				}),
			);
			if (process.env.NODE_ENV === 'production') {
				config.optimization.minimizer.forEach((plugin) => {
					if (
						plugin.constructor.name === 'TerserPlugin' &&
						plugin.options.terserOptions?.compress
					) {
						plugin.options.terserOptions.compress.drop_console = true;
					}
				});
			}
		}
		return config;
	},
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'Access-Control-Allow-Methods',
						value: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
					},
					{key: 'Access-Control-Allow-Credentials', value: 'true'},
					{
						key: 'Access-Control-Allow-Headers',
						value: 'Content-Range, Content-Type, Authorization',
					},
					{
						key: 'Access-Control-Expose-Headers',
						value: 'Content-Range, Content-Type, Authorization',
					},
					{key: 'X-XSS-Protection', value: '1; mode=block'},
					{key: 'X-Content-Type-Options', value: 'nosniff'},
					{key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
				],
			},
		];
	},
	images: {domains: ['*'], minimumCacheTTL: 60},
	sassOptions: {includePaths: [join(__dirname, 'styles')]},
	experimental: {
		optimizePackageImports: [],
	},
	transpilePackages: [],
	compiler: {
		removeConsole:
			process.env.NODE_ENV === 'production' ? {exclude: []} : false,
	},
};

module.exports = config;
