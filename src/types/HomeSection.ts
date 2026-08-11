import { ConversationSummary } from './Message';

export type HomeSectionItem =
  | {
      type: 'header';
      id: string;
      title: string;
      count: number;
    }
  | {
      type: 'conversation';
      id: string;
      conversation: ConversationSummary;
    };