import { badgeClassName, classLabel } from '@/lib/badges';
import type { OntologyClass } from '@/lib/types';

export function Badge({ className }: { className: OntologyClass }) {
  return <span className={badgeClassName(className)}>{classLabel(className)}</span>;
}
