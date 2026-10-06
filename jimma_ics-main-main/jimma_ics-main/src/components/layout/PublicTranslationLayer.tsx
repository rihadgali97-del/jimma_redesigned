import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { translatePublicCopy } from '../../i18n/publicCopy';

const excludedText = 'script, style, noscript, svg, [contenteditable="true"], [data-translation-skip]';
const translatableAttributes = ['placeholder', 'aria-label', 'title'] as const;

export const PublicTranslationLayer: React.FC = () => {
  const { language } = useLanguage();
  const originalTextMap = useRef(new WeakMap<Text, string>());
  const originalAttrMap = useRef(new WeakMap<Element, Map<string, string>>());

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('#root') || document.body;
    if (!root) return;

    let observer: MutationObserver | null = null;

    const translateTree = () => {
      // Pause observer while mutating DOM to prevent infinite mutation loop
      if (observer) observer.disconnect();

      try {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const textNode = node as Text;
          const parent = textNode.parentElement;
          if (!parent || parent.closest(excludedText)) continue;

          // Store the immutable original text on first encounter
          if (!originalTextMap.current.has(textNode)) {
            originalTextMap.current.set(textNode, textNode.data);
          }

          const source = originalTextMap.current.get(textNode) ?? textNode.data;
          if (!source.trim()) continue;

          const leading = source.match(/^\s*/)?.[0] ?? '';
          const trailing = source.match(/\s*$/)?.[0] ?? '';
          const cleanSource = source.trim();
          const translatedText = translatePublicCopy(cleanSource, language);
          const translated = `${leading}${translatedText}${trailing}`;

          if (textNode.data !== translated) {
            textNode.data = translated;
          }
        }

        root.querySelectorAll<HTMLElement>('[placeholder], [aria-label], [title]').forEach((element) => {
          if (element.closest(excludedText)) return;

          let attrMap = originalAttrMap.current.get(element);
          if (!attrMap) {
            attrMap = new Map<string, string>();
            originalAttrMap.current.set(element, attrMap);
          }

          for (const attribute of translatableAttributes) {
            const currentVal = element.getAttribute(attribute);
            if (currentVal === null) continue;

            if (!attrMap.has(attribute)) {
              attrMap.set(attribute, currentVal);
            }

            const source = attrMap.get(attribute) ?? currentVal;
            const translated = translatePublicCopy(source, language);
            if (currentVal !== translated) {
              element.setAttribute(attribute, translated);
            }
          }
        });
      } finally {
        // Reconnect observer
        if (observer) {
          observer.observe(root, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: [...translatableAttributes],
          });
        }
      }
    };

    observer = new MutationObserver(translateTree);

    // Initial translation pass
    translateTree();

    // Observe future DOM mutations
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...translatableAttributes],
    });

    return () => {
      if (observer) observer.disconnect();
    };
  }, [language]);

  return null;
};

