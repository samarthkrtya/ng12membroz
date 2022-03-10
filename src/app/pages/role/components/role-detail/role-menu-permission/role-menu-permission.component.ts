import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { CommonService } from 'src/app/core/services/common/common.service';
import { MenupermissionsService } from 'src/app/core/services/menu/menupermissions.service';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-role-menu-permission',
  templateUrl: './role-menu-permission.component.html',
  styles: [`
  .mat-form-field {
    margin-right: 4px;
  }`
  ]
})
export class RoleMenuPermissionComponent extends BaseComponemntComponent implements OnInit {
  @Input() bindId: any;
  @Input() dataContent: any;
  btnDisable: boolean = false;
  isAllSelected: boolean = false;
  isExpanded: boolean = false;
  isChecked: boolean = false;
  select: any;
  menulist: any[] = [];
  rollViewList: any[] = [];
  menupermissionId: any[] = []
  titlename: any[] = []
  newarray: any[] = []
  updatedMenus: any[] = []
  finalarray: any[] = []

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<ItemNodeFlatNode, ItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<ItemNode, ItemNodeFlatNode>();

  treeControl: FlatTreeControl<ItemNodeFlatNode>;

  treeFlattener: MatTreeFlattener<ItemNode, ItemNodeFlatNode>;

  dataSource: MatTreeFlatDataSource<ItemNode, ItemNodeFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<ItemNodeFlatNode>(true);

  isLoading: boolean = true;

  dbvalue: ItemNodeFlatNode[] = [];
  @Output() selectionValues = new EventEmitter<any>();

  constructor(public _commonService: CommonService,
    public _menupermissionsService: MenupermissionsService) {
    super();
  }


  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.getMenuBasedonRole(this.bindId);
      await this.loadmenu()

    }
    catch (error) {
      console.error(error)
    }
    finally {

    }
  }

  async loadmenu() {

    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<ItemNodeFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.isLoading = true;
    this.isExpanded = true;

    let api = "menus/filter";
    let method = "POST";
    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData['sort'] = { 'title' : 1}


    return this._commonService
      .commonServiceByUrlMethodDataAsync(api, method, postData)
      .then((data: any) => {

        let obj = {}, array = [];

        this.menulist = data;
        data.forEach((element, i) => {
          obj = {
            item: element.title,
            category: element['parent'] ? element['parent'] : element['menuname'],
            _id: element._id
          };
          array.push(obj);
        });

        array.sort((a,b) => (a.category > b.category) ? 1 : ((b.category > a.category) ? -1 : 0))
        const grpdata = this.groupBy(array, "category");
        const datas = this.buildFileTree(grpdata, 0);
        this.dataSource.data = datas;
        this.isLoading = false;
        this.rendertree();
        this.treeControl.collapseAll();
        
        return;
      });
  }

  selectAll() {
    this.select = !this.select;
    this.treeControl.dataNodes.forEach((r, index) => {
      this.treeControl.expand(this.treeControl.dataNodes[index]);
      this.select
        ? this.checklistSelection.select(this.treeControl.dataNodes[index])
        : this.checklistSelection.deselect(this.treeControl.dataNodes[index]);

    });

    this.isAllSelected = true;
  }

  async rendertree() {

    this.updatedMenus.forEach(permission => {
      this.menulist.forEach(ele => {
        if (ele._id == permission) {
          let obj: ItemNodeFlatNode = {
            category: ele['parent'] ? ele['parent'] : ele['menuname'],
            item: ele.title,
            _id: ele._id,
            level: 1,
            expandable: false
          }
          this.dbvalue.push(obj)
        }
      });
    });
    for (let i = 0; i < this.treeControl.dataNodes.length && this.treeControl.dataNodes.length; i++) {
      for (let j = 0; j < this.dbvalue.length; j++) {
        if (this.treeControl.dataNodes[i]["_id"] == this.dbvalue[j]["_id"]) {
          this.checklistSelection.toggle(this.treeControl.dataNodes[i]);
        }
      }
    }

  }

  buildFileTree(obj: any, level: number): ItemNode[] {
    return Object.keys(obj).reduce<ItemNode[]>((accumulator, key) => {
      const value: ItemNode[] = obj[key];
      const node = new ItemNode();
      node.item = key;
      if (value != null) {
        if (Array.isArray(value)) {
          node.children = value;
        } else {
          node.item = value;
        }
      }
      return accumulator.concat(node);
    }, []);
  }

  async getMenuBasedonRole(id: any) {
    this.updatedMenus = [];
    let postData = {
      search: [{ searchfield: "roleid", searchvalue: id, criteria: "eq" }]
    };

    return this._menupermissionsService
      .GetAllByFilterAsync(postData)
      .then(data => {
        if (data) {

          if (data[0]) {
            data[0]['menuid'].forEach(element => {
              this.updatedMenus.push(element._id);
            });
          }
          return;
        }
      });
  }

  menuSave() {
    this.btnDisable = true;
    this.finalarray = []
    var parentid = []

    this.checklistSelection.selected.forEach(ele => {
      this.finalarray.push(ele._id);
      if (ele.level == 1) {
        parentid.push(ele.category);
      }
    })

    var parentmenus = this.menulist.filter((parent) => {
      return parentid.includes(parent.menuname);
    })

    parentmenus.forEach((parent) => {
      var filtermenu = this.finalarray.find((menu) => {
        if (menu)
          return parent._id.toString() == menu.toString()
      })

      if (!filtermenu) {
        this.finalarray.push(parent._id);
      }

    })

    let postData = {
      roleid: this.bindId,
      menuid: this.finalarray
    }
    console.log(postData);


    var url = "menupermissions/" + this.bindId;
    var method = "PUT";

    this._commonService.commonServiceByUrlMethodData(url, method, postData)
      .subscribe(data => {
        if (data) {

          this.btnDisable = false;
          this.showNotification('top', 'right', 'Menu permission has been updated successfully!!!', 'success');

        }

      })
  }

  getLevel = (node: ItemNodeFlatNode) => node.level;

  isExpandable = (node: ItemNodeFlatNode) => node.expandable;

  getChildren = (node: ItemNode): ItemNode[] => node.children;

  hasChild = (_: number, _nodeData: ItemNodeFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: ItemNodeFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: ItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
      ? existingNode
      : new ItemNodeFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode._id = node._id;
    flatNode.category = node.category;
    flatNode.expandable = !!node.children?.length;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: ItemNodeFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 && descendants.every(child => {
      return this.checklistSelection.isSelected(child);
    });
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: ItemNodeFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: ItemNodeFlatNode): void {
    this.checklistSelection.toggle(node);
    //console.log(this.checklistSelection);

    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
    // Force update for the parent
    descendants.forEach(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: ItemNodeFlatNode): void {
    //console.log(node);

    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
    //console.log(this.checklistSelection.selected);


  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: ItemNodeFlatNode): void {
    let parent: ItemNodeFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: ItemNodeFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 && descendants.every(child => {
      return this.checklistSelection.isSelected(child);
    });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: ItemNodeFlatNode): ItemNodeFlatNode | null {
    const currentLevel = this.getLevel(node);
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  groupBy(collection: any, property: any) {

    let i = 0, val, index, values = [], result = [], finalresult = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1) {
        result[index].push(collection[i]);
        finalresult[collection[i][property]].push(collection[i]);
      } else {
        values.push(val);
        result.push([collection[i]]);
        finalresult[collection[i][property]] = [collection[i]];
      }
    }
    return finalresult;
  }

  public onSave() {

    this.selectionValues.emit(this.checklistSelection.selected);
  }
}

export class ItemNode {
  children: any[];
  item: string;
  category: string;
  _id: string;
}

export class ItemNodeFlatNode {
  item: string;
  category: string;
  _id: string;
  level: number;
  expandable: boolean;

  constructor(item?: string, category?: string, _id?: string, level?: number, expandable?: boolean) {
    this.item = item;
    this.category = category;
    this._id = _id;
    this.level = level;
    this.expandable = expandable;
  }


}
