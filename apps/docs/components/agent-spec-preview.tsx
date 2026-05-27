export function AgentSpecPreview({ markdown }: { markdown: string }) {
  const [, frontmatter = "", body = ""] =
    markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? [];

  const meta = frontmatter
    .trim()
    .split("\n")
    .map((line) => {
      const colon = line.indexOf(":");
      if (colon === -1) return null;
      return {
        key: line.slice(0, colon).trim(),
        value: line.slice(colon + 1).trim().replace(/^"|"$/g, ""),
      };
    })
    .filter(Boolean) as { key: string; value: string }[];

  const blocks = body.trim().split(/\n\n+/);

  return (
    <div className="agent-spec-preview text-[13px] leading-[1.65] text-neutral-800 dark:text-neutral-200">
      {meta.length > 0 ? (
        <dl className="mb-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-b border-neutral-200 pb-5 dark:border-neutral-700">
          {meta.map(({ key, value }) => (
            <div key={key} className="contents">
              <dt className="font-medium text-neutral-500 dark:text-neutral-400">
                {key}
              </dt>
              <dd className="m-0 text-neutral-700 dark:text-neutral-300">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="space-y-5">
        {blocks.map((block, index) => {
          const lines = block.split("\n");

          if (lines[0]?.startsWith("## ")) {
            return (
              <section key={index} className="space-y-2">
                <p
                  role="heading"
                  aria-level={2}
                  className="m-0 text-[13px] font-semibold text-neutral-900 dark:text-neutral-100"
                >
                  {lines[0].slice(3)}
                </p>
                {lines.slice(1).map((line, lineIndex) =>
                  line.trim() ? (
                    <p
                      key={lineIndex}
                      className="m-0 text-neutral-700 dark:text-neutral-300"
                    >
                      {line}
                    </p>
                  ) : null,
                )}
              </section>
            );
          }

          if (lines.every((line) => line.startsWith("- "))) {
            return (
              <ul
                key={index}
                className="m-0 list-none space-y-1.5 pl-0 text-neutral-700 dark:text-neutral-300"
              >
                {lines.map((line, lineIndex) => {
                  const checked = line.startsWith("- [ ] ");
                  const text = checked ? line.slice(6) : line.slice(2);
                  return (
                    <li key={lineIndex} className="flex gap-2">
                      <span className="mt-0.5 text-neutral-400" aria-hidden>
                        {checked ? "☐" : "•"}
                      </span>
                      <span>{text}</span>
                    </li>
                  );
                })}
              </ul>
            );
          }

          return (
            <p
              key={index}
              className="m-0 text-neutral-700 dark:text-neutral-300"
            >
              {block}
            </p>
          );
        })}
      </div>
    </div>
  );
}
