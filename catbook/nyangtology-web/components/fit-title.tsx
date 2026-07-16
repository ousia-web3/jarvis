type FitTitleProps = {
  children: string;
  className?: string;
};

function getMobileTitleFitClass(title: string) {
  const length = Array.from(title.replace(/\s/g, '')).length;

  if (length >= 19) {
    return 'isMoUltraDense';
  }

  if (length >= 18) {
    return 'isMoDense';
  }

  if (length >= 15) {
    return 'isMoCompact';
  }

  if (length >= 11) {
    return 'isMoBalanced';
  }

  return '';
}

function buildTitleClassName(baseClassName: string, title: string, className = '') {
  return [baseClassName, className, getMobileTitleFitClass(title)]
    .filter(Boolean)
    .join(' ');
}

export function FitTitle({ children, className }: FitTitleProps) {
  return (
    <h1 className={buildTitleClassName('pageTitle', children, className)}>
      {children}
    </h1>
  );
}

export function HeroFitTitle({ children, className }: FitTitleProps) {
  return (
    <h1 className={buildTitleClassName('mobileFitTitle', children, className)}>
      {children}
    </h1>
  );
}
