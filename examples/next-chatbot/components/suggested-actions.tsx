'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { memo } from 'react';
import { useGT } from 'gt-next/client';

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const t = useGT();
  const suggestedActions = [
    {
      title: t('What are the advantages'),
      label: t('of using Next.js?'),
      action: t('What are the advantages of using Next.js?'),
    },
    {
      title: t('Write code to'),
      label: t("demonstrate djikstra's algorithm"),
      action: t("Write code to demonstrate djikstra's algorithm"),
    },
    {
      title: t('Help me write an essay'),
      label: t('about silicon valley'),
      action: t('Help me write an essay about silicon valley'),
    },
    {
      title: t('What is the weather'),
      label: t('in San Francisco?'),
      action: t('What is the weather in San Francisco?'),
    },
  ];

  return (
    <div className='grid sm:grid-cols-2 gap-2 w-full'>
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant='ghost'
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className='text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start'
          >
            <span className='font-medium'>{suggestedAction.title}</span>
            <span className='text-muted-foreground'>
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
