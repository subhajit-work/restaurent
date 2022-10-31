import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Platform, IonContent, AlertController, ModalController} from '@ionic/angular';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonUtils } from './../../services/common-utils/common-utils';

import { environment } from '../../../environments/environment';
import { NgForm } from '@angular/forms';
import { AddCommonModelPage } from '../modal/add-common-model/add-common-model.page';
import { AuthService } from 'src/app/services/auth/auth.service';

declare var $ :any; //jquary declear
 
/* tslint:disable */ 

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.page.html',
  styleUrls: ['./reservation.page.scss'],
})

export class ReservationPage implements OnInit, OnDestroy {

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
  private getListSubscribe: Subscription;
  private formSubmitSubscribe: Subscription;
  parms_action_id;
  get_user_dtls;
  setStartdate;
  getlistLoading;
  getlistData;
  timeSlotList;
  form_api_check;
  form_api;
  allfiledcurrect = 'false';
  form_submit_text = 'Submit';
  loginSuccess = 'false';
  fetchCartItems =[];
  selectLoading;

  constructor(
    private activatedRoute : ActivatedRoute,
    private router: Router,
    private http : HttpClient,
    private commonUtils : CommonUtils,
    private alertController : AlertController,
    private plt: Platform,
    private modalController : ModalController,
    private authService : AuthService,
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

    // form submit api add
    this.form_api = 'api/table_booking';
    this.form_api_check = 'api/check_booking';

    // disable date call
    this.dateDisable();
    
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


  

  // ----------- destroy subscription start ---------
    ngOnDestroy() {
      if(this.viewPageDataSubscribe !== undefined){
        this.viewPageDataSubscribe.unsubscribe();
      }
      if(this.logoutDataSubscribe !== undefined){
        this.logoutDataSubscribe.unsubscribe();
      }
      if(this.formSubmitSubscribe !== undefined){
        this.formSubmitSubscribe.unsubscribe();
      }
      if(this.getListSubscribe !== undefined){
        this.getListSubscribe.unsubscribe();
      }
    }
  // destroy subscription end
}