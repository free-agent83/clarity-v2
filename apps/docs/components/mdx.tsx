import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { StorybookEmbed } from './storybook-embed';
import { Gap } from './gap';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    StorybookEmbed,
    Gap,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
