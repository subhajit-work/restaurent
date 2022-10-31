import { Component, Renderer, Renderer2, Inject, OnInit } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ActivatedRoute, Router } from '@angular/router';
import {  MenuController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subscription, observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { DOCUMENT } from '@angular/platform-browser'; //use for fabicon


import { WOW } from 'wowjs/dist/wow.min'; //wow animation

import { AuthService } from './services/auth/auth.service';
import { CommonUtils } from './services/common-utils/common-utils';

import { environment } from '../environments/environment';

import { ResponsiveService } from './services/responsive.service'; //responive check

/* tslint:disable */ 
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {

  main_url = environment.apiUrl;
  file_url = environment.fileUrl;

  // variable define
  url_name;
  url_path_name;
  get_user_type;
  panelOpenState: boolean;
  userInfodDataLoading;
  private userInfoSubscribe: Subscription;
  private groupMenuDataSubscribe : Subscription;
  private userDataSubscribe : Subscription;
  menuPages = [];
  menuPagesList;
  menuPages2 = [];
  activeMenuHilight;
  selectedItemActive;
  parentSelectedIndex;
  childSelectedIndex;
  siteInfo : any;
  isActive : boolean = false;
  siteInfoLoading;
  checkAuthentication;
  headerData;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private activatedRoute : ActivatedRoute,
    private http : HttpClient,
    private authService : AuthService,
    private responsiveService : ResponsiveService,
    private menuCtrl: MenuController,
    private renderer: Renderer2,
    private router : Router,
    private navCtrl : NavController,
    private commonUtils: CommonUtils, // common functionlity come here
    @Inject(DOCUMENT) private _document: HTMLDocument //use for fabicon
  ) {
    
    this.authService.autoLogin().pipe(
      take(1)
    ).subscribe(resData => {
      console.log('resData +++++++++++++++++++++++++++++++=&&&&&& (autoLogin)>', resData);
      if(resData){
        this.checkAuthentication = true;
        this.initializeApp();
        // console.log('HAVEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
        this.onSiteInformation();
        this.userDataGet();
      }else{
        this.checkAuthentication = false;
        this.onSiteInformation();
        // console.log('NNNNNNNNNNNNNOT HAVEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
      }
    });
    

    // this.onSiteInformation();
    // this.initializeApp();

  }

  ngOnInit(){
    this.responsiveService.getMobileStatus().subscribe( isMobile =>{
      if(isMobile){
        // console.log('Mobile device detected');

        // menu show true
        this.menuCtrl.enable(true);
      }
      else{
        // console.log('Desktop detected');

        // menu show false
        this.menuCtrl.enable(false);
      }
    });
    this.onResize('');    
  }

  onResize(e){
    this.responsiveService.checkWidth();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      // wow initilize
      new WOW().init();

      // user data call
      this.userInfoData();
      
      // ----get current active url name start---
        this.activatedRoute.url.subscribe(activeUrl => {
          this.url_name = window.location.pathname;
          console.log('this.url_name app.componet.ts @@@>>', this.url_name.split('/')[1]);
        })
        
      //get current active url name end

      // observable data for all page url name get
      this.commonUtils.pagePathNameAnywhereObsv.subscribe(pathRes => {
        // console.log('common utility path page url name #### @@@@@@@ >>', pathRes);
        this.url_path_name = pathRes;
      });

    });
  }
  //------------------- menu item show start------------------------

  

  // menu data call
  mapped;
  userInfoData(){

    // console.log('main componentttttttttttttttttttttttttttttttttttttt');

    this.menuPages = [];
    this.userInfodDataLoading = false;

    this.commonUtils.getSiteInfoObservable
    .pipe(
      take(1)
    ).subscribe(res => {

      console.log('componet.ts Toke store >>>>>>>>>>>>>>>111', res);
      this.headerData = res;
      //--- auto login check for website start ---

      // this.authService.autoLoginWebsite();

      /* let aa = this.authService.autoLoginWebsite();
      aa.subscribe(res => {
      console.log('aa 22 >>>>>>>>>', res);
      }) */
      // auto login check for website end

      this.menuPages = [];


      const parsedUrl = new URL(window.location.href);
      const baseUrl = parsedUrl.hostname;
      //console.log('parsedUrl> ', parsedUrl);
      console.log('baseUrl> ', baseUrl); // this will print http://example.com or http://localhost:4200
      if(baseUrl == 'localhost' || baseUrl == '192.168.0.10'){
        this.site_url_name = 'https://www.online-restaurent.bongtechsolutions.com/#/home';
      }else{
        this.site_url_name = window.location.href;
      }
      

      this.userInfodDataLoading = true;
      this.userInfoSubscribe = this.http.get('api/commoninfo').subscribe(
        (response:any) => {
        this.userInfodDataLoading = false;
        if(response.return_status > 0){

          this.get_user_type = response.return_data.user_type;


          // pageTitle
          this._document.getElementById('pageTitle').innerHTML = response.return_data.sitedetails.name;

          // fabicon set
          // this._document.getElementById('appFavicon').setAttribute('href', this.file_url+'/'+response.return_data.sitedetails.favicon);

          
          this.commonUtils.setUserType(response.return_data.user_type);
          
          // this.commonUtils.menuPermissionService(response.return_data.menu_data.permission);

          this.commonUtils.getCommonDataService(response.return_data);

         
          // this.commonUtils.setSiteInfo(response.return_data.sitedetails);
          
          
          if(response.return_data.user_type == 'group'){
            // group login menu
            // this.groupMenuData();
            
          }else{
          // super admin menu

            this.menuPages = []; // menu array delete data first
           
            if(response.return_data.header){

              this.menuPagesList = response.return_data.header.main_menu;
              // this.menuPagesList = response.return_data.menu_data.side_menu.list;

              console.log('this.menuPagesList >>>>>>>>>>>>>>>>>>>>>>>>>', this.menuPagesList);
              console.log('this.menuPagesList response >>>>>>>>>>>>>>>>>>>>>>>>>', response.return_data);
              response.return_data.header.main_menu.forEach((val, ind) => {
                
                // object to array convert
                if(val.pages!= null && val.pages!= '' && val.pages != undefined){
                  this.mapped = Object.keys(val.pages).map(key => ({type: key, value: val.pages[key]}));
                }else{
                  this.mapped = undefined;
                }
                
                // if(val.module_access == 1){
                  this.menuPages.push({'value':val, 'pages':this.mapped});
                  
                // }

              });
              // console.log('mapped >', this.mapped);

              console.log("this.menuPages =====================>", this.menuPages);

              // --active menu start---
              this.panelOpenState = false;
              if(this.menuPages != undefined || this.menuPages != null ){

                // console.log('this.menuPages =############====>', this.menuPages);
                // console.log('val2.url @@@@ 11>>', this.url_name);

                this.menuPages.forEach((val, ind) => {
                  if(val.pages != null){
                    val.pages.forEach((val2, ind2) => {
                      if(this.url_path_name == val2.value.page_url.split('/')[1]){
                        val.isOpen = true;
                      }
                      /* else if(this.url_name.split('/')[1] == 'auth'){
                        this.menuCtrl.enable(false);
                      }else{
                        this.menuCtrl.enable(true);
                      } */
                    });
                  }
                })
              }
              //active menu end
            }
          }
          
        }

      },
      errRes => {
        this.userInfodDataLoading = false;
      }
      );
    });
  }

   // ============site information get start =============
   site_path;
   site_href;
   site_href_split;
   site_path_split;
   site_url_name;
   onSiteInformation(){
     // console.log('this.url_name app.componet.ts  pathname @@@>>',  window.location.pathname);
 
     this.site_path = window.location.pathname;
     this.site_href = window.location.href;
     this.site_href_split = window.location.href.split('/')[1];
     this.site_path_split = window.location.pathname.split('/')[1];
 
     // server print reasult///////
     /* site_path > /ci/xcelero/online/ 
     site_href > https://www.online-restaurent.bongtechsolutions.com/#/home 
     site_href_split > 
     site_path_split > ci  */
 
     const parsedUrl = new URL(window.location.href);
     const baseUrl = parsedUrl.hostname;
     //console.log('parsedUrl> ', parsedUrl);
     console.log('baseUrl> ', baseUrl); // this will print http://example.com or http://localhost:4200
     if(baseUrl == 'localhost' || baseUrl == '192.168.0.10'){
       this.site_url_name = 'https://www.online-restaurent.bongtechsolutions.com/#/home';
     }else{
       this.site_url_name = window.location.href;
     }

     console.log('wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww >', this.checkAuthentication);
     this.siteInfoLoading = true;
     this.groupMenuDataSubscribe = this.http.get('api/commoninfo')
     .pipe(
      take(1)
      ).subscribe(
       (res:any) => {
        //  console.log("site info  data  res =====================>", res);
         this.siteInfoLoading = false;
         if(res.return_status > 0){
           this.siteInfo = res.return_data;
           
          this.commonUtils.setSiteInfo(res.return_data);
          //  console.log('this.siteInfo >>', this.siteInfo);
 
           // initializeApp
           this.initializeApp();
         }
       },
       errRes => {
         this.siteInfoLoading = false;
       }
     );
   }

  // ================== view data fetch start =====================
  userDataGet(){
    this.userDataSubscribe = this.http.get('api/userinfo').pipe(
      take(1)
      ).subscribe(
      (res:any) => {
        // this.viewLoadData = false;
        console.log("view data  res -------------------header ss ->", res.return_data);
        if(res.return_status > 0){
          // this.get_user_dtls = res.return_data.studentinfo;

          // user details set
          this.commonUtils.onSigninStudentInfo(res.return_data.userinfo);
        }
      },
      errRes => {
        // this.viewLoadData = false;
      }
    );
  }
  // view data fetch end

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

}
