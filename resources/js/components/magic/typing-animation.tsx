import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TypingAnimationProps {
  text: string | string[];
  className?: string;
  speed?: number;
  deleteSpeed?: number;
  delay?: number;
  cursor?: boolean;
  cursorChar?: string;
  loop?: boolean;
  onComplete?: () => void;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  className,
  speed = 100,
  deleteSpeed = 50,
  delay = 2000,
  cursor = true,
  cursorChar = '|',
  loop = true,
  onComplete,
}) => {
  const texts = Array.isArray(text) ? text : [text];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const currentFullText = texts[currentTextIndex];

    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentText.length < currentFullText.length) {
            setCurrentText(currentFullText.slice(0, currentText.length + 1));
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          } else if (onComplete) {
            onComplete();
          }
        } else {
          if (currentText.length > 0) {
            setCurrentText(currentFullText.slice(0, currentText.length - 1));
          } else {
            setIsDeleting(false);
            setCurrentTextIndex((prev) => (prev + 1) % texts.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed
    );

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentTextIndex, texts, speed, deleteSpeed, delay, loop, onComplete]);

  // Cursor blinking effect
  useEffect(() => {
    if (!cursor) return;

    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, [cursor]);

  return (
    <span className={cn('inline-flex', className)}>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {currentText}
      </motion.span>
      {cursor && (
        <motion.span
          className="ml-1"
          animate={{ opacity: showCursor ? 1 : 0 }}
          transition={{ duration: 0.1 }}
        >
          {cursorChar}
        </motion.span>
      )}
    </span>
  );
};

interface TypingAnimationProps2 {
  words: string[];
  className?: string;
  duration?: number;
  cursorClassName?: string;
}

export const TypingAnimation2: React.FC<TypingAnimationProps2> = ({
  words,
  className,
  duration = 2000,
  cursorClassName,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words, duration]);

  return (
    <div className={cn('inline-flex', className)}>
      <span className={cn('mr-2', cursorClassName)}>|</span>
      <motion.span
        key={words[index]}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="inline-block"
      >
        {words[index]}
      </motion.span>
    </div>
  );
};

export default TypingAnimation;
