import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/auth/auth.guard';

/* tslint:disable */ 
const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'home', 
    pathMatch: 'full' 
  },
  { 
    path: 'home', 
    loadChildren: './pages/home/home.module#HomePageModule'
  },
  { 
    path: 'reservation', 
    loadChildren: './pages/reservation/reservation.module#ReservationPageModule' 
  },
  { 
    path: 'about', 
    loadChildren: './pages/about/about.module#AboutPageModule' 
  },
  { 
    path: 'contact', 
    loadChildren: './pages/contact/contact.module#ContactPageModule' 
  },
  { 
    path: 'gallery', 
    loadChildren: './pages/gallery/gallery.module#GalleryPageModule' 
  },
  { 
    path: 'menus', 
    loadChildren: './pages/menus/menus.module#MenusPageModule' 
  },
  { 
    path: 'checkout/:id', 
    loadChildren: './pages/checkout/checkout.module#CheckoutPageModule' ,
    canLoad: [AuthGuard] 
  },
  { 
    path: 'profile', 
    loadChildren: './pages/profile/profile.module#ProfilePageModule' ,
    canLoad: [AuthGuard]
  },
  { 
    path: 'search', 
    loadChildren: './pages/search/search.module#SearchPageModule' 
  },
  { 
    path: 'cms/:action/:name', 
    loadChildren: './pages/cms/cms.module#CmsPageModule'
  },
  {
    path: '**',   // redirects all other routes to the main page
    redirectTo: 'home'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }