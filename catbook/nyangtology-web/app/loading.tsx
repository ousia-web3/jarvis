import { ObservationLoading } from '@/components/observation-loading';

export default function Loading() {
  return (
    <div className="narrowShell">
      <div className="pageLoadingWrap">
        <ObservationLoading mode="page" />
      </div>
    </div>
  );
}
