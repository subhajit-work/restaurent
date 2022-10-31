import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform, ModalController, AlertController, IonContent } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { CommonUtils } from '../../services/common-utils/common-utils';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { NgForm } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})


export class ContactPage implements OnInit, OnDestroy {

  @ViewChild(IonContent) content: IonContent;

  main_url = environment.apiUrl;
  file_url = environment.fileUrl;

  constructor(
    private plt: Platform,
    private modalController : ModalController,
    private storage: Storage,
    private router: Router,
    private activatedRoute : ActivatedRoute,
    private http : HttpClient,
    private alertController : AlertController,
    private commonUtils: CommonUtils // common functionlity come here
  ) { }

  // variable declartion section
  model: any = {};
  private getListSubscribe: Subscription;
  private uploadSubscribe: Subscription;
  private contactByCompanySubscribe: Subscription;
  private formSubmitSubscribe: Subscription;
  private editDataSubscribe: Subscription;
  private itemsSubscribe: Subscription;
  curentDate;
  commonPageData;
  // select checkbox end

  //--------------  getlist data fetch start -------------
    account
    accountList;
    lender
    lenderList;
    borrower;
    borrowerList;
    principle;
    interest;
    setStartdate;
    setEnddate;
    contact_by_company;
    servicesList;
    selectLoading;
    selectLoadingDepend;
    groupList;
    form_submit_text = 'Submit';
    form_api;
    companyByContact_api;
    uploadURL;
    interestCycle = '1';
    parms_action_name;
    parms_action_id;
    actionHeaderText;
    toggleShow;
    companyList;
    countryList;
    stateList;
    onEditField = 'PUT';
    onHiddenRole;
    editLoading;
    allEditData;
    gracedayList;
    getGraceDayCount;

    // ------ init function call start ------

      commonFunction(){

        // get active url name
        this.commonUtils.getPathNameFun(this.router.url.split('/')[1]);
        
        this.parms_action_name = this.activatedRoute.snapshot.paramMap.get('action');
        this.parms_action_id = this.activatedRoute.snapshot.paramMap.get('id');
        
        // getlist data
        //this.getlist('associate/getlist');

        if( this.parms_action_name == 'edit'){
          // form submit api edit
          this.form_api = 'api/get_in_tech'+this.parms_action_id;
        }else{
          // form submit api add
          this.form_api = 'api/get_in_tech'
        }

        // company by contact api
        this.companyByContact_api = 'contact_bycompany/'

        // file upload url
        this.uploadURL = `fileupload?identifier=internalsupportticket`;

        let curentDate = new Date();
        this.setStartdate = moment(curentDate).format('DD/MM/YYYY');

        setInterval(() => {
          this.curentDate = new Date();
        }, 1);

        // init call
        this.init();

        // get data from commoninfo api
        this.itemsSubscribe = this.commonUtils.commonDataobservable.subscribe((res:any) =>{
          console.log('commonPageData data res>>>>>>>>>>>>>>>>>>>.. >', res);
          if(res){
            this.commonPageData = res;
          }
        })


    }

    // init
    ngOnInit() {
    //  this.commonFunction();
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

    ionViewWillEnter() {
      this.commonFunction();
    }
    
    ionViewDidEnter(){
      // go to scroll top in mozila browser
      this.content.scrollToTop(0);
    }
    
    // ---------- init start ----------
    init(){
      
      if( this.parms_action_name == 'edit'){
        this.actionHeaderText = 'Edit';
        this.onEditField = 'PUT';
        this.editLoading = true;
        //edit data call
        this.editDataSubscribe = this.http.get(this.form_api).subscribe(
          (res:any) => {
            this.editLoading = false;
            console.log("Edit data  res >", res.return_data);
            if(res.return_status > 0){
              this.model = {
                company_category_id : res.return_data.company_category_id,
                name : res.return_data.name,
                skill : res.return_data.skill,
                city : res.return_data.city,
                contact_name : res.return_data.contact_name,
                contact_phone : res.return_data.contact_phone,
                contact_email : res.return_data.contact_email,
              };

              // edit data
              this.allEditData = res;
            }
          },
          errRes => {
            // this.selectLoadingDepend = false;
            this.editLoading = false;
          }
        );

      }else{
        this.actionHeaderText = 'Add';
        // this.reloadPage();
        
      }
    }
    // ---------- init end ----------

    // ----------------- file upload start -------------
      files: any = [];
      uploadResponseProgress;
      
      // file upload
      uploadFile(_type, e) {
        console.log('e >>>>>>>>>>>>>>>>>>>', e);
        if(_type == 'single'){
          this.files = [];
          let singleFile = e[0];
          this.goForUpload(this.uploadURL, singleFile, this.files);
        }else{
          for (let index = 0; index < e.length; index++) {
            const element = e[index];
            this.goForUpload(this.uploadURL, element, this.files);
          }  
        }
      }
      // goForUpload call
      goForUpload(_url, _getvalue, _filesArray){
        const fd = new FormData();
        fd.append('files', _getvalue, _getvalue.name);

        this.uploadSubscribe = this.http.post<any>(_url, fd, {
          reportProgress: true,
          observe: 'events'
          }).subscribe( event => {
            if(event.type === HttpEventType.UploadProgress){
              this.uploadResponseProgress = Math.round( event.loaded / event.total * 100 );
            }else if(event.type === HttpEventType.Response){
              // console.log('event.body >>>>>', event.body);
              event.body.return_data_mobile.files.id = '';
              _filesArray.push(event.body.return_data_mobile.files);
              this.uploadResponseProgress = 0;
            }
        })
      }
    // file upload end


    //-------------------- pdc file upload start-------------------------
      pdcFiles: any = [];
      pdcUploadResponseProgress = false;
      
      // file upload
      pdcUploadFile(_type, e) {
        this.pdcUploadResponseProgress = true;
        // console.log('e >>>>>>>>>>>>>>>>>>>', e);
        if(_type == 'single'){
          this.pdcFiles = [];
          let singleFile = e[0];
          this.goForUpload(this.uploadURL, singleFile, this.pdcFiles);
        }else{
          for (let index = 0; index < e.length; index++) {
            const element = e[index];
            this.goForUpload(this.uploadURL, element, this.pdcFiles);
          }  
        }
      }
    // pdc file upload end

    onChange(_item){
      console.log("dropdown selected item >", _item);
    }

    // select company
    OnChangeSelect(_item){
      this.contactByCompany(_item );
    }

    // Dropdown change
    hiring_partner = false;;
    onChangeselectDropdown(_id, _identifire){
      console.log('onChangeselectDropdown _id >', _id);
      console.log('onChangeselectDropdown _identifire >', _identifire);
      if(_id == 2){
        this.hiring_partner = true;
        this.model = {};
        this.model.company_category_id = _id;
      }else{
        this.hiring_partner = false;
        this.model = {};
        this.model.company_category_id = _id;

      }

    }

    //contactByCompany
    contactByCompany = function( _id ){
      this.selectLoadingDepend = true;
      this.contactByCompanySubscribe = this.http.get(this.companyByContact_api+_id).subscribe(
        res => {
        this.selectLoadingDepend = false;
        console.log("contactByCompany res >", res);
        this.contact_by_company = res.return_data.contact
      },
      errRes => {
        this.selectLoadingDepend = false;
      }
      );
    }

    getlist(_getlistUrl){
      this.plt.ready().then(() => {
        this.selectLoading = true;
        this.getListSubscribe = this.commonUtils.getlistCommon(_getlistUrl).subscribe(
          resData => {
            this.selectLoading = false;

            // this.onHiddenRole = resData.role.id;

            this.companyList = resData.associate_category_id;
            this.model.company_category_id = resData.associate_category_id[0].id;
          },
          errRes => {
            this.selectLoading = false;
          }
        );
      });
    }
  // getlist data fetch end

  // =================================== datepicker start =====================================
    datePickerObj: any = {
      dateFormat: 'DD/MM/YYYY', // default DD MMM YYYY
      closeOnSelect: true
    };

    // get selected date
    myFunction(){
      console.log('get seleted date');
    }

    // particular day disable
    disabledDates = [    
      new Date('2019-7-14'), // Short format
    ];

    startdatePickerObj:any = {};
    dateDisable(){
      // let myDate = new Date();

      // let getdd = myDate.getDate();
      // let getmm = myDate.getMonth()+1; 
      // let getyyyy = myDate.getFullYear();

      // disableFormDate = getyyyy + '-' + getmm + '-' + getdd;

      // ----- form date disable start ----
      let disableFormStartDate = new Date();
      let financial_day = new Date();
      let setDay = financial_day.setDate(1);
      let setMonth = financial_day.setMonth(3);
      let financial_disableStartDateFrom = moment(financial_day).format('YYYY-MM-DD');
      console.log('setMonth >>>>>>>>>>>>1', financial_day);
      console.log('disableFormStartDate >>>>>>>>>>>>1', financial_disableStartDateFrom);
      disableFormStartDate.setDate( disableFormStartDate.getDate() - 30);

      let disableStartDateFrom = moment(disableFormStartDate).format('YYYY-MM-DD');
      console.log("disableToDateSelect  FROM>", disableStartDateFrom);    
      // form date disable end

      // ----- form date disable start ----
      let disableTOStartDate = new Date();
      disableTOStartDate.setDate( disableTOStartDate.getDate() + 31);
      let disableTOStartDateTo = moment(disableTOStartDate).format('YYYY-MM-DD');
      console.log("disableTOStartDateTo  TO>", disableTOStartDateTo);    
      // form date disable end


      this.startdatePickerObj = {
        dateFormat: 'DD/MM/YYYY',
        closeOnSelect: true,
        yearInAscending: true,
        // fromDate: new Date(disableStartDateFrom),
        fromDate: new Date(financial_disableStartDateFrom),
        toDate: new Date(disableTOStartDateTo)
        // disabledDates: this.disabledDates
      };


    }
   
    

    onDateChangePriDate(_item){
      console.log('onDateChangePriDate >', _item);

      // ----- original date format convert start -----
        let myFormatDate = _item.split(" ")[0].split("/");
        let _mynewdate = myFormatDate[2] + "-" + myFormatDate[1] + "-" + myFormatDate[0];
      // original date format convert end

      // this.model.start_date = _item;
      this.model.start_date = '';
      this.startdatePickerObj = {
        dateFormat: 'DD/MM/YYYY', // default DD MMM YYYY
        // fromDate:moment(_item).format('YYYY-DD-MM'),
        fromDate: new Date(_mynewdate),
        closeOnSelect: true,
        yearInAscending: true
      };
    }

    /* endDatePickerObj: any = {
      dateFormat: 'DD/MM/YYYY',
      closeOnSelect: true
    }; */

    /* endDatePickerObj:any = {
      inputDate: new Date('2018-08-10'),
      dateFormat: 'DD/MM/YYYY', // default DD MMM YYYY
      closeOnSelect: true,
      yearInAscending: true
    }; */

    endDatePickerObj:any = {
      dateFormat: 'DD/MM/YYYY', // default DD MMM YYYY
      closeOnSelect: true,
      yearInAscending: true
    };

    principleReturnDatePickerObj:any = {
      dateFormat: 'DD/MM/YYYY', // default DD MMM YYYY
      closeOnSelect: true,
      yearInAscending: true
    };

    // radio button change
    
    radioButtonChange(_item){
      // if( this.parms_action_name == 'add'){
        if(_item){
          console.log('radioButtonChange >', _item);
          this.model.cycle_days = '';
          this.model.cycle_month = null;
          this.model.end_date = '';
          this.model.no_of_days = '';
          this.model.prncpl_rtrn_dt = '';
        }
      // }
    }

    // --- start date select ---
    getStartDate;
    onDateChangeStartDate(_item){
      if(_item){
        this.model.cycle_days = '';
        this.model.cycle_month = null;
        this.model.end_date = '';
        this.model.prncpl_rtrn_dt = '';
        this.model.no_of_days = '';

        // ----- original date format convert start -----
          let myFormatDate = _item.split(" ")[0].split("/");
          let _mynewdate = myFormatDate[2] + "-" + myFormatDate[1] + "-" + myFormatDate[0];
        // original date format convert end
    
        console.log('_item  start date select endDatePickerObj >>>', _item);
        // console.log("aaaaaaaaaaaaaaaaaaa1", moment(new Date()).format('YYYY-MM-DD'));
    
        this.getStartDate = _item;
        // this.model.start_date = _item;
    
        this.endDatePickerObj = {
          dateFormat: 'DD/MM/YYYY',
          // fromDate:moment(_item).format('YYYY-DD-MM'),
          fromDate: new Date(_mynewdate),
          closeOnSelect: true,
          yearInAscending: true
        };
      }
    }

    //----- end date select------
    noOfDays;
    onDateChangeEndDate(_cylceDay, _item){

      console.log('_item end  date _cylceDay @>>>', _cylceDay);
      console.log('_item end  date select @>>>', _item);
      console.log('_item start  date select >>>', this.getStartDate);

      let start_date = moment(this.getStartDate, 'DD/MM/YYYY');
      let end_date = moment(_item, 'DD/MM/YYYY');

      if(this.getStartDate == undefined){
        start_date = moment(this.setStartdate, 'DD/MM/YYYY');
      }else{
        start_date = moment(this.getStartDate, 'DD/MM/YYYY');
      }

      // this.model.no_of_days = end_date.diff(start_date, 'days');

      let getNoOfDays = end_date.diff(start_date, 'days');

      // console.log('this.noOfDays >>>>>>>', this.model.no_of_days );
      // console.log('getNoOfDays =====>', getNoOfDays);

      // grace day add
      for(let i = 0; i < this.gracedayList.length; i++){

        if(parseInt(this.gracedayList[i].start_day) <= _cylceDay && parseInt(this.gracedayList[i].end_day) >= _cylceDay){
          this.getGraceDayCount = this.gracedayList[i].increase_day;
          console.log('this.getGraceDayCount ===========%%%%%%%>', this.getGraceDayCount);

          // this.model.no_of_days = getNoOfDays + parseInt(this.getGraceDayCount);

          this.model.no_of_days = parseInt(_cylceDay) + parseInt(this.getGraceDayCount);

          console.log('this.model.no_of_days===========######>', this.model.no_of_days);


          // console.log('this.gracedayList[i].end_day >>>>>>>>>>>>>@@@@ >', this.gracedayList[i].increase_day);
          // console.log('this.noOfDays >>>>>>>', this.model.no_of_days );
          break;
          // return true;
        }else{
          this.model.no_of_days = parseInt(_cylceDay) + parseInt('0');
        }
      }


      //-----  principle return date select start ------
      if(_item){
        this.model.prncpl_rtrn_dt = _item;

        let myFormatDate1 = _item.split(" ")[0].split("/");
        let _mynewdate1 = myFormatDate1[2] + "-" + myFormatDate1[1] + "-" + myFormatDate1[0];
        console.log("_mynewdate1 >>", _mynewdate1);
        this.principleReturnDatePickerObj = {
          dateFormat: 'DD/MM/YYYY', // default DD MMM YYYY
          fromDate: new Date(_mynewdate1),
          closeOnSelect: true,
          yearInAscending: true
        };
      }
      //principle return date select end

    }
    //--------------- due Date Auto Calculate start --------------
    selectCycleDate;
    dueDateAutoCalculate(_item, _startDate){
      if(_item){

        // ----- original date format convert start -----
          let myFormatDate = _startDate.split(" ")[0].split("/");
          let _mynewdate = myFormatDate[2] + "-" + myFormatDate[1] + "-" + myFormatDate[0];
        // original date format convert end

        this.model.end_date = '';
        this.model.prncpl_rtrn_dt = '';
        this.model.no_of_days = '';

        console.log('due date select item -------------------22  >>', _item);
        //---- set day + count add start----
          this.selectCycleDate = new Date(_mynewdate);
          // this.selectCycleDate.setDate( this.selectCycleDate.getDate() + 3 );
          this.selectCycleDate.setDate( this.selectCycleDate.getDate() + parseInt(_item ));
          // alert('this.date >'+this.selectCycleDate);

          this.model.end_date = moment(this.selectCycleDate).format('DD/MM/YYYY');

          // no of day calculate
          this.onDateChangeEndDate(_item, this.model.end_date);

        //---- set day + count add end----
      }else{
        this.model.end_date = '';
        this.model.prncpl_rtrn_dt = '';
        this.model.no_of_days = '';
      }
    }
    // due Date Auto Calculate end

    //--------------- due Month Auto Calculate start --------------
    selectCycleDateMonth;
    dueMonthAutoCalculate(_item, _startDate){
      if(_item){

        // ----- original date format convert start -----
          let myFormatDate = _startDate.split(" ")[0].split("/");
          let _mynewdate = myFormatDate[2] + "-" + myFormatDate[1] + "-" + myFormatDate[0];
        // original date format convert end

        this.model.end_date = '';
        this.model.prncpl_rtrn_dt = '';
        this.model.no_of_days = '';

        console.log('due month select item >>', _item);
        //---- set month + count add start----
          this.selectCycleDateMonth = new Date(_mynewdate);
          // this.selectCycleDateMonth.setMonth( this.selectCycleDateMonth.getMonth() + 2);

          // this.selectCycleDateMonth.setMonth( this.selectCycleDateMonth.getMonth() + parseInt(_item));
          this.selectCycleDateMonth.setDate( this.selectCycleDateMonth.getDate() + (parseInt(_item) * 30));

          this.model.end_date = moment(this.selectCycleDateMonth).format('DD/MM/YYYY');

          // no of day calculate
          this.onDateChangeEndDate(_item*30, this.model.end_date);

        //---- set month + count add end----
      }else{
        this.model.end_date = '';
        this.model.prncpl_rtrn_dt = '';
        this.model.no_of_days = '';
      }
    }
    // due Date Auto Calculate end

    //----- no of day select ---
    onChangeNoOfDay(_item){
      console.log('no of day select >>>', _item);
      console.log('this.getStartDate >>>', this.getStartDate);
    } 

  //================================ datepicker  end ================================


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

            this.files = [];
            // this.commonUtils.presentToast(response.return_message);
            this.commonUtils.presentToast('success', response.return_message);

           
            // this.notifier.notify( type, 'aa' );
      
            if( this.parms_action_name == 'add'){
              // form.reset();
              this.model = {};
            }

            this.model = {};
            // select category id
            this.model.company_category_id = this.companyList[0].id;
            
          }
        },
        errRes => {
          this.form_submit_text = 'Submit';
        }
      );

    }
  // form submit end

  // delete uploaded file Aleart Start

    @ViewChild('fileInput') fileInputVariable: ElementRef;

    async deleteAlertConfirm(_itemsArray, _index) {
      const alert = await this.alertController.create({
        header: 'Delete',
        message: 'Do you really want to delete selected item ?',
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
              // console.log('Confirm Okay');
              _itemsArray.splice(_index, 1);
              this.fileInputVariable.nativeElement.value = "";

            }
          }
        ]
      });

      await alert.present();
    }
  // delete  Aleart End
  // Normal file upload
    fileVal;
    normalFileUpload(event) {
      this.fileVal =  event.target.files[0];
      this.model.image =  event.target.files[0].name;
    }
    fileCross(_item1){
      this.model.image = '';
      this.model.profile2 = '';
    }
  // Normal file upload end

  //----------- reload page start ------------
    reloadPage(){
    
     /*  this.model = {
        company_category_id : this.allEditData.return_data.company_category_id,
        name : this.allEditData.return_data.name,
        skill : this.allEditData.return_data.skill,
        city : this.allEditData.return_data.city,
        contact_name : this.allEditData.return_data.contact_name,
        contact_phone : this.allEditData.return_data.contact_phone,
        contact_email : this.allEditData.return_data.contact_email,
      }; */

      this.model = {};
        
     
    }
    // reload alert
    async reloadPageAlert() {
      const reload = await this.alertController.create({
        header: 'Clear',
        message: 'Do you really want to Clear?',
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
              // console.log('Confirm Okay');
              this.reloadPage();

            }
          }
        ]
      });

      await reload.present();
    }
  // reload page end
  // addItem
    addItem(_items){
      console.log('_items >', _items);
      this.commonUtils.addToItem(_items);
    }

    // remove item
    removeItem(index, event, items, action, isDefault){
      this.commonUtils.removeToItem(index, event, items, action, isDefault);
    }

  // ----------- destroy subscription start ---------
    ngOnDestroy() {
      if(this.getListSubscribe !== undefined){
        this.getListSubscribe.unsubscribe();
      }
      if(this.formSubmitSubscribe !== undefined){
        this.formSubmitSubscribe.unsubscribe();
      }
      if(this.contactByCompanySubscribe !== undefined){
        this.contactByCompanySubscribe.unsubscribe();
      }
      if(this.uploadSubscribe !== undefined){
        this.uploadSubscribe.unsubscribe();
      }
      if(this.editDataSubscribe !== undefined ){
        this.editDataSubscribe.unsubscribe();
      }
      if(this.itemsSubscribe !== undefined ){
        this.itemsSubscribe.unsubscribe();
      }
      
    }
  // destroy subscription end
}