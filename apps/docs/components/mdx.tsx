import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { DocsCodeBlock, DocsPre } from './docs-code-block';
import { StorybookEmbed } from './storybook-embed';
import { Gap } from './gap';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    pre: (props) => (
      <DocsCodeBlock {...props}>
        <DocsPre>{props.children}</DocsPre>
      </DocsCodeBlock>
    ),
    StorybookEmbed,
    Gap,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
