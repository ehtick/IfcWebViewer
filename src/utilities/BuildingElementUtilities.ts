import { Tree, TreeNode } from "./Tree";
import { SelectionGroup, BuildingElement, KnownGroupType, sustainerProperties, IfcElement, BasicProperty } from "./types";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front"
import { ModelCache } from "../bim-components/modelCache";
import { GetCenterPoint, GetFragmentIdMaps } from "./IfcUtilities";
import { ModelViewManager } from "../bim-components/modelViewer";
import { FragmentsGroup } from "@thatopen/fragments";
import { Components } from "@thatopen/components";
import { TreeUtils } from "./treeUtils";
import { ViewableTree } from "../bim-components/modelViewer/src/viewableTree";

// Type guard to check if an IfcElement is also a BuildingElement
export function isBuildingElement(element: IfcElement): element is BuildingElement {
  return (
    'FragmentID' in element &&
    'modelID' in element &&
    'properties' in element &&
    Array.isArray((element as BuildingElement).properties) // Ensure properties is an array
  );
}

/**
 * Function to convert IfcElement(s) to BuildingElement(s) if applicable
 */
export function convertToBuildingElement(
  ifcElements: IfcElement | IfcElement[]
): BuildingElement[] {
  // Helper function to check and return BuildingElement or null
  const convertSingleElement = (element: IfcElement): BuildingElement | null => {
    return isBuildingElement(element) ? element : null;
  };

  // If it's an array, map over it and filter out non-BuildingElements
  if (Array.isArray(ifcElements)) {
    return ifcElements.map(convertSingleElement).filter(Boolean) as BuildingElement[];
  }

  // If it's a single element, wrap it in an array and return it, or return an empty array if null
  const singleElement = convertSingleElement(ifcElements);
  return singleElement ? [singleElement] : [];
}


/**
 * takes in the current group, the building elements to search from (select by matching type) and the direction
 * we assume the group name will matach a node name in the input tree
 */
export function GetAdjacentGroup(
  current: SelectionGroup | undefined,
  tree: ViewableTree<IfcElement> | undefined,
  direction: 'next' | 'previous' = 'next',
  searchType: 'stepOver' | 'stepInto'
): SelectionGroup | undefined {

  if (!tree) return undefined;
  // If no current group, return the first group
  if (!current) return getFirstGroup(tree);
  const currentNode = tree.getNode(current.id);
  if (!currentNode) return getFirstGroup(tree);

  console.log('get neigbor of', current, currentNode, tree)


  switch (searchType) {
    case "stepOver":
      return stepOver(currentNode, tree, direction)
    case 'stepInto':
      return stepInto(currentNode, tree, direction);
    default:
      return getFirstGroup(tree);
  }
}

/**
 * Step into the children of a tree node, moving through neighbors and backtracking as necessary.
 * @param current - Current selection node.
 * @param tree - Viewable tree to traverse.
 * @returns Next valid tree node or undefined if no valid step exists.
 */
function stepInto(
  current: TreeNode<IfcElement>,
  tree: ViewableTree<IfcElement>,
  direction: 'next' | 'previous' = 'next'
): SelectionGroup | undefined {

  // Helper function to convert a map of children to an array.
  function mapToArray<T>(map: Map<string, T>): T[] {
    return [...map.values()];
  }

  // Helper function to get all non-leaf children of a node.
  function getNonLeafChildren(nodeId: string): TreeNode<IfcElement>[] {
    const node = tree.getNode(nodeId);
    console.log('non leaf children', node?.children)
    if (!node || !node.children) return [];
    const childrenArray = mapToArray(node.children);
    return childrenArray.filter(child => child.children.size > 0);
  }
  /**
   * Get the next or previous sibling of a node within its parent's children.
   * If there are no more siblings in the given direction, returns undefined.
   */
  function getNeighbor(
    nodeId: string,
    parentId: string,
    direction: 'next' | 'previous'
  ): TreeNode<IfcElement> | undefined {
    const parent = tree.getNode(parentId);
    if (!parent || !parent.children) return undefined;

    const siblings = mapToArray(parent.children);
    const currentIndex = siblings.findIndex(s => s.id === nodeId);

    console.log('get neighbor', nodeId, currentIndex);

    // If the current node is not found in the siblings, return undefined.
    if (currentIndex === -1) return undefined;

    // Determine the adjacent index based on the direction, but avoid wrapping around.
    const adjacentIndex =
      direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    // Return undefined if the adjacent index is out of bounds.
    if (adjacentIndex < 0 || adjacentIndex >= siblings.length) {
      return undefined;
    }

    // Return the valid sibling node at the adjacent index.
    return siblings[adjacentIndex];
  }


  // Recursive function to step into children or navigate neighbors.
  function recursiveStep(
    nodeId: string,
    parentId?: string
  ): SelectionGroup | undefined {
    const nonLeafChildren = getNonLeafChildren(nodeId);
    console.log('non leaf children', parentId, nonLeafChildren)

    if (nonLeafChildren.length > 0) {
      // Step into the first non-leaf child.
      const firstChild = nonLeafChildren[0];
      return {
        groupType: firstChild.type,
        id: firstChild.id,
        groupName: firstChild.name,
        elements: TreeUtils.getBuildingElements(firstChild),
      };
    } else if (parentId) {
      // No children to step into, so try to move to the neighbor.
      const neighbor = getNeighbor(nodeId, parentId, direction);
      console.log('no children found, check neighbor', neighbor)
      if (neighbor) {
        return {
          groupType: neighbor.type,
          id: neighbor.id,
          groupName: neighbor.name,
          elements: TreeUtils.getBuildingElements(neighbor),
        };
      } else {

        // If no neighbor, move up to the parent's neighbor.
        const grandParent = tree.getNode(parentId)?.parent;
        console.log(' get grandparent - parent', grandParent)
        const parentsNeighbor = getNeighbor(parentId, grandParent?.id ?? "", direction);
        if (parentsNeighbor)
          return {
            groupType: parentsNeighbor.type,
            id: parentsNeighbor.id,
            groupName: parentsNeighbor.name,
            elements: TreeUtils.getBuildingElements(parentsNeighbor),
          };        // return recursiveStep(parentId, grandParent?.id);

      }
    }
    return undefined; // No valid step found.
  }

  // Start the traversal from the current node.
  return recursiveStep(current.id, current.parent?.id);
}

function getGroup() {

}




/**
 * Get the next tree node of the same type ignoring children
 * @param current 
 * @param tree 
 * @param direction 
 * @returns 
 */
function stepOver(current: TreeNode<IfcElement>,
  tree: ViewableTree<IfcElement>,
  direction: 'next' | 'previous' = 'next',) {

  const groupOfType = tree.getNodes(n => n.type === current.type).map(n => n.id);
  // console.log("Group of same type",tree,current, groupOfType);

  if (!groupOfType) {
    // console.log("Get adjacent group failed. grouping type not found", current.groupType);
    return undefined;
  }

  const currentIndex = groupOfType.indexOf(current.id);

  let adjacentIndex: number;
  if (direction === 'next') {
    adjacentIndex = (currentIndex === -1 || currentIndex === groupOfType.length - 1) ? 0 : currentIndex + 1;
  } else {
    adjacentIndex = (currentIndex === -1 || currentIndex === 0) ? groupOfType.length - 1 : currentIndex - 1;
  }

  const newNode = tree.getNode(groupOfType[adjacentIndex]);
  // console.log("New group selection",currentIndex, newNode);

  if (newNode) {
    return { groupType: newNode.type, id: newNode.id, groupName: newNode.name, elements: TreeUtils.getBuildingElements(newNode) };
  }
  return undefined;
}

function getFirstGroup(tree: ViewableTree<IfcElement>): SelectionGroup | undefined {

  if (tree.root.children.size === 0) {
    console.log('failed to find next group because root node has no children')
    return;
  }
  const firstGroup = tree.getFirstOrUndefinedNode(n => n.type !== "Project");
  console.log('getting default group', firstGroup, tree)

  if (!firstGroup) return undefined;

  const el = TreeUtils.getChildren(firstGroup, n => n.type === KnownGroupType.BuildingElement)
    .map(n => n.data)
    .filter((data): data is NonNullable<typeof data> => data != null)
    .flat();


  return { groupType: firstGroup.type, id: firstGroup.id, groupName: firstGroup.name, elements: convertToBuildingElement(el) };
}

/**
 * Group by Model ID for easy handeling
 * @returns key = ModuleID, value = Building Elements 
 */
export function groupByModelID(buildingElements: BuildingElement[]): Map<string, BuildingElement[]> {
  return buildingElements.reduce((acc, element) => {
    if (!acc.get(element.modelID)) {
      acc.set(element.modelID, [])
    }
    acc.get(element.modelID)?.push(element)
    return acc;
  }, new Map<string, BuildingElement[]>);
}

export function mapByName(buildingElements: BuildingElement[]) {
  return buildingElements.reduce((acc, element) => {
    if (!acc.has(element.name)) {
      acc.set(element.name, [])
    }
    acc.get(element.name)?.push(element)
    return acc;
  }, new Map<string, BuildingElement[]>);
}


/**
 * Zooms to elements by getting their fragmetIDs, creating a bounding box with their meshes and calling camera.control.fitToSphere
 * @param elements Elements to zoom
 * @param components instance of components
 * @returns 
 */
export async function zoomToBuildingElements(elements: BuildingElement[] | undefined, components: OBC.Components, allowTransition: boolean, buffer: number = 0.8) {
  if (!components || !elements) return;
  const cache = components.get(ModelCache);
  if (!cache.world) return;

  const fragments = components.get(OBC.FragmentsManager);
  const bbox = components.get(OBC.BoundingBoxer);
  bbox.reset();

  const idMaps = GetFragmentIdMaps(elements, components);

  if (!idMaps) return;
  idMaps.forEach(idMap => {
    for (const fragID in idMap) {
      const fragment = fragments.list.get(fragID);

      if (!fragment) continue;

      const ids = idMap[fragID];
      bbox.addMesh(fragment.mesh, ids);
      // console.log("zooming to selected",fragment)

    }
  });

  const sphere = bbox.getSphere();
  const i = Infinity;
  const mi = -Infinity;
  const { x, y, z } = sphere.center;
  const isInf = sphere.radius === i || x === i || y === i || z === i;
  const isMInf = sphere.radius === mi || x === mi || y === mi || z === mi;
  const isZero = sphere.radius === 0;
  if (isInf || isMInf || isZero) {
    return;
  }

  sphere.radius *= buffer;
  const camera = cache.world.camera as OBC.OrthoPerspectiveCamera;
  await camera.controls.fitToSphere(sphere, allowTransition);

  // if(allowTransition)
  // setTimeout(async () => {
  //   await camera.controls.fitToSphere(sphere, allowTransition);
  // }, 10);
};

// TODO: change method so that it highlights input building elements 
export const selectElements = (elements: BuildingElement[] | undefined, components: OBC.Components) => {
  if (!components || !elements) return;
  const cache = components.get(ModelCache);
  if (!cache.world) return;

  const fragments = components.get(OBC.FragmentsManager);
  const bbox = components.get(OBC.BoundingBoxer);
  bbox.reset();

  const idMaps = GetFragmentIdMaps(elements, components);

  if (!idMaps) return;
  idMaps.forEach(idMap => {
    for (const fragID in idMap) {
      const fragment = fragments.list.get(fragID);

      if (!fragment) continue;

      const ids = idMap[fragID];
      bbox.addMesh(fragment.mesh, ids);
      // console.log("zooming to selected",fragment)

    }
  });

  const sphere = bbox.getSphere();
  const i = Infinity;
  const mi = -Infinity;
  const { x, y, z } = sphere.center;
  const isInf = sphere.radius === i || x === i || y === i || z === i;
  const isMInf = sphere.radius === mi || x === mi || y === mi || z === mi;
  const isZero = sphere.radius === 0;
  if (isInf || isMInf || isZero) {
    return;
  }
  sphere.radius *= 0.8;
  const camera = cache.world.camera as OBC.OrthoPerspectiveCamera;

  setTimeout(async () => {
    camera.controls.fitToSphere(sphere, true);
  }, 10);
};

/**
 * Selected elements, if elements invisible first make visible then select
 * @param elements elements to highlight
 * @param components instance of component used
 * @param clearPrevious clear all previous selected elements, default true
 * @returns 
 */
export const select = async (elements: BuildingElement[], components: OBC.Components, clearPrevious: boolean = true) => {
  if (!elements || !components) return;
  console.log("high light these elements")

  const highlighter = components.get(OBF.Highlighter);
  const hider = components.get(OBC.Hider);
  const modelCache = components.get(ModelCache);

  // we need to group by model id incase we have mulitpl models open 
  // so we know which model to search from
  const elementsByModelId = new Map<string, BuildingElement[]>();

  for (const element of elements) {
    const groupID = element.modelID;
    if (!groupID || !element) continue;
    if (!elementsByModelId.has(groupID)) {
      elementsByModelId.set(groupID, []);
    }
    elementsByModelId.get(groupID)!.push(element);
  }

  if (clearPrevious)
    await highlighter.clear('select');


  const highlightPromises = Array.from(elementsByModelId.entries()).map(async ([modelId, elements]) => {
    const model = modelCache.getModel(modelId);
    if (!model) return;

    const expressIds = elements.flatMap(e => e.expressID);
    const elementTypeIds = model.getFragmentMap(expressIds);
    // console.log("high light these elements",elementTypeIds)
    await highlighter.highlightByID("select", elementTypeIds, clearPrevious, false);
    hider.set(true, elementTypeIds)
  });

  await Promise.all(highlightPromises);
}

/**
 * Isolates building elements, hiding all other geometry
 * @param elements 
 * @param components 
 * @returns 
 */
export const isolate = async (elements: BuildingElement[], components: OBC.Components) => {
  if (!elements || !components) return;

  const hider = components.get(OBC.Hider);
  const modelCache = components.get(ModelCache);

  // we need to group by model id incase we have mulitpl models open 
  // so we know which model to search from
  const elementsByModelId = new Map<string, BuildingElement[]>();

  for (const element of elements) {
    const groupID = element.modelID;
    if (!groupID || !element) continue;
    if (!elementsByModelId.has(groupID)) {
      elementsByModelId.set(groupID, []);
    }
    elementsByModelId.get(groupID)!.push(element);
  }

  const highlightPromises = Array.from(elementsByModelId.entries()).map(async ([modelId, elements]) => {
    const model = modelCache.getModel(modelId);
    if (!model) return;

    const expressIds = elements.flatMap(e => e.expressID);
    const elementTypeIds = model.getFragmentMap(expressIds);
    hider.isolate(elementTypeIds)
    const selectedElements = components.get(ModelCache).getElementByFragmentIdMap(elementTypeIds)
    if (!selectedElements) return;
    components.get(ModelViewManager).onVisibilityUpdated.trigger({ elements: [...selectedElements], treeID: '' })
  });

  await Promise.all(highlightPromises);
}

/**
 * Simply set the visibility of building elements directly and not changing any sletion state or settings
 * @param node 
 * @param components 
 * @returns 
 */
export const setVisibility = (elements: BuildingElement[], components: OBC.Components, visibility: boolean = true) => {
  if (!elements || !components) return;

  const idMaps = GetFragmentIdMaps(elements, components);
  if (!idMaps || !idMaps[0]) return;

  const cache = components.get(ModelCache);
  console.log('setting visibility', visibility)

  elements.forEach((element) => {
    const frag = cache.getFragmentByElement(element);
    if (visibility && frag && frag.hiddenItems.has(element.expressID)) {
      frag.setVisibility(true, [element.expressID]);
    }
    if (!visibility && frag && !frag.hiddenItems.has(element.expressID)) {
      frag.setVisibility(false, [element.expressID]);
    }
  });
}

/**
 * Get the distance between the center point of two building elements
 * @param a 
 * @param b 
 * @param model 
 * @param components 
 * @returns 
 */
export function distanceToCenter(a: BuildingElement, b: BuildingElement, model: FragmentsGroup, components: Components) {
  const aCenter = GetCenterPoint(a, model, components);
  const bCenter = GetCenterPoint(b, model, components);
  if (!bCenter) return;
  return aCenter?.distanceTo(bCenter);
}

interface treeSetupConfig {
  allowUnspecifedasNodeName?: boolean,
}

/**
 * Create a tree structure by using the input node order to group building elements by their property.
 * we assume that grouping is done by property values and that building elements have the properties 
 * in node order.
 */
export const setUpTreeFromProperties = (id: string, elements: BuildingElement[], propertyNames: string[] | sustainerProperties[], config?: treeSetupConfig) => {

  const tree = new Tree<IfcElement>(id, "Project", "Project");
  const root = tree.getNode("Project")


  function createSortedSubTree(tree: Tree<IfcElement>, parentNode: TreeNode<IfcElement>, currentElements: any[], currentLevel: number) {
    if (currentLevel >= propertyNames.length) {
      // We've reached the leaf level, add elements as leaf nodes
      console.log('adding nodes to tree', parentNode.id, currentElements.map(e => e.name))

      currentElements.forEach((element, index) => {
        tree.addNode(parentNode.id, `${parentNode.id}_${index}`, element.name, KnownGroupType.BuildingElement, element, true);
      });
      return;
    }

    const currentNodeType = propertyNames[currentLevel];
    const groupedElements = groupElementsByPropertyName(currentElements, currentNodeType);
    const sortedGroups = sortGroupedElements(groupedElements);

    sortedGroups.forEach(([groupValue, groupElements]) => {
      if (groupValue === "Unspecified") {
        // dont add as new node just pass on
        console.log('created sub tree for unspecified ', parentNode.id, groupElements)
        let nodeId = parentNode.id;
        // if config set then make unSpecified a node in the tree, otherwise make it a child of the previous parent
        if (config?.allowUnspecifedasNodeName) {
          nodeId = `${parentNode.id}_${currentNodeType}_${groupValue}`;
          tree.addNode(parentNode.id, nodeId, groupValue, currentNodeType);
        }

        // const parentNode = config?.allowUnspecifedasNodeName ?
        createSortedSubTree(tree, tree.getNode(nodeId)!, groupElements, currentLevel + 1);
      } else {
        const nodeId = `${parentNode.id}_${currentNodeType}_${groupValue}`;
        tree.addNode(parentNode.id, nodeId, groupValue, currentNodeType);
        console.log('created sub tree for sorted nod ', groupValue, groupElements)
        createSortedSubTree(tree, tree.getNode(nodeId)!, groupElements, currentLevel + 1);
      }

    });
  }

  if (root)
    createSortedSubTree(tree, root, elements, 0)
  // console.log('tree created', id, elements, tree)
  return tree;
}


function sortGroupedElements(groupedElements: Map<string, any[]>): [string, any[]][] {
  const entries = Array.from(groupedElements.entries());
  // console.log('sorting', Array.from(groupedElements.keys()));

  // Function to extract the first number (including decimals) from a string
  const extractNumber = (str: string): [number, number] => {
    const match = str.match(/(\d+)(?:\.(\d+))?/);
    if (match) {
      const integerPart = parseInt(match[1]);
      const decimalPart = match[2] ? parseInt(match[2]) : 0;
      return [integerPart, decimalPart];
    }
    return [Infinity, 0];
  };

  // Custom sort function
  entries.sort((a, b) => {
    const [aInt, aDec] = extractNumber(a[0]);
    const [bInt, bDec] = extractNumber(b[0]);
    // console.log('sort between', `${aInt}.${aDec}`, `${bInt}.${bDec}`);

    if (aInt !== bInt) {
      return aInt - bInt; // Compare integer parts
    }

    if (aDec !== bDec) {
      return aDec - bDec; // Compare decimal parts as integers
    }

    // If numbers are the same, fall back to alphabetical comparison
    // console.log('sorted one', a[0].localeCompare(b[0]));
    return a[0].localeCompare(b[0]);
  });

  // console.log('sorted', entries.map(e => e[0]));
  return entries;
}


export const groupElementsByPropertyName = (elements: BuildingElement[], property: string): Map<string, BuildingElement[]> => {
  const grouped = new Map<string, BuildingElement[]>();
  // const uniqueElements = Array.from(new Set(elements.map(el => JSON.stringify(el)))).map(el => JSON.parse(el));

  elements.forEach(element => {
    if (!element.properties) {
      console.log('element failed to find property', element, elements)
      return;
    }
    const value = element.properties.find((prop: BasicProperty) => prop.name === property)?.value || 'Unspecified';
    // if(value === "Unknown")
    //   console.log("unknown data found",property,element.properties )
    if (!grouped.has(value)) {
      grouped.set(value, []);
    }
    grouped.get(value)!.push(element);
  });
  return grouped;
};

export const GetPropertyByName = (element: BuildingElement, propertyName: sustainerProperties) => {
  if (!element || !propertyName)
    return;

  return element.properties.find(p => p.name === propertyName);
}