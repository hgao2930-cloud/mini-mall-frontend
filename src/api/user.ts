import api from '.'

export interface User {
  id: string
  username: string
  password: string
}
export const registerUser = function (user: Omit<User, 'id'>) {
  return api.post<User>('/users', user)
}
// export const loginUser = function(user:Omit<User, 'id'>){
//     return api.get<User[]>('/users',{
//         params:{
//             username:user.username,
//             password:user.password
//         }
//     })
// }
export const loginUser = function () {
  return api.get<User[]>('/users')
}
