import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Storage } from '@ionic/storage';
import { MenuController, Platform, AlertController, ModalController } from '@ionic/angular';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';


import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth/auth.service';
import { AddCommonModelPage } from '../../pages/modal/add-common-model/add-common-model.page';

import { ResponsiveService } from '../../services/responsive.service';
import { AppComponent } from '../../app.component';
import { CommonUtils } from '../../services/common-utils/common-utils';
import { NavController } from '@ionic/angular';
import { CartService } from 'src/app/services/cart.service';

declare var $ :any; //jquary declear

/* tslint:disable */ 
@Component({
  selector: 'common-header',
  templateUrl: './common-header.component.html',
  styleUrls: ['./common-header.component.scss'],
})
export class CommonHeaderComponent implements OnInit, OnDestroy {

  cartNumber:number;
  newUser:number;
  
  main_url = environment.apiUrl;
  file_url = environment.fileUrl;

  form_api;
  model: any = {};
  private logoutDataSubscribe : Subscription;
  private formSubmitSearchSubscribe : Subscription;
  private autoCompliteSubscribe : Subscription;
  private homePageDataSubscribe : Subscription;
  private commonPageDataSubscribe : Subscription;
  private viewPageDataSubscribe: Subscription;
  public isMobile: Boolean;
  main_menu;
  side_main_menu;
  searchModel;
  form_api_logout;
  site_info_data;
  commondata;
  get_user_dtls;
  current_url_path_name;
  viewLoadData;
  listing_view_url;
  selectLoading;
  degreeList;
  interestList;
  default_degree_id;
  selectLoadingDepend;
  qual_interest_with_data;
  homeLoadData;
  homePageData;
  home_page_url;
  commonPageContent;
  show: boolean= true;
  message:string;
  viewData;

  constructor( 
    private authService: AuthService,
    private commonUtils : CommonUtils,
    private menuCtrl: MenuController,
    private http : HttpClient,
    private router: Router,
    private modalController : ModalController,
    private responsiveService : ResponsiveService,
    private platform : Platform,
    private storage: Storage,
    private alertController : AlertController,
    private appComponent : AppComponent,
    private navCtrl : NavController,
    private eRef: ElementRef,
    private cart: CartService
    ) { }

  // init
  ngOnInit() {

    this.cart.castUser.subscribe(user => this.cartNumber = user);

    console.log('Cart number>>>>>>>>>>', this.cartNumber);

    this.onResize();
    this.responsiveService.checkWidth();

    this.form_api_logout = 'api/logout'; //logout api call
    this.form_api = 'subscriber/return_add'; //subscriber api call

    this.listing_view_url = 'api/cart';

    // view page url name
    this.home_page_url = 'api/userinfo' ;

    // common Data Fetch
    this.commonDataFetch();

    this.viewPageData();

    // view data call
    this.commonUtils.getSiteInfoObservable.subscribe(res =>{
      console.log('getSiteInfoObservable res>>>>>>>>>>>>>>>>>>>.. >', res);
      this.commondata = res;
      if(res){
        
      }
    })

    // this.viewPageData();
    
    this.logoutDataSubscribe = this.authService.globalparamsData.subscribe(res => {
      console.log('(header)  globalparamsData res ssss >>>>>>>>>>>', res);
      if(res != null || res != undefined){
        this.get_user_dtls = res.user;
        console.log('this.get_user_dtls************', this.get_user_dtls);
        // this.viewPageData();

        this.homePagesData();

        // user details set
        this.commonUtils.onSigninStudentInfo(res.user);
      }
    });

    // user details get
    this.logoutDataSubscribe = this.commonUtils.signinStudentInfoObservable.subscribe(res => {
      console.log(' =========== HEADER  userdata observable  >>>>>>>>>>>', res);
      
      
      if(res){
        this.get_user_dtls = res;
      }else{
        this.get_user_dtls = '';
      }
    });


    // get header data from commoninfo api
    this.logoutDataSubscribe = this.commonUtils.commonDataobservable.subscribe((res:any) => {
      if(res != null || res != undefined){
        // console.log('header globalparamsData res HEADER >>>>>>>>>>>', res);
        
      }
    });


    // current url name
    this.current_url_path_name =  this.router.url.split('/')[1];
    // console.log('this.current_url_path_name ==== s>>', this.current_url_path_name);


  }
  //----- swipe menu call start -----
    onSwipMenu() {

      console.log('right side menu click');
      // this.userAuthenticateModal('signIn', '', '');
      
      $('.swipe').height($(window).height());
      if ($('body').hasClass('ind')) {
          $('.menu-toggle-button').removeClass('active');
          $('body').removeClass('ind');
          $('.swipe').stop(true).animate({
              'right': '-300'
          }, 500);
          $('.swipe').removeClass('open');
          $('body').removeClass('menu-overlay');
          $('.swipe-overlay').removeClass('active');
      } else {
          $('.menu-toggle-button').addClass('active');
          if ($('.icon-search').hasClass('active')) {
              $('.icon-search').toggleClass('active');
          }
          if ($('.main-wishlist-cart').hasClass('active')) {
              $('.main-wishlist-cart').removeClass('active');
              $('.cart-dropdown').stop(true).slideUp();
          }
          $('body').addClass('ind');
          $('.swipe-overlay').addClass('active');

          $('.swipe').addClass('open');
          $('body').addClass('menu-overlay');
          $('.swipe').stop(true).animate({
              'right': '0'
          }, 500);
      }
      $('.swipe-menu ul').find('li.parent').append('<strong></strong>');
      $(".swipe-menu ul li").click(function(event) {
          if (event.srcElement = event.currentTarget) {
              if ($(this).hasClass('active')) {
                  $(this).removeClass('active');
                  $(this).children("ul").stop(true).slideUp();
                  $(this).children('strong').removeClass('opened');
              } else {
                  $(this).siblings(0).removeClass('active');
                  $(this).siblings(0).find('ul').stop(true).slideUp();
                  $(this).siblings(0).find('strong').removeClass('opened');
                  $(this).addClass('active');
                  $(this).children("ul").stop(true).slideDown();
                  $(this).children('strong').addClass('opened');
              }
              event.stopPropagation();
          }
      });
    };

    // close swipe menu overlay click
    
  // swip menu call end

 

  onResize() {
    this.responsiveService.getMobileStatus().subscribe(isMobile => {
      this.isMobile = isMobile;
      const height = window.innerHeight;
      const width = window.innerWidth;

      // console.log('this.height >', height);
      // console.log('this.width >', width);
    });
  }

  ionViewWillEnter(){
    /* this.form_api = 'logout'; //logout api call
    this.authService.globalparamsData.subscribe(res => {
      console.log('header globalparamsData res >>>>>>>>>>>', res);
      if(res != null || res != undefined){
        this.get_user_dtls = res.user;
      }
    }); */

    // this.viewPageData();
    // common Data Fetch
    this.commonDataFetch();
  }
 
  menuEnable = true;
  toggleMenu() {
    this.menuEnable =! this.menuEnable;
    console.log('click menu button');
    this.menuCtrl.enable(this.menuEnable);
    // this.menuCtrl.toggle();
  }

  // -----logout function start-------

  loadingShow = false;
  logOutUser(){
    this.onLogout();
  }
  //logout function end-

  // common data fetch
  commonDataFetch(){
    // get footer data from commoninfo api
    this.commonPageDataSubscribe = this.commonUtils.commonDataobservable.subscribe((res:any) =>{
      console.log('footer data res>>>>>>>>>>>>>>>>>>>.. @@>', res);
      if(res){
        this.commonPageContent = res;

        if(res.header){
          this.main_menu = res.header.main_menu;
          this.side_main_menu = res.header.side_menu;
          this.site_info_data = res.sitedetails;
          // console.log('this.site_info_data ==================>', this.site_info_data );
        }
      }
    })
  }

  // ================== view data fetch start =====================
    homePagesData(){
      this.homeLoadData = true;
      this.homePageDataSubscribe = this.http.get(this.home_page_url).subscribe(
        (res:any) => {
          this.homeLoadData = false;
          
          console.log("HOME INFO  data  res -------------------->", res.return_data);
          if(res.return_status > 0){
            this.homePageData = res.return_data;

            // this.interestList = res.return_data.search_bar.qual_interest_with_data;
            /* this.homePageContent = res.return_data.variable;
            this.commonUtils.setFooterData(res.return_data); */
          }

        },
        errRes => {
          this.homeLoadData = false;
        }
      );
    }
  // view data fetch end

  // onLogout
  onLogout(){
    console.log('logout..................');
    // this.authService.logout();
    this.loadingShow = true;
    //edit data call
    this.logoutDataSubscribe = this.http.get(this.form_api_logout).subscribe(
      (res:any) => {
        this.loadingShow = false;
        console.log("Edit data  res >", res.return_data);
        if(res.return_status > 0){
          this.authService.logout();

          // user menu call
          // this.appComponent.userInfoData();

        }
      },
      errRes => {
        this.loadingShow = false;
      }
    );
  }

  // goProfilePageUrl
  goProfilePageUrl(){
    // ${url}/${id}`;
    // user id : this.get_user_dtls.id
    this.router.navigateByUrl(`add-user/edit/${this.get_user_dtls.id}`);
  }

  //----get storage user data start---------
    get_global_params = this.authService.getTokenSessionMaster();
  // get storage user data start end

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


  //  page go
  addClass: boolean = false;
  goToPage(_url, _item){
    console.log('goToPage _url >', _url);
    console.log('goToPage _item >', _item);
    // this.router.navigateByUrl(_url);

    this.navCtrl.navigateRoot(_url);
    // _item.addClass = !_item.addClass;   
    
    /* this.main_menu.forEach(element => {
      element.addClass = false;
    });

    if(_item){
      _item.addClass = true;
    } */
  }

  // ..... change Password modal start ......
  async changePasswordOpenModal(_identifier, _item, _items) {
    // console.log('_identifier >>', _identifier);
    let principle_modal;
      principle_modal = await this.modalController.create({
      component: AddCommonModelPage,
      cssClass: 'mymodalClass password',
      componentProps: { 
        identifier: _identifier,
        modalForm_item: _item,
        modalForm_array: _items
      }
    });
    
    // modal data back to Component
    principle_modal.onDidDismiss()
    .then((getdata) => {
      console.log('getdata >>>>>>>>>>>', getdata);
      if(getdata.data == 'submitClose'){
        /* this.onListData(this.listing_url, this.displayRecord, this.pageNo, this.api_parms, this.searchTerm, this.cherecterSearchTerm, this.sortColumnName, this.sortOrderName, this.advanceSearchParms, this.urlIdentifire);  */
      }

    });

    return await principle_modal.present();
  }
  // change Password   modal end 

  // ================== view data fetch start =====================
    viewPageData(){
      this.viewLoadData = true;
      this.viewPageDataSubscribe = this.http.get(this.listing_view_url).subscribe(
        (res:any) => {
          this.viewLoadData = false;
          
          console.log("viewData INFO  res -------------------->", res.return_data);
          this.viewData = res.return_data;
          
        },
        errRes => {
          this.viewLoadData = false;
        }
      );
    }
  // view data fetch end

  // ======================== search submit start ===================
    form_submit_text = 'Surging Employability';
    forms_api = 'skill/return_index';

    onSubmitSearch(form:NgForm){
      console.log("add form submit >", form.value);

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

      this.formSubmitSearchSubscribe = this.http.post(this.forms_api, fd).subscribe(
        (response:any) => {
          this.form_submit_text = 'Surging Employability';
          console.log("add form response >", response);

          if(response.return_status > 0){
            // this.commonUtils.presentToast(response.return_message);
            // this.commonUtils.presentToast('success', response.return_message);

            // this.notifier.notify( type, 'aa' );
              // form.reset();

              this.router.navigateByUrl(`skill-list?location=${form.value.location}&degree_id=${form.value.degree_id}&interest_id=${form.value.interest_id}`);

              // this.router.navigate([`skill-list?location='${form.value.location}'&degree_id='${form.value.degree_id}&interest_id=${form.value.interest_id}`], {replaceUrl: true});
            
          }
        },
        errRes => {
          this.form_submit_text = 'Surging Employability';
        }
      );

    }
  // search submit end

  //------------- autocomplite start------------
  inputChangedAuto;
  autoCompliteItem: any[] = [];
  testItem;
  isLoadingAutoComplite;

  onSelectAutoSelect(val: string) {
    this.inputChangedAuto = val;
    console.log('onSelectAutoSelect val >', val);
  }

  // configer
  autoCompliteConfig: any = {'placeholder': 'search', 'sourceField': ['name']};

  autoCompliteSearch (term: string) {
   console.log('autoCompliteSearch term >', term);
    this.isLoadingAutoComplite = true;
    this.autoCompliteSubscribe = this.http.get(`skill/return_index?search=${term}`).subscribe(
      (res:any) => {
        this.isLoadingAutoComplite = false;
        if(res.return_status > 0){
          this.autoCompliteItem = res.return_data.data;
          console.log('autoCompliteSearch  res >', this.autoCompliteItem);
        }
    },
    errRes => {
      this.isLoadingAutoComplite = false;
    }
    );
  }
//-- auto complite end--

// On change degree start

onChangeDegree(_id, _identifire){

  let identy;
  if(_identifire == 'degree'){
    identy = 'return_getInterestWithData?degree';

    this.model.interest_id = null;
  }

} 
// On change degree end


// category click got to skill page for filter data
goToFilterPage(_identifire, _id){
  this.router.navigateByUrl(`skill-list?interest_id=${_id}`);
}


  // click outside menu then should be close start
  @HostListener('document:click', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  handleOutsideClick(event) {
    // Some kind of logic to exclude clicks in Component.
    // This example is borrowed Kamil's answer
    /* if (!this.eRef.nativeElement.contains(event.target) ){
    
    } */
  }
  // click outside menu close end

  // ----------- destroy subscription start ---------
  ngOnDestroy() {
    if(this.logoutDataSubscribe !== undefined){
      this.logoutDataSubscribe.unsubscribe();
    }
    if(this.formSubmitSearchSubscribe !== undefined){
      this.formSubmitSearchSubscribe.unsubscribe();
    }
    if(this.autoCompliteSubscribe !== undefined){
      this.autoCompliteSubscribe.unsubscribe();
    }
    if(this.homePageDataSubscribe !== undefined){
      this.homePageDataSubscribe.unsubscribe();
    }
    if(this.commonPageDataSubscribe !== undefined){
      this.commonPageDataSubscribe.unsubscribe();
    }
    if(this.viewPageDataSubscribe !== undefined){
      this.viewPageDataSubscribe.unsubscribe();
    }
  }
// destroy subscription end
}
