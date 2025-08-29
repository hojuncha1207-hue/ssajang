(() => {
    // =============================================
    // ✨ 상품 관리 기능 (복원) ✨
    // =============================================
    const initialProducts = [
        { id: 1, name: '돼지갈비', price: 18000 },
        { id: 2, name: '목살 (600g)', price: 16000 },
        { id: 3, name: '삼겹살 (600g)', price: 17000 },
    ];
    let products = JSON.parse(localStorage.getItem('ilbunji_products')) || initialProducts;

    function saveProducts() {
        localStorage.setItem('ilbunji_products', JSON.stringify(products));
    }

    function renderProducts() {
        const container = document.getElementById('productListContainer');
        container.innerHTML = '';
        products.forEach(product => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-white p-4 rounded-lg border';
            div.innerHTML = `
                <div>
                    <p class="font-semibold">${product.name}</p>
                    <p class="text-gray-600">${product.price.toLocaleString()}원</p>
                </div>
                <button data-id="${product.id}" class="delete-product-btn px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200">삭제</button>
            `;
            container.appendChild(div);
        });
    }

    // =============================================
    // ✨ 화면 전환 및 주문 내역 조회 기능 ✨
    // =============================================
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');

        // 각 화면에 맞는 렌더링 함수를 호출합니다.
        if (screenId === 'productScreen') {
            renderProducts();
        }
        if (screenId === 'orderScreen') {
            renderOrders();
        }
    }

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

    // =============================================
    // ✨ 모든 이벤트 리스너 설정 (복원) ✨
    // =============================================
    function setupEventListeners() {
        // 공통: 화면 전환 버튼
        document.querySelectorAll('.nav-btn-admin').forEach(btn => {
            btn.addEventListener('click', () => {
                showScreen(btn.dataset.screen);
            });
        });

        // 상품 관리: 새 상품 추가 폼
        const addProductForm = document.getElementById('addProductForm');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('productName');
                const priceInput = document.getElementById('productPrice');
                
                const newProduct = { id: Date.now(), name: nameInput.value, price: parseInt(priceInput.value, 10) };
                products.push(newProduct);
                saveProducts();
                renderProducts();
                e.target.reset();
            });
        }

        // 상품 관리: 상품 삭제 버튼
        const productListContainer = document.getElementById('productListContainer');
        if (productListContainer) {
            productListContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-product-btn')) {
                    const productId = parseInt(e.target.dataset.id, 10);
                    products = products.filter(p => p.id !== productId);
                    saveProducts();
                    renderProducts();
                }
            });
        }
    }

    // 앱 초기화
    document.addEventListener('DOMContentLoaded', () => {
        setupEventListeners();
        showScreen('dashboardScreen');
    });

})();
