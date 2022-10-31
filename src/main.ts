import 'hammerjs';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

/* tslint:disable */ 
if (environment.production) {
  enableProdMode();

  // disable console for production mode
  if(window){
    window.console.log = function(){};
  }
}



platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
