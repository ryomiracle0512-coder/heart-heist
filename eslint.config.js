import js from '@eslint/js';
import ts from 'typescript-eslint';
export default ts.config({ignores:['dist/**','node_modules/**','test-results/**','playwright-report/**','Codex_LP_Handson/**','docs/design/**']},js.configs.recommended,...ts.configs.recommended,{rules:{'@typescript-eslint/no-explicit-any':'off','@typescript-eslint/no-unused-vars':['error',{argsIgnorePattern:'^_'}]},languageOptions:{globals:{document:'readonly',window:'readonly',console:'readonly',setTimeout:'readonly',URL:'readonly',process:'readonly'}}});
