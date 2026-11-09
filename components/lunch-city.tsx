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

  return <div className="lunch-route">
    <div ref={scene} className="lunch-city" aria-hidden="true" data-running={visible && !paused}>
      <svg viewBox="0 0 600 150" preserveAspectRatio="none" focusable="false">
        <g fill="currentColor">
          <rect x="61" y="31" width="29" height="20" rx="4"/>
          <rect x="98" y="32" width="31" height="18" rx="4"/>
          <rect x="157" y="31" width="41" height="19" rx="4"/>
          <rect x="206" y="31" width="33" height="20" rx="5"/>
          <rect x="269" y="32" width="65" height="17" rx="5"/>
          <rect x="365" y="29" width="32" height="22" rx="4"/>
          <rect x="406" y="34" width="36" height="17" rx="4"/>
          <rect x="469" y="30" width="45" height="21" rx="5"/>
          <rect x="63" y="67" width="63" height="19" rx="5"/>
          <rect x="158" y="66" width="33" height="20" rx="4"/>
          <rect x="200" y="70" width="37" height="17" rx="4"/>
          <rect x="267" y="65" width="36" height="21" rx="4"/>
          <rect x="311" y="70" width="24" height="16" rx="4"/>
          <rect x="364" y="67" width="78" height="18" rx="5"/>
          <rect x="468" y="66" width="65" height="20" rx="5"/>
          <rect x="62" y="104" width="45" height="18" rx="4"/>
          <rect x="116" y="106" width="47" height="16" rx="4"/>
          <rect x="174" y="102" width="62" height="20" rx="5"/>
          <rect x="266" y="104" width="68" height="18" rx="5"/>
          <rect x="365" y="102" width="39" height="20" rx="4"/>
          <rect x="412" y="107" width="30" height="14" rx="4"/>
          <rect x="469" y="103" width="31" height="20" rx="4"/>
          <rect x="508" y="106" width="30" height="16" rx="4"/>
        </g>
      </svg>
      <span className="lunch-city-dot"/>
    </div>
    <button className="lunch-motion-toggle" type="button" aria-label={label} title={label} onClick={() => setPaused(value => !value)}>
      {paused ? <Play size={14} aria-hidden="true"/> : <Pause size={14} aria-hidden="true"/>}
    </button>
  </div>;
}
