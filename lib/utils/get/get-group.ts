import { namedNode } from '@rdfjs/data-model';
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
  return collection.list.flatMap((node: sh.Shape) => {
    // TODO: Do properly with on2ts
    if (node.isA(namedNode('http://www.w3.org/ns/shacl#NodeShape'))) {
      return getGroupsNode(node as sh.NodeShape);
    } if (node.isA(namedNode('http://www.w3.org/ns/shacl#PropertyShape'))) {
      return getGroupProperty(node as sh.PropertyShape) ?? [];
    }
    // TODO [FUTURE]: Remove this catch case when upstream inferencing is working
    try {
      return getGroupProperty(node as sh.PropertyShape) ?? [];
    } catch (e) {
      return getGroupsNode(node as sh.NodeShape);
    }
    //     throw new Error(
    //       deindent`Invalid node: expected node shape or property shape.
    //       Instead instance of ${
    //   JSON.stringify(node.properties['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'])
    // }`,
    //     );
  });
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
