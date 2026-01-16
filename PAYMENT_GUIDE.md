# 결제 시스템(PG) 도입 가이드

현재 사이트는 HTML/JS와 Firebase(NoSQL) 기반의 정적 웹사이트 구조입니다. 이 환경에서 책 판매를 위한 결제 시스템을 구축하는 방법들을 제안해 드립니다.

## 1. 추천 결제 대행사 (PG)

### [포트원 (Port One)](https://portone.io/kr) - **가장 추천**
- **특징**: 여러 PG사(KG이니시스, 나이스페이 등)와 간편결제(카카오페이, 네이버페이)를 하나로 통합해주는 서비스입니다.
- **장점**: 
    - JavaScript SDK가 매우 잘 되어 있어 현재의 `main.js` 구조에 바로 삽입하기 쉽습니다.
    - 관리자 페이지가 직관적이라 대금 정산 확인이 편리합니다.

### [토스 페이먼츠 (Toss Payments)](https://www.tosspayments.com/)
- **특징**: 개발자 친화적인 API와 세련된 결제창을 제공합니다.
- **장점**: 연동 과정이 매우 빠르고 승인 절차가 상대적으로 간소합니다.

---

## 2. 연동 단계 (포트원 기준)

### 1단계: JavaScript SDK 추가
`index.html` 하단에 포트원 라이브러리를 추가합니다.
```html
<script src="https://cdn.iamport.kr/v1/iamport.js"></script>
```

### 2단계: 결제 함수 구현 (`main.js`)
"바로 구매하기" 버튼 클릭 시 실행될 함수를 만듭니다.
```javascript
function requestPay(bookTitle, price) {
    const IMP = window.IMP;
    IMP.init("발급받은_가맹점_식별코드"); // 관리자 설정값

    IMP.request_pay({
        pg: "html5_inicis",           // PG사 선택
        pay_method: "card",           // 결제수단
        name: bookTitle,              // 책 이름
        amount: price,                // 가격
        buyer_email: "test@domain.com",
        buyer_name: "구매자이름",
        buyer_tel: "010-0000-0000",
    }, function (rsp) {
        if (rsp.success) {
            // 결제 성공 시: 서버(이미 구축된 Firebase)에 주문 정보 저장
            alert('결제가 완료되었습니다!');
            db.collection("orders").add({
                book: bookTitle,
                price: price,
                status: "paid",
                buyer: rsp.buyer_name,
                paidAt: new Date()
            });
        } else {
            // 결제 실패 시
            alert('결제에 실패했습니다: ' + rsp.error_msg);
        }
    });
}
```

---

## 3. 현실적인 대안: 무통장 입금 및 문의 기반 판매

완전한 자동 결제 시스템 구축이 부담스럽다면 다음과 같은 단계적 도입을 추천합니다.

1.  **카카오톡 오픈채팅**: 현재 제가 버튼에 넣어둔 대로, 클릭 시 오픈채팅방으로 연결하여 개별 상담 후 판매합니다.
2.  **구글 폼 / 네이버 폼**: 주문 정보를 폼으로 받고, 안내된 계좌로 입금을 확인한 후 책을 배송합니다.
3.  **네이버 스마트스토어 외부 링크**: 이미 스마트스토어를 운영 중이시라면 책 상세페이지 링크를 붙여 결제만 스마트스토어에서 하게 합니다.

## 4. 고려해야 할 법적 사항
- **통신판매업 신고**: 온라인에서 직접 결제를 받으려면 통신판매업 신고가 필수입니다.
- **구매안전서비스(에스크로)**: PG사 연동 시 자동으로 가입되지만, 무통장 입금 시에는 고려가 필요할 수 있습니다.
