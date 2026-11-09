'use client';

import type {ComponentPropsWithoutRef} from 'react';

type PhotoProps = Omit<ComponentPropsWithoutRef<'img'>, 'draggable' | 'onContextMenu' | 'onDragStart'>;

export default function SitePhoto(props: PhotoProps) {
  // The static site serves its own responsive WebP files.
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} data-site-photo draggable={false}
    onContextMenu={event => event.preventDefault()}
    onDragStart={event => event.preventDefault()}/>;
}
