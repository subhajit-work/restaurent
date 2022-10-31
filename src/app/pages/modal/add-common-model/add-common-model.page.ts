import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalController, Platform, NavParams, LoadingController } from '@ionic/angular';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import * as moment from 'moment';
import { Observable, Subscription, from } from 'rxjs';
import { take } from 'rxjs/operators';


import { CommonUtils } from '../../../services/common-utils/common-utils';
import { environment } from '../../../../environments/environment';

// for login
import { AuthService } from '../../../services/auth/auth.service';
import { CartService } from 'src/app/services/cart.service';


/* tslint:disable */ 
@Component({
  selector: 'app-add-common-model',
  templateUrl: './add-common-model.page.html',
  styleUrls: ['./add-common-model.page.scss'],
})
export class AddCommonModelPage implements OnInit, OnDestroy {
  
  main_url = environment.apiUrl;
  file_url = environment.fileUrl;
  
  // variable declar
  model: any = {};
  form_submit_text = 'Submit';
  private formSubmitSubscribe: Subscription;
  private editDataSubscribe: Subscription;
  private getListSubscribe: Subscription;
  private viewPageDataSubscribe: Subscription;
  setStartdate;
  api_url;

  get_identifier;
  get_item;
  get_array;
  heder_title;
  onEditField = 'PUT';
  jobApplyStatus = 'true';
  hide = true;
  showSubmitButton = true;
  previewOtherUrl;
  principleStartdate;
  get_identifier_type;
  onHiddenFieldIdentifire;
  get_hidden_type;
  onHiddenFieldStatus;
  selectLoading;
  site_url_name;
  senduserId;
  senduserIdStatus = false;
  viewData;
  parentList;
  isLoading = false;
  cart_api;
  cartList;

  uploadURL;
  reviewUniqcode;
  viewLoadData;
  listing_view_url;
  otherUrlData;
  reviewMsg;
  cartNumber:number;
  tokenNumber:number;

  // @Input() identifire;
  
  constructor(
    private plt: Platform,
    private modalController : ModalController,
    private http : HttpClient,
    private navParams : NavParams,
    private commonUtils: CommonUtils, // common functionlity come here
    private authService:AuthService,
    private loadingController: LoadingController,
    private cart: CartService,
  ) { }

  private uploadSubscribe: Subscription;

  ngOnInit() {

    this.cart.castUser.subscribe(loginCheck => this.cartNumber = loginCheck);
    this.cart.getToken.subscribe(tokenGet => this.tokenNumber = tokenGet);

    // today select
    let curentDate = new Date();
    this.setStartdate = moment(curentDate).format('DD/MM/YYYY');

    // this.model.setStartdate = moment(curentDate).format('DD/MM/YYYY');

    this.get_identifier =  this.navParams.get('identifier');
    this.get_identifier_type =  this.navParams.get('identifier_type');
    this.get_hidden_type =  this.navParams.get('hidden_type');

    this.get_item =  this.navParams.get('modalForm_item');
    this.get_array =  this.navParams.get('modalForm_array');
    console.log('this.get_item >>>>>>>>>>>>>>', this.get_item);

    if(this.get_identifier == 'signUp')
    {
      this.heder_title = 'Sign Up';
      this.onEditField = 'PUT';
      this.api_url = 'api/signup';
    }else if(this.get_identifier == 'signIn'){
      this.heder_title = 'Sign In';
      this.onEditField = 'PUT';
      this.api_url = 'api/signin';
    }else if(this.get_identifier == 'forgotPassword'){
      this.heder_title = 'Forgot Password';
      this.onEditField = 'PUT';
      this.api_url =  'api/forgotpassword';
    }else if(this.get_identifier == 'change_password_modal'){
      this.heder_title = 'Change Password';
      this.onEditField = 'PUT';
      this.api_url = 'api/changepassword';
    }else if(this.get_identifier == 'addMenu'){
      this.heder_title = 'Delicious Food Menu';
      this.onEditField = 'PUT';
      // this.api_url = 'api/changepassword';
      // cart url name
      this.cart_api = 'api/addtocart';
      this.listing_view_url = this.get_array;
      this.viewPageData();
    }else if(this.get_identifier == 'termsAndCondition'){
      this.heder_title = 'Terms & Conditions';
      this.onEditField = 'PUT';
      // this.api_url = 'api/changepassword';
      // cart url name
      // this.cart_api = 'api/cms';
      this.listing_view_url = this.get_array;
      this.viewPageData();
    }else if(this.get_identifier == 'edit_profile'){
      this.heder_title = 'Edit profile';
      this.onEditField = 'PUT';
      this.api_url = 'api/profileupdate';
      this.form_submit_text = 'Update';
      this.listing_view_url = 'api/profileedit';
      this.viewPageData();
    }else if(this.get_identifier == 'review'){
      
      if(this.get_item.review){ 
        this.heder_title = 'Edit review';
        this.onEditField = 'PUT';
        this.api_url = 'api/update_review';
        this.form_submit_text = 'Submit';
        this.reviewMsg = this.get_item.review.message;
        this.reviewUniqcode = this.get_item.review.uniqcode;
      }else if(!this.get_item.review && this.get_array == 'api/order_review') {
        this.heder_title = 'Add review';
        this.api_url = this.get_array;
        this.form_submit_text = 'Submit';
      }else if(!this.get_item.review && this.get_array == 'api/booking_review') {
        this.heder_title = 'Add review';
        this.api_url = this.get_array;
        this.form_submit_text = 'Submit';
      }
    }else if(this.get_identifier == 'address_add'){
      if(this.get_array == 'add'){
        this.heder_title = 'Add delivery address';
        this.onEditField = 'PUT';
        this.api_url = 'api/add_address';
      }else{
        this.heder_title = 'Edit delivery address';
        this.onEditField = 'PUT';
        this.api_url = 'api/edit_address';
        this.otherUrlData = '?uniqcode='+this.get_item;
        this.listing_view_url = 'api/address_edit_data'+this.otherUrlData;
        this.viewPageData();
      }
    }else if(this.get_identifier == 'get_in_touch'){
      this.heder_title = 'Pre-Counseling Form';
      this.onEditField = 'PUT';
      

      // signin student  data call
      this.commonUtils.signinStudentInfoObservable.pipe(
        take(1)
      ).subscribe(res =>{
        console.log('signinStudentInfoObservable res>>>>>>>>>>>>>>>>>>>.. >', res);
        if(res){
          this.api_url = 'student/pre_counseling_update/'+res.id;
          this.senduserId = res.id;
          this.senduserIdStatus = true;


        }else{
          this.api_url = 'student/pre_counseling_signup';
        }
      })

    }

  }

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

  

  // ======================== form submit start ===================
    onSubmit(form:NgForm){
      this.form_submit_text = 'Submitting';

      // get form value
      let fd = new FormData();

      console.log('form >>value', form.value);
      console.log('form >>', form);

      // get_in_touch
      if(this.get_identifier == 'edit_profile'){
        // fileValprofile
      if(this.fileValprofile) {
        // normal file upload
        fd.append(this.normalFileNameProfile, this.fileValprofile, this.fileValprofile.name);
      }else if(this.fileValprofileCross == 'cross_image'){
        fd.append('image', '');
      }else{
        fd.append('image', '');
      }
      }
      
      for (let val in form.value) {
        if(form.value[val] == undefined){
          form.value[val] = '';
        }
        fd.append(val, form.value[val]);

      };

      if(!form.valid){
        return;
      }
      this.formSubmitSubscribe = this.http.post(this.api_url, fd).subscribe(
        (response:any) => {
          if(this.get_identifier == 'apply_query'){
            this.form_submit_text = 'Apply';
          }else{
            this.form_submit_text = 'Submit';
          }
          if(response.return_status > 0){

            this.commonUtils.presentToast('success', response.return_message);
            form.reset();

            if(this.get_identifier == 'apply_query'){
              this.modalController.dismiss('applyQuerysubmitClose');
              this.get_item.job_applied = 1;
            }else if (this.get_identifier == 'edit_profile'){
              this.modalController.dismiss('edit_updated');
            }else{
              this.modalController.dismiss('submitClose');
            }
          }
        },
        errRes => {
          if(this.get_identifier == 'apply_query'){
            this.form_submit_text = 'Apply';
          }else{
            this.form_submit_text = 'Submit';
          }
        }
      );

    }
  // form submit end

  // Normal file upload
    fileValResume;
    fileValprofile;
    fileValprofileCross;
    fileValResumeCross;
    normalFileNameResume;
    normalFileNameProfile;
    uploadImagePathShow = false;
    uploadresumePathShow = false;
    imgaePreview;
    normalFileUpload(event, _item, _name) {
      console.log('nomal file upload _item => ', _item);
      console.log('nomal file upload _name => ', _name);

      if(_name == 'resume'){
        this.fileValResume =  event.target.files[0];
        _item =  event.target.files[0].name;
        this.normalFileNameResume = _name;
        this.uploadresumePathShow = true;
      }else{
        this.fileValprofile =  event.target.files[0];

        const render = new FileReader();
        render.onload = () =>{
          this.imgaePreview = render.result;
          // console.log('this.imgaePreview >>', this.imgaePreview);
        }
        render.readAsDataURL(this.fileValprofile);

        _item =  event.target.files[0].name;
        this.normalFileNameProfile = _name;
        this.uploadImagePathShow = true;
      }
    }
    fileCross(_item, _identifire){
      if(_identifire == 'resume'){
        this.model.resume = null;
        this.model.resume2 = null;
        this.normalFileNameResume = '';
        this.fileValResumeCross = 'cross_resume';

      }else{
        this.model.image = null;
        this.model.image2 = null;
        this.normalFileNameProfile = '';
        this.fileValprofileCross = 'cross_image';
        this.uploadImagePathShow = false;
      }
    }
  // Normal file upload end

  //---------------- login form submit start-----------------
    onSubmitSingInForm(form:NgForm){
      this.isLoading = true;
      console.log('form >>', form.value);
      if(!form.valid){
        return;
      }
      let fd = new FormData();

      for (let val in form.value) {
        if(form.value[val] == undefined){
          form.value[val] = '';
        }
        fd.append(val, form.value[val]);

      };

      this.authenticate(form, fd);
      // form.reset();

    }

    // authenticate function
    authenticate(_form, form_data) {
      this.isLoading = true;
      this.loadingController
        .create({ keyboardClose: true, message: 'Logging in...' })
        .then(loadingEl => {
          loadingEl.present();
          let authObs: Observable<any>;
          authObs = this.authService.login(this.api_url, form_data, '')
          
          this.formSubmitSubscribe = authObs.subscribe(
            resData => {
              console.log('resData ============= (sign in) ))))))))))))))>', resData);
              if(resData.return_status > 0)
              {
                console.log('user Type =============))))))))))))))>', resData.return_data.user_type);
                
                // this.router.navigateByUrl('/dashboard');
                // service 
                
                this.commonUtils.onClicksigninCheck(resData.return_data.userdetails);

                // user details set
                this.commonUtils.onSigninStudentInfo(resData.return_data.userdetails);
                
                setTimeout(() => {
                  _form.reset();
                  loadingEl.dismiss();
                  this.modalController.dismiss('submitClose');
                  this.commonUtils.presentToast('success', resData.return_message);
                }, 2000);
      
              }else{
                loadingEl.dismiss();
                this.commonUtils.presentToast('error', resData.return_message);
              }
              
              // console.log("data login after resData ++++++>", resData);
              this.isLoading = false;
              // loadingEl.dismiss();
              // this.router.navigateByUrl('/places/tabs/discover');
            },
            errRes => {
              loadingEl.dismiss();
            }
          );
        });
    }
  // login form submit end

  // ..... userAuthenticate modal start ......
    async userAuthenticateModal(_identifier, _item, _items) {
      // console.log('_identifier >>', _identifier);

      this.modalController.dismiss(); //click file first close

      let open_modal;
      let myclass;
      if(_identifier == 'forgotPassword' || _identifier == 'signIn' || _identifier == 'signUp'){
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
  // userAuthenticate modal end 

  // onChange dropdown
  onChange(event){

  }

  // close modal
  closeModal() {
    // this.modalController.dismiss(this.arrayList);
    this.modalController.dismiss();
  }

  // -----datepicker start------

    datePickerObj: any = {
      dateFormat: 'DD/MM/YYYY', // default DD MMM YYYY
      toDate: new Date(),
      closeOnSelect: true,
      yearInAscending: true
    };

    principledatePickerObj: any = {
      dateFormat: 'DD/MM/YYYY', // default DD MMM YYYY
      closeOnSelect: true,
      yearInAscending: true
    };

    // get selected date
    myFunction(){
      console.log('get seleted date')
    }
// datepicker 

  // -------------- edit page api call start  ------------
    profileLoading;
    allClient;
    editPagaDataCall(api_name, _item){
      // console.log('aa _item >', _item.toString());
      this.onEditField = 'PUT';
      this.profileLoading = true;
      //edit data call
      this.editDataSubscribe = this.http.get(api_name+'/'+_item.id).subscribe(
        (res:any) => {
          this.profileLoading = false;
          console.log("Edit data  res profile >", res.return_data);
          if(res.return_status > 0){

            this.model = {
              name : res.return_data.name,
              // borrower : JSON.parse(res.return_data.client[0].id),
              // enable : res.return_data.status,
              is_login : res.return_data.is_login,
              description : res.return_data.description
            };

            // status
            if(res.return_data.status){
              if(res.return_data.status == '1'){
                  this.model.enable = 'true';
              }else{
                  this.model.enable = '';
              }
            }
            
            if(res.return_data.user_info){
              this.model.username = res.return_data.user_info[0].email;
              this.model.password = res.return_data.user_info[0].password;
            }

            // console.log('country >', this.model.country);
            this.allClient = [];
            res.return_data.client.forEach(element => {
              this.allClient.push(element);
            });
            // this.selectedPeople = [this.people[0].id, this.people[1].id
          }
        },
        errRes => {
          // this.selectLoadingDepend = false;
          this.profileLoading = false;
        }
      );

    }
  // edit page api call end

  // getlist data fetch start
    getlist(_getlistUrl){
      this.plt.ready().then(() => {
        this.selectLoading = true;
        this.getListSubscribe = this.commonUtils.getlistCommon(_getlistUrl).subscribe(
          resData => {
            this.selectLoading = false;
            this.parentList = resData.parent;
          },
          errRes => {
            this.selectLoading = false;
          }
        );
      });
    }
  // getlist data fetch end

  // ------ export function call start ------
    export_url;
    onExport(_identifier, _item){
      this.getListSubscribe = this.authService.globalparamsData.subscribe(res => {
      //  this.export_url = this.main_url+'/transaction_print/'+_item+'?token='+res.token+'&master='+res.master;
        this.export_url = this.file_url+'/'+_item;
      });
      window.open(this.export_url);
    }
  // export function call end

  // ================== view data fetch start =====================
    viewPageData(){
      console.log("viewPageData------------------->");
      this.viewLoadData = true;
      this.viewPageDataSubscribe = this.http.get(this.listing_view_url).subscribe(
        (res:any) => {
          this.viewLoadData = false;
          console.log("view data  res -------------------->", res);
          this.viewData = res.return_data;
          if(res.return_status > 0){
            this.model = {
              flat_no: res.return_data.flat_no,
              name: res.return_data.name,
              email: res.return_data.email,
              uniqcode: res.return_data.uniqcode,
              mobile: res.return_data.mobile_no,
              phone_no: res.return_data.phone_no,
              address: res.return_data.address_details,
              city: res.return_data.city_dist_town,
              state: res.return_data.state,
              pin_code: res.return_data.pin_code,
              landmark: res.return_data.landmark,
              address_type: res.return_data.address_type,
              image : res.return_data.image,
              path : res.return_data.path,
              old_image : res.return_data.image
            }
          }
        },
        errRes => {
          this.viewLoadData = false;
        }
      );
    }
  // view data fetch end

  // Cart value increment, decremrent start
  onChangeCart(_unicode, _identifire, _quantity, _tabname){
    console.log('menu _unicode>>', _unicode);
    console.log('menu _identifire>>', _identifire);
    console.log('menu _quantity>>', _quantity);

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
            }
          },
          errRes => {
          }
        );
      

      
  }
  // Cart value increment, decremrent end

  // destroy call
  ngOnDestroy(){
    if(this.formSubmitSubscribe !== undefined){
      this.formSubmitSubscribe.unsubscribe();
    }
    if(this.editDataSubscribe !== undefined){
      this.editDataSubscribe.unsubscribe();
    }
    if(this.viewPageDataSubscribe !== undefined){
      this.viewPageDataSubscribe.unsubscribe();
    }
    if(this.getListSubscribe !== undefined){
      this.getListSubscribe.unsubscribe();
    }
    if(this.uploadSubscribe !== undefined){
      this.uploadSubscribe.unsubscribe();
    }
  }

}

