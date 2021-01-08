module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: ['google'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
        'max-len': ['error', { code: 120 }],
        indent: ['error', 4],
        'new-cap': ['error', { capIsNewExceptionPattern: 'Router' }],
        'object-curly-spacing': ['error', 'always'],
        'operator-linebreak': ['error', 'before'],
        indent: ['error', 4, { SwitchCase: 1 }],
    },
};
