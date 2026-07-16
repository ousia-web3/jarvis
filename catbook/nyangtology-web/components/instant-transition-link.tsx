'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { ComponentProps, MouseEvent } from 'react';
import { ObservationLoading } from './observation-loading';

type InstantTransitionLinkProps = Omit<
  ComponentProps<typeof Link>,
  'href' | 'onClick' | 'onMouseEnter' | 'onFocus'
> & {
  href: string;
};

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.button !== 0 ||
    event.currentTarget.target === '_blank'
  );
}

function isLocalNavigableHref(href: string) {
  return href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/#');
}

export function InstantTransitionLink({
  children,
  href,
  prefetch = true,
  ...props
}: InstantTransitionLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const shouldShowTransition = useMemo(() => {
    if (!isLocalNavigableHref(href)) {
      return false;
    }

    const [targetPath] = href.split('?');
    return targetPath !== pathname;
  }, [href, pathname]);

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  useEffect(() => {
    if (!pending) {
      return;
    }

    const timer = window.setTimeout(() => setPending(false), 9000);
    return () => window.clearTimeout(timer);
  }, [pending]);

  const warmRoute = () => {
    if (shouldShowTransition) {
      router.prefetch(href);
    }
  };

  return (
    <>
      <Link
        {...props}
        href={href}
        onClick={(event) => {
          if (shouldShowTransition && !isModifiedClick(event)) {
            setPending(true);
          }
        }}
        onFocus={warmRoute}
        onMouseEnter={warmRoute}
        prefetch={prefetch}
      >
        {children}
      </Link>

      {pending ? (
        <div
          aria-live="polite"
          className="instantTransitionOverlay"
          data-testid="instant-transition-overlay"
          role="status"
        >
          <ObservationLoading mode="page" />
        </div>
      ) : null}
    </>
  );
}
