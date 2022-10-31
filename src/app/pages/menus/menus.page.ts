import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Platform, IonContent, ModalController} from '@ionic/angular';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonUtils } from './../../services/common-utils/common-utils';

import { environment } from '../../../environments/environment';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AddCommonModelPage } from '../modal/add-common-model/add-common-model.page';
import { CartService } from 'src/app/services/cart.service';

declare var $ :any; //jquary declear
 
/* tslint:disable */ 

@Component({
  selector: 'app-menus',
  templateUrl: './menus.page.html',
  styleUrls: ['./menus.page.scss'],
})

export class MenusPage implements OnInit, OnDestroy {

  @ViewChild(IonContent) content: IonContent;

  main_url = environment.apiUrl;
  file_url = environment.fileUrl;

  // variable declartion section
  model: any = {};
  isListLoading = false;
  page = 1;
  noDataFound = true;
  fetchItems;
  tableHeaderData;
  tableHeaderDataDropdown;
  current_url_path_name;
  private viewPageDataSubscribe: Subscription;
  private logoutDataSubscribe : Subscription;
  private homePageDataSubscribe : Subscription;
  private menuByFilterSubscribe: Subscription;
  parms_action_id;
  listing_view_url;
  viewLoadData;
  viewData;
  get_user_dtls;
  homeLoadData;
  homePageData;
  menu_api;
  menuList;
  cart_api;
  cartList;
  cartNumber:number;
  tokenNumber:number;

  constructor(
    private activatedRoute : ActivatedRoute,
    private router: Router,
    private http : HttpClient,
    private commonUtils : CommonUtils,
    private authService : AuthService,
    private modalController : ModalController,
    private cart: CartService,
  ) { }

  // tslint:disable-next-line: comment-format
  // pager object
  pager: any = {};
  // paged items
  pageItems: any[];

  listAlldata;

  // ------ init function call start -------
  commonFunction(){
    // get active url name
    this.current_url_path_name =  this.router.url.split('/')[1] + 'ColumnSelect';
    this.commonUtils.getPathNameFun(this.router.url.split('/')[1]);

    this.parms_action_id = this.activatedRoute.snapshot.paramMap.get('id');

    this.cart.castUser.subscribe(loginCheck => this.cartNumber = loginCheck);
    this.cart.getToken.subscribe(tokenGet => this.tokenNumber = tokenGet);
    
    // view page url name
    this.listing_view_url = 'api/menulist';

    // user details get
    this.logoutDataSubscribe = this.commonUtils.signinStudentInfoObservable.subscribe(res => {
      console.log(' =========== HEADER  userdata observable  >>>>>>>>>>>', res);
      if(res){
        this.get_user_dtls = res;
      }else{
      
      }
    });

    // menu url name
    this.menu_api = 'api/sessionmenulist';
    this.onChangeMenu('Special');

    // cart url name
    this.cart_api = 'api/addtocart';

    this.viewPageData();
  
  }

  ngOnInit() {
  }

  // scroll event detect
  isFixedHeader;
  onScrollHedearFix(event) {
    // console.log('scroll onnnnnnnnn', event.detail.scrollTop);
    if (event.detail.scrollTop > 56) {
      // console.log("scrolling down, hiding footer...iffffffffffff");
      this.isFixedHeader = true;
    } else {
      // console.log("scrolling up, revealing footer...elseeeeeeeeeeeeeee");
      this.isFixedHeader = false;
    };
  }

  // ion View Will Enter call
  ionViewWillEnter() {
    this.commonFunction();
  }

  ionViewDidEnter(){
    // go to scroll top in mozila browser
    this.content.scrollToTop(0);
  }




  // open description
  openDescription(event, _item, _items){
    _item.isOpenDescription = !_item.isOpenDescription;

    /* _items.forEach(element => {
      element.isOpenDescription = false;
    });
    if(_item){
      _item.isOpenDescription = true;
    } */
  }

  // ================== view data fetch start =====================
    viewPageData(){
      this.viewLoadData = true;
      this.viewPageDataSubscribe = this.http.get(this.listing_view_url).subscribe(
        (res:any) => {
          this.viewLoadData = false;
          console.log("view data  res --****------------------>", res.return_data);
          if(res.return_status > 0){
            this.viewData = res.return_data;
          }
        },
        errRes => {
          this.viewLoadData = false;
        }
      );
    }
  // view data fetch end

  
  // Menu change start
  onChangeMenu(_item){
    console.log('menu name>>', _item);

    this.menuByFilterSubscribe = this.http.get(this.menu_api+ '?session=' + _item).subscribe(
      (res:any) => {
        
          this.menuList = res.return_data;
          console.log('this.menuList', this.menuList);
        
    },
    errRes => {
    }
    );
  }
  // Menu change end

  // ..... open modal start ......
    async openModalForm(_identifier, _item, _items) {
      // console.log('_identifier >>', _identifier);
      let open_modal;
      let myclass;
      if(_identifier == 'signIn'){
        myclass = 'mymodalClass signin';
      }else{
        myclass = 'mymodalClass';
      }

      open_modal = await this.modalController.create({
        component: AddCommonModelPage,
        cssClass: myclass,
        componentProps: { 
          identifier: _identifier,
          modalForm_item: _item,
          modalForm_array: _items
        }
      });
      
      // modal data back to Component
      open_modal.onDidDismiss()
      .then((getdata) => {
        // console.log('getdata >>>>>>>>>>>', getdata);
        if(getdata.data == 'submitClose'){
          /* this.onListData(this.listing_url, this.displayRecord, this.pageNo, this.api_parms, this.searchTerm, this.cherecterSearchTerm, this.sortColumnName, this.sortOrderName, this.advanceSearchParms, this.urlIdentifire);  */
        }

      });

      return await open_modal.present();
    }
  // open modal end 

  // Cart value increment, decremrent start
  onChangeCart(_unicode, _identifire, _quantity, _tabname){
    console.log('menu _unicode>>', _unicode);
    console.log('menu _identifire>>', _identifire);
    console.log('menu _quantity>>', _quantity);

    // Authentication check
    this.authService.autoLogin().subscribe(resData => {
      console.log('resData +++++++++++=&&&&&& (autoLogin details page)>>>>>>>>>>>>>>', resData);
      if(!resData){
        // if not login
        this.openModalForm('signIn', '', '');
      }else{
        // if login
        let quantity:number;
        quantity = _quantity;
        console.log('menu quantity>>', quantity);

        if(_identifire == 'increment'){
          quantity++;
        }else if (_identifire == 'decrement'){
          quantity--;
        }
        console.log('menu quantity>@@>', quantity);

        this.http.get(this.cart_api+ '?submenu_id=' + _unicode+'&quantity='+quantity).subscribe(
          (res:any) => {
            if(res.return_status > 0){
              this.cartList = res.return_data;
              this.cart.editUser(quantity); 
              console.log('this.cartList', this.cartList);
              this.viewPageData();
              this.onChangeMenu(_tabname);
            }
          },
          errRes => {
          }
        );
      }
    });

      
  }
  // Cart value increment, decremrent end

  //---- rating click function call start ----
   ratingClicked: number;
   ratingComponentClick(clickObj: any): void {
     console.log('clickObj >>', clickObj);
     if (!!this.viewData) {
      this.viewData.rating = clickObj.rating;
     }
   }
  // --rating click function call  end--

  // ----------- destroy subscription start ---------
    ngOnDestroy() {
      if(this.viewPageDataSubscribe !== undefined){
        this.viewPageDataSubscribe.unsubscribe();
      }
      if(this.logoutDataSubscribe !== undefined){
        this.logoutDataSubscribe.unsubscribe();
      }
      if(this.menuByFilterSubscribe !== undefined){ 
        this.menuByFilterSubscribe.unsubscribe();
      }
      if(this.homePageDataSubscribe !== undefined){
        this.homePageDataSubscribe.unsubscribe();
      }
    }
  // destroy subscription end
}