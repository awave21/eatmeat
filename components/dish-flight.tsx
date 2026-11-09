'use client';
import {useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
export type Flight={id:number;cat:number;variant:number;x:number;y:number;size:number;targetX:number;targetY:number};
export default function DishFlight({flight,onLand}:{flight:Flight;onLand:(f:Flight)=>void}){
 const element=useRef<HTMLDivElement>(null);const callback=useRef(onLand);callback.current=onLand;
 useEffect(()=>{const node=element.current;if(!node)return;const dx=flight.targetX-flight.x-flight.size/2;const dy=flight.targetY-flight.y-flight.size/2;
 const endScale=42/flight.size;
 const move=node.animate([{transform:'translate3d(0,0,0) scale(.96)',opacity:.95,offset:0},{transform:`translate3d(${dx*.22}px,${dy*.12-35}px,0) scale(.76)`,opacity:1,offset:.28},{transform:`translate3d(${dx*.76}px,${dy*.67-20}px,0) scale(.33)`,opacity:1,offset:.73},{transform:`translate3d(${dx}px,${dy}px,0) scale(${endScale})`,opacity:1,offset:.93},{transform:`translate3d(${dx}px,${dy}px,0) scale(${endScale})`,opacity:1,offset:1}],{duration:950,easing:'cubic-bezier(.35,0,.35,1)',fill:'forwards'});
 move.onfinish=()=>callback.current(flight);return()=>{move.onfinish=null;move.cancel()};},[flight]);
 return createPortal(<div ref={element} className="flying-dish" aria-hidden="true" style={{left:flight.x,top:flight.y,width:flight.size,height:flight.size,backgroundPosition:`${flight.cat*100/3}% ${flight.variant*50}%`}}/>,document.body);
}
