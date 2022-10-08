import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';
import { Product } from './../../types';


interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const [cartItemsAmount, setcartItemsAmount] = useState<CartItemsAmount>({})
  const { addProduct, cart, updateProductAmount } = useCart();

  // const cartItemsAmount = cart.reduce((sumAmount, product) => {
  //   // TODO
  // }, {} as CartItemsAmount)

  function loadCartItemsAmount(cart: Product[]){
    let itemsAmount: CartItemsAmount = {}
    cart.forEach(product => itemsAmount[product.id] = product.amount  )
    setcartItemsAmount(itemsAmount)
  }

  useEffect(() => {
    async function loadProducts() {
      // TODO
      const { data }   = await api.get<Product[]>("/products")
      
      

      const productFormattedList = data.map(({id, image, price, title, amount}) => {
        const productFormatted: ProductFormatted = {
          id, 
          image, 
          price, 
          title,
          amount,
          priceFormatted: formatPrice(price)
        }

        return productFormatted
      })

      setProducts([...productFormattedList])
    }

    loadProducts();
  }, []);
  useEffect(() => {
    loadCartItemsAmount(cart)
  }, [cart])
  function handleAddProduct(id: number) {
    // TODO
    let productOnCart = cart.find(product => product.id === id)

    if(productOnCart){
      
      updateProductAmount({
        productId: id,
        amount: productOnCart.amount + 1
      })

      return
    }

    const {id: productId, image, price, title  } = products.find(product => product.id === id) as ProductFormatted
    const product = {
      id: productId,
      title, 
      image,
      price, 
      amount: 1,

    }
    addProduct(id, product)
    
  }

  return (
    <ProductList>
      {products.map(({
          id,
          image,
          priceFormatted,
          price,
          title
        })=> {
        return (
          <li key={id}>
            <img src={image} alt={title} />
            <strong>{title}</strong>
            <span>{priceFormatted}</span>
            <button
              type="button"
              data-testid="add-product-button"
              onClick={() => handleAddProduct(id)}
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {cartItemsAmount[id] || 0} 
              </div>

              <span>ADICIONAR AO CARRINHO</span>
            </button>
          </li>
        )
      })}
    </ProductList>
  );
};

export default Home;

