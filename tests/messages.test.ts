import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { routing } from '@/i18n/routing';

type Tree = { [key: string]: Tree | string };

const load = (locale: string): Tree => JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8')) as Tree;

function keys(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => (typeof value === 'string' ? [`${prefix}${key}`] : keys(value, `${prefix}${key}.`)));
}

describe('messages', () => {
  const base = keys(load('es')).sort();

  it.each(routing.locales)('%s has exactly the keys of es', (locale) => {
    expect(keys(load(locale)).sort()).toEqual(base);
  });

  it.each(routing.locales)('%s has no empty string', (locale) => {
    const empty = keys(load(locale)).filter((key) => key.split('.').reduce<Tree | string>((node, part) => (node as Tree)[part], load(locale)) === '');
    expect(empty).toEqual([]);
  });
});
