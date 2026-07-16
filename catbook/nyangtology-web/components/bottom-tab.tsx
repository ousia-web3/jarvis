import { InstantTransitionLink } from './instant-transition-link';

export function BottomTab() {
  return (
    <nav className="bottomTab" aria-label="모바일 하단 메뉴">
      <div className="bottomTabInner">
        <InstantTransitionLink href="/">홈</InstantTransitionLink>
        <InstantTransitionLink href="/ask">질문</InstantTransitionLink>
        <InstantTransitionLink href="/explore">궁금증</InstantTransitionLink>
        <InstantTransitionLink href="/safety">안전</InstantTransitionLink>
      </div>
    </nav>
  );
}
