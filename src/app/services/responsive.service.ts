/* tslint:disable */ 

// =========== process 1 responsive ==========
/* import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {

    private isMobileResolution: boolean;

    constructor() {
      if (window.innerWidth < 768) {
        this.isMobileResolution = true;
      } else {
        this.isMobileResolution = false;
      }
    }
  
    public getIsMobileResolution(): boolean {
      return this.isMobileResolution;
    }
}
 */



// globals.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
    private isMobile = new BehaviorSubject(null);
    public screenWidth: string;


    constructor() {
      this.checkWidth();
    }

    onMobileChange(status: boolean) {
      this.isMobile.next(status);
    }

    getMobileStatus(): Observable<any> {
      return this.isMobile.asObservable();
    }

    public checkWidth() {
      var width = window.innerWidth;
      if (width <= 768) {
          this.screenWidth = 'sm';
          this.onMobileChange(true);
      } else if (width > 768 && width <= 992) {
          this.screenWidth = 'md';
          this.onMobileChange(false);
      } else {
          this.screenWidth = 'lg';
          this.onMobileChange(false);
      }
    }

}