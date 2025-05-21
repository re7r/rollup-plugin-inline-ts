import { sxzz } from '@sxzz/eslint-config';
import jsdoc from 'eslint-plugin-jsdoc';

export default sxzz().append({
  rules: {
    eqeqeq: 'off',
    semi: ['error', 'always'],
    'jsdoc/check-types': 'error',
    'jsdoc/valid-types': 'error',
    'jsdoc/no-undefined-types': 'error',
    'perfectionist/sort-imports': 'off',
  },
  plugins: {
    jsdoc,
  },
});
