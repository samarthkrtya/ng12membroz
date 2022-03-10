import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

declare var $: any;

@Component({
  selector: 'app-branch-users',
  templateUrl: './branch-users.component.html',
})
export class BranchUsersComponent extends BaseComponemntComponent implements OnInit {

  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource;

  ELEMENT_DATA: any[] = [];
  displayedColumns: string[] = ['fullname', 'designation', 'joiningdate', 'email', 'phone', 'status', 'Action'];

  selectedUser: string = ''; 
  currentpassword: string = '';
  hidepasswd: boolean = true;
  validpasswd: boolean = true;
  disableBtn: boolean = false;

  constructor(
    public _route: ActivatedRoute, 
    public _router: Router
  ) {
    super();
    this.pagename = "app-branch-user";
  }

  async ngOnInit() {
    await super.ngOnInit();
    this.getUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  async getUsers() {
    if (this.dataContent.users && this.dataContent.users.length > 0) {
      this.dataContent.users.forEach(ele => {
       // console.log(ele)
        let obj = {
          fullname: ele.fullname ? ele.fullname : '---',
          designation: ele.designation ? ele.designation : '---',
          status: ele.status ? ele.status : '---',
          joiningdate: ele.property && ele.property.joiningdate ? new Date(ele.property.joiningdate).toLocaleDateString(this._commonService.currentLocale()): '',
          email: ele.property.primaryemail ? ele.property.primaryemail : '---',
          phone: ele.property.mobile ? ele.property.mobile : '---',
          _id: ele._id
        }
        this.ELEMENT_DATA.push(obj);
      });
      this.dataSource = new MatTableDataSource();
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
      });
      this.dataSource.sort = this.sort;
      return;
    }

  }

  async AddStaff() {
    let navigationExtras = { queryParams: { 'branchid': this._loginUserBranchId } };
    this._router.navigate([`pages/dynamic-forms/form/603c86a1c49da52f300bc3cc`], navigationExtras);
  }

  async getview(userid: any) {
    this._router.navigate(['pages/user/profile/' + userid + '/598998cb6bff2a0e50b3d793/']);
  }

  
  getPassword(checked: boolean) {
    if (checked == true) {
      this.currentpassword = this.ranString();
      this.validatePasswd();
    } else {
      this.currentpassword = '';
    }
  }

  showPassword() {
    this.hidepasswd = !this.hidepasswd;
    var input = <HTMLInputElement>document.getElementById('newpasswd');
    if (input.getAttribute('type') == "password") {
      input.setAttribute('type', 'text');
    } else {
      input.setAttribute('type', 'password');
    }
  }

  ranString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
  }

  validatePasswd() {
    if (this.currentpassword) {
      // var regex = /^(?=.*[A-Za-z])(?=.*\d){8,}$/;
      // var valid = regex.test(this.currentpassword);
      var valid = false;
      if (this.currentpassword.length == 8 ) valid = true
      this.validpasswd = valid;
    }
  }

  setPwd(id : any){
    this.selectedUser = id;
    this.currentpassword ="";
    this.hidepasswd = true;
    var input = <HTMLInputElement>document.getElementById('newpasswd');
    input.setAttribute('type', 'password');
  }

  async updatePassword(){

    var url = `users/${this.selectedUser}`
    var newobject = {
      newpassword: this.currentpassword,
      forcelogin: true
    }

    this.disableBtn = true;
    this._commonService
    .commonServiceByUrlMethodDataAsync(url, "PATCH", newobject)
    .then((data: any) => {
      this.disableBtn = false;
      if (data) {
        this.showNotification('top', 'right', 'Password updated successfully !!', 'success');
        $("#resetpwdclose").click();
      }
    }).catch((e) => {
      this.disableBtn = false;
      this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
      $("#resetpwdclose").click();
    });

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
