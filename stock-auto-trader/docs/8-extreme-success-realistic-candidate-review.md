# 8개 극단 성공 시나리오 기반 현실 접근 후보 검토

작성일: 2026-05-22 15:22:08

## 결론

- 8개 성공 시나리오의 종목을 그대로 실전 매수 후보로 쓰면 안 된다.
- 성공은 20~30% 거래대금 참여율을 허용한 극단 조건에서만 나왔고, 이는 실제 체결·시장충격 기준으로 매우 위험하다.
- 다만 같은 성공 경로 안에서도 일부 이벤트는 `1~3% 참여율`, `거래대금 100억~200억원 이상` 조건에 들어와서 감시 후보로 분리할 수 있다.
- 따라서 접근 방식은 `종목 고정`이 아니라 `당일 유동성 상태가 현실 구간에 들어온 이벤트만 거래 후보화`다.
- 아래 우선 후보는 한 번이라도 좋은 날이 있었던 종목이 아니라, 8개 성공 경로에 등장한 모든 이벤트의 최악 참여율까지 통과한 `안정 등급` 기준이다.

## 현실성 버킷

- A 현실 접근: 당일/20D 평균 거래량 참여율 1% 이하, 당일/20D 거래대금 200억원 이상, 가격 $2 이상.
- B 제한 접근: 참여율 3% 이하, 거래대금 100억원 이상, 가격 $1.5 이상.
- C 공격 감시: 참여율 5% 이하, 거래대금 50억원 이상, 가격 $1 이상.
- D 극단 전용: 위 조건 미달. 사후 라벨로만 보존.

## 티커별 섹터/산업

업데이트: 2026-05-22 16:36:19

- 기준 데이터: Nasdaq screener `sector`, `industry` 필드와 기존 Jarvis 테마.
- 섹터/산업은 상장사 분류 변경, 사명 변경, 티커 변경에 따라 달라질 수 있으므로 운영 전 재조회가 필요하다.
- Nasdaq 섹터 상위: Health Care 18개, Technology 16개, Consumer Discretionary 12개, Industrials 6개, Finance 3개, Energy 2개, Miscellaneous 2개, Real Estate 2개
- Jarvis 그룹 상위: 바이오/헬스케어 19개, AI/기술/소프트웨어 16개, 소비재 14개, 산업재/모빌리티/우주 7개, 에너지 3개, 금융 3개, 미분류 2개, 기초소재/광물 1개

| 티커 | 안정 등급 | Nasdaq Sector | Sector KR | Industry | Jarvis 그룹 | Jarvis 테마 |
| --- | --- | --- | --- | --- | --- | --- |
| NAMM | A 현실 접근 | Basic Materials | 기초소재 | Precious Metals | 기초소재/광물 | Nasdaq/Basic Materials |
| JTAI | A 현실 접근 | Consumer Discretionary | 경기소비재 | Transportation Services | 소비재 | Nasdaq/Consumer Discretionary |
| ROLR | A 현실 접근 | Consumer Discretionary | 경기소비재 | Services-Misc. Amusement & Recreation | 소비재 | Nasdaq/Consumer Discretionary |
| BATL | A 현실 접근 | Energy | 에너지 | Oil & Gas Production | 에너지 | Nasdaq/Energy |
| SOC | A 현실 접근 | Energy | 에너지 | Oil & Gas Production | 에너지 | Nasdaq/Energy |
| CATX | A 현실 접근 | Health Care | 헬스케어 | Medical/Dental Instruments | 바이오/헬스케어 | Nasdaq/Health Care |
| FEED | A 현실 접근 | Health Care | 헬스케어 | Industrial Specialties | 바이오/헬스케어 | Nasdaq/Health Care |
| IBRX | A 현실 접근 | Health Care | 헬스케어 | Biotechnology: Biological Products (No Diagnostic Substances) | 바이오/헬스케어 | 바이오 |
| OCUL | A 현실 접근 | Health Care | 헬스케어 | Biotechnology: Pharmaceutical Preparations | 바이오/헬스케어 | Nasdaq/Health Care |
| EYPT | A 현실 접근 | Industrials | 산업재 | Biotechnology: Laboratory Analytical Instruments | 바이오/헬스케어 | Nasdaq/Industrials |
| RR | A 현실 접근 | Industrials | 산업재 | Industrial Machinery/Components | 산업재/모빌리티/우주 | Nasdaq/Industrials |
| ELPW | A 현실 접근 | Miscellaneous | 기타 | Industrial Machinery/Components | 산업재/모빌리티/우주 | Nasdaq/Miscellaneous |
| ASTI | A 현실 접근 | Technology | 기술 | Semiconductors | AI/기술/소프트웨어 | Nasdaq/Technology |
| FSLY | A 현실 접근 | Technology | 기술 | Computer Software: Prepackaged Software | AI/기술/소프트웨어 | Nasdaq/Technology |
| MOBX | A 현실 접근 | Technology | 기술 | Semiconductors | AI/기술/소프트웨어 | Nasdaq/Technology |
| RCAT | A 현실 접근 | Technology | 기술 | Computer Software: Prepackaged Software | AI/기술/소프트웨어 | Nasdaq/Technology |
| SMX | A 현실 접근 | Technology | 기술 | Industrial Machinery/Components | AI/기술/소프트웨어 | Nasdaq/Technology |
| CJMB | B 제한 접근 | Consumer Discretionary | 경기소비재 | Business Services | 소비재 | Nasdaq/Consumer Discretionary |
| ACXP | B 제한 접근 | Health Care | 헬스케어 | Biotechnology: Pharmaceutical Preparations | 바이오/헬스케어 | Nasdaq/Health Care |
| BIAF | B 제한 접근 | Health Care | 헬스케어 | Biotechnology: Commercial Physical & Biological Resarch | 바이오/헬스케어 | Nasdaq/Health Care |
| OCGN | B 제한 접근 | Health Care | 헬스케어 | Biotechnology: Biological Products (No Diagnostic Substances) | 바이오/헬스케어 | Nasdaq/Health Care |
| OLMA | B 제한 접근 | Health Care | 헬스케어 | Biotechnology: Pharmaceutical Preparations | 바이오/헬스케어 | Nasdaq/Health Care |
| QNCX | B 제한 접근 | Health Care | 헬스케어 | Biotechnology: Biological Products (No Diagnostic Substances) | 바이오/헬스케어 | Nasdaq/Health Care |
| LUNR | B 제한 접근 | Industrials | 산업재 | Industrial Machinery/Components | 산업재/모빌리티/우주 | 우주 |
| LWLG | B 제한 접근 | Industrials | 산업재 | Containers/Packaging | 산업재/모빌리티/우주 | Nasdaq/Industrials |
| BOXL | B 제한 접근 | Real Estate | 부동산 | Other Consumer Services | 소비재 | Nasdaq/Real Estate |
| ATOM | B 제한 접근 | Technology | 기술 | Semiconductors | AI/기술/소프트웨어 | Nasdaq/Technology |
| GXAI | B 제한 접근 | Technology | 기술 | Computer Software: Prepackaged Software | AI/기술/소프트웨어 | Nasdaq/Technology |
| PRSO | B 제한 접근 | Technology | 기술 | Semiconductors | AI/기술/소프트웨어 | Nasdaq/Technology |
| AHMA | C 공격 감시 | Consumer Discretionary | 경기소비재 | Services-Misc. Amusement & Recreation | 소비재 | Nasdaq/Consumer Discretionary |
| HCHL | C 공격 감시 | Consumer Discretionary | 경기소비재 | Restaurants | 소비재 | Nasdaq/Consumer Discretionary |
| JZXN | C 공격 감시 | Consumer Discretionary | 경기소비재 | Retail-Auto Dealers and Gas Stations | 소비재 | Nasdaq/Consumer Discretionary |
| EZRA | C 공격 감시 | Finance | 금융 | Specialty Insurers | 금융 | Nasdaq/Finance |
| ASBP | C 공격 감시 | Health Care | 헬스케어 | Biotechnology: Pharmaceutical Preparations | 바이오/헬스케어 | Nasdaq/Health Care |
| HUMA | C 공격 감시 | Health Care | 헬스케어 | Biotechnology: Biological Products (No Diagnostic Substances) | 바이오/헬스케어 | Nasdaq/Health Care |
| MTEN | C 공격 감시 | Industrials | 산업재 | Building Products | 산업재/모빌리티/우주 | Nasdaq/Industrials |
| RXT | C 공격 감시 | Technology | 기술 | Computer Software: Programming Data Processing | AI/기술/소프트웨어 | Nasdaq/Technology |
| SEGG | C 공격 감시 | Technology | 기술 | Computer Software: Prepackaged Software | AI/기술/소프트웨어 | Nasdaq/Technology |
| SUPX | C 공격 감시 | Unknown | 미분류 | Unknown | 미분류 | Nasdaq/Nasdaq screener |
| NCI | D 극단 전용 | Consumer Discretionary | 경기소비재 | Apparel | 소비재 | Nasdaq/Consumer Discretionary |
| RBNE | D 극단 전용 | Consumer Discretionary | 경기소비재 | Marine Transportation | 소비재 | Nasdaq/Consumer Discretionary |
| STAK | D 극단 전용 | Consumer Discretionary | 경기소비재 | Oil and Gas Field Machinery | 에너지 | Nasdaq/Consumer Discretionary |
| TLYS | D 극단 전용 | Consumer Discretionary | 경기소비재 | Clothing/Shoe/Accessory Stores | 소비재 | Nasdaq/Consumer Discretionary |
| UGRO | D 극단 전용 | Consumer Discretionary | 경기소비재 | Industrial Specialties | 소비재 | Nasdaq/Consumer Discretionary |
| WNW | D 극단 전용 | Consumer Discretionary | 경기소비재 | Catalog/Specialty Distribution | 소비재 | Nasdaq/Consumer Discretionary |
| BYND | D 극단 전용 | Consumer Staples | 필수소비재 | Packaged Foods | 소비재 | Nasdaq/Consumer Staples |
| LHAI | D 극단 전용 | Finance | 금융 | Real Estate | 금융 | Nasdaq/Finance |
| RENX | D 극단 전용 | Finance | 금융 | Real Estate | 금융 | Nasdaq/Finance |
| ALDX | D 극단 전용 | Health Care | 헬스케어 | Biotechnology: Pharmaceutical Preparations | 바이오/헬스케어 | Nasdaq/Health Care |
| ARTL | D 극단 전용 | Health Care | 헬스케어 | Biotechnology: Pharmaceutical Preparations | 바이오/헬스케어 | Nasdaq/Health Care |
| ATPC | D 극단 전용 | Health Care | 헬스케어 | Medical/Nursing Services | 바이오/헬스케어 | Nasdaq/Health Care |
| EDSA | D 극단 전용 | Health Care | 헬스케어 | Biotechnology: Pharmaceutical Preparations | 바이오/헬스케어 | Nasdaq/Health Care |
| ELAB | D 극단 전용 | Health Care | 헬스케어 | Biotechnology: Pharmaceutical Preparations | 바이오/헬스케어 | Nasdaq/Health Care |
| QNTM | D 극단 전용 | Health Care | 헬스케어 | Biotechnology: Pharmaceutical Preparations | 바이오/헬스케어 | Nasdaq/Health Care |
| SER | D 극단 전용 | Health Care | 헬스케어 | Biotechnology: Pharmaceutical Preparations | 바이오/헬스케어 | Nasdaq/Health Care |
| POAS | D 극단 전용 | Industrials | 산업재 | Industrial Machinery/Components | 산업재/모빌리티/우주 | Nasdaq/Industrials |
| LASE | D 극단 전용 | Miscellaneous | 기타 | Industrial Machinery/Components | 산업재/모빌리티/우주 | Nasdaq/Miscellaneous |
| JDZG | D 극단 전용 | Real Estate | 부동산 | Other Consumer Services | 소비재 | Nasdaq/Real Estate |
| AIFF | D 극단 전용 | Technology | 기술 | Computer Software: Prepackaged Software | AI/기술/소프트웨어 | Nasdaq/Technology |
| GITS | D 극단 전용 | Technology | 기술 | Computer Software: Programming Data Processing | AI/기술/소프트웨어 | Nasdaq/Technology |
| NXTT | D 극단 전용 | Technology | 기술 | EDP Services | AI/기술/소프트웨어 | Nasdaq/Technology |
| SATL | D 극단 전용 | Technology | 기술 | Radio And Television Broadcasting And Communications Equipment | AI/기술/소프트웨어 | Nasdaq/Technology |
| SLNH | D 극단 전용 | Technology | 기술 | EDP Services | AI/기술/소프트웨어 | Nasdaq/Technology |
| SST | D 극단 전용 | Technology | 기술 | Computer Software: Programming Data Processing | AI/기술/소프트웨어 | Nasdaq/Technology |
| SIDU | D 극단 전용 | Telecommunications | 통신 | Telecommunications Equipment | 통신 | Nasdaq/Telecommunications |
| ORBS | D 극단 전용 | Unknown | 미분류 | Unknown | 미분류 | Nasdaq/Nasdaq screener |

## 집계

- 성공 시나리오 수: 8개
- 총 포지션 이벤트: 794개
- 고유 종목 수: 66개
- 이벤트 기준 A/B/C/D: A 279개, B 213개, C 103개, D 199개
- 종목 안정 등급 기준 A/B/C/D: A 17개, B 12개, C 10개, D 27개
- 한 번이라도 A/B/C 이벤트가 있었던 종목 수: 47개
- 2개 이상 성공 시나리오에 등장한 안정 A/B/C 후보: 38개

## 우선 감시 후보

| 티커 | 안정 등급 | 출현 | 시나리오 | 종목명 | 테마 | 최악 20D ADV | 최대 20D 참여율 | 최대 당일 참여율 |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: | ---: |
| BATL | A 현실 접근 | 44 | 8 | Battalion Oil Corporation Common Stock | Nasdaq/Energy | 52,064,465,162원 | +0.06% | +0.02% |
| SMX | A 현실 접근 | 32 | 8 | SMX (Security Matters) Public Limited Company Ordinary Shares | Nasdaq/Technology | 37,380,596,773원 | +0.13% | +0.15% |
| ASTI | A 현실 접근 | 20 | 8 | Ascent Solar Technologies Inc. Common Stock | Nasdaq/Technology | 34,011,562,246원 | +0.01% | +0.01% |
| SOC | A 현실 접근 | 16 | 8 | Sable Offshore Corp. Common Stock | Nasdaq/Energy | 61,348,745,862원 | +0.30% | +0.10% |
| NAMM | A 현실 접근 | 12 | 8 | Namib Minerals Ordinary Shares | Nasdaq/Basic Materials | 108,544,259,105원 | +0.02% | +0.04% |
| FEED | A 현실 접근 | 8 | 8 | ENvue Medical Inc. Common Stock | Nasdaq/Health Care | 92,239,720,974원 | +0.00% | +0.00% |
| ELPW | A 현실 접근 | 8 | 8 | Elong Power Holding Limited Class A Ordinary Shares | Nasdaq/Miscellaneous | 30,709,997,163원 | +0.02% | +0.00% |
| JTAI | A 현실 접근 | 8 | 8 | Jet.AI Inc. Common Stock | Nasdaq/Consumer Discretionary | 30,245,279,698원 | +0.02% | +0.00% |
| FSLY | A 현실 접근 | 8 | 8 | Fastly Inc. Class A Common Stock | Nasdaq/Technology | 55,964,695,992원 | +0.01% | +0.00% |
| EYPT | A 현실 접근 | 8 | 8 | EyePoint Inc. Common Stock | Nasdaq/Industrials | 21,577,890,851원 | +0.06% | +0.01% |
| IBRX | A 현실 접근 | 8 | 8 | ImmunityBio | 바이오 | 402,830,509,715원 | +0.00% | +0.00% |
| OCUL | A 현실 접근 | 8 | 8 | Ocular Therapeutix Inc. Common Stock | Nasdaq/Health Care | 103,198,217,546원 | +0.08% | +0.04% |
| RCAT | A 현실 접근 | 8 | 8 | Red Cat Holdings Inc. Common Stock | Nasdaq/Technology | 256,219,136,267원 | +0.07% | +0.02% |
| MOBX | A 현실 접근 | 8 | 8 | Mobix Labs Inc. Class A Common Stock | Nasdaq/Technology | 165,906,873,161원 | +0.12% | +0.05% |
| CATX | A 현실 접근 | 4 | 4 | Perspective Therapeutics Inc. Common Stock | Nasdaq/Health Care | 31,111,899,719원 | +0.00% | +0.00% |
| ROLR | A 현실 접근 | 4 | 4 | High Roller Technologies Inc. Common Stock | Nasdaq/Consumer Discretionary | 173,741,615,244원 | +0.00% | +0.00% |
| BOXL | B 제한 접근 | 16 | 8 | Boxlight Corporation Class A Common Stock | Nasdaq/Real Estate | 17,380,922,487원 | +0.01% | +0.00% |
| QNCX | B 제한 접근 | 16 | 8 | Quince Therapeutics Inc. Common Stock | Nasdaq/Health Care | 66,439,191,211원 | +0.04% | +0.05% |
| OLMA | B 제한 접근 | 8 | 8 | Olema Pharmaceuticals Inc. Common Stock | Nasdaq/Health Care | 43,766,149,086원 | +1.03% | +0.09% |
| ACXP | B 제한 접근 | 16 | 8 | Acurx Pharmaceuticals Inc. Common Stock | Nasdaq/Health Care | 61,390,932,260원 | +2.28% | +2.60% |
| BIAF | B 제한 접근 | 16 | 8 | bioAffinity Technologies Inc. Common Stock | Nasdaq/Health Care | 41,376,341,675원 | +2.70% | +0.88% |
| CJMB | B 제한 접근 | 8 | 8 | Callan JMB Inc. Common Stock | Nasdaq/Consumer Discretionary | 61,888,497,021원 | +0.00% | +0.01% |
| GXAI | B 제한 접근 | 8 | 8 | Gaxos.ai Inc. Common Stock | Nasdaq/Technology | 13,606,320,501원 | +0.01% | +0.00% |
| ATOM | B 제한 접근 | 8 | 8 | Atomera Incorporated Common Stock | Nasdaq/Technology | 10,354,631,956원 | +0.10% | +0.01% |
| OCGN | B 제한 접근 | 8 | 8 | Ocugen Inc. Common Stock | Nasdaq/Health Care | 15,153,305,988원 | +2.51% | +0.36% |

## 반복 출현 상위 종목

| 티커 | 안정 등급 | 최선 이벤트 | 출현 | 시나리오 | 종목명 | 최악 20D ADV | 최대 20D 참여율 | 해석 |
| --- | --- | --- | ---: | ---: | --- | ---: | ---: | --- |
| NCI | D 극단 전용 | A 현실 접근 | 63 | 8 | Neo-Concept International Group Holdings Limited Class A Ordinary Shares | 15,541,370,366원 | +113.09% | 극단 라벨 |
| BATL | A 현실 접근 | A 현실 접근 | 44 | 8 | Battalion Oil Corporation Common Stock | 52,064,465,162원 | +0.06% | 감시 후보 |
| SMX | A 현실 접근 | A 현실 접근 | 32 | 8 | SMX (Security Matters) Public Limited Company Ordinary Shares | 37,380,596,773원 | +0.13% | 감시 후보 |
| EDSA | D 극단 전용 | A 현실 접근 | 32 | 8 | Edesa Biotech Inc. Common Shares | 12,447,405,816원 | +1.41% | 극단 라벨 |
| UGRO | D 극단 전용 | A 현실 접근 | 32 | 8 | urban-gro Inc. Common Stock | 89,742,507,506원 | +3.22% | 극단 라벨 |
| RXT | C 공격 감시 | A 현실 접근 | 24 | 8 | Rackspace Technology Inc. Common Stock | 61,529,432,633원 | +0.06% | 감시 후보 |
| AIFF | D 극단 전용 | B 제한 접근 | 24 | 8 | Firefly Neuroscience Inc. Common Stock | 44,818,154,889원 | +6.02% | 극단 라벨 |
| ASTI | A 현실 접근 | A 현실 접근 | 20 | 8 | Ascent Solar Technologies Inc. Common Stock | 34,011,562,246원 | +0.01% | 감시 후보 |
| ELAB | D 극단 전용 | D 극단 전용 | 19 | 8 | PMGC Holdings Inc. Common Stock | 39,739,749,551원 | +19.02% | 극단 라벨 |
| SEGG | C 공격 감시 | B 제한 접근 | 18 | 8 | Sports Entertainment Gaming Global Corporation Common Stock | 57,417,762,529원 | +0.01% | 감시 후보 |
| GITS | D 극단 전용 | A 현실 접근 | 17 | 8 | Global Interactive Technologies Inc. Common Stock | 10,179,971,696원 | +0.27% | 극단 라벨 |
| SOC | A 현실 접근 | A 현실 접근 | 16 | 8 | Sable Offshore Corp. Common Stock | 61,348,745,862원 | +0.30% | 감시 후보 |
| BOXL | B 제한 접근 | A 현실 접근 | 16 | 8 | Boxlight Corporation Class A Common Stock | 17,380,922,487원 | +0.01% | 감시 후보 |
| QNCX | B 제한 접근 | A 현실 접근 | 16 | 8 | Quince Therapeutics Inc. Common Stock | 66,439,191,211원 | +0.04% | 감시 후보 |
| ACXP | B 제한 접근 | B 제한 접근 | 16 | 8 | Acurx Pharmaceuticals Inc. Common Stock | 61,390,932,260원 | +2.28% | 감시 후보 |
| BIAF | B 제한 접근 | B 제한 접근 | 16 | 8 | bioAffinity Technologies Inc. Common Stock | 41,376,341,675원 | +2.70% | 감시 후보 |
| JZXN | C 공격 감시 | B 제한 접근 | 16 | 8 | Jiuzi Holdings Inc. Ordinary Shares | 18,128,812,756원 | +1.26% | 감시 후보 |
| RENX | D 극단 전용 | B 제한 접근 | 16 | 8 | RenX Enterprises Corp. Common Stock | 14,610,406,369원 | +3.40% | 극단 라벨 |
| ALDX | D 극단 전용 | D 극단 전용 | 16 | 8 | Aldeyra Therapeutics Inc. Common Stock | 14,399,958,701원 | +17.34% | 극단 라벨 |
| SST | D 극단 전용 | D 극단 전용 | 15 | 8 | System1 Inc. Class A Common Stock | 22,509,730,435원 | +31.11% | 극단 라벨 |

## 현실 접근 로직

1. 전일 기준으로 A/B/C 버킷에 들어오는 종목만 후보화한다.
2. 장중에는 목표가 터치가 아니라 목표가 이상 구간의 누적 체결량으로 매도 가능 금액을 계산한다.
3. 계좌가 커지면 같은 종목 반복 진입을 중단하고, 초과 자본은 현금 처리하거나 더 많은 고유 종목으로 분산한다.
4. D 등급 종목은 성공 라벨 학습용으로만 쓰고 실거래 후보에서 제외한다.

## 다음 검증

- 1분봉 또는 틱 데이터로 목표가 위 체결량을 재검산한다.
- 국내 브로커 실제 취급 가능 여부, 주문 제한, 매매 정지, 상장폐지/액면병합 이력을 확인한다.
- 장전 뉴스/공시/거래량 급증 조건이 전일 또는 장초반에 관측 가능한지 분리한다.
