import Image from 'next/image';
import { Geist, Geist_Mono } from 'next/font/google';
import { LocaleSelector } from 'gt-react';
import { T } from 'gt-react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function Home() {
  return (
    
    <div>
     <T id='pages.index.0'>
      <div>Hello, world!</div>
     <LocaleSelector />
    </T>
    </div>
  );
}
