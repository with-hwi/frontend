# 여행 일정 관리 시퀀스 다이어그램

## 1. 플랜에 여행지 추가 시퀀스

```mermaid
sequenceDiagram
    participant U as 👤 사용자
    participant C as 🖥️ 클라이언트
    participant Auth as 🔑 Auth Store
    participant API as 🌐 Plan Service
    participant TourAPI as 🗺️ Tour Service

    U->>C: 플랜 페이지에서 "여행지 추가" 버튼 클릭
    C->>Auth: 사용자 권한 확인

    alt 권한 없음 (비회원 또는 플랜 참여자 아님)
        C->>U: 권한 없음 메시지 표시
    else 권한 있음 (플랜 참여자)
        C->>C: 여행지 선택 모달 표시

        alt 여행지 검색으로 추가
            U->>C: 여행지 검색 탭 선택
            U->>C: 검색어 입력
            C->>TourAPI: 여행지 검색 요청
            TourAPI->>C: 검색 결과 반환
            C->>U: 검색 결과 목록 표시

            U->>C: 원하는 여행지 선택
        else 즐겨찾기에서 추가
            U->>C: 즐겨찾기 탭 선택
            C->>API: 사용자 즐겨찾기 목록 조회
            API->>C: 즐겨찾기 목록 반환
            C->>U: 즐겨찾기 목록 표시

            U->>C: 즐겨찾기에서 여행지 선택
        end

        U->>C: "플랜에 추가" 버튼 클릭
        C->>API: 플랜에 여행지 추가 요청

        alt 추가 실패
            API->>C: 추가 실패 응답 (중복/권한 없음)
            C->>U: 추가 실패 메시지 표시
        else 추가 성공
            API->>C: 추가 성공 응답
            C->>C: 플랜 여행지 목록 업데이트
            C->>U: 추가 완료 메시지 및 업데이트된 목록 표시
        end
    end
```

## 2. 여행지 방문 일정 설정 시퀀스

```mermaid
sequenceDiagram
    participant Owner as 👤 플랜 관리자
    participant C as 🖥️ 클라이언트
    participant Calendar as 📅 달력 컴포넌트
    participant API as 🌐 Plan Service

    Owner->>C: 여행지 목록에서 일정 설정 버튼 클릭
    C->>Auth: 관리자 권한 확인

    alt 관리자 권한 없음
        C->>Owner: 권한 없음 메시지 표시
    else 관리자 권한 있음
        C->>API: 플랜 기간 정보 조회
        API->>C: 플랜 시작일/종료일 반환
        C->>Calendar: 일정 설정 모달 표시
        Calendar->>Owner: 달력 UI 표시 (플랜 기간 내 날짜만 활성화)

        Owner->>Calendar: 방문 날짜 선택
        Calendar->>C: 선택된 날짜 전달

        alt 선택한 날짜가 플랜 기간 밖
            C->>Owner: "플랜 기간 내 날짜를 선택해주세요" 메시지
        else 유효한 날짜 선택
            Owner->>C: 저장 버튼 클릭
            C->>API: 여행지 방문 일정 업데이트 요청

            alt 일정 설정 실패
                API->>C: 업데이트 실패 응답
                C->>Owner: 일정 설정 실패 메시지
            else 일정 설정 성공
                API->>C: 업데이트 성공 응답
                C->>C: 여행지 목록 UI 업데이트
                C->>Calendar: 모달 닫기
                C->>Owner: 일정 설정 완료 메시지
            end
        end
    end
```

## 3. 여행지 방문 시간 설정 시퀀스

```mermaid
sequenceDiagram
    participant Owner as 👤 플랜 관리자
    participant C as 🖥️ 클라이언트
    participant TimePicker as ⏰ 시간 선택 컴포넌트
    participant API as 🌐 Plan Service

    Owner->>C: 여행지의 시간 설정 버튼 클릭
    C->>Auth: 관리자 권한 확인

    alt 관리자 권한 없음
        C->>Owner: 권한 없음 메시지 표시
    else 관리자 권한 있음
        C->>TimePicker: 시간 설정 모달 표시
        TimePicker->>Owner: 도착/출발 시간 입력 UI 표시

        Owner->>TimePicker: 도착 시간 입력
        Owner->>TimePicker: 출발 시간 입력
        TimePicker->>TimePicker: 시간 유효성 검증

        alt 출발 시간이 도착 시간보다 빠름
            TimePicker->>Owner: "출발 시간은 도착 시간 이후여야 합니다" 메시지
        else 유효한 시간 설정
            Owner->>TimePicker: 저장 버튼 클릭
            TimePicker->>C: 설정된 시간 정보 전달
            C->>API: 여행지 방문 시간 업데이트 요청

            alt 시간 설정 실패
                API->>C: 업데이트 실패 응답
                C->>Owner: 시간 설정 실패 메시지
            else 시간 설정 성공
                API->>C: 업데이트 성공 응답
                C->>C: 여행지 목록 UI 업데이트
                C->>TimePicker: 모달 닫기
                C->>Owner: 시간 설정 완료 메시지
            end
        end
    end
```

## 4. 여행지 순서 변경 시퀀스

```mermaid
sequenceDiagram
    participant Owner as 👤 플랜 관리자
    participant C as 🖥️ 클라이언트
    participant DragDrop as 🖱️ 드래그&드롭 컴포넌트
    participant API as 🌐 Plan Service

    Owner->>C: "순서 편집" 모드 활성화
    C->>Auth: 관리자 권한 확인

    alt 관리자 권한 없음
        C->>Owner: 권한 없음 메시지 표시
    else 관리자 권한 있음
        C->>DragDrop: 드래그&드롭 활성화
        DragDrop->>Owner: 드래그 가능한 여행지 목록 표시

        Owner->>DragDrop: 여행지 드래그 시작
        DragDrop->>DragDrop: 드래그 중 시각적 피드백 표시
        Owner->>DragDrop: 새 위치에 드롭
        DragDrop->>C: 새로운 순서 정보 전달

        C->>C: 임시로 UI 순서 변경
        C->>API: 여행지 순서 업데이트 요청

        alt 순서 변경 실패
            API->>C: 업데이트 실패 응답
            C->>C: 원래 순서로 되돌리기
            C->>Owner: 순서 변경 실패 메시지
        else 순서 변경 성공
            API->>C: 업데이트 성공 응답
            C->>Owner: 순서 변경 완료 메시지
        end

        Owner->>C: "순서 편집 완료" 버튼 클릭
        C->>DragDrop: 드래그&드롭 비활성화
        DragDrop->>Owner: 일반 여행지 목록 표시
    end
```

## 5. 여행지 제거 시퀀스

```mermaid
sequenceDiagram
    participant Owner as 👤 플랜 관리자
    participant C as 🖥️ 클라이언트
    participant API as 🌐 Plan Service

    Owner->>C: 여행지 제거 버튼 클릭
    C->>Auth: 관리자 권한 확인

    alt 관리자 권한 없음
        C->>Owner: 권한 없음 메시지 표시
    else 관리자 권한 있음
        C->>C: 제거 확인 다이얼로그 표시

        alt 사용자가 제거 취소
            Owner->>C: "취소" 버튼 클릭
            C->>Owner: 다이얼로그 닫기
        else 사용자가 제거 확인
            Owner->>C: "제거" 버튼 클릭
            C->>API: 여행지 제거 요청

            alt 제거 실패
                API->>C: 제거 실패 응답
                C->>Owner: 제거 실패 메시지
            else 제거 성공
                API->>C: 제거 성공 응답
                C->>C: 여행지 목록에서 제거
                C->>Owner: 제거 완료 메시지
            end
        end
    end
```

## 6. 일정 자동 최적화 시퀀스

```mermaid
sequenceDiagram
    participant Owner as 👤 플랜 관리자
    participant C as 🖥️ 클라이언트
    participant OptimizeAPI as 🤖 최적화 API
    participant API as 🌐 Plan Service

    Owner->>C: "일정 최적화" 버튼 클릭
    C->>Auth: 관리자 권한 확인

    alt 관리자 권한 없음
        C->>Owner: 권한 없음 메시지 표시
    else 관리자 권한 있음
        C->>C: 최적화 확인 다이얼로그 표시
        Owner->>C: 최적화 확인

        C->>Owner: 최적화 진행 로딩 표시
        C->>OptimizeAPI: 여행지 목록과 제약조건 전달
        OptimizeAPI->>OptimizeAPI: AI 기반 최적화 계산

        alt 최적화 실패
            OptimizeAPI->>C: 최적화 실패 응답
            C->>Owner: "최적화에 실패했습니다" 메시지
        else 최적화 성공
            OptimizeAPI->>C: 최적화된 일정 반환
            C->>Owner: 최적화 결과 미리보기 표시

            alt 사용자가 최적화 결과 거부
                Owner->>C: "원래대로" 버튼 클릭
                C->>Owner: 기존 일정 유지
            else 사용자가 최적화 결과 승인
                Owner->>C: "적용하기" 버튼 클릭
                C->>API: 최적화된 일정 저장 요청

                alt 저장 실패
                    API->>C: 저장 실패 응답
                    C->>Owner: 저장 실패 메시지
                else 저장 성공
                    API->>C: 저장 성공 응답
                    C->>C: 여행지 목록 업데이트
                    C->>Owner: 최적화 완료 메시지
                end
            end
        end
    end
```

## 주요 특징

### 🎯 직관적인 일정 관리

- **드래그&드롭**: 시각적인 순서 변경으로 직관적인 조작
- **달력 연동**: 플랜 기간 내에서만 날짜 선택 가능
- **시간 검증**: 도착/출발 시간의 논리적 순서 검증

### 🤖 AI 기반 최적화

- **경로 최적화**: 여행지 간 거리와 이동시간을 고려한 순서 제안
- **시간 효율성**: 각 여행지의 운영시간과 혼잡도 고려
- **사용자 선택권**: 최적화 결과를 선택적으로 적용 가능

### 🔐 권한 기반 제어

- **관리자 전용**: 일정 수정은 플랜 관리자만 가능
- **참여자 제안**: 일반 참여자는 여행지 추가 제안만 가능
- **실시간 권한 검증**: 모든 액션 전 권한 확인

### 📱 반응형 UI

- **실시간 업데이트**: 일정 변경 시 즉시 UI 반영
- **시각적 피드백**: 드래그&드롭, 로딩 상태 등 명확한 피드백
- **모바일 최적화**: 터치 친화적인 일정 조작 인터페이스

### 🔄 데이터 동기화

- **실시간 동기화**: 여러 참여자 간 일정 변경사항 실시간 공유
- **충돌 방지**: 동시 편집 시 데이터 충돌 방지 메커니즘
- **백업 및 복구**: 일정 변경 실패 시 이전 상태로 롤백

### 🎨 사용자 경험

- **단계별 가이드**: 복잡한 일정 설정을 단계별로 안내
- **미리보기**: 변경사항 적용 전 미리보기 제공
- **실행 취소**: 중요한 변경사항에 대한 확인 절차
