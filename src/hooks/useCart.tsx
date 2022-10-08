import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';
import produce from 'immer'
interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number, product: Product) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')
    
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return []; 
  });

  const [stock, setStock] = useState<Stock[]>([])

  async function loadStock(){
    const {data} = await api.get('/stock')
    setStock([...data])
  }

  useEffect(() => {
    loadStock()
  }, [])

  useEffect(() => {
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
  }, [cart])
  
  const addProduct = async (productId: number, product: Product) => {

    try {
      const productStock = stock.find(stock => productId === stock.id)
      const isAmountAvailable = productStock && productStock?.amount >= 1
      if(isAmountAvailable){
        setCart([...cart, product])
        
      }
    } catch(error) {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {   
    try {
      setCart(produce(cart, draft => {
        const productIndex = draft.findIndex(product => product.id === productId)

        draft.splice(productIndex,1)
      }))
    } catch(err) {
      console.log(err)
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      setCart(produce(cart,(draft)=> {
        let productIndex = -1
        const product = draft.find((product, index) => {
          productIndex = index
          return product.id === productId
        })
        const newProduct: Product = {
          ...product,
          amount
        } as Product
        draft.splice(productIndex, 1, newProduct)
        
      }))
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
