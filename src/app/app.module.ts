import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule , HTTP_INTERCEPTORS } from  '@angular/common/http';

import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { SharedModule } from './shared/shared.module';
import { AddCommonModelPageModule } from './pages/modal/add-common-model/add-common-model.module';

import { InterceptorProvider } from './services/interceptors/interceptor';
import { StickyHeaderDirective } from './directives/sticky-header.directive';
// import { SafeHtmlPipe } from './pipe/safe-html.pipe';

/* tslint:disable */ 
@NgModule({
  declarations: [AppComponent, StickyHeaderDirective],
  imports: [BrowserModule,
    IonicModule.forRoot(), 
    AppRoutingModule, 
    BrowserAnimationsModule,
    SharedModule, //share module import here
    IonicStorageModule.forRoot(),
    AddCommonModelPageModule, //add common modal module
    HttpClientModule
  ],
  providers: [
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorProvider,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [],
})
export class AppModule {}
