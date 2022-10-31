import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ModalController, Platform } from '@ionic/angular';
import { CommonUtils } from 'src/app/services/common-utils/common-utils';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AddCommonModelPage } from '../modal/add-common-model/add-common-model.page';
import { CartService } from 'src/app/services/cart.service';
@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})

export class SearchPage implements OnInit, OnDestroy {

  // @ViewChild(IonContent,{ static: true }) content: IonContent;
  
  // variable
  public isMobile: Boolean;
  skilsList;
  careersList;
  locationList;
  selectLoading;
  getlistLoading = true;
  model: any = {};
  private formSubmitSearchSubscribe: Subscription;
  private getListSubscribe : Subscription;
  private itemsSubscribe : Subscription;
  isSelected;
  checkedList = [];
  checkedListLocation = [];
  selectedLocationIds = [];
  fetchItems = [];
  isListLoading = false;
  listing_url;
  itemcheckClick = false;
  allselectModel;
  getlistData;
  checkinfinite;
  scrollRefreshEvent;
  parms_action_name;
  listing;
  searchItems;
  file_url = environment.fileUrl;
  main_url = environment.apiUrl;
  cart_api;
  cartList;
  cartNumber:number;
  tokenNumber:number;


  //---- list page variable --
  // pager object
  pager: any = {};
  pageNo = 1;
  // paged items
  pageItems: any[];
  listAlldata;
  // api parms
  api_parms: any = {};
  urlIdentifire = '';
  searchTerm:string = '';
  cherecterSearchTerm:string = '';
  sortColumnName = '';
  sortOrderName = '';
  advanceSearchParms = '';
  current_url_path_name;
  selectedindustryId;
  parms_action_name_category;
  getLangId;
  listing_view_url;

  // skeleton loading
  skeleton = [
    {},{},{},{},{},{},{},{},{},{}
  ]

  constructor(
    private http : HttpClient,
    private plt: Platform,
    private commonUtils : CommonUtils,
    private router: Router,
    private activatedRoute : ActivatedRoute,
    private authService : AuthService,
    private modalController : ModalController,
    private cart: CartService,
  ) {}

  // init
  ngOnInit() {
    this.onResize();
    
    this.cart_api = 'api/addtocart';

    // cart url name
    this.cart.castUser.subscribe(loginCheck => this.cartNumber = loginCheck);
    this.cart.getToken.subscribe(tokenGet => this.tokenNumber = tokenGet);
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

  onResize() {
    
  }

  // ion View Will Enter call
  ionViewWillEnter() {
    // this.parms_action_name = this.activatedRoute.snapshot.paramMap.get('action');

    // getlist data url name
    // this.getlist('skill/getlist');

    // list data url name
    this.listing_url = 'api/search';
    

    /* this.api_parms = {
      type:'frontend'
    } */
  
    //this.onListData(this.listing_url, this.displayRecord, this.pageNo, this.api_parms, this.searchTerm, this.advanceSearchParms, this.urlIdentifire, '', ''); 

  }

  // ---------  list data function ---------
    listDataItems:any[] = [];
    noDataFoundText;
    noDataFound;
    onListData(_list_url, _search) {
      this.plt.ready().then(() => {
        this.isListLoading = true;
        
        console.log('_list_url',_list_url);
        console.log('_search',_search);

        this.itemsSubscribe = this.http.post(_list_url+'?search='+ _search, '').subscribe(
          (response:any) => {
    
            console.log("add form response >", response);
            
            
            this.searchItems = response;
            
          },
        );
      });
    }

  // ------------searchbar start------------------
    searchList(event){
      console.log ('event', event);
      this.searchTerm = event.target.value;

      console.log ('this.searchTerm', this.searchTerm);

      if(this.searchTerm) {

        this.onListData(this.listing_url, this.searchTerm)
      }

    }
  // searchbar end

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
              this.onListData(this.listing_url, this.searchTerm)
              
            }
          },
          errRes => {
          }
        );
      }
    });
    
      
  }
  
  // Cart value increment, decremrent end



  // ----------- destroy subscription ---------
  ionViewDidLeave() {
    if(this.getListSubscribe !== undefined){
      this.getListSubscribe.unsubscribe();
    }
    if(this.itemsSubscribe !== undefined){
      this.itemsSubscribe.unsubscribe();
    }
    if(this.formSubmitSearchSubscribe !== undefined){
      this.formSubmitSearchSubscribe.unsubscribe();
    }
    console.log('Destroy Url');
  }
  ngOnDestroy() {
    if(this.getListSubscribe !== undefined){
      this.getListSubscribe.unsubscribe();
    }
    if(this.itemsSubscribe !== undefined){
      this.itemsSubscribe.unsubscribe();
    }
    if(this.formSubmitSearchSubscribe !== undefined){
      this.formSubmitSearchSubscribe.unsubscribe();
    }
  }

}