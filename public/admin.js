(() => {
    // 화면 전환 함수
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');

        if (screenId === 'orderScreen') {
            renderOrders();
        }
    }

    // ✨ 서버에서 주문 데이터를 받아와 화면에 렌더링하는 함수 ✨
    async function renderOrders() {
        const container = document.getElementById('orderListContainer');
        container.innerHTML = '<p class="text-gray-500">주문 내역을 불러오는 중...</p>';

        try {
            // '일번지정육점'의 고유 ID '95'로 주문 내역을 요청합니다.
            const response = await fetch('/orders/95');
            if (!response.ok) {
                throw new Error('서버에서 데이터를 가져오지 못했습니다.');
            }
            const fetchedOrders = await response.json();

            container.innerHTML = '';
            if (fetchedOrders.length === 0) {
                container.innerHTML = '<p class="text-gray-500">들어온 주문이 없습니다.</p>';
                return;
            }

            fetchedOrders.forEach(order => {
                const card = document.createElement('div');
                card.className = 'bg-white p-6 rounded-lg border';

                const itemDetails = order.items.map(item => `<li>${item.name} x ${item.quantity}</li>`).join('');
                const itemsHtml = `<h4 class="font-semibold mt-2">주문 상품</h4><ul class="list-disc list-inside text-sm text-gray-700">${itemDetails}</ul>`;
                
                const orderDate = new Date(order.order_date).toLocaleString('ko-KR');

                // 주문번호(order.order_id)와 사용자 ID(order.user_id)를 화면에 표시
                card.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-lg">주문번호: ${order.order_id}</p>
                            <p class="text-sm text-gray-500">고객 ID: ${order.user_id} / 주문일: ${orderDate}</p>
                        </div>
                        <p class="font-bold text-lg">${order.total_price.toLocaleString()}원</p>
                    </div>
                    <div class="mt-4 border-t pt-4">
                        ${itemsHtml}
                    </div>
                `;
                container.appendChild(card);
            });
        } catch (error) {
            console.error('주문 내역 로딩 실패:', error);
            container.innerHTML = `<p class="text-red-500">주문 내역을 불러오는 데 실패했습니다. 서버 로그를 확인하세요.</p>`;
        }
    }

    // 이벤트 리스너 설정
    function setupEventListeners() {
        document.querySelectorAll('.nav-btn-admin').forEach(btn => {
            btn.addEventListener('click', () => {
                showScreen(btn.dataset.screen);
            });
        });
        // 상품 관리 기능은 현재 사용하지 않으므로 관련 코드는 생략합니다.
    }

    // 앱 초기화
    document.addEventListener('DOMContentLoaded', () => {
        setupEventListeners();
        showScreen('dashboardScreen'); // 처음에는 대시보드 화면을 보여줍니다.
    });

})();
