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
          <g opacity=".76">
            <rect x="19" y="9" width="38" height="10" rx="3"/>
            <rect x="67" y="7" width="30" height="12" rx="3"/>
            <rect x="133" y="8" width="70" height="11" rx="4"/>
            <rect x="244" y="6" width="34" height="13" rx="4"/>
            <rect x="286" y="9" width="34" height="10" rx="3"/>
            <rect x="356" y="7" width="51" height="12" rx="4"/>
            <rect x="417" y="10" width="29" height="9" rx="3"/>
            <rect x="456" y="7" width="42" height="12" rx="4"/>
            <rect x="535" y="9" width="49" height="10" rx="3"/>
          </g>
          <g>
            <rect x="23" y="48" width="71" height="14" rx="4"/>
            <rect x="133" y="47" width="34" height="16" rx="4"/>
            <rect x="176" y="50" width="30" height="13" rx="3"/>
            <rect x="242" y="49" width="78" height="14" rx="5"/>
            <rect x="355" y="47" width="33" height="16" rx="4"/>
            <rect x="397" y="49" width="44" height="13" rx="3"/>
            <rect x="451" y="47" width="48" height="16" rx="4"/>
            <rect x="535" y="48" width="48" height="14" rx="4"/>
          </g>
          <g>
            <rect x="20" y="93" width="32" height="12" rx="3"/>
            <rect x="63" y="91" width="34" height="16" rx="4"/>
            <rect x="134" y="91" width="70" height="16" rx="4"/>
            <rect x="242" y="92" width="35" height="15" rx="4"/>
            <rect x="287" y="94" width="34" height="12" rx="3"/>
            <rect x="356" y="91" width="58" height="16" rx="4"/>
            <rect x="425" y="93" width="31" height="14" rx="3"/>
            <rect x="467" y="91" width="32" height="16" rx="4"/>
            <rect x="534" y="92" width="50" height="15" rx="4"/>
          </g>
          <g opacity=".76">
            <rect x="22" y="135" width="73" height="10" rx="4"/>
            <rect x="135" y="137" width="29" height="9" rx="3"/>
            <rect x="174" y="135" width="31" height="10" rx="3"/>
            <rect x="243" y="135" width="77" height="11" rx="4"/>
            <rect x="357" y="136" width="40" height="10" rx="3"/>
            <rect x="406" y="135" width="49" height="11" rx="4"/>
            <rect x="466" y="137" width="32" height="8" rx="3"/>
            <rect x="536" y="135" width="46" height="10" rx="4"/>
          </g>
        </g>
      </svg>
      <span className="lunch-city-dot"/>
    </div>
    <button className="lunch-motion-toggle" type="button" aria-label={label} title={label} onClick={() => setPaused(value => !value)}>
      {paused ? <Play size={14} aria-hidden="true"/> : <Pause size={14} aria-hidden="true"/>}
    </button>
  </div>;
}
