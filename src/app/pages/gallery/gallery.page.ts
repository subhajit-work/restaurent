import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Platform, IonContent} from '@ionic/angular';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonUtils } from './../../services/common-utils/common-utils';

import { environment } from '../../../environments/environment';

declare var $ :any; //jquary declear
 
/* tslint:disable */ 

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.page.html',
  styleUrls: ['./gallery.page.scss'],
})

export class GalleryPage implements OnInit, OnDestroy {

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
  parms_action_id;
  listing_view_url;
  viewLoadData;
  viewData;
  get_user_dtls;

  constructor(
    private activatedRoute : ActivatedRoute,
    private router: Router,
    private http : HttpClient,
    private commonUtils : CommonUtils
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
    
    // view page url name
    this.listing_view_url = 'api/gallery';


    // user details get
    this.logoutDataSubscribe = this.commonUtils.signinStudentInfoObservable.subscribe(res => {
      console.log(' =========== HEADER  userdata observable  >>>>>>>>>>>', res);
      if(res){
        this.get_user_dtls = res;
      }else{
      
      }
    });

    // view data call   
    this.viewPageDataSubscribe = this.commonUtils.getSiteInfoObservable.subscribe(res =>{
      console.log('getSiteInfoObservable res>>>>>>>>>>>>>>>>>>>.. >', res);
      if(res){
        this.viewPageData(); 
      }
    })
  
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
          console.log("view data  res -------------------->", res.return_data);
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

  //----------- related product slick slider for angular start -----------
    /* relatedProductSlides = [
      {
        img: "assets/images/icon-1.jpg",
        title: "CAMPUS TO CORPORATE",
        eligible: 'For Freshers',
        content: 'ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod',
        course: 'Browse Courses',
        assessment : 'Start Assessment'
      },
      {
        img: "assets/images/icon-2.jpg",
        title: "CAMPUS TO CORPORATE",
        eligible: 'For Freshers',
        content: 'ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod',
        course: 'Browse Courses',
        assessment : 'Start Assessment'
      },
      {
        img: "assets/images/icon-1.jpg",
        title: "CAMPUS TO CORPORATE",
        eligible: 'For Freshers',
        content: 'ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod',
        course: 'Browse Courses',
        assessment : 'Start Assessment'
      },
      {
        img: "assets/images/icon-2.jpg",
        title: "CAMPUS TO CORPORATE",
        eligible: 'For Freshers',
        content: 'ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod',
        course: 'Browse Courses',
        assessment : 'Start Assessment'
      },
      {
        img: "assets/images/icon-2.jpg",
        title: "CAMPUS TO CORPORATE",
        eligible: 'For Freshers',
        content: 'ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod',
        course: 'Browse Courses',
        assessment : 'Start Assessment'
      }
    ]; */

    relatedProductSlideConfig = {
      "slidesToShow": 4, 
      "slidesToScroll": 1,
      "nextArrow":"<div class='nav-btn next-slide'></div>",
      "prevArrow":"<div class='nav-btn prev-slide'></div>",
      "dots":false,
      "infinite": true,
      "autoplay": true,
      "speed": 500,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 4,
            infinite: true,
          }
        },
        {
          breakpoint: 900,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
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
  //--related product slick slider for angular end--

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
    }
  // destroy subscription end
}