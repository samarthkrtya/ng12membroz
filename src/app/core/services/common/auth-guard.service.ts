
import { Injectable } from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth.service';

import { UserloginService } from '../userlogin/userlogin.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private _userloginService: UserloginService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;
    return this.checkLogin(url);
    //return true;
  }

  checkLogin(url: string): boolean {
    
    // if (this.authService.auth_id) {
    //   this._userloginService
    //     .GetLoginDetailById(this.authService.auth_id)
    //     .subscribe(data => {
    //       if (!data) {
    //         const roleType = this.authService.auth_roletype;
    //         this.authService.logout();
    //         if (roleType !== 'M' && roleType !== 'P') {
    //           this.router.navigate(['login']);
    //         } else if (roleType === 'M') {
    //           this.router.navigate(['loginMember']);
    //         } else if (roleType === 'P') {
    //           this.router.navigate(['loginNonMember']);
    //         } else {
    //           this.router.navigate(['login']);
    //         }
    //       }
    //     },
    //   data => {
    //     if (data) {
    //          const roleType = this.authService.auth_roletype;
    //           this.authService.logout();
    //          if (roleType !== 'M' && roleType !== 'P') {
    //           this.router.navigate(['login']);
    //          } else if (roleType === 'M') {
    //           this.router.navigate(['loginMember']);
    //         } else if (roleType === 'P') {
    //           this.router.navigate(['loginNonMember']);
    //         }  else {
    //           this.router.navigate(['login']);
    //         }
    //     }
    //   }
    // );
    // }

    if (this.authService.isLoggedIn()) {
      this.authService.getLoginUser();
      return true;
    }    
    this.authService.redirectUrl = url; // Store the attempted URL for redirecting
    
    this.router.navigate(['/login']); // Navigate to the login page with extras
    return false;
  }
}
