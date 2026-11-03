'use client';

import { ImageBlockData } from '@/types';
import { FormField } from './shared/FormField';

interface Props {
  data: ImageBlockData;
  onChange: (data: ImageBlockData) => void;
}

export function ImageForm({ data, onChange }: Props) {
  const update = (partial: Partial<ImageBlockData>) => onChange({ ...data, ...partial });

  return (
    <div className="space-y-4">
      <FormField label="Image URL" required>
        <input className="form-input" type="url" value={data.imageUrl} onChange={(e) => update({ imageUrl: e.target.value })} placeholder="https://..." />
      </FormField>

      <FormField label="Alt text" required>
        <input className="form-input" value={data.alt} onChange={(e) => update({ alt: e.target.value })} placeholder="Describe the image for accessibility" />
      </FormField>

      <FormField label="Caption" optional>
        <input className="form-input" value={data.caption ?? ''} onChange={(e) => update({ caption: e.target.value })} />
      </FormField>

      <FormField label="Link URL" optional>
        <input className="form-input" value={data.link ?? ''} onChange={(e) => update({ link: e.target.value })} placeholder="/ or https://..." />
      </FormField>

      <FormField label="Aspect ratio">
        <select className="form-input" value={data.aspectRatio ?? 'auto'} onChange={(e) => update({ aspectRatio: e.target.value as ImageBlockData['aspectRatio'] })}>
          <option value="auto">Auto</option>
          <option value="16/9">16:9</option>
          <option value="4/3">4:3</option>
          <option value="3/2">3:2</option>
          <option value="1/1">1:1 (Square)</option>
        </select>
      </FormField>

      <FormField label="Object fit">
        <select className="form-input" value={data.objectFit ?? 'cover'} onChange={(e) => update({ objectFit: e.target.value as ImageBlockData['objectFit'] })}>
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
        </select>
      </FormField>

      <FormField label="Width">
        <select className="form-input" value={data.width ?? 'normal'} onChange={(e) => update({ width: e.target.value as ImageBlockData['width'] })}>
          <option value="narrow">Narrow</option>
          <option value="normal">Normal</option>
          <option value="wide">Wide</option>
          <option value="full">Full</option>
        </select>
      </FormField>

      <FormField label="Alignment">
        <select className="form-input" value={data.alignment ?? 'center'} onChange={(e) => update({ alignment: e.target.value as ImageBlockData['alignment'] })}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </FormField>
    </div>
  );
}
