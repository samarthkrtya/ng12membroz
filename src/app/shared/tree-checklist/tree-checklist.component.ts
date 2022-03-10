import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/core/services/common/common.service';

@Component({
  selector: 'tree-checklist',
  templateUrl: 'tree-checklist.component.html',
  styles: [`
    .mat-form-field {
      margin-right: 4px;
    }`
  ]
})
export class TreeChecklist implements OnInit {
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

  @Input() api: string;
  @Input() method: string;
  @Input() postData: object;
  @Input() for: string;

  @Input() routerLink: string;

  
  @Input() sub: boolean;
  @Input() itemname: string;
  @Input() category: string;
  @Input() subcategory: string;
  @Input() maincategory: string;
  @Input() dbvalue: ItemNodeFlatNode[];


  @Output() selectionValues = new EventEmitter<any>();

  constructor(private _commonService: CommonService) { }

  ngOnInit() {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<ItemNodeFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.isLoading = true;
    
    if (this.dbvalue.length > 0) {
      this.dbvalue.map(a => a.level = 1);
      this.dbvalue.map(a => a.expandable = false);
    }
    
    this._commonService
      .commonServiceByUrlMethodDataAsync(this.api, this.method, this.postData)
      .then((data: any) => {
        
        if (this.sub) {
          data.map((val: any) => val[this.category] = val[this.category] && val[this.category][this.subcategory][this.maincategory] ? val[this.category][this.subcategory][this.maincategory] : '')
        }
        let obj = {}, array = [];
        
        data.forEach((element , i) => {
          obj = {
             item: element[this.itemname],
             category: element[this.category] ? element[this.category] : element['menuname'],
             _id: element._id 
          };
          array.push(obj);
        });
        
        const grpdata = this.groupBy(array, "category");
        
        const datas = this.buildFileTree(grpdata, 0);
        
        this.dataSource.data = datas;
        this.treeControl.expandAll();
        
        if (this.dbvalue && this.dbvalue.length > 0) {
          for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
            for (let j = 0; j < this.dbvalue.length; j++) {
              if (this.treeControl.dataNodes[i]["_id"] == this.dbvalue[j]["_id"]) {
                this.checklistSelection.toggle(this.treeControl.dataNodes[i]);
              }
            }
          }
        }
        this.isLoading = false;
        
      }).catch((e)=>{
        this.isLoading = false;
        
      });
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
  todoItemSelectionToggle(node: ItemNodeFlatNode , event : any): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    // this.checklistSelection.isSelected(node)
    event.checked ? this.checklistSelection.select(...descendants) : this.checklistSelection.deselect(...descendants);
    // descendants.forEach(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: ItemNodeFlatNode , event : any): void {
    console.log("event==>",event);
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
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