import api from ".";
import { type CartItem } from "@/stores/cart";

export const getCartItem = function(){
    return api.get<CartItem[]>('/cart')
}
export const addToCartItem = function(productId:string,quantity:number){
    return api.post('/cart',{productId,quantity})
}
export const updateCartQuantity = function(productId:string,quantity:number){
    return api.patch(`/cart/${productId}`,{quantity})
}
export const removeCartItem = function(productId:string){
    return api.delete(`/cart/${productId}`)
}
export const clearCart = function(){
    return api.delete('/cart')
}