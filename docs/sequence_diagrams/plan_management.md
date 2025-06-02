# 플랜 관리 시퀀스 다이어그램

## 1. 새 플랜 생성 시퀀스

```mermaid
sequenceDiagram
    participant U as 👤 사용자
    participant C as 🖥️ 클라이언트
    participant Auth as 🔑 Auth Store
    participant Modal as 🪟 Plan Modal Store
    participant API as 🌐 Plan Service
    participant Router as 🧭 Vue Router

    U->>C: "새 플랜 만들기" 버튼 클릭
    C->>Auth: 로그인 상태 확인

    alt 미로그인 상태
        C->>U: 로그인 모달 표시
        U->>C: 로그인 완료
    end

    C->>Modal: 플랜 생성 모달 열기
    Modal->>U: 플랜 기본 정보 입력 폼 표시

    U->>Modal: 플랜 정보 입력 (제목, 설명, 날짜, 인원, 테마)
    Modal->>Modal: 입력 유효성 검증

    alt 유효성 검증 실패
        Modal->>U: 오류 메시지 표시
    else 유효성 검증 성공
        U->>Modal: 저장 버튼 클릭
        Modal->>C: 플랜 생성 요청 전달
        C->>API: 새 플랜 생성 API 호출

        alt 플랜 생성 실패
            API->>C: 생성 실패 응답
            C->>Modal: 오류 상태 전달
            Modal->>U: 생성 실패 메시지 표시
        else 플랜 생성 성공
            API->>C: 생성된 플랜 정보 반환
            C->>Modal: 모달 닫기
            C->>Router: 플랜 상세 페이지로 이동
            Router->>U: 새로 생성된 플랜 페이지 표시
        end
    end
```

## 2. 플랜 정보 수정 시퀀스

```mermaid
sequenceDiagram
    participant U as 👤 사용자
    participant C as 🖥️ 클라이언트
    participant Auth as 🔑 Auth Store
    participant Modal as 🪟 Plan Modal Store
    participant API as 🌐 Plan Service

    U->>C: 플랜 설정 버튼 클릭
    C->>Auth: 사용자 권한 확인

    alt 권한 없음 (참여자 또는 비회원)
        C->>U: 권한 없음 메시지 표시
    else 관리자 권한 있음
        C->>API: 현재 플랜 정보 조회
        API->>C: 플랜 상세 정보 반환
        C->>Modal: 플랜 수정 모달 열기
        Modal->>U: 현재 정보가 채워진 수정 폼 표시

        U->>Modal: 정보 수정
        Modal->>Modal: 변경사항 추적

        U->>Modal: 저장 버튼 클릭
        Modal->>Modal: 입력 유효성 검증

        alt 유효성 검증 실패
            Modal->>U: 오류 메시지 표시
        else 유효성 검증 성공
            Modal->>C: 수정 요청 전달
            C->>API: 플랜 정보 업데이트 API 호출

            alt 업데이트 실패
                API->>C: 업데이트 실패 응답
                C->>Modal: 오류 상태 전달
                Modal->>U: 수정 실패 메시지 표시
            else 업데이트 성공
                API->>C: 업데이트된 플랜 정보 반환
                C->>C: 플랜 정보 상태 업데이트
                C->>Modal: 모달 닫기
                C->>U: 수정 완료 메시지 및 업데이트된 정보 표시
            end
        end
    end
```

## 3. 초대 링크 생성 및 공유 시퀀스

```mermaid
sequenceDiagram
    participant U as 👤 관리자
    participant C as 🖥️ 클라이언트
    participant InviteModal as 🪟 Invite Modal Store
    participant API as 🌐 Plan Service
    participant Clipboard as 📋 클립보드 API

    U->>C: "팀원 초대" 버튼 클릭
    C->>InviteModal: 초대 모달 열기
    InviteModal->>U: 초대 방법 선택 UI 표시

    U->>InviteModal: "링크로 초대" 선택
    InviteModal->>C: 초대 링크 생성 요청
    C->>API: 초대 링크 생성 API 호출

    alt 링크 생성 실패
        API->>C: 생성 실패 응답
        C->>InviteModal: 오류 상태 전달
        InviteModal->>U: 링크 생성 실패 메시지
    else 링크 생성 성공
        API->>C: 초대 링크 URL 반환
        C->>InviteModal: 초대 링크 저장
        InviteModal->>U: 초대 링크와 공유 옵션 표시

        alt 링크 복사
            U->>InviteModal: "링크 복사" 버튼 클릭
            InviteModal->>Clipboard: 링크 복사 요청
            Clipboard->>InviteModal: 복사 완료 응답
            InviteModal->>U: "링크가 복사되었습니다" 메시지
        else SNS 공유
            U->>InviteModal: SNS 공유 버튼 클릭
            InviteModal->>C: 해당 SNS 공유 API 호출
            C->>U: SNS 공유 창 열기
        end
    end
```

## 4. 초대 링크를 통한 플랜 참여 시퀀스

```mermaid
sequenceDiagram
    participant Invitee as 👤 초대받은 사용자
    participant C as 🖥️ 클라이언트
    participant Auth as 🔑 Auth Store
    participant API as 🌐 Plan Service
    participant Router as 🧭 Vue Router

    Invitee->>C: 초대 링크 클릭하여 접속
    C->>Router: 링크에서 초대 코드 추출
    Router->>C: 초대 코드 전달

    C->>API: 초대 코드 유효성 검증

    alt 초대 코드 무효
        API->>C: 무효한 링크 응답
        C->>Invitee: "유효하지 않은 초대 링크" 메시지
    else 초대 코드 유효
        API->>C: 플랜 정보 반환
        C->>Invitee: 플랜 미리보기 및 참여 확인 UI 표시

        alt 사용자가 참여 거부
            Invitee->>C: "참여하지 않기" 선택
            C->>Router: 홈페이지로 이동
        else 사용자가 참여 승인
            Invitee->>C: "플랜 참여하기" 버튼 클릭
            C->>Auth: 로그인 상태 확인

            alt 미로그인 상태
                C->>Invitee: 로그인 모달 표시
                Invitee->>C: 로그인 완료
            end

            C->>API: 플랜 참여 요청

            alt 참여 실패 (이미 참여/플랜 없음)
                API->>C: 참여 실패 응답
                C->>Invitee: 참여 실패 메시지 표시
            else 참여 성공
                API->>C: 참여 성공 응답
                C->>Router: 플랜 상세 페이지로 이동
                Router->>Invitee: 플랜 페이지 표시 (참여자 권한)
            end
        end
    end
```

## 5. 참여자 관리 시퀀스

```mermaid
sequenceDiagram
    participant Owner as 👤 플랜 관리자
    participant C as 🖥️ 클라이언트
    participant API as 🌐 Plan Service

    Owner->>C: 참여자 관리 탭 클릭
    C->>API: 플랜 참여자 목록 조회
    API->>C: 참여자 목록 및 권한 정보 반환
    C->>Owner: 참여자 목록 UI 표시

    alt 참여자 권한 변경
        Owner->>C: 참여자 권한 변경 버튼 클릭
        C->>C: 권한 변경 확인 다이얼로그 표시
        Owner->>C: 변경 확인
        C->>API: 참여자 권한 변경 요청

        alt 권한 변경 실패
            API->>C: 변경 실패 응답
            C->>Owner: 권한 변경 실패 메시지
        else 권한 변경 성공
            API->>C: 변경 성공 응답
            C->>C: 참여자 목록 UI 업데이트
            C->>Owner: 권한 변경 완료 메시지
        end

    else 참여자 추방
        Owner->>C: 참여자 추방 버튼 클릭
        C->>C: 추방 확인 다이얼로그 표시
        Owner->>C: 추방 확인
        C->>API: 참여자 추방 요청

        alt 추방 실패
            API->>C: 추방 실패 응답
            C->>Owner: 추방 실패 메시지
        else 추방 성공
            API->>C: 추방 성공 응답
            C->>C: 참여자 목록에서 제거
            C->>Owner: 추방 완료 메시지
        end
    end
```

## 6. 플랜 삭제 시퀀스

```mermaid
sequenceDiagram
    participant Owner as 👤 플랜 관리자
    participant C as 🖥️ 클라이언트
    participant API as 🌐 Plan Service
    participant Router as 🧭 Vue Router

    Owner->>C: 플랜 삭제 버튼 클릭
    C->>C: 삭제 확인 다이얼로그 표시

    alt 사용자가 삭제 취소
        Owner->>C: "취소" 버튼 클릭
        C->>Owner: 다이얼로그 닫기
    else 사용자가 삭제 확인
        Owner->>C: 플랜 제목 입력으로 재확인
        C->>C: 입력된 제목과 실제 제목 비교

        alt 제목 불일치
            C->>Owner: "제목이 일치하지 않습니다" 메시지
        else 제목 일치
            Owner->>C: "삭제" 버튼 클릭
            C->>API: 플랜 삭제 요청

            alt 삭제 실패
                API->>C: 삭제 실패 응답 (권한 없음/플랜 없음)
                C->>Owner: 삭제 실패 메시지
            else 삭제 성공
                API->>C: 삭제 성공 응답
                C->>Router: 홈페이지로 이동
                Router->>Owner: "플랜이 삭제되었습니다" 메시지와 함께 홈페이지 표시
            end
        end
    end
```

## 주요 특징

### 🔐 권한 기반 접근 제어

- **관리자 권한**: 플랜 수정, 삭제, 참여자 관리는 관리자만 가능
- **참여자 권한**: 플랜 조회, 여행지 추가 제안은 모든 참여자 가능
- **실시간 권한 확인**: 모든 액션 전 사용자 권한 검증

### 🔗 초대 시스템

- **링크 기반 초대**: 간단한 링크 공유로 플랜 참여 가능
- **다양한 공유 방법**: 링크 복사, SNS 공유 등 다중 공유 옵션
- **보안**: 초대 링크 유효성 검증 및 만료 처리

### 🎯 사용자 경험

- **확인 절차**: 중요한 작업(삭제, 추방)에 대한 이중 확인
- **실시간 업데이트**: 플랜 정보 변경 시 즉시 UI 반영
- **명확한 피드백**: 모든 액션에 대한 성공/실패 메시지

### 📱 상태 관리

- **모달 상태**: Pinia를 통한 모달 상태 중앙 관리
- **캐싱**: 플랜 정보 캐싱으로 불필요한 API 호출 방지
- **동기화**: 여러 사용자 간 플랜 정보 실시간 동기화

### 🛡️ 데이터 무결성

- **입력 검증**: 클라이언트와 서버 양쪽에서 데이터 검증
- **롤백 처리**: 실패 시 이전 상태로 복구
- **일관성 보장**: 플랜 참여자 간 데이터 일관성 유지
