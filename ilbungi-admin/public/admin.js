// public/admin.js
(() => {
    // ==================== 초기 데이터 및 상태 관리 ====================
    const initialProducts = [
        { id: 1, name: '돼지갈비', price: 18000 },
        { id: 2, name: '목살 (600g)', price: 16000 },
        { id: 3, name: '삼겹살 (600g)', price: 17000 },
        { id: 4, name: '소갈비', price: 32000 },
        { id: 5, name: '소고기 국거리 (300g)', price: 15000 },
        { id: 6, name: '한우 채끝', price: 45000 }
    ];

    let products = JSON.parse(localStorage.getItem('ilbunji_products')) || initialProducts;
    
    // ==================== 데이터 저장 함수 ====================
    function saveProducts() {
        localStorage.setItem('ilbunji_products', JSON.stringify(products));
    }

    // ==================== 화면 전환 함수 ====================
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');

        if (screenId === 'productScreen') renderProducts();
        if (screenId === 'orderScreen') renderOrders();
    }

    // ==================== 렌더링 함수 ====================
    function renderProducts() {
        const container = document.getElementById('productListContainer');
        container.innerHTML = '';
        if (products.length === 0) {
            container.innerHTML = '<p class="text-gray-500">아직 등록된 상품이 없습니다.</p>';
            return;
        }
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
    
    async function renderOrders() {
        const container = document.getElementById('orderListContainer');
        container.innerHTML = '<p class="text-gray-500">주문 내역을 불러오는 중...</p>';

        try {
            const response = await fetch('/orders/ilbunji_butcher_shop');
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
            container.innerHTML = `<p class="text-red-500">주문 내역을 불러오는 데 실패했습니다. 서버가 켜져 있는지 확인하세요.</p>`;
        }
    }

    // ==================== 이벤트 리스너 설정 ====================
    function setupEventListeners() {
        document.querySelectorAll('.nav-btn-admin').forEach(btn => {
            btn.addEventListener('click', () => {
                showScreen(btn.dataset.screen);
            });
        });

        document.getElementById('addProductForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('productName').value;
            const price = parseInt(document.getElementById('productPrice').value, 10);
            
            const newProduct = { id: Date.now(), name: name, price: price };
            products.push(newProduct);
            saveProducts();
            renderProducts();
            e.target.reset();
        });

        document.getElementById('productListContainer').addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-product-btn')) {
                const productId = parseInt(e.target.dataset.id, 10);
                if (confirm('정말로 이 상품을 삭제하시겠습니까?')) {
                    products = products.filter(p => p.id !== productId);
                    saveProducts();
                    renderProducts();
                }
            }
        });
    }

    // ==================== 앱 초기화 ====================
    document.addEventListener('DOMContentLoaded', () => {
        setupEventListeners();
        showScreen('dashboardScreen');
    });

})();