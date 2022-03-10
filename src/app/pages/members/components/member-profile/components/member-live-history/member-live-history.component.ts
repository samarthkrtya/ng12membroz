import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-member-live-history',
  templateUrl: './member-live-history.component.html'
})
export class MemberLiveHistoryComponent extends BaseLiteComponemntComponent implements OnInit {
 
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();

  dataSource = new MatTableDataSource;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ELEMENT_DATA: any[] = []; 
  displayedColumns : string[] = ['startAt' , 'endAt' , 'consultant' , 'action']; 
  consultantData: any[];
  chatData: any[];
  messages: any;
  sender: any;
  receiver: any;
  isLoading: boolean = true;
  constructor(private _commonService: CommonService,
    private firestore: AngularFirestore,
    private _route: ActivatedRoute,
    private db: AngularFireDatabase) { 
    super();
  }

  async ngOnInit() {
    await this.loaddata();
    await this.getSenderData();
    this.setTable();
  }

  

  async loaddata() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "contextid", "searchvalue": this.dataContent._id, "criteria": "eq" })

    var url = "formdatas/filter"
    var method = "POST"
    return this._commonService.commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        this.dataContent.chatData = data
      })
  
  }

  setTable(){
    this.ELEMENT_DATA = [];
    this.ELEMENT_DATA =  this.dataContent.chatData ? this.dataContent.chatData : [];

    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
    this.dataSource.sort = this.sort;
  }

  

  async getSenderData() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" })

    var url = "users/filter"
    var method = "POST"

    this._commonService.commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        this.consultantData = data
      })
  }

  async viewChat(chatId) {
    this.isLoading = true;
    let getChatId = this.firestore.collection('chat');
    this.firestore.collection('chat').valueChanges({ idField: 'firebaseChatId' })
      .subscribe(val => {
        this.chatData = val
      })
    setTimeout(() => {
      let chat = this.chatData.find(x => x.firebaseChatId == chatId.property.fierbasechatid)
      this.firestore
        .collection('chat')
        .doc(chat.firebaseChatId)
        .collection('messages').valueChanges().subscribe(val => {
          this.isLoading = false;
          this.messages = val;
          
            this.messages.forEach(ele => {
              if (this.dataContent._id == ele.user._id) {
                this.sender = this.dataContent
              }
          })
          this.consultantData.forEach(element => {
            this.messages.forEach(ele => {
              if (element._id == ele.user._id) {
                this.receiver = element
              }
            });
          })
        })
    }, 1000);



  }



}
