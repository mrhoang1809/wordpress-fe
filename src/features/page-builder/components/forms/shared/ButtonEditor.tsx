'use client';

import { ButtonConfig } from '@/types';

interface Props {
  value?: ButtonConfig;
  onChange: (btn: ButtonConfig | undefined) => void;
}

export function ButtonEditor({ value, onChange }: Props) {
  const handleChange = (partial: Partial<ButtonConfig>) => {
    onChange({ label: '', url: '/', ...value, ...partial });
  };

  const handleClear = () => onChange(undefined);

  return (
    <div className="space-y-2 rounded-md border p-3 bg-muted/30">
      <div className="flex items-center gap-2">
        <input
          className="form-input flex-1"
          placeholder="Button label"
          value={value?.label ?? ''}
          onChange={(e) => handleChange({ label: e.target.value })}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-destructive hover:underline shrink-0"
          >
            Remove
          </button>
        )}
      </div>
      {value !== undefined && (
        <>
          <input
            className="form-input w-full"
            placeholder="URL (/ or https://...)"
            value={value.url ?? ''}
            onChange={(e) => handleChange({ url: e.target.value })}
          />
          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              id="open-new-tab"
              checked={value.openInNewTab ?? false}
              onChange={(e) => handleChange({ openInNewTab: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="open-new-tab">Open in new tab</label>
          </div>
        </>
      )}
      {!value && (
        <button
          type="button"
          onClick={() => onChange({ label: 'Click here', url: '/' })}
          className="text-xs text-primary hover:underline"
        >
          + Add button
        </button>
      )}
    </div>
  );
}
