'use client';

import {Pause, Play} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';

export default function LunchCity() {
  const scene = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = scene.current;
    if (!element) return;

    let inView = false;
    const syncVisibility = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.intersectionRatio >= 0.08;
      syncVisibility();
    }, {threshold: 0.08});

    observer.observe(element);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);

  const label = paused ? 'Продолжить анимацию маршрута' : 'Приостановить анимацию маршрута';

  return <>
    <div ref={scene} className="lunch-city" aria-hidden="true" data-running={visible && !paused}>
      <svg viewBox="0 0 620 426" preserveAspectRatio="none" focusable="false">
        <g fill="#d9e5f6" opacity=".58">
          <rect x="50" y="32" width="32" height="43" rx="6"/>
          <rect x="102" y="37" width="58" height="42" rx="8"/>
          <rect x="175" y="37" width="42" height="64" rx="7"/>
          <rect x="34" y="121" width="31" height="62" rx="6"/>
          <rect x="33" y="209" width="51" height="43" rx="7"/>
          <rect x="36" y="275" width="35" height="66" rx="7"/>
          <rect x="86" y="284" width="64" height="34" rx="6"/>
          <rect x="91" y="358" width="45" height="42" rx="8"/>
          <rect x="471" y="35" width="72" height="40" rx="8"/>
          <rect x="558" y="27" width="37" height="64" rx="7"/>
          <rect x="549" y="120" width="42" height="54" rx="7"/>
          <rect x="553" y="318" width="39" height="66" rx="7"/>
          <rect x="474" y="373" width="58" height="33" rx="7"/>
        </g>
      </svg>
      <span className="lunch-city-dot"/>
    </div>
    <button className="lunch-motion-toggle" type="button" aria-label={label} title={label} onClick={() => setPaused(value => !value)}>
      {paused ? <Play size={14} aria-hidden="true"/> : <Pause size={14} aria-hidden="true"/>}
    </button>
  </>;
}
