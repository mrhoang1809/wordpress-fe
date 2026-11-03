import { HeroBlockData } from '@/types';
import { spacingClass, cn } from '@/lib/utils';

interface Props {
  data: HeroBlockData;
}

export function HeroBlock({ data }: Props) {
  const spacing = spacingClass(data.spacing);
  const alignment = data.alignment ?? 'left';
  const theme = data.theme ?? 'light';

  return (
    <section
      className={cn(
        spacing,
        'px-4 sm:px-6 lg:px-8',
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900',
      )}
      style={data.backgroundColor ? { backgroundColor: data.backgroundColor } : undefined}
    >
      <div
        className={cn(
          'mx-auto max-w-7xl',
          data.layout === 'image-right' || data.layout === 'image-left'
            ? 'grid grid-cols-1 md:grid-cols-2 gap-8 items-center'
            : 'flex flex-col',
          alignment === 'center' && 'items-center text-center',
          alignment === 'right' && 'items-end text-right',
        )}
      >
        <div className="flex flex-col gap-4">
          {data.eyebrow && (
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              {data.eyebrow}
            </span>
          )}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {data.title}
          </h1>
          {data.subtitle && (
            <p className="text-xl font-medium opacity-80">{data.subtitle}</p>
          )}
          {data.description && (
            <p className="text-lg opacity-70 max-w-2xl">{data.description}</p>
          )}
          {(data.primaryButton || data.secondaryButton) && (
            <div className="flex flex-wrap gap-3 mt-2">
              {data.primaryButton && (
                <a
                  href={data.primaryButton.url}
                  target={data.primaryButton.openInNewTab ? '_blank' : undefined}
                  rel={data.primaryButton.openInNewTab ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
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

        {data.imageUrl && (
          <div
            className={cn(
              'relative',
              data.layout === 'image-left' && 'order-first',
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.imageUrl}
              alt={data.imageAlt ?? data.title}
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
