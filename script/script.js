document.addEventListener('DOMContentLoaded', () => {
  const search = document.querySelector('.search');
        cartBtn = document.getElementById('cart'),
        wishlistBtn = document.getElementById('wishlist'),
        goodsWrapper = document.querySelector('.goods-wrapper'),
        cart = document.querySelector('.cart'),
        category = document.querySelector('.category'),
        cartCounter = cartBtn.querySelector('.counter') ,
        wishlistCounter = wishlistBtn.querySelector('.counter'),
        cartWrapper = document.querySelector('.cart-wrapper');

  const wishlist = [];
  let goodsBasket = {};

  const loading = () => {
    goodsWrapper.innerHTML = `<div id="spinner">
                                <div class="spinner-loading">
                                  <div>
                                    <div>
                                      <div></div>
                                    </div>	
                                    <div>
                                      <div></div>
                                    </div>
                                    <div>
                                      <div></div>
                                    </div>
                                    <div>
                                      <div></div>
                                    </div>
                                  </div>
                                </div>
                              </div>`
  };

  const createCardGoods = (id, title, price, img) => {
    const card = document.createElement('div');
    card.className = 'card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3';
    card.innerHTML = `<div class="card">
                        <div class="card-img-wrapper">
                          <img class="card-img-top" src="./${img}" alt="">
                          <button class="card-add-wishlist ${wishlist.includes(id) ? 'active' : ''}"
                            data-goods-id="${id}"></button>
                        </div>
                        <div class="card-body justify-content-between">
                          <a href="#" class="card-title">${title}</a>
                          <div class="card-price">${price} ₽</div>
                          <div>
                            <button class="card-add-cart"
                              data-goods-id="${id}">Добавить в корзину</button>
                          </div>
                        </div>
                      </div>`;  
    return card;
  };

  const renderCard = goods => {
    goodsWrapper.textContent = '';
    if (goods.length) {
      goods.forEach(({ id, title, price, imgMin }) => {
        goodsWrapper.appendChild(createCardGoods(id, title, price, imgMin));
      })
    } else {
      goodsWrapper.textContent = '❌ Упс! Товаров по вашему запросу не найдено. ❌';
    }
  };

  // Рендер товаров в КОРЗИНЕ

  const createCardGoodsBasket = (id, title, price, img) => {
    const card = document.createElement('div');
    card.className = 'goods';
    card.innerHTML = `<div class="goods-img-wrapper">
                        <img class="goods-img" src="${img}" alt="">
                      </div>
                      <div class="goods-description">
                        <h2 class="goods-title">${title}</h2>
                        <p class="goods-price">${price} ₽</p>

                      </div>
                      <div class="goods-price-count">
                        <div class="goods-trigger">
                          <button class="goods-add-wishlist ${wishlist.includes(id) ? 'active' : ''}"
                          data-goods-id="${id}"></button>
                          <button class="goods-delete" data-goods-id="${id}"></button>
                        </div>
                        <div class="goods-count">1</div>
                      </div>`;  
    return card;
  };

  const renderBasket = goods => {
    cartWrapper.textContent = '';
    if (goods.length) {
      goods.forEach(({ id, title, price, imgMin }) => {
        cartWrapper.appendChild(createCardGoodsBasket(id, title, price, imgMin));
      })
    } else {
      cartWrapper.innerHTML = '<div id="cart-empty">Ваша корзина пока пуста</div>';
    }
  };

  const closeCart = event => { 
    const target = event.target;
    if (target === cart || 
      target.classList.contains('cart-close') || 
      event.keyCode === 27) {
      cart.style.display = '';
      document.removeEventListener('keyup', closeCart);
    }
  };

  const showCardBasket = goods => goods.filter(item => goodsBasket.hasOwnProperty(item.id));

  const openCart = event => {
    event.preventDefault();
    cart.style.display = 'flex';
    document.addEventListener('keyup', closeCart);
    getGoods(renderBasket, showCardBasket);
  };

  const getGoods = (goods, filter) => {
    loading();
    fetch('./db/db.json')
      .then(response => response.json())
      .then(filter)
      .then(goods);
  };

  const randomSort = item => item.sort(() => Math.random() - 0.5);

  const chooseCategory = event => {
    event.preventDefault();
    const target = event.target;

    if (target.classList.contains('category-item')) {
      const cat = target.dataset.category;
      getGoods(renderCard, goods => goods.filter(item => item.category.includes(cat)));
    }
  };

  const searchGoods = event => {
    event.preventDefault();
    const input = event.target.elements.searchGoods;
    const inputValue = input.value.trim(); 
    if (inputValue !== '') {
      const searchString = new RegExp(inputValue, 'i');
      getGoods(renderCard, goods => goods.filter(item => searchString.test(item.title)));
    } else {
      search.classList.add('error');
      setTimeout(() => {
        search.classList.remove('error');        
      }, 2000);
    }
    input.value = '';
  }

  const getCookie = (name) => {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }; 

  const cookieQuery = get => {
    if (get) {
      goodsBasket = JSON.parse(getCookie('goodsBasket'));
      checkCounter(); 
    } else {
      document.cookie = `goodsBasket=${JSON.stringify(goodsBasket)}; max-age=86400e3`;
    } 
  };

  const checkCounter = () => {
    wishlistCounter.textContent = wishlist.length;
    cartCounter.textContent = Object.keys(goodsBasket).length;
  };

  const storageQuery = get => {
    if (get) {
      if(localStorage.getItem('wishlist')) {
        const wishlistStorage = JSON.parse(localStorage.getItem('wishlist'));
        wishlistStorage.forEach(id => wishlist.push(id));
      }
      checkCounter();
    } else {  
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } 
    
  };

  const toggleWishlist = (goodsId, elem) => {
    if (wishlist.includes(goodsId)) {
      wishlist.splice(wishlist.indexOf (goodsId), 1)
      elem.classList.remove('active');
    } else {
      wishlist.push(goodsId);
      elem.classList.add('active');
    }
    checkCounter();
    storageQuery();
  };

  const addBasket = id => {
    if (goodsBasket[id]) {
      goodsBasket[id] += 1
    } else {
      goodsBasket[id] = 1
    }
    checkCounter();
    cookieQuery();
  };

  const handlerGoods = event => {
    const target = event.target;
    if(target.classList.contains('card-add-wishlist')) {
      toggleWishlist(target.dataset.goodsId, target);
    }
    if(target.classList.contains('card-add-cart')) {
      addBasket(target.dataset.goodsId);
    }
  };

  const showWishlist = event => {
    event.preventDefault();
    getGoods(renderCard, goods => goods.filter(item => wishlist.includes(item.id)))
  };  

  cartBtn.addEventListener('click', openCart);
  cart.addEventListener('click', closeCart);
  category.addEventListener('click', chooseCategory);
  search.addEventListener('submit', searchGoods);
  goodsWrapper.addEventListener('click', handlerGoods);
  wishlistBtn.addEventListener('click', showWishlist);

  getGoods(renderCard, randomSort);
  storageQuery(true);
  cookieQuery(true);
});