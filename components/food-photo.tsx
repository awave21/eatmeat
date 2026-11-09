import {dishes} from '../lib/menu';
import SitePhoto from './site-photo';

export default function FoodPhoto({cat, variant, lazy = false}: {
  cat: number;
  variant: number;
  lazy?: boolean;
}) {
  const dish = dishes[cat][variant];
  return (
    <SitePhoto
      className="food-photo"
      src={'/food/' + dish.id + '.webp'}
      alt={dish.name + ' в чёрном контейнере'}
      width={362}
      height={362}
      loading={lazy ? 'lazy' : undefined}
      decoding="async"
    />
  );
}
