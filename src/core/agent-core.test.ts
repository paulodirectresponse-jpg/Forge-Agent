import test from 'node:test'; import assert from 'node:assert/strict'; import {selectSkills} from './skills.ts'; import {isDestructive} from './security.ts';
test('selects relevant skills',()=>{const names=selectSkills('crie uma tela React em TypeScript').map(s=>s.name); assert.ok(names.includes('react-quality')); assert.ok(names.includes('typescript'));});
test('flags destructive requests',()=>{assert.equal(isDestructive('rm -rf projeto'),true); assert.equal(isDestructive('npm test'),false);});

