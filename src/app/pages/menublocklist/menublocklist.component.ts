import { MenupermissionsService } from './../../core/services/menu/menupermissions.service';
import { MenuService } from './../../core/services/menu/menu.service';
import { AuthService } from './../../core/services/common/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-menublocklist',
  templateUrl: './menublocklist.component.html'  
})
export class MenublocklistComponent implements OnInit {

  allMenus: any [] = [];
  language: any;

  selectedMenus: any [] = [];
  removeMenus: any [] = [];
  branchId: any;
  bindId: any;
  cList: any = {};
  selectedSubMenus: any [] = [];
  rSubMenus: any [] = [];
  rSubMenus2: any [] = [];
  cMenuTitle: string = '';
  isLoading: boolean = false;
  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private authService: AuthService,
    private _menuService: MenuService,
    private _menupermissionsService: MenupermissionsService,
  ) {

        this.language = "en";
        this.isLoading = true;
        this.cList = {"0":"rose","1":"green","2":"orange","3":"blue",
                    "4":"rose","5":"green","6":"orange","7":"blue",
                    "8":"rose","9":"green","10":"orange","11":"blue"};

        if(this.authService.auth_user != undefined && this.authService.auth_user.branchid != undefined && this.authService.auth_user.branchid._id != undefined){
          this.branchId = this.authService.auth_user.branchid._id;
        }

        if(this.authService.currentUser) {
            if(this.authService.currentUser.language) {
                this.language = this.authService.currentUser.language;
            }
        }

    }

  ngOnInit() {

    this._route.params.subscribe(
      (param: any) => {
          this.bindId = param['mname'];
          this.isLoading = true;
          this.getAllMenus();
      });
  }

  getAllMenus() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria" : "eq" });
    postData["sort"] = { "menuindex": 1 };
        
    this._menuService
        .GetAllByFilter(postData)
        .subscribe((data:any)=>{

            data.forEach(element => {
                if(this.branchId && this.branchId) {
                    element.url = element.url != undefined ? element.url.replace(":branchid", this.branchId) : element.url;
                } 
            });
            this.allMenus = data;
            if(this.authService.auth_role['_id']) {
                this.getMenuBasedonRole(this.authService.auth_role['_id']);
            } else {
                this.selectedMenus = this.list_to_tree(this.allMenus);
                if (this.bindId != '' && this.bindId != undefined) {
                  this.getSubMenu();
                } else {
                    this.isLoading = false;
                }
            }
        } , data => {
                this.isLoading = false;
        });
  }

  getMenuBasedonRole(id: any) {

    this.removeMenus = [];

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "roleid", "searchvalue": id, "criteria" : "eq" });
    
    this._menupermissionsService
        .GetAllByFilter(postData)
        .subscribe((data:any)=>{
            
            if(data.length !== 0) {
                this.allMenus.forEach(element => {
                    data[0]['menuid'].forEach(ele => {
                       if(ele._id == element._id) {
                           this.removeMenus.push(element);
                       } 
                    });
                });
                this.selectedMenus = this.list_to_tree(this.removeMenus);
                 
                if (this.bindId != '' && this.bindId != undefined) {
                  this.getSubMenu();
                } else {
                    this.isLoading = false;
                }
            } else {
                this.isLoading = false;
            }
        }, data => {
                this.isLoading = false;
        });
  }

  getSubMenu(){
    if(this.bindId != undefined && this.bindId != ''){
      let sobj: any = this.selectedMenus.find( ele => ele.value == this.bindId);
      if(sobj != undefined && sobj.text != undefined && sobj.text != ''){
          this.cMenuTitle = sobj.text;
      }
      if(sobj != undefined && sobj.children != undefined && sobj.children.length > 0){
        this.selectedSubMenus = sobj.children;
        this.rSubMenus2 = [];
        this.rSubMenus = this.groupBy(this.selectedSubMenus, 'group');
           var size = 10;
           size = Math.round(this.rSubMenus.length/2);
            for (var i=0; i<this.rSubMenus.length; i+=size) {
                this.rSubMenus2.push(this.rSubMenus.slice(i,i+size));
            }
       }
       this.isLoading = false;
    } else {
        this.isLoading = false;
    }
  }

  list_to_tree(list: any) {
        
    var map = {}, node, roots = [], i;
    let cnt = 0;
    for (i = 0; i < list.length; i += 1) {
        
        if (!list[i].parent) {
            map[list[i].menuname] = cnt;
            cnt++;
        }
        
        list[i].children = [];
    }
    for (i = 0; i < list.length; i += 1) {
        node = list[i];
        if (node.parent) {

            let title;
            if(node.key && node.key.title && node.key.title.value && node.key.title.value[this.language] && this.language ){
                title = node.key.title.value[this.language];
            } else {
                title = node.title;
            }

            let desc;
            if(node.key && node.key.description && node.key.description.value && node.key.description.value[this.language] && this.language ){
                desc = node.key.description.value[this.language];
            } else {
                desc = node.description ? node.description : '';
            }
            

            let obj = {
                text: title,
                value: node._id,
                checked: false,
                materialicon: node.materialicon,
                shortname: node.shortname,
                url: node.url,
                group: node.group != undefined ? node.group : '',
                desc: desc
            };
        
            if(roots[map[node.parent]]){

            if(!roots[map[node.parent]]['children']) {
                roots[map[node.parent]]['children'] = [];
            }
            if(roots[map[node.parent]]['children']){
                roots[map[node.parent]]['children'].push(obj);
            }
           
            }   

        } else {

            let title;
            if(node.key && node.key.title && node.key.title.value && node.key.title.value[this.language] && this.language ){
                title = node.key.title.value[this.language];
            } else {
                title = node.title;
            }

            let desc;
            if(node.key && node.key.description && node.key.description.value && node.key.description.value[this.language] && this.language ){
                desc = node.key.description.value[this.language];
            } else {
                desc = node.description ? node.description : '';
            }

            let obj = {
                text: title,
                value: node._id,
                checked: false,
                materialicon: node.materialicon,
                shortname: node.shortname,
                url: node.url,
                desc: desc
            };
            roots.push(obj);
        }
    }
    return roots;
  }

  groupBy(collection: any, property: any) {
    let i = 0, val, index,
    values = [], result = [];
    for (; i < collection.length; i++) {
        val = collection[i][property];
        index = values.indexOf(val);
        if (index > -1) {
        result[index].push(collection[i]);
        } else {
            values.push(val);
            result.push([collection[i]]);
        }
    }
    return result;
  }

}
