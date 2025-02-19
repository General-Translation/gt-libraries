'use client';

import { useState } from 'react';
import { ChevronDownIcon, LoaderIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Markdown } from './markdown';
import { T, Var } from 'gt-next';

interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string;
}

export function MessageReasoning({
  isLoading,
  reasoning,
}: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
  };

  return (
    <T id='components.message_reasoning.2'>
      <div className='flex flex-col'>
        <Var>
          {isLoading ? (
            <T id='components.message_reasoning.0'>
              <div className='flex flex-row gap-2 items-center'>
                <div className='font-medium'>Reasoning</div>
                <div className='animate-spin'>
                  <LoaderIcon />
                </div>
              </div>
            </T>
          ) : (
            <T id='components.message_reasoning.1'>
              <div className='flex flex-row gap-2 items-center'>
                <div className='font-medium'>Reasoned for a few seconds</div>
                <div
                  className='cursor-pointer'
                  onClick={() => {
                    setIsExpanded(!isExpanded);
                  }}
                >
                  <ChevronDownIcon />
                </div>
              </div>
            </T>
          )}
        </Var>

        <AnimatePresence initial={false}>
          <Var>
            {isExpanded && (
              <motion.div
                key='content'
                initial='collapsed'
                animate='expanded'
                exit='collapsed'
                variants={variants}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
                className='pl-4 text-zinc-600 dark:text-zinc-400 border-l flex flex-col gap-4'
              >
                <Markdown>
                  <Var>{reasoning}</Var>
                </Markdown>
              </motion.div>
            )}
          </Var>
        </AnimatePresence>
      </div>
    </T>
  );
}
