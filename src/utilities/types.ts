

/**
 * Used to determine how to update the visibility tree and there fore visibility state of selection groups using the ModelViewManager
 */
export enum VisibilityMode {
  /**
   * Hide all elements but selected
   */
  Isolate = "Isolate",
  /**
   * isolates all but elements in the same parent node that come before this node
   */
  showPrevious = "ShowPrevious",
  /**
   * isolates all but elements in the same parent node
   */
  showNeighbors = "ShowSiblings",
  /**
   * Select active group do not change any visibility
   */
  selectGroup = "SelectGroup"

}

export const Unspecified = "Unspecifed";

export enum VisibilityState {
  Visible = "Visible",
  Hidden = 'Hidden',
  Ghost = "Ghost"
}

export enum KnownGroupType {
  Station = "Station",
  BuildingStep = "BuildingStep",
  Assembly = "Assembly",
  BuildingElement = "BuildingElement",
  Unknown = "Unknown"
}

export type GroupingType = KnownGroupType | string;

export interface SelectionGroup {
  id: string; // used for tree nodeMap searching
  groupType: GroupingType;
  groupName: string;
  elements: BuildingElement[];
}

// representing https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/lexical/IfcElement.htm
export interface IfcElement {
  /**
   * the number of the line in the .ifc file
   */
  expressID: number;
  /**
* The guid of an element from the .ifc file. It is more unique than the expressID
*/
  GlobalID: string;
  /**
* The type enumerated of all IFC types. use the ifcElements Map to get number version
*/
  type: string;
  name: string;
  properties: BasicProperty[]
}

/**
 * A container for handeling Sustainer elements and properties 
 */
export interface BuildingElement extends IfcElement {
  /**
   * The Id of the fragment which holds the reference to the InstanceMesh of this object
   */
  FragmentID: string;

  /**
   * The Id of the FragmentGroup which represents the ifc model file
   */
  modelID: string; // the fraggroup id

  /**
   * An Alias can be a user assigned arbitrary number set from a local database or other means
   */
  alias?: string;

}

export interface BasicProperty {
  name: string,
  value: string,
  pSet: string
}

// names of properties that we commonly use for ifc export
// export type knownProperties = "Aantal" |"Bouwnummer"| "Productcode" | "Materiaal"

export enum sustainerProperties {
  Count = "Aantal",
  BuildingNumber = "Bouwnummer",
  ProductCode = "Productcode",
  Material = 'Materiaal',
  Station = 'Station',
  Assembly = 'Assembly',
  BuildingStep = "BuildingStep",
  PrefabNumber = "PrefabNumber", // used by installation companies to group elements together like cables and endings
  Family = "Family",
}


// can I stash visibility state on elements directly and still cleaning support groups temp trans state?
// copy logic of resetcolor on frag group
