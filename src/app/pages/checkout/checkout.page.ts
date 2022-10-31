import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Platform, IonContent, ModalController} from '@ionic/angular';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonUtils } from './../../services/common-utils/common-utils';

import { environment } from '../../../environments/environment';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import { AddCommonModelPage } from '../modal/add-common-model/add-common-model.page';
import { CartService } from 'src/app/services/cart.service';

declare var $ :any; //jquary declear

declare var Razorpay: any;   //Razorpay payment getway declar and file index.html(<script src="https://checkout.razorpay.com/v1/checkout.js"></script>)

 
/* tslint:disable */ 

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: {displayDefaultIndicatorType: false}
  }]
})

export class CheckoutPage implements OnInit, OnDestroy {

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
  private formSubmitSubscribe : Subscription;
  parms_action_id;
  listing_view_url;
  viewLoadData;
  viewData;
  get_user_dtls;
  homeLoadData;
  home_page_url;
  homePageData;
  currentNumber = 0;
  form_api;
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  paymentoptions;
  form_submit_text = 'Proceed to Pay';
  cartUniqcode = '';
  subTotal = 0;
  grandTotal = 0;
  totalGst = 0;
  razorpayId;
  sideDetails;
  finalFd;
  deliveryAddress = 'change';
  addressList = [];
  deliveryUniqcode;
  cart_api;
  cartList;
  cartNumber:number;
  tokenNumber:number;
  buttonLoader = false;

  constructor(
    private activatedRoute : ActivatedRoute,
    private router: Router,
    private http : HttpClient,
    private _formBuilder: FormBuilder,
    private commonUtils : CommonUtils,
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
    console.log('this.parms_action_id>>', this.parms_action_id);

    this.model = {
      payment_type: 'pay_by_online',
    }
    
    // view page url name
    this.listing_view_url = 'api/cart';

    this.home_page_url = 'api/userinfo' ;

    this.cart_api = 'api/addtocart';

    // form submit api add
    if (this.parms_action_id == 'order'){
      this.form_api = 'api/order';
    }else {
      this.form_api = 'api/update_table_booking';
    } 

    // user details get
    this.logoutDataSubscribe = this.commonUtils.signinStudentInfoObservable.subscribe(res => {
      console.log(' =========== HEADER  userdata observable  >>>>>>>>>>>', res);
      if(res){
        this.get_user_dtls = res;
      }else{
      
      }
    });

    this.homePagesData();

    // view data call   
    this.viewPageDataSubscribe = this.commonUtils.getSiteInfoObservable.subscribe(res =>{
      console.log('getSiteInfoObservable res>>>>>>>>>>>>>>>>>>>.. >', res);
      if(res){
        this.sideDetails = res;
        
      }
    })
  
  }

  ngOnInit() {
    this.viewPageData();
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
    this.viewPageData();
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
          
          console.log("viewData INFO  res -------------------->", res.return_data);
          this.viewData = res.return_data;
          this.subTotal = 0;
          this.totalGst = 0;
          this.grandTotal = 0;
          this.cartUniqcode = '';
          
          if(this.viewData.cart_details.length > 0){
            for (let val=0; val < this.viewData.cart_details.length; val++) {
              this.cartUniqcode = this.cartUniqcode+this.viewData.cart_details[val].uniqcode+',';
              this.subTotal = this.subTotal+parseInt(this.viewData.cart_details[val].price);
              this.totalGst = this.totalGst+parseInt(this.viewData.cart_details[val].gst_price);
            }
            console.log('this.cartUniqcode ', this.cartUniqcode );
            console.log('this.subTotal ', this.subTotal );
            console.log('this.totalGst ', this.totalGst );
            this.grandTotal = this.subTotal+this.totalGst;
          }else {
            this.cartUniqcode = '';
            this.subTotal = 0;
            this.totalGst = 0;
            this.grandTotal = 0;
            this.cartUniqcode = '';
          }
          console.log('this.cartUniqcode ', this.cartUniqcode );
          
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

  // ================== homePagesData fetch start =====================
    homePagesData(){
      this.homeLoadData = true;
      this.homePageDataSubscribe = this.http.get(this.home_page_url).subscribe(
        (res:any) => {
          this.homeLoadData = false;
          
          console.log("HOME INFO  data  res -------------------->", res.return_data);
          if(res.return_status > 0){
            this.homePageData = res.return_data;

            this.addressList = this.homePageData.userinfo.address;
          }
        },
        errRes => {
          this.homeLoadData = false;
        }
      );
    }
  // homePagesData fetch end

  // ..... address add edit modal start ......
  async addMenuOrder(_identifier, _item, _items) {
    console.log('_identifier >>', _identifier);
    console.log('_item >>', _item);
    console.log('_items >>', _items);
    this.buttonLoader = true;
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
      this.buttonLoader = false;
      this.viewPageData();
      this.homePagesData();
      
      if(getdata.data){
        console.log('getdata >>>>>>>>>>>', getdata);
        
        /* this.onListData(this.listing_url, this.displayRecord, this.pageNo, this.api_parms, this.searchTerm, this.cherecterSearchTerm, this.sortColumnName, this.sortOrderName, this.advanceSearchParms, this.urlIdentifire);  */
      }

    });

    return await principle_modal.present();
  }
  // address add edit  modal end

  // Delivery place change start
  onChangeaddress(_identifier, _addressItem) {
    console.log('_identifier>>', _identifier);
    console.log('_addressItem>>', _addressItem);
    this.deliveryAddress = _identifier;
    
    console.log('deliveryUniqcode>>', this.deliveryUniqcode);
    if(this.deliveryAddress == 'deliverd'){
      this.deliveryUniqcode = _addressItem.flat_no+','+_addressItem.address_details+','+_addressItem.city_dist_town+'-'+_addressItem.pin_code+','+_addressItem.state+','+_addressItem.landmark;
      this.addressList = [];
      this.addressList[0]=_addressItem;
    }else if (this.deliveryAddress == 'change'){
      this.deliveryUniqcode = '';
      this.addressList = [];
      this.addressList=this.homePageData.userinfo.address;
    }
    
    console.log('this.addressList>>', this.addressList);
  }
  // Delivery place change end

  // Payment mood change start
    onChangePaymentMode(_select){
      console.log('paymeny mood>>', _select);
      if(_select == 'pay_by_online') {
        this.form_submit_text = 'Proceed to Pay';
      }else {
        this.form_submit_text = 'Confirm Order';
      }
    }
  // Payment mood change start
  // ======================== form submit start ===================
    
    onSubmit(form:NgForm){
      console.log("add form submit >", form.value);

      this.form_submit_text = 'Submitting';

      // get form value
      let fd = new FormData();
      // fd.append('totalcart', this.cartUniqcode);
      // fd.append('deliveryUniqcode', this.deliveryUniqcode);

      if(this.model.payment_type == 'pay_by_online'){

        // -----------------razorpay payment getwat call start-------------------

        var paymentSucessVariable = 0;
        var paymentId = 0;
        this.paymentoptions = {
          "key": this.sideDetails.sitedetails.razorpay_key, //(rzp_test_oBBldknGgfDRpv) Enter the Key ID generated from the Dashboard
          "amount": this.grandTotal * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise or INR 500.
          "currency": "INR",
          "name": this.sideDetails.sitedetails.name,
          "description": this.sideDetails.sitedetails.email,
          "image": this.file_url +'/'+this.sideDetails.sitedetails.path+this.sideDetails.sitedetails.logo,
          "handler": function (response) {
            //alert(response.razorpay_payment_id); //error alert
      
            console.log('===================== my api call ================');
            // bank object
            this.model = {};
            
            
            //------ api call only javascript work start---------
            var opts = {
              method: 'GET',      
              headers: {}
            };
            paymentId = response.razorpay_payment_id;
            // console.log('this.paymentId = response.razorpay_payment_id;', this.paymentId);
            
            
            var order_api = 'https://www.saloon.bongtechsolutions.com/admin/api/booking/submit?token=12026533457967184980&master=1&payment_id='+paymentId;
            fetch(order_api, opts).then(function (responsee) {
              // return response.json();
            })
            .then(function (body) {
              //doSomething with body;
              console.log('body >>>>>>>>>>>>>>>>>>>>', body);
              paymentSucessVariable = 1;
              // this.router.navigateByUrl(`dashboard`);
            });
            //-api call only javascript work end-

            // this.router.navigateByUrl(`dashboard`);
            
          },
          "prefill": {
            "name": this.homePageData.userinfo.name,
            "email": this.homePageData.userinfo.email,
            "contact": this.homePageData.userinfo.phone_no
          },
          "notes": {
            "address": 'Kolkata'
          },
          "theme": {
            "color": "#f70200"
          }
          
        };
        // initPay() {
          var rzp1 = new Razorpay(this.paymentoptions);
          rzp1.open();
          console.log("payment works");
        // }
      //------ razorpay payment getwat call end -----

      let prevNowPlaying = setInterval(() => {
        if(paymentSucessVariable == 1){
          clearInterval(prevNowPlaying);
          this.razorpayId = paymentId;
          console.log('this.razorpayPaymentId >>>>>', this.razorpayId);
          fd.append('refferCode', this.parms_action_id);
          fd.append('paymentId', this.razorpayId);

          for (let val in form.value) {
            if(form.value[val] == undefined){
              form.value[val] = '';
            }
            fd.append(val, form.value[val]);
          };
    
          
          this.finalFd = fd;
    
          console.log('this.finalFd >', this.finalFd);
          
          if(!form.valid){
            return;
          }
          form.reset();

          this.orderSubmit();
        }
      }, 1000);


        
      }else if(this.model.payment_type == 'pay_on_cash'){

        for (let val in form.value) {
          if(form.value[val] == undefined){
            form.value[val] = '';
          }
          fd.append(val, form.value[val]);
        };
  
        
        this.finalFd = fd;
  
        console.log('this.finalFd >', this.finalFd);
        
        if(!form.valid){
          return;
        }
        form.reset();
        
        this.orderSubmit();
      }
      
    }
    orderSubmit(){
      this.formSubmitSubscribe = this.http.post(this.form_api, this.finalFd).subscribe(
        (res:any) => {

          console.log("add form response >", res);
          console.log("add form response.return_data >", res.return_data);
          this.finalFd = '';
          this.commonUtils.presentToast('success', res.return_message);
          this.cart.editUser(0); 
          this.router.navigateByUrl(`profile`);
        },
        errRes => {
          this.form_submit_text = 'Proceed to Pay';
        }
      );
    }
  // form submit end

  // ----------- destroy subscription start ---------
    ngOnDestroy() {
      if(this.viewPageDataSubscribe !== undefined){
        this.viewPageDataSubscribe.unsubscribe();
      }
      if(this.logoutDataSubscribe !== undefined){
        this.logoutDataSubscribe.unsubscribe();
      }
      if(this.homePageDataSubscribe !== undefined){
        this.homePageDataSubscribe.unsubscribe();
      }
      if(this.formSubmitSubscribe !== undefined){
        this.formSubmitSubscribe.unsubscribe();
      }
    }
  // destroy subscription end
}