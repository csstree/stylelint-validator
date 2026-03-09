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

// Plugin to add .default to require() calls for .mjs externals.
// When require() is used on .mjs files, it returns { __esModule: true, default: fn }
// instead of the function directly, so we need to unwrap .default.
const mjsInteropPlugin = {
    name: 'mjs-interop',
    renderChunk(code) {
        return code.replace(
            /require\('([^']+\.mjs)'\)/g,
            "require('$1').default"
        );
    }
};

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
        input: entryPoints,
        plugins: [mjsInteropPlugin]
    });
    await res.write({
        dir: outputDir,
        entryFileNames: '[name].cjs',
        format: 'cjs',
        exports: 'auto',
        preserveModules: true,
        interop: false,
        esModule: false,
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
