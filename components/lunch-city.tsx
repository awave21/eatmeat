'use client';

import {useEffect, useId, useRef, useState} from 'react';

export default function LunchCity() {
  const scene = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const buildings = useId();

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

  return <div ref={scene} className="lunch-city" aria-hidden="true" data-running={visible}>
    <svg viewBox="0 0 480 248" focusable="false">
      <defs><g id={buildings}>
        <path d="M16 15h39v12H38v23H16z"/>
        <rect x="64" y="22" width="20" height="28" rx="3"/>
        <rect x="116" y="12" width="33" height="36" rx="4"/>
        <path d="M159 24h30v26h-18V37h-12z"/>
        <path fillRule="evenodd" d="M223 15h64v34h-64zm15 10v14h35V25z"/>
        <rect x="322" y="13" width="25" height="32" rx="3"/>
        <path d="M357 22h39v27h-16V36h-23z"/>
        <rect x="432" y="14" width="31" height="32" rx="4"/>

        <rect x="20" y="80" width="23" height="31" rx="3"/>
        <rect x="52" y="90" width="32" height="25" rx="3"/>
        <path d="M117 80h42v19h27v16h-69z"/>
        <path d="M225 79h24v26h-11v11h-13z"/>
        <rect x="258" y="87" width="29" height="29" rx="4"/>
        <path fillRule="evenodd" d="M322 78h73v38h-73zm17 11v15h39V89z"/>
        <path d="M430 81h33v15h-16v20h-17z"/>

        <path fillRule="evenodd" d="M17 145h67v34H17zm16 9v15h35v-15z"/>
        <rect x="118" y="145" width="28" height="30" rx="3"/>
        <rect x="156" y="152" width="31" height="27" rx="4"/>
        <path d="M220 147h40v17h27v15h-67z"/>
        <rect x="320" y="145" width="29" height="34" rx="4"/>
        <rect x="359" y="150" width="38" height="26" rx="3"/>
        <rect x="430" y="145" width="35" height="33" rx="4"/>

        <rect x="25" y="207" width="51" height="26" rx="3"/>
        <path d="M115 208h34v13h37v17h-71z"/>
        <rect x="219" y="208" width="36" height="31" rx="4"/>
        <rect x="265" y="218" width="24" height="21" rx="3"/>
        <path d="M321 208h75v29h-20v-15h-55z"/>
        <rect x="431" y="208" width="31" height="24" rx="3"/>
      </g></defs>
      <use href={'#'+buildings} transform="translate(2 6)" fill="#7894c4"/>
      <use href={'#'+buildings} transform="translate(1 3)" fill="#7894c4"/>
      <use href={'#'+buildings} fill="currentColor"/>
    </svg>
    <span className="lunch-city-dot"/>
  </div>;
}
