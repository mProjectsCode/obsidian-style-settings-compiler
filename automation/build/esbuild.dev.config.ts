import esbuild from 'esbuild';
import { getBuildBanner } from 'build/buildBanner';
import { sassPlugin } from 'esbuild-sass-plugin';

const banner = getBuildBanner('Dev Build', _ => 'Dev Build');

const context = await esbuild.context({
	banner: {
		css: banner,
	},
	entryPoints: ['output/index.scss'],
	logLevel: 'info',
	outfile: 'exampleVault/.obsidian/themes/test.css',
	plugins: [
		sassPlugin({
			cache: true,
			charset: false,
			alertColor: true,
			alertAscii: true,
		}),
	],
});

await context.watch();
