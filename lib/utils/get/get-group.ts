import type { sh, LogicalCollection } from '../../types';

export function getGroupProperty(property: sh.PropertyShape): sh.NodeGroup | undefined {
  return 'group' in property ? property.group : undefined;
}

export function getGroupsNode(node: sh.NodeShape): sh.NodeGroup[] {
  if ('group' in node) {
    return [node.group];
  }

  let groups: sh.NodeGroup[] = [];
  for (const and of node.and) {
    groups = groups.concat(getGroupsCollection(and));
  }
  for (const xone of node.xone) {
    groups = groups.concat(getGroupsCollection(xone));
  }
  for (const or of node.or) {
    groups = groups.concat(getGroupsCollection(or));
  }

  for (const property of node.sh$property) {
    const group = getGroupProperty(property);
    if (group) {
      groups.push(group);
    }
  }
  for (const not of node.not) {
    const group = getGroupProperty(not);
    if (group) {
      groups.push(group);
    }
  }
  return groups;
}

export function getGroupsCollection(collection: LogicalCollection): sh.NodeGroup[] {
  // TODO [FUTURE]: REMOVE TYPE CASTING HERE - Perhaps edit the shacl-shacl constraint
  return collection.list.flatMap((node: sh.Shape) => getGroupsNode(node as sh.NodeShape));
}

export function getGroupCollection(collection: LogicalCollection): sh.NodeGroup | undefined {
  let chosenGroup: sh.NodeGroup | undefined;
  for (const group of getGroupsCollection(collection)) {
    if (!chosenGroup) {
      chosenGroup = group;
      // TODO: Make sure no isses with literals equalling named nodes
    } else if (`${group}` !== `${chosenGroup}`) {
      return undefined;
    }
  }
  return chosenGroup;
}
