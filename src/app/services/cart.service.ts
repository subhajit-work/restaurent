import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  tokenNumber:number;
  constructor(
    private http : HttpClient,
  ){}
  private user = new BehaviorSubject<number>(0);
  private tokenGet = new BehaviorSubject<number>(0);
  castUser = this.user.asObservable();
  getToken = this.tokenGet.asObservable();
  cartApi = 'api/cart';

  editToken(token){
    console.log('tokentokentokentokentoken>>>', token);
    
    
    this.tokenNumber = token;
    this.tokenGet.next(token); 
    console.log('tokenNumber>>>>>>>>@@@@', this.tokenNumber);
  }

  editUser(newUser){
    console.log('newUsernewUsernewUsernewUser>>>', newUser);
    this.user.next(newUser); 

    if(newUser == 0){
      this.editToken(0);
      this.http.get(this.cartApi).subscribe(
        (res:any) => {
          console.log('cart number', res);
          if(res.return_data){
            this.user.next(res.return_data.totalcart); 
          }else {
            this.user.next(0); 
          }
          
        },
        errRes => {
        }
      );
    }else {
      this.cartvalueChange();
    }
  }

 

  cartvalueChange() {
    console.log('tokenNumber!!!!!!!!!!!!!!!!!>@@@@', this.tokenNumber);
    if(this.tokenNumber) {
      this.http.get(this.cartApi+'?token='+this.tokenNumber).subscribe(
        (res:any) => {
          console.log('cart number', res);
          if(res.return_data){
            this.user.next(res.return_data.totalcart); 
          }else {
            this.user.next(0); 
          }
          
        },
        errRes => {
        }
      );
    }else{
      this.user.next(0);
    }
  }
}
