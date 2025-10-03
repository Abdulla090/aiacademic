import { Mark, mergeAttributes } from '@tiptap/core';

export interface SuggestionOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    suggestion: {
      /**
       * Set a suggestion mark
       */
      setSuggestion: () => ReturnType;
      /**
       * Toggle a suggestion mark
       */
      toggleSuggestion: () => ReturnType;
      /**
       * Unset a suggestion mark
       */
      unsetSuggestion: () => ReturnType;
    };
  }
}

export const Suggestion = Mark.create<SuggestionOptions>({
  name: 'suggestion',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'suggestion text-gray-400',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'suggestion',
      },
      {
        style: 'color',
        getAttrs: value => value === '#9ca3af' ? {} : false,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['suggestion', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setSuggestion: () => ({ commands }) => {
        return commands.setMark(this.name);
      },
      toggleSuggestion: () => ({ commands }) => {
        return commands.toggleMark(this.name);
      },
      unsetSuggestion: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});