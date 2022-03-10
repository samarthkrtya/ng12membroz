import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import {
  CanDeactivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

declare var $:any;

export interface PendingChanges {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable()
export class PendingChangesGuard implements CanDeactivate<PendingChanges> {
  
  constructor(
    
    ) {
     
  }

  
  canDeactivate(component: PendingChanges): boolean | Observable<boolean> {

    if (confirm('You have unsaved changes! If you leave, your changes will be lost.')) {
      return true;
    } else {
      return false;
    }
    // return component.canDeactivate() ? true : confirm("You may have unsaved changes");
  }


}
