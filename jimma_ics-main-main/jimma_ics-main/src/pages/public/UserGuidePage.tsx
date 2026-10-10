import ReactMarkdown from 'react-markdown';
import userGuide from '../../content/public-user-guide.md?raw';

export const UserGuidePage = () => (
  <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
    <article className="rounded-3xl border border-stone-200 bg-white px-5 py-7 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:px-10 sm:py-10">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-4xl">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-10 border-b border-stone-200 pb-2 font-serif text-2xl font-bold text-emerald-900 dark:border-stone-700 dark:text-emerald-300">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-6 text-lg font-bold text-stone-900 dark:text-stone-100">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-sm leading-7 text-stone-600 dark:text-stone-300">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-5 list-disc space-y-2 pl-6 text-sm leading-7 text-stone-600 dark:text-stone-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-5 list-decimal space-y-2 pl-6 text-sm leading-7 text-stone-600 dark:text-stone-300">
              {children}
            </ol>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="font-semibold text-emerald-800 underline decoration-emerald-400 underline-offset-2 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-stone-900 dark:text-stone-100">
              {children}
            </strong>
          ),
        }}
      >
        {userGuide}
      </ReactMarkdown>
    </article>
  </div>
);
