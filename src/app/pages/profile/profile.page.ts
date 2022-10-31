import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Platform, IonContent, ModalController, AlertController} from '@ionic/angular';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonUtils } from './../../services/common-utils/common-utils';

import { environment } from '../../../environments/environment';
import { AddCommonModelPage } from '../modal/add-common-model/add-common-model.page';

declare var $ :any; //jquary declear
 
/* tslint:disable */ 

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})

export class ProfilePage implements OnInit, OnDestroy {

  @ViewChild(IonContent) content: IonContent;

  main_url = environment.apiUrl;
  file_url = environment.fileUrl;

  // variable declartion section
  model: any = {};
  isListLoading = false;
  page = 1;
  noDataFound = true;
  fetchItems=[];
  tableHeaderData;
  tableHeaderDataDropdown;
  current_url_path_name;
  private viewPageDataSubscribe: Subscription;
  private logoutDataSubscribe : Subscription;
  private ratingSubscribe : Subscription;
  private deleteListSubscribe: Subscription;
  parms_action_id;
  listing_view_url;
  viewLoadData;
  viewData;
  get_user_dtls;
  cancel_booking_path;
  invoice_download_path;
  export_url;
  intRating = 3;
  intRatingId = '1';
  delete_url;
  alertHeader;
  alertMsg;

  constructor(
    private activatedRoute : ActivatedRoute,
    private router: Router,
    private http : HttpClient,
    private commonUtils : CommonUtils,
    private modalController : ModalController,
    private alertController : AlertController
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
    this.listing_view_url = 'api/userinfo';

    // Cancel booking path
    this.cancel_booking_path = 'api/booking/cancel';

    

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


  // Cancel booking 
  onCancelBooking(booking_unicode, reason, user_uicode) {
    console.log("booking_unicode -------------------->", booking_unicode);
    console.log("reason -------------------->", reason);
    console.log("user_uicode -------------------->", user_uicode);

    this.http.get(this.cancel_booking_path+'?booking_uniqcode='+booking_unicode+'&user_uniqcode='+user_uicode).subscribe(
      (res:any) => {
        console.log("onCancelBooking -------------------->", res.return_data);
        if(res.return_status > 0){
          this.commonUtils.presentToast('success', res.return_message);
          this.viewPageData();
        }
      },
      errRes => {
        this.viewLoadData = false;
      }
    );

  }

  // Download Invoice
  onDownloadInvoice(booking_unicode, _api) {

    // Download Invoice path
    this.invoice_download_path = _api;


    this.http.get(this.invoice_download_path+'?uniqcode='+booking_unicode).subscribe(
      (res:any) => {
        
        // window.open(this.export_url);
        if(res.return_status > 0){
          this.commonUtils.presentToast('success', res.return_message);
        }
      },
      errRes => {
        this.viewLoadData = false;
      }
    );
    this.export_url = this.file_url+'/'+this.invoice_download_path+'?uniqcode='+booking_unicode;
    console.log("export_url -------------------->", this.export_url);
    window.open(this.export_url);
  }

  //---- rating click function call  start ----
  ratingClicked: number;
  ratingComponentClick(clickObj: any, _link): void {
    console.log('clickObj >>', clickObj);
    console.log('click_link >>', _link);
    const item = this.fetchItems.find(((i: any) => i.id === clickObj.itemId));
    if (!!item) {
      item.rating = clickObj.rating;
    }

    this.ratingSubscribe = this.http.post(_link+'?uniqcode='+clickObj.itemId+'&rating='+clickObj.rating,'rating').subscribe(
    (res:any) => {
      if(res.return_status > 0){

        this.commonUtils.presentToast('success', res.return_message);
      }else{
        this.commonUtils.presentToast('error', res.return_message);
      }
    }); 
  }
  // --rating click function call  end--

  // ..... address add edit modal start ......
  async addressEditAdd(_identifier, _item, _items) {
    console.log('_identifier >>', _identifier);
    console.log('_item >>', _item);
    console.log('_items >>', _items);
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
      // console.log('getdata >>>>>>>>>>>', getdata);
      if(getdata.data){
        console.log('getdata >>>>>>>>>>>', getdata);
        this.commonFunction();
        if(getdata.data == 'edit_updated'){
          console.log('getdata >>>>>>>@@>>>>', getdata);
          window.location.reload();
        }
        /* this.onListData(this.listing_url, this.displayRecord, this.pageNo, this.api_parms, this.searchTerm, this.cherecterSearchTerm, this.sortColumnName, this.sortOrderName, this.advanceSearchParms, this.urlIdentifire);  */
      }

    });

    return await principle_modal.present();
  }
  // address add edit  modal end 
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

  // ---------------- Click Delete Item start ---------------------
    deleteLodershow = false; 
    alldeleteLoaderShow = false;
    async onClickDeleteItem(_identifire, _item, _items){

      if(_items == 'delete') {
        this.alertHeader = 'Delete';
        this.alertMsg = 'Do you really want to delete this address?';
        // Delete url path
        this.delete_url = _identifire;
      }else if(_items == 'cancel'){
        this.alertHeader = 'Cancel';
        this.alertMsg = 'Do you really want to Cancel this order?';
        // Delete url path
        this.delete_url = _identifire;
      }

      const alert = await this.alertController.create({
        header: this.alertHeader,
        message: this.alertMsg,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'popup-cancel-btn',
            handler: (blah) => {
              // console.log('Confirm Cancel: blah');
            }
          }, {
            text: 'Ok',
            cssClass: 'popup-ok-btn',
            handler: () => {

              // ------------  item delete start ------------
                // console.log('Confirm Okay');
                let fd = new FormData();
                fd.append('_method', 'DELETE');

                this.deleteLodershow = true;
                this.deleteListSubscribe = this.http.post(this.delete_url+'?uniqcode='+_item,fd).subscribe(
                (res:any) => {
                  this.deleteLodershow = false;
                  if(res.return_status > 0){

                    this.commonUtils.presentToast('success', res.return_message);
                    this.viewPageData();
                  }else{
                    this.commonUtils.presentToast('error', res.return_message);
                  }
                }); 
              // ------------ item delete end ------------
              

            }
          }
        ]
      });

      await alert.present();

    }
  // Click Delete Item end

  // ----------- destroy subscription start ---------
    ngOnDestroy() {
      if(this.viewPageDataSubscribe !== undefined){
        this.viewPageDataSubscribe.unsubscribe();
      }
      if(this.logoutDataSubscribe !== undefined){
        this.logoutDataSubscribe.unsubscribe();
      }
      if(this.deleteListSubscribe !== undefined){
        this.deleteListSubscribe.unsubscribe();
      }
      if(this.ratingSubscribe !== undefined){
        this.ratingSubscribe.unsubscribe();
      }
    }
  // destroy subscription end
}