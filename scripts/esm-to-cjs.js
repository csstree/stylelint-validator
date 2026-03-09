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

// Plugin to handle require() of .mjs externals across Node.js versions.
// - Stylelint 16 ships both .cjs and .mjs utils; Node 18 can't require() .mjs files.
// - Stylelint 17 ships only .mjs utils but requires Node >=20.19 where require(.mjs) works.
// The helper tries .cjs first (stylelint 16 on any Node), falls back to .mjs (stylelint 17).
const mjsInteropPlugin = {
    name: 'mjs-interop',
    renderChunk(code) {
        if (!code.includes(".mjs')")) {
            return null;
        }

        const helper =
            "function _requireMjs(m) { try { return require(m.replace(/\\.mjs$/, '.cjs')); }" +
            ' catch { return require(m).default; } }\n';

        return helper + code.replace(
            /require\('([^']+\.mjs)'\)/g,
            "_requireMjs('$1')"
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
