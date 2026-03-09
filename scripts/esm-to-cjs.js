import fs from 'fs';
import { rollup } from 'rollup';

const external = [
    'assert',
    'stylelint-csstree-validator',
    'css-tree',
    'stylelint',
    'stylelint/lib/utils/isStandardSyntaxAtRule.mjs',
    'stylelint/lib/utils/isStandardSyntaxDeclaration.mjs',
    'stylelint/lib/utils/isStandardSyntaxProperty.mjs',
    'stylelint/lib/utils/isStandardSyntaxValue.mjs',
    'postcss',
    'postcss-scss',
    'postcss-less'
];

function rewriteMjsToCjs(id) {
    return id.endsWith('.mjs') ? id.replace(/\.mjs$/, '.cjs') : id;
}

function readDir(dir) {
    return fs.readdirSync(dir)
        .filter(fn => fn.endsWith('.js'))
        .map(fn => `${dir}/${fn}`);
}

async function build(outputDir, ...entryPoints) {
    const startTime = Date.now();

    console.log();
    console.log(`Convert ESM to CommonJS (output: ${outputDir})`);

    const res = await rollup({
        external,
        input: entryPoints
    });
    await res.write({
        dir: outputDir,
        entryFileNames: '[name].cjs',
        format: 'cjs',
        exports: 'auto',
        preserveModules: true,
        interop: false,
        esModule: false,
        paths: rewriteMjsToCjs,
        generatedCode: {
            constBindings: true
        }
    });
    await res.close();

    console.log(`Done in ${Date.now() - startTime}ms`);
}

async function buildAll() {
    await build('./cjs', 'lib/index.js');
    await build('./cjs-test', ...readDir('test'));
}

buildAll();
