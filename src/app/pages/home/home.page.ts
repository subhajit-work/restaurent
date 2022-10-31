import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ResponsiveService } from '../../services/responsive.service';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { IonContent, MenuController, Platform, AlertController, ModalController, NavController } from '@ionic/angular';

import { CommonUtils } from '../../services/common-utils/common-utils';
import { AddCommonModelPage } from '../../pages/modal/add-common-model/add-common-model.page';
import { environment } from '../../../environments/environment';
import { CartService } from 'src/app/services/cart.service';
import { AuthService } from 'src/app/services/auth/auth.service';

declare var $ :any; //jquary declear

/* tslint:disable */ 
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  @ViewChild(IonContent) content: IonContent;

  main_url = environment.apiUrl;
  file_url = environment.fileUrl;
  
  // variable
  public isMobile: Boolean;
  selectLoading;
  model: any = {};
  private bannerDataSubscribe : Subscription;
  private whyUsDataSubscribe : Subscription;
  private specialMenuDataSubscribe : Subscription;
  private commonPageDataSubscribe : Subscription;
  private contactByCompanySubscribe: Subscription;
  private formSubmitSubscribe: Subscription;
  private menuByFilterSubscribe: Subscription;
  private getListSubscribe: Subscription;
  homeLoadData;
  bannerDatas;
  whyUsDatas;
  specialMenuDatas;
  
  banner_url;
  whyUs_url;
  specialMenu_url;
  commonPageContent;
  companyByContact_api;
  selectLoadingDepend;
  setStartdate;
  getlistLoading;
  getlistData;
  form_submit_text = 'Submit';
  form_api;
  currentNumber = 0;
  isReadmoreCollapsed;
  user:number;
  newUser:number;
  menu_api;
  menuList;
  cart_api;
  cartList;
  timeSlotList;
  cartNumber:number;
  tokenNumber:number;
  allfiledcurrect = 'false';
  loginSuccess = 'false';
  form_api_check;
  fetchCartItems =[];
  urlName;

  constructor(
    private responsiveService : ResponsiveService,
    private http : HttpClient,
    private commonUtils : CommonUtils,
    private router : Router,
    private modalController : ModalController,
    private cart: CartService,
    private authService : AuthService,
    private plt: Platform,
    private alertController : AlertController,
    private navCtrl : NavController,
  ) {}

  // init
  ngOnInit() {
    this.cart.castUser.subscribe(loginCheck => this.cartNumber = loginCheck);
    this.cart.getToken.subscribe(tokenGet => this.tokenNumber = tokenGet);

    
    this.onResize();
    this.responsiveService.checkWidth();

    // common Data Fetch
    this.commonDataFetch();

    // menu url name
    this.menu_api = 'api/sessionmenulist';
    this.onChangeMenu('Special');

    // cart url name
    this.cart_api = 'api/addtocart';

    // form submit api add
    this.form_api = 'api/table_booking';
    this.form_api_check = 'api/check_booking';

    // disable date call
    this.dateDisable();
  }
 

  // scroll event detect
  isFixedHeader;
  onScrollHedearFix(event) {
    // console.log('scroll onnnnnnnnn', event.detail.scrollTop);
    if (event.detail.scrollTop > 35) {
      // console.log("scrolling down, hiding footer...iffffffffffff");
      this.isFixedHeader = true;
    } else {
      // console.log("scrolling up, revealing footer...elseeeeeeeeeeeeeee");
      this.isFixedHeader = false;
    };
  }

  onResize() {
    this.responsiveService.getMobileStatus().subscribe(isMobile => {
      this.isMobile = isMobile;
      // console.log('this.isMobile >', this.isMobile);
    });
  }

  // ion View Will Enter call
  ionViewWillEnter() {

    // common Data Fetch
    this.commonDataFetch();

    // banner url name
    this.banner_url = 'api/banner' ;
    // Why us url name
    this.whyUs_url = 'api/why_choose_us';
    // specialMenu_url name
    this.specialMenu_url = 'api/specialmenulist';
    // company by contact api
    this.companyByContact_api = 'ajaxs_post/'

    // view data call
    this.commonUtils.getSiteInfoObservable.subscribe(res =>{
      console.log('getSiteInfoObservable res>>>>>>>>>>>>>>>>>>>.. >', res);
      if(res){
        this.bannerData();
        this.whyUsData();
        this.specialMenuData();
      }
    })

    
  }

  ionViewDidEnter(){
    // go to scroll top in mozila browser
    // this.content.scrollToTop(0);
  }

  // common data fetch
  commonDataFetch(){
    // get footer data from commoninfo api
    this.commonPageDataSubscribe = this.commonUtils.commonDataobservable.subscribe((res:any) =>{
      console.log('footer data res>>>>>>>>>>>>>>>>>>>.. >', res);
      if(res){
        this.commonPageContent = res;
        
      }
    })
    
  }

  public config = {
    animation: 'minima', 
     
    value: 5000,
    auto: true,
  }

  // ================== view data fetch start =====================
    // banner
    bannerData(){
      this.bannerDataSubscribe = this.http.get(this.banner_url).subscribe(
        (res:any) => {
          console.log("api/banner  data  res -------------------->", res.return_data);
          if(res.return_status > 0){
            this.bannerDatas = res.return_data;
          }
        },
        errRes => {

        }
      );
    }
    // why choose us
    whyUsData(){
      this.whyUsDataSubscribe = this.http.get(this.whyUs_url).subscribe(
        (res:any) => {
          console.log("api/why_choose_us data  res -------------------->", res.return_data);
          if(res.return_status > 0){
            this.whyUsDatas = res.return_data;
          }
        },
        errRes => {
          
        }
      );
    }
    // Special menu 
    specialMenuData(){
      this.specialMenuDataSubscribe = this.http.get(this.specialMenu_url).subscribe(
        (res:any) => {
          console.log("api/specialmenulist data  res -------------------->", res.return_data);
          if(res.return_status > 0){
            this.specialMenuDatas = res.return_data;
          }
        },
        errRes => {
          
        }
      );
    }
  // view data fetch end

  //----------- banner slick slider for angular start -----------
    title = 'ngSlick';
  
    slideConfig = {
      "slidesToShow": 1, 
      "slidesToScroll": 1,
      "nextArrow":"<div class='nav-btn next-slide'></div>",
      "prevArrow":"<div class='nav-btn prev-slide'></div>",
      "dots":true,
      "infinite": true,
      "autoplay": true,
      "speed": 1000,
      "fade": true,
      "cssEase": 'linear',
    };

    notificationConfig = {
      "slidesToShow": 1, 
      "slidesToScroll": 1,
      "infinite": true,
      "autoplay": true,
      "speed": 1000,
      "fade": true,
      "cssEase": 'linear',
    };
    
    slickInit(e) {
      // console.log('........ slick initialized ......');
    }
    
    breakpoint(e) {
      // console.log('breakpoint');
    }
    
    afterChange(e) {
      // console.log('afterChange');
    }
    
    beforeChange(e) {
      // console.log('beforeChange');
    }
  //--banner slick slider for angular end--

  //----------- note slick slider for angular start -----------
  specialMenuConfig = {
    "slidesToShow": 3, 
    "slidesToScroll": 1,
    "nextArrow":"<div class='nav-btn next-slide'></div>",
    "prevArrow":"<div class='nav-btn prev-slide'></div>",
    "dots":false,
    "infinite": true,
    "autoplay": false,
    "speed": 500,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]

  };
  //--note slick slider for angular end--

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

  goToPage(_url, _item){
    console.log('goToPage _url >', _url);
    console.log('goToPage _item >', _item);
    // this.router.navigateByUrl(_url);

    this.urlName = _url+'/'+_item;

    this.navCtrl.navigateRoot(this.urlName);
    // _item.addClass = !_item.addClass;   
    
    /* this.main_menu.forEach(element => {
      element.addClass = false;
    }); */
    
    
  }


  //contactByCompany
  contactByCompany = function( _id , _name){
    this.selectLoadingDepend = true;
    this.contactByCompanySubscribe = this.http.get(this.companyByContact_api+ _name + '=' +_id +'&identifier=skill').subscribe(
      (res:any) => {
      this.selectLoadingDepend = false;

      if(res.return_status > 0){

        if(_name == 'return_getInterestWithData?degree'){
          this.interestList = res.return_data.interest;

          if (this.interestList == 0) {
            console.log('null>>>>>>>>>>>>');
            this.homePagesData();
          }
        }
      }
    },
    errRes => {
      this.selectLoadingDepend = false;
    }
    );
  }

  myFuncCalls = 0;
  loginCheck(){
    this.myFuncCalls++;

    if(this.myFuncCalls < 3) {
      this.ngOnInit();
    }
  }

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
              if(_tabname == 'Specialties'){
                this.specialMenuData();
              }else{
                this.onChangeMenu(_tabname);
              }
              
              
            }
          },
          errRes => {
          }
        );
      }
    });
    
      
  }
  
  // Cart value increment, decremrent end
  

  // date picker start
  onChangeDateTime(_val){
    console.log('get seleted time >', _val);
    this.model.time_preffer = _val;
    // getlist data
    this.getlist('api/timeslot/getlist?date='+_val);
  }

  datePickerObj:any = {};
  dateDisable(){

    let curentDate = new Date();
    this.setStartdate = moment(curentDate).format('DD-MM-YYYY');

    this.datePickerObj = {
      disableWeekDays: [0],
      dateFormat: 'DD-MM-YYYY', // default DD MMM YYYY
      closeOnSelect: true,
      yearInAscending: true,
      fromDate: new Date(curentDate),
    };


  }
  // date picker end

  //--------------  getlist data fetch start -------------
  getlist(_getlistUrl){
    this.plt.ready().then(() => {
      this.getlistLoading = true;
      this.getListSubscribe = this.commonUtils.getlistCommon(_getlistUrl).subscribe(
        resData => {
          console.log('getlist>>', resData );
          this.getlistLoading = false;
          this.getlistData = resData;
          this.timeSlotList = resData.booking_time;

          
        },
        errRes => {
          this.getlistLoading = false;
        }
      );
    });
  }
  // getlist data fetch end

  // Seat availability checking start
  onCheckBooking(form:NgForm) {
    console.log("onChangeformData selected _form >", form.value);

    let fd = new FormData();

    for (let val in form.value) {
      if(form.value[val] == undefined){
        form.value[val] = '';
      }
      fd.append(val, form.value[val]);
    };

    console.log('value >', fd);

    this.formSubmitSubscribe = this.http.post(this.form_api_check, fd).subscribe(
      (response:any) => {

        console.log("add form response >", response);

        if(response.return_status > 0){
          // this.commonUtils.presentToast(response.return_message);
          this.commonUtils.presentToast('success', response.return_message);
          this.allfiledcurrect = 'true';
        }else if (response.return_status == 0){
          this.model.acceptTerms = false;
        }else{
          this.form_submit_text = 'Submit';
        }
        console.log("add form this.allfiledcurrect >", this.allfiledcurrect);
      },
    );
  }
  // Seat availability checking end

  //================ Authenticate or not button click start ==================

  // ..... userAuthenticate modal start ......
    async userAuthenticateModal(_identifier, _item, _items) {
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
        console.log('getdata >>>>>>>>>>>', getdata);
        if(getdata.data == 'submitClose'){
          /* this.onListData(this.listing_url, this.displayRecord, this.pageNo, this.api_parms, this.searchTerm, this.cherecterSearchTerm, this.sortColumnName, this.sortOrderName, this.advanceSearchParms, this.urlIdentifire);  */
        }

      });

      return await open_modal.present();
    }
    // userAuthenticate modal end 
  // ----------- Authenticate or not button click end ------


  // ======================== form submit start ===================
    clickButtonTypeCheck = '';
    form_submit_text_save = 'Save';
    form_submit_text_save_another = 'Save & Add Another' ;

    // click button type 
    clickButtonType( _buttonType ){
      this.clickButtonTypeCheck = _buttonType;
    }

    onSubmit(form:NgForm){
      console.log("add form submit >", form.value);
      
      this.authService.autoLogin().subscribe(resData => {
        console.log('resData +++++++++++=&&&&&& (autoLogin details page)>>>>>>>>>>>>>>', resData);
        if(!resData){
          // if not login
          this.model.acceptTerms = false;
          this.loginSuccess = 'false';
          this.userAuthenticateModal('signIn', '', '');
        }else{
          // if login
          this.loginSuccess = 'true';
          this.form_submit_text = 'Submitting';

          // get form value
          let fd = new FormData();
          for (let val in form.value) {
            if(form.value[val] == undefined){
              form.value[val] = '';
            }
            fd.append(val, form.value[val]);
          };

          console.log('value >', fd);

          if(!form.valid){
            return;
          }

          this.formSubmitSubscribe = this.http.post(this.form_api, fd).subscribe(
            (response:any) => {

              console.log("add form response >", response);

              if(response.return_status > 0){

                this.form_submit_text = 'Submit';

                // this.commonUtils.presentToast(response.return_message);
                this.commonUtils.presentToast('success', response.return_message);

                this.model = {};
                this.onClickDeleteItem('Food Order', response.return_data.ref_code);
                
              }
            },
            errRes => {
              this.form_submit_text = 'Submit';
            }
          );
        }
      });
      

    }
  // form submit end

  // ---------------- Click Delete Item start ---------------------
  deleteLodershow = false; 
  alldeleteLoaderShow = false;
  async onClickDeleteItem(_identifire, _item){
    console.log('_identifire',_identifire);
    console.log('_item',_item);
    
    const alert = await this.alertController.create({
      cssClass: 'success-alert',
      header: 'Complete',
      message: 'Your booking token number is:- '+_item+'. Do you want to order some food along with this booking?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'popup-cancel-btn',
          handler: (blah) => {
            // console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Yes',
          cssClass: 'popup-ok-btn',
          handler: () => {
            console.log('Confirm Yes: blah');
            this.router.navigateByUrl(`checkout/${_item}`);
            

          } 
        }
      ]
    });

    await alert.present();

  }
  // Click Delete Item end

  // ----------- destroy subscription ---------
  ngOnDestroy() {
    if(this.commonPageDataSubscribe !== undefined){
      this.commonPageDataSubscribe.unsubscribe();
    }
    if(this.bannerDataSubscribe !== undefined){
      this.bannerDataSubscribe.unsubscribe();
    }
    if(this.whyUsDataSubscribe !== undefined){
      this.whyUsDataSubscribe.unsubscribe();
    }
    if(this.specialMenuDataSubscribe !== undefined){
      this.specialMenuDataSubscribe.unsubscribe();
    }
    if(this.menuByFilterSubscribe !== undefined){ 
      this.menuByFilterSubscribe.unsubscribe();
    }
    if(this.contactByCompanySubscribe !== undefined){ 
      this.contactByCompanySubscribe.unsubscribe();
    }
    if(this.formSubmitSubscribe !== undefined){
      this.formSubmitSubscribe.unsubscribe();
    }
    if(this.getListSubscribe !== undefined){
      this.getListSubscribe.unsubscribe();
    }
  }

}
