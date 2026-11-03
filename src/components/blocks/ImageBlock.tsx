import { ImageBlockData } from '@/types';
import { spacingClass, cn } from '@/lib/utils';

interface Props {
  data: ImageBlockData;
}

const widthClass: Record<string, string> = {
  narrow: 'max-w-sm',
  normal: 'max-w-2xl',
  wide: 'max-w-5xl',
  full: 'max-w-none',
};

const aspectClass: Record<string, string> = {
  '1/1': 'aspect-square',
  '4/3': 'aspect-4/3',
  '16/9': 'aspect-video',
  '3/2': 'aspect-3/2',
  auto: '',
};

export function ImageBlock({ data }: Props) {
  const spacing = spacingClass(data.spacing);
  const width = widthClass[data.width ?? 'normal'];
  const aspect = aspectClass[data.aspectRatio ?? 'auto'];

  const imgEl = (
    <figure className="m-0">
      <div className={cn('overflow-hidden rounded-lg', aspect)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.imageUrl}
          alt={data.alt}
          className={cn(
            'w-full h-full',
            data.objectFit === 'contain' ? 'object-contain' : 'object-cover',
          )}
        />
      </div>
      {data.caption && (
        <figcaption className="mt-2 text-sm text-muted-foreground text-center">
          {data.caption}
        </figcaption>
      )}
    </figure>
  );

  return (
    <section className={cn(spacing, 'px-4 sm:px-6 lg:px-8')}>
      <div
        className={cn(
          'mx-auto',
          width,
          data.alignment === 'center' && 'flex justify-center',
          data.alignment === 'right' && 'flex justify-end',
        )}
      >
        {data.link ? (
          <a
            href={data.link}
            className="block"
            target={data.link.startsWith('http') ? '_blank' : undefined}
            rel={data.link.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {imgEl}
          </a>
        ) : (
          imgEl
        )}
      </div>
    </section>
  );
}
