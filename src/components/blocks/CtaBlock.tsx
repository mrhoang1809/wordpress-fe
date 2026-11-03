import { CtaBlockData } from '@/types';
import { spacingClass, cn } from '@/lib/utils';

interface Props {
  data: CtaBlockData;
}

const themeClass: Record<string, string> = {
  light: 'bg-gray-50 text-gray-900',
  dark: 'bg-gray-900 text-white',
  brand: 'bg-primary text-primary-foreground',
};

export function CtaBlock({ data }: Props) {
  const spacing = spacingClass(data.spacing);
  const theme = themeClass[data.theme ?? 'light'];
  const inline = data.layout === 'inline';

  return (
    <section
      className={cn(spacing, 'px-4 sm:px-6 lg:px-8', theme)}
      style={data.backgroundColor ? { backgroundColor: data.backgroundColor } : undefined}
    >
      <div
        className={cn(
          'mx-auto max-w-4xl',
          inline
            ? 'flex flex-col sm:flex-row items-center justify-between gap-6'
            : 'flex flex-col items-center text-center gap-6',
        )}
      >
        <div className={inline ? 'flex-1' : ''}>
          <h2 className="text-3xl font-bold">{data.title}</h2>
          {data.description && (
            <p className="mt-2 text-lg opacity-80">{data.description}</p>
          )}
        </div>

        {(data.primaryButton || data.secondaryButton) && (
          <div className="flex flex-wrap gap-3">
            {data.primaryButton && (
              <a
                href={data.primaryButton.url}
                target={data.primaryButton.openInNewTab ? '_blank' : undefined}
                rel={data.primaryButton.openInNewTab ? 'noopener noreferrer' : undefined}
                className={cn(
                  'inline-flex items-center px-6 py-3 rounded-md font-medium transition-colors',
                  data.theme === 'brand'
                    ? 'bg-white text-primary hover:bg-white/90'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90',
                )}
              >
                {data.primaryButton.label}
              </a>
            )}
            {data.secondaryButton && (
              <a
                href={data.secondaryButton.url}
                target={data.secondaryButton.openInNewTab ? '_blank' : undefined}
                rel={data.secondaryButton.openInNewTab ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center px-6 py-3 rounded-md border border-current font-medium hover:bg-black/5 transition-colors"
              >
                {data.secondaryButton.label}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
