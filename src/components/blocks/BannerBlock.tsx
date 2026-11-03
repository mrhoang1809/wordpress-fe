import { BannerBlockData } from '@/types';
import { spacingClass, cn } from '@/lib/utils';

interface Props {
  data: BannerBlockData;
}

export function BannerBlock({ data }: Props) {
  const spacing = spacingClass(data.spacing);
  const alignment = data.alignment ?? 'center';

  const style: React.CSSProperties = {};
  if (data.backgroundType === 'color' && data.backgroundColor) {
    style.backgroundColor = data.backgroundColor;
  }
  if (data.textColor) {
    style.color = data.textColor;
  }

  return (
    <section
      className={cn(spacing, 'relative px-4 sm:px-6 lg:px-8')}
      style={style}
    >
      {data.backgroundType === 'image' && data.imageUrl && (
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.imageUrl}
            alt={data.imageAlt ?? ''}
            className="w-full h-full object-cover"
          />
          {data.overlayOpacity != null && (
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: data.overlayOpacity / 100 }}
            />
          )}
        </div>
      )}

      <div
        className={cn(
          'relative mx-auto max-w-4xl',
          alignment === 'center' && 'text-center',
          alignment === 'right' && 'text-right',
        )}
      >
        <h2 className="text-3xl font-bold sm:text-4xl">{data.title}</h2>
        {data.description && (
          <p className="mt-4 text-lg opacity-80">{data.description}</p>
        )}
        {data.cta && (
          <a
            href={data.cta.url}
            target={data.cta.openInNewTab ? '_blank' : undefined}
            rel={data.cta.openInNewTab ? 'noopener noreferrer' : undefined}
            className="mt-6 inline-flex items-center px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            {data.cta.label}
          </a>
        )}
      </div>
    </section>
  );
}
