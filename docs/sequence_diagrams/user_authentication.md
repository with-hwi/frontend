# 사용자 인증 시퀀스 다이어그램

## 1. 회원가입 시퀀스

```mermaid
sequenceDiagram
    participant U as 👤 사용자
    participant C as 🖥️ 클라이언트
    participant Auth as 🔑 Auth Store
    participant User as 👤 User Store
    participant FB as 🔥 Firebase Auth
    participant API as 🌐 User Service

    U->>C: 회원가입 폼 작성
    C->>C: 입력 유효성 검증

    alt 유효성 검증 실패
        C->>U: 오류 메시지 표시
    else 유효성 검증 성공
        C->>FB: createUserWithEmailAndPassword()

        alt Firebase 회원가입 실패
            FB->>C: 인증 오류 반환
            C->>U: 회원가입 실패 메시지
        else Firebase 회원가입 성공
            FB->>C: 사용자 인증 정보 반환
            C->>Auth: 토큰 저장
            C->>API: 사용자 정보 생성 요청

            alt 사용자 정보 생성 실패
                API->>C: 생성 실패 응답
                C->>FB: 계정 삭제 요청
                C->>U: 회원가입 실패 메시지
            else 사용자 정보 생성 성공
                API->>C: 사용자 정보 반환
                C->>User: 사용자 정보 저장
                C->>U: 회원가입 성공, 자동 로그인
            end
        end
    end
```

## 2. 로그인 시퀀스

```mermaid
sequenceDiagram
    participant U as 👤 사용자
    participant C as 🖥️ 클라이언트
    participant Auth as 🔑 Auth Store
    participant User as 👤 User Store
    participant FB as 🔥 Firebase Auth
    participant API as 🌐 User Service

    U->>C: 로그인 폼 작성
    C->>C: 입력 유효성 검증

    alt 유효성 검증 실패
        C->>U: 오류 메시지 표시
    else 유효성 검증 성공
        C->>FB: signInWithEmailAndPassword()

        alt Firebase 로그인 실패
            FB->>C: 인증 오류 반환
            C->>U: 로그인 실패 메시지
        else Firebase 로그인 성공
            FB->>C: 사용자 인증 정보 반환
            C->>Auth: 토큰 저장
            C->>API: 사용자 정보 조회 요청

            alt 사용자 정보 조회 실패
                API->>C: 조회 실패 응답
                C->>Auth: 로그아웃 처리
                C->>U: 로그인 실패 메시지
            else 사용자 정보 조회 성공
                API->>C: 사용자 정보 반환
                C->>User: 사용자 정보 저장
                C->>Auth: 리다이렉트 경로 확인

                alt 리다이렉트 경로 있음
                    C->>U: 원래 페이지로 이동
                else 리다이렉트 경로 없음
                    C->>U: 홈페이지로 이동
                end
            end
        end
    end
```

## 3. 자동 로그인 시퀀스

```mermaid
sequenceDiagram
    participant U as 👤 사용자
    participant C as 🖥️ 클라이언트
    participant Auth as 🔑 Auth Store
    participant User as 👤 User Store
    participant FB as 🔥 Firebase Auth
    participant API as 🌐 User Service

    U->>C: 페이지 접속/새로고침
    C->>FB: onAuthStateChanged() 리스너

    alt 인증 상태 없음
        FB->>C: null 반환
        C->>Auth: 로그아웃 상태 설정
        C->>U: 게스트 모드로 표시
    else 인증 상태 있음
        FB->>C: 사용자 인증 정보 반환
        C->>FB: getIdToken() 요청

        alt 토큰 갱신 실패
            FB->>C: 토큰 오류 반환
            C->>Auth: 로그아웃 처리
            C->>U: 로그인 페이지로 이동
        else 토큰 갱신 성공
            FB->>C: 새 토큰 반환
            C->>Auth: 토큰 업데이트
            C->>API: 사용자 정보 조회 요청

            alt 사용자 정보 조회 실패
                API->>C: 조회 실패 응답
                C->>Auth: 로그아웃 처리
                C->>U: 로그인 페이지로 이동
            else 사용자 정보 조회 성공
                API->>C: 사용자 정보 반환
                C->>User: 사용자 정보 저장
                C->>U: 로그인 상태로 표시
            end
        end
    end
```

## 4. 로그아웃 시퀀스

```mermaid
sequenceDiagram
    participant U as 👤 사용자
    participant C as 🖥️ 클라이언트
    participant Auth as 🔑 Auth Store
    participant User as 👤 User Store
    participant FB as 🔥 Firebase Auth

    U->>C: 로그아웃 버튼 클릭
    C->>FB: signOut() 요청

    alt Firebase 로그아웃 실패
        FB->>C: 로그아웃 오류 반환
        C->>U: 오류 메시지 표시
    else Firebase 로그아웃 성공
        FB->>C: 로그아웃 완료 응답
        C->>Auth: 토큰 삭제
        C->>User: 사용자 정보 삭제
        C->>C: 로컬 스토리지 정리
        C->>U: 홈페이지로 이동
    end
```

## 5. 프로필 수정 시퀀스

```mermaid
sequenceDiagram
    participant U as 👤 사용자
    participant C as 🖥️ 클라이언트
    participant Auth as 🔑 Auth Store
    participant User as 👤 User Store
    participant FB as 🔥 Firebase Auth
    participant API as 🌐 User Service

    U->>C: 프로필 수정 페이지 접속
    C->>Auth: 인증 상태 확인

    alt 미인증 상태
        C->>U: 로그인 페이지로 리다이렉트
    else 인증된 상태
        C->>User: 현재 사용자 정보 조회
        C->>U: 프로필 폼 표시

        U->>C: 프로필 정보 수정 후 저장
        C->>C: 입력 유효성 검증

        alt 유효성 검증 실패
            C->>U: 오류 메시지 표시
        else 유효성 검증 성공
            C->>API: 프로필 업데이트 요청

            alt 프로필 업데이트 실패
                API->>C: 업데이트 실패 응답
                C->>U: 실패 메시지 표시
            else 프로필 업데이트 성공
                API->>C: 업데이트된 사용자 정보 반환
                C->>User: 사용자 정보 업데이트
                C->>U: 성공 메시지 표시
            end
        end
    end
```

## 주요 특징

### 🔐 보안 고려사항

- **토큰 검증**: 모든 API 요청 시 유효한 토큰 확인
- **자동 로그아웃**: 토큰 만료 시 자동으로 로그아웃 처리
- **입력 검증**: 클라이언트와 서버 양쪽에서 데이터 검증

### 🔄 상태 관리

- **Pinia Store**: 인증 상태와 사용자 정보를 중앙 집중 관리
- **실시간 동기화**: Firebase 인증 상태 변화를 실시간으로 감지
- **지속성**: 페이지 새로고침 시에도 로그인 상태 유지

### 🎯 사용자 경험

- **자동 리다이렉트**: 로그인 후 원래 페이지로 자동 이동
- **오류 처리**: 명확한 오류 메시지로 사용자 가이드
- **로딩 상태**: 인증 처리 중 적절한 로딩 표시

### 📱 반응성

- **즉시 반영**: 인증 상태 변화 시 UI 즉시 업데이트
- **캐싱**: 사용자 정보 캐싱으로 성능 최적화
- **오프라인 지원**: 네트워크 오류 시 적절한 처리
