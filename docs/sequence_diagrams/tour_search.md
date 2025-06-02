# 여행지 검색 시퀀스 다이어그램

## 1. 지역별 여행지 검색 시퀀스

```mermaid
sequenceDiagram
    participant U as 👤 사용자
    participant C as 🖥️ 클라이언트
    participant Store as 📦 Tour Store
    participant API as 🌐 Tour Service
    participant ExtAPI as 🗺️ 외부 여행지 API

    U->>C: 여행지 검색 페이지 접속
    C->>U: 지역 선택 UI 표시

    U->>C: 시/도 선택
    C->>API: 시/구/군 목록 요청
    API->>ExtAPI: 하위 지역 조회 API 호출
    ExtAPI->>API: 시/구/군 목록 반환
    API->>C: 시/구/군 목록 응답
    C->>U: 시/구/군 선택 옵션 표시

    U->>C: 시/구/군 선택 후 검색
    C->>Store: 로딩 상태 설정
    C->>U: 로딩 스피너 표시

    C->>API: 지역별 여행지 검색 요청
    API->>ExtAPI: 여행지 목록 조회 API 호출

    alt API 호출 실패
        ExtAPI->>API: 오류 응답
        API->>C: 검색 실패 응답
        C->>Store: 오류 상태 설정
        C->>U: 오류 메시지 표시
    else API 호출 성공
        ExtAPI->>API: 여행지 목록 반환
        API->>C: 검색 결과 응답
        C->>Store: 검색 결과 저장
        C->>C: 지도에 마커 표시
        C->>U: 여행지 목록 및 지도 표시
    end
```

## 2. 키워드 여행지 검색 시퀀스

```mermaid
sequenceDiagram
    participant U as 👤 사용자
    participant C as 🖥️ 클라이언트
    participant Store as 📦 Tour Store
    participant API as 🌐 Tour Service
    participant ExtAPI as 🗺️ 외부 여행지 API

    U->>C: 검색어 입력
    C->>C: 입력 디바운싱 (300ms)

    alt 검색어 길이 부족 (< 2자)
        C->>U: 검색어 입력 안내 표시
    else 검색어 유효
        C->>Store: 로딩 상태 설정
        C->>U: 로딩 스피너 표시

        C->>API: 키워드 검색 요청
        API->>ExtAPI: 키워드 검색 API 호출

        alt API 호출 실패
            ExtAPI->>API: 오류 응답
            API->>C: 검색 실패 응답
            C->>Store: 오류 상태 설정
            C->>U: 오류 메시지 표시
        else API 호출 성공
            ExtAPI->>API: 검색 결과 반환
            API->>C: 검색 결과 응답
            C->>Store: 검색 결과 저장
            C->>Store: 검색 기록 저장 (로그인 사용자만)
            C->>C: 지도에 마커 표시
            C->>U: 검색 결과 목록 및 지도 표시
        end
    end
```

## 3. 여행지 상세 정보 조회 시퀀스

```mermaid
sequenceDiagram
    participant U as 👤 사용자
    participant C as 🖥️ 클라이언트
    participant Store as 📦 Tour Store
    participant API as 🌐 Tour Service
    participant ExtAPI as 🗺️ 외부 여행지 API

    U->>C: 여행지 항목 클릭
    C->>Store: 선택된 여행지 확인

    alt 상세 정보 캐시됨
        Store->>C: 캐시된 상세 정보 반환
        C->>U: 상세 정보 모달 표시
    else 상세 정보 없음
        C->>U: 로딩 스피너 표시
        C->>API: 여행지 상세 정보 요청
        API->>ExtAPI: 상세 정보 조회 API 호출

        alt API 호출 실패
            ExtAPI->>API: 오류 응답
            API->>C: 조회 실패 응답
            C->>U: 오류 메시지 표시
        else API 호출 성공
            ExtAPI->>API: 상세 정보 반환
            API->>C: 상세 정보 응답
            C->>Store: 상세 정보 캐싱
            C->>U: 상세 정보 모달 표시
        end
    end
```

## 4. 지도 마커 클릭 시퀀스

```mermaid
sequenceDiagram
    participant U as 👤 사용자
    participant C as 🖥️ 클라이언트
    participant Map as 🗺️ 지도 컴포넌트
    participant Store as 📦 Tour Store
    participant API as 🌐 Tour Service

    U->>Map: 지도 마커 클릭
    Map->>C: 마커 클릭 이벤트 전달
    C->>Store: 클릭된 여행지 ID 조회

    alt 기본 정보 있음
        Store->>C: 여행지 기본 정보 반환
        C->>Map: 인포윈도우 표시
        Map->>U: 여행지명, 대표사진 표시
    else 기본 정보 없음
        C->>API: 여행지 기본 정보 요청
        API->>C: 기본 정보 응답
        C->>Store: 기본 정보 저장
        C->>Map: 인포윈도우 표시
        Map->>U: 여행지명, 대표사진 표시
    end

    opt 사용자가 상세보기 클릭
        U->>Map: 상세보기 버튼 클릭
        Map->>C: 상세 정보 요청 전달
        Note over C: 여행지 상세 정보 조회 시퀀스 실행
    end
```

## 5. 여행지를 플랜에 추가 시퀀스

```mermaid
sequenceDiagram
    participant U as 👤 사용자
    participant C as 🖥️ 클라이언트
    participant Auth as 🔑 Auth Store
    participant PlanModal as 🪟 Plan Modal Store
    participant API as 🌐 Plan Service

    U->>C: "플랜에 추가" 버튼 클릭
    C->>Auth: 로그인 상태 확인

    alt 미로그인 상태
        C->>U: 로그인 모달 표시
        U->>C: 로그인 완료
    end

    C->>API: 사용자 플랜 목록 조회

    alt 플랜 없음
        API->>C: 빈 목록 반환
        C->>U: 플랜 생성 유도 메시지

        opt 새 플랜 생성
            U->>C: 새 플랜 생성 선택
            Note over C: 플랜 생성 시퀀스 실행
        end
    else 플랜 있음
        API->>C: 플랜 목록 반환
        C->>PlanModal: 플랜 선택 모달 표시
        PlanModal->>U: 플랜 목록과 선택 UI

        U->>PlanModal: 플랜 선택
        PlanModal->>C: 선택된 플랜 정보 전달
        C->>API: 플랜에 여행지 추가 요청

        alt 추가 실패
            API->>C: 실패 응답 (권한 없음/플랜 없음)
            C->>U: 오류 메시지 표시
        else 추가 성공
            API->>C: 성공 응답
            C->>U: 성공 메시지 표시
            C->>PlanModal: 모달 닫기
        end
    end
```

## 6. 검색 결과 페이징 시퀀스

```mermaid
sequenceDiagram
    participant U as 👤 사용자
    participant C as 🖥️ 클라이언트
    participant Store as 📦 Tour Store
    participant API as 🌐 Tour Service
    participant ExtAPI as 🗺️ 외부 여행지 API

    Note over U,ExtAPI: 초기 검색 완료 상태

    U->>C: 다음 페이지 버튼 클릭
    C->>Store: 현재 페이지 정보 확인

    alt 다음 페이지 캐시됨
        Store->>C: 캐시된 페이지 데이터 반환
        C->>C: 지도 마커 업데이트
        C->>U: 다음 페이지 결과 표시
    else 다음 페이지 캐시 없음
        C->>Store: 로딩 상태 설정
        C->>U: 로딩 표시

        C->>API: 다음 페이지 데이터 요청
        API->>ExtAPI: 페이징된 데이터 조회

        alt API 호출 실패
            ExtAPI->>API: 오류 응답
            API->>C: 실패 응답
            C->>U: 오류 메시지 표시
        else API 호출 성공
            ExtAPI->>API: 다음 페이지 데이터 반환
            API->>C: 페이지 데이터 응답
            C->>Store: 페이지 데이터 캐싱
            C->>C: 지도 마커 업데이트
            C->>U: 다음 페이지 결과 표시
        end
    end
```

## 주요 특징

### 🚀 성능 최적화

- **디바운싱**: 검색 입력 시 과도한 API 호출 방지
- **캐싱**: 검색 결과와 상세 정보 캐싱으로 재요청 최소화
- **페이징**: 대량 데이터 처리를 위한 페이지네이션

### 🗺️ 지도 연동

- **실시간 마커**: 검색 결과에 따른 실시간 지도 마커 업데이트
- **인포윈도우**: 마커 클릭 시 간단한 정보 표시
- **지도 중심**: 검색 결과에 따른 지도 중심점 자동 조정

### 🔍 검색 기능

- **다중 검색**: 지역별 검색과 키워드 검색 동시 지원
- **검색 기록**: 로그인 사용자의 검색 기록 저장
- **자동완성**: 검색어 입력 시 자동완성 제안

### 🎯 사용자 경험

- **즉시 피드백**: 모든 액션에 대한 즉각적인 UI 피드백
- **오류 처리**: 네트워크 오류, API 오류에 대한 명확한 메시지
- **로딩 상태**: 데이터 로딩 중 적절한 스피너 표시

### 🔗 플랜 연동

- **원클릭 추가**: 검색 결과에서 바로 플랜에 추가 가능
- **권한 확인**: 플랜 추가 시 사용자 권한 자동 확인
- **플랜 선택**: 여러 플랜 중 선택하여 추가 가능
