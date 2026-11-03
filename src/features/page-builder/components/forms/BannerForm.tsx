'use client';

import { BannerBlockData } from '@/types';
import { FormField } from './shared/FormField';
import { ButtonEditor } from './shared/ButtonEditor';

interface Props {
  data: BannerBlockData;
  onChange: (data: BannerBlockData) => void;
}

export function BannerForm({ data, onChange }: Props) {
  const update = (partial: Partial<BannerBlockData>) => onChange({ ...data, ...partial });

  return (
    <div className="space-y-4">
      <FormField label="Title" required>
        <input className="form-input" value={data.title} onChange={(e) => update({ title: e.target.value })} />
      </FormField>

      <FormField label="Description" optional>
        <textarea className="form-input min-h-[80px]" value={data.description ?? ''} onChange={(e) => update({ description: e.target.value })} />
      </FormField>

      <FormField label="Background type">
        <select className="form-input" value={data.backgroundType ?? 'color'} onChange={(e) => update({ backgroundType: e.target.value as BannerBlockData['backgroundType'] })}>
          <option value="color">Solid color</option>
          <option value="image">Image</option>
        </select>
      </FormField>

      {data.backgroundType === 'color' && (
        <FormField label="Background color" optional>
          <input type="color" className="h-10 w-20 rounded border" value={data.backgroundColor ?? '#1e40af'} onChange={(e) => update({ backgroundColor: e.target.value })} />
        </FormField>
      )}

      {data.backgroundType === 'image' && (
        <>
          <FormField label="Image URL" optional>
            <input className="form-input" type="url" value={data.imageUrl ?? ''} onChange={(e) => update({ imageUrl: e.target.value })} />
          </FormField>
          <FormField label="Overlay opacity (0–100)" optional>
            <input type="number" className="form-input" min={0} max={100} value={data.overlayOpacity ?? 50} onChange={(e) => update({ overlayOpacity: Number(e.target.value) })} />
          </FormField>
        </>
      )}

      <FormField label="Text color" optional>
        <input type="color" className="h-10 w-20 rounded border" value={data.textColor ?? '#ffffff'} onChange={(e) => update({ textColor: e.target.value })} />
      </FormField>

      <FormField label="Alignment">
        <select className="form-input" value={data.alignment ?? 'center'} onChange={(e) => update({ alignment: e.target.value as BannerBlockData['alignment'] })}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </FormField>

      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-2">CTA Button</p>
        <ButtonEditor value={data.cta} onChange={(btn) => update({ cta: btn })} />
      </div>
    </div>
  );
}
