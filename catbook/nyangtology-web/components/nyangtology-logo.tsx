import Image from 'next/image';

export function NyangtologyLogo() {
  return (
    <span className="brandLogo" aria-hidden="true">
      <span className="brandSymbolFrame">
        <Image
          className="brandSymbolImage"
          src="/images/brand/nyangtology-grid-logo-128.webp"
          width={48}
          height={48}
          alt=""
          priority
        />
      </span>
      <span className="brandWordmark">냥톨로지</span>
    </span>
  );
}
