"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, CalendarDays } from 'lucide-react';

export default function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="flex items-center space-x-4 text-sm text-foreground/80 dark:text-foreground/70">
      <div className="flex items-center space-x-1">
        <CalendarDays className="h-4 w-4" />
        <span>{format(time, 'eeee, MMMM do, yyyy')}</span>
      </div>
      <div className="flex items-center space-x-1">
        <Clock className="h-4 w-4" />
        <span>{format(time, 'h:mm: