import { Component, Input, OnInit } from '@angular/core';
import { BaseComponemntInterface } from '../../shared/base-componemnt/base-componemnt.component';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
declare var $: any;
import { NgNavigatorShareService } from 'ng-navigator-share';


@Component({
  selector: 'app-invite-earn',
  templateUrl: './invite-earn.component.html'
})
export class InviteEarnComponent extends BaseLiteComponemntComponent implements BaseComponemntInterface, OnInit {

  private ngNavigatorShareService: NgNavigatorShareService;
  isLoadingData: boolean;

  public repoUrl = 'https://www.membroz.com/';
  public imageUrl = 'https://www.membroz.com/wp-content/uploads/2020/01/membroz-logo-1.png';

  constructor(ngNavigatorShareService: NgNavigatorShareService) {
    super();
    this.ngNavigatorShareService = ngNavigatorShareService;
  }

  async ngOnInit() {
    try {
      this.isLoadingData = true;
      super.ngOnInit();
      this.LoadData();
      this.isLoadingData = false;
    } catch (error) {
      console.error(error);
      this.isLoadingData = false;
    } finally {
    }
  }

  LoadData() {
  }

  copyReferral() {
    super.showNotification("top", "right", "Code Copied !!", "success");
    const selBox = document.createElement('textarea');
    selBox.value = this._loginUser.membernumber;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  async shareApi() {
    try {
      const sharedResponse = await this.ngNavigatorShareService.share({
        title: 'Best Business Management & Membership Management Software',
        text: 'Anywhere, Anytime access to your business on cloud.',
        url: 'https://www.membroz.com/free-trial/'
      });
      console.log(sharedResponse);
    } catch (error) {
      console.log('You app is not shared, reason: ', error);
    }
  }

  whatssapp() {
    window.open("https://web.whatsapp.com/send?text=https://www.membroz.com/free-trial/", "_blank","location=yes,height=570,width=520,scrollbars=yes,status=yes");
  }
  twitter() {
    window.open("https://twitter.com/intent/tweet", "_blank","location=yes,height=570,width=520,scrollbars=yes,status=yes");
  }
  linkedin() {
    window.open("https://www.linkedin.com/sharing/share-offsite/?url={url}", "_blank","location=yes,height=570,width=520,scrollbars=yes,status=yes");
  }
  facebook() {
    window.open("https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.membroz.com%2Fnews%2F", "_blank","location=yes,height=570,width=520,scrollbars=yes,status=yes");
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

}
