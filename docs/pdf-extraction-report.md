# PDF 추출 보고서

## 추출 대상

- 원본: 별도 보관된 `AI_에이전트_팀_아키텍처.pdf`
- 프로젝트 내 원본 PDF 상태: 2026-05-22에 사용자 승인으로 삭제
- 페이지 수: 21
- 추출 도구: `opendataloader-pdf`
- 실행 방식: 기본 Java 파이프라인, `markdown,json,text` 출력, 이미지 외부 추출

## 추출 산출물

- Markdown: `docs/opendataloader-extract/AI_에이전트_팀_아키텍처.md`
- JSON: `docs/opendataloader-extract/AI_에이전트_팀_아키텍처.json`
- Text: `docs/opendataloader-extract/AI_에이전트_팀_아키텍처.txt`
- Page images: `docs/opendataloader-extract/images/imageFile1.png` - `docs/opendataloader-extract/images/imageFile21.png`

## 품질 판단

PDF는 텍스트 레이어가 없는 이미지 기반 문서로 확인되었습니다. 기본 추출 결과는 텍스트가 거의 없고, Markdown은 각 페이지 이미지를 참조하는 구조입니다. 따라서 PRD/TASK 작성에는 다음 자료를 함께 사용했습니다.

- 기존 정리 문서: `docs/ai-agent-team-guide.md`
- 추출된 페이지 이미지 21장
- 추출 JSON의 페이지/이미지 구조

## 반영된 핵심 내용

- 4단계 아키텍처:
  - SYS.01 The Dream Team
  - SYS.02 The Virtual Office
  - SYS.03 The Agent Brain
  - SYS.04 The Human Conductor
- 지휘부, 프로젝트 매니저, 기획 및 실무진, 분석 및 리스크관리 쉴드
- To/CC 기반 자율 통신망
- 에피소딕 메모리, 지혜 승격, 망각 및 소거
- 드리프트, 환각, 거짓 보고, 법무·보안 리스크 감시

## 제한 사항

`opendataloader-pdf[hybrid]` OCR 설치는 디스크 공간 부족으로 완료하지 못했습니다. 기본 추출은 성공했으며, 이미지 산출물을 기반으로 문서 내용을 반영했습니다.
