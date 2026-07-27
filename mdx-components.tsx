import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  h1: (props) => <h1 className="mb-4 font-serif text-3xl text-navy-900 sm:text-4xl" {...props} />,
  h2: (props) => <h2 className="mb-3 mt-10 font-serif text-2xl text-navy-900" {...props} />,
  h3: (props) => <h3 className="mb-2 mt-6 font-serif text-xl text-navy-900" {...props} />,
  p: (props) => <p className="mb-4 leading-relaxed text-navy-800" {...props} />,
  ul: (props) => <ul className="mb-4 list-disc space-y-1 pl-6 text-navy-800" {...props} />,
  ol: (props) => <ol className="mb-4 list-decimal space-y-1 pl-6 text-navy-800" {...props} />,
  a: (props) => <a className="text-gold-700 underline hover:text-gold-500" {...props} />,
  strong: (props) => <strong className="font-semibold text-navy-900" {...props} />,
  blockquote: (props) => (
    <blockquote className="mb-4 border-l-4 border-gold-400 pl-4 italic text-warm-700" {...props} />
  ),
};

export function useMDXComponents(existing: MDXComponents): MDXComponents {
  return { ...existing, ...components };
}
