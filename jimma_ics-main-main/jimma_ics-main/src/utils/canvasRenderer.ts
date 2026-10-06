import html2canvas from 'html2canvas';

/**
 * Sanitizes a cloned DOM tree before html2canvas executes to prevent
 * "unsupported color function oklch" errors caused by Tailwind v4 / modern CSS.
 */
export function sanitizeClonedDocColors(clonedDoc: Document, clonedElement: HTMLElement): void {
  const canvas = clonedDoc.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const colorProps = [
    'color',
    'background-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'outline-color',
    'text-decoration-color',
    'fill',
    'stroke',
    'stop-color',
    'flood-color',
  ];

  const convertColorStringToRgb = (colorStr: string): string => {
    if (!colorStr) return '';
    if (!colorStr.includes('oklch') && !colorStr.includes('color(') && !colorStr.includes('lab(')) {
      return colorStr;
    }
    try {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = colorStr;
      return ctx.fillStyle; // Native 2D canvas context resolves modern colors to rgb / rgba / hex
    } catch {
      return '#000000';
    }
  };

  const sanitizeComplexProperty = (propertyVal: string): string => {
    if (!propertyVal) return propertyVal;
    if (!propertyVal.includes('oklch') && !propertyVal.includes('color(') && !propertyVal.includes('lab(')) {
      return propertyVal;
    }
    return propertyVal.replace(/(?:oklch|color|lab)\([^)]+\)/gi, (match) => {
      try {
        ctx.fillStyle = '#000000';
        ctx.fillStyle = match;
        return ctx.fillStyle;
      } catch {
        return '#000000';
      }
    });
  };

  const allElements = [clonedElement, ...Array.from(clonedElement.querySelectorAll('*'))] as HTMLElement[];

  for (const el of allElements) {
    if (!el || !el.style) continue;

    try {
      const computed = window.getComputedStyle(el);

      for (const prop of colorProps) {
        const val = computed.getPropertyValue(prop);
        if (val && (val.includes('oklch') || val.includes('color(') || val.includes('lab('))) {
          const rgbVal = convertColorStringToRgb(val);
          el.style.setProperty(prop, rgbVal, 'important');
        }
      }

      const boxShadow = computed.getPropertyValue('box-shadow');
      if (boxShadow && (boxShadow.includes('oklch') || boxShadow.includes('color('))) {
        el.style.setProperty('box-shadow', sanitizeComplexProperty(boxShadow), 'important');
      }

      const bgImage = computed.getPropertyValue('background-image');
      if (bgImage && (bgImage.includes('oklch') || bgImage.includes('color('))) {
        el.style.setProperty('background-image', sanitizeComplexProperty(bgImage), 'important');
      }

      const bg = computed.getPropertyValue('background');
      if (bg && (bg.includes('oklch') || bg.includes('color('))) {
        el.style.setProperty('background', sanitizeComplexProperty(bg), 'important');
      }
    } catch {
      // Continue on any style query error
    }
  }
}

/**
 * Safely renders an HTML element into a high-DPI HTML5 canvas
 * with oklch color conversion and error recovery.
 */
export async function renderElementToCanvas(
  element: HTMLElement,
  options: { scale?: number } = {}
): Promise<HTMLCanvasElement> {
  const scale = options.scale || 2.5;

  return await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: null,
    onclone: (clonedDoc, clonedElement) => {
      sanitizeClonedDocColors(clonedDoc, clonedElement);
    },
  });
}
